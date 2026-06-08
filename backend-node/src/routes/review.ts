/**
 * Review routes — the main pipeline.
 *
 * POST /api/review/start   — upload doc + config, start the 4-agent pipeline
 * GET  /api/review/:id/stream — SSE stream of agent progress
 * GET  /api/review/:id/result  — get final compliance report
 */

import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { v4 as uuid } from 'uuid';
import { createModel } from '../lib/aiClient.js';
import { parseDocument } from '../lib/pdfParser.js';
import { createBandRoom, sendBandMessage, closeBandRoom } from '../lib/bandClient.js';
import { runPolicyReader } from '../agents/policyReader.js';
import { runRiskAnalyzer } from '../agents/riskAnalyzer.js';
import { runLegalChecker } from '../agents/legalChecker.js';
import { runReporter } from '../agents/reporter.js';
import type { ComplianceReport } from '../agents/reporter.js';

export const reviewRoutes = new Hono();

// In-memory session store (replace with DB later)
const sessions = new Map<string, {
  status: 'running' | 'complete' | 'error';
  fileName: string;
  regulations: string[];
  report: ComplianceReport | null;
  events: SSEEvent[];
}>();

interface SSEEvent {
  id: string;
  agent: string;
  type: string;
  content: string;
  timestamp: string;
}

// ─── POST /api/review/start ───────────────────────────────

reviewRoutes.post('/review/start', async (c) => {
  const apiKey = c.req.header('X-API-Key');
  const providerUrl = c.req.header('X-Provider-URL');
  const modelName = c.req.header('X-Model-Name');

  if (!apiKey || !providerUrl || !modelName) {
    return c.json({ error: 'Missing required headers: X-API-Key, X-Provider-URL, X-Model-Name' }, 400);
  }

  // Parse multipart form data
  const body = await c.req.parseBody();
  const file = body['file'];
  const regulationsRaw = body['regulations'];

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded. Send a PDF or DOCX via multipart form field "file".' }, 400);
  }

  const regulations: string[] = typeof regulationsRaw === 'string'
    ? regulationsRaw.split(',').map(r => r.trim())
    : Array.isArray(regulationsRaw)
      ? regulationsRaw.map(String)
      : ['gdpr'];

  const sessionId = uuid();
  const buffer = Buffer.from(await file.arrayBuffer());

  // Initialize session
  sessions.set(sessionId, {
    status: 'running',
    fileName: file.name,
    regulations,
    report: null,
    events: [],
  });

  // Run pipeline asynchronously
  runPipeline(sessionId, buffer, file.name, regulations, { apiKey, providerUrl, modelName })
    .catch(err => {
      console.error(`[Pipeline] Session ${sessionId} failed:`, err);
      const session = sessions.get(sessionId);
      if (session) {
        session.status = 'error';
        session.events.push({
          id: uuid(),
          agent: 'SYSTEM',
          type: 'error',
          content: err instanceof Error ? err.message : 'Pipeline failed unexpectedly.',
          timestamp: new Date().toISOString(),
        });
      }
    });

  return c.json({ sessionId, status: 'running' });
});

// ─── GET /api/review/:id/stream ────────────────────────────

reviewRoutes.get('/review/:sessionId/stream', async (c) => {
  const { sessionId } = c.req.param();
  const session = sessions.get(sessionId);

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  return streamSSE(c, async (stream) => {
    let lastIndex = 0;

    // Send existing events first
    for (const event of session.events) {
      await stream.writeSSE({
        event: event.type,
        data: JSON.stringify(event),
      });
    }
    lastIndex = session.events.length;

    // Poll for new events until complete
    while (true) {
      if (session.events.length > lastIndex) {
        for (let i = lastIndex; i < session.events.length; i++) {
          await stream.writeSSE({
            event: session.events[i].type,
            data: JSON.stringify(session.events[i]),
          });
        }
        lastIndex = session.events.length;
      }

      if (session.status === 'complete' || session.status === 'error') {
        // Send final event
        await stream.writeSSE({
          event: session.status,
          data: JSON.stringify({
            id: uuid(),
            agent: 'SYSTEM',
            type: session.status,
            content: session.status === 'complete'
              ? 'Pipeline complete. Report ready.'
              : 'Pipeline failed.',
            timestamp: new Date().toISOString(),
          }),
        });
        break;
      }

      // Wait before polling again
      await stream.sleep(500);
    }
  });
});

// ─── GET /api/review/:id/result ────────────────────────────

reviewRoutes.get('/review/:sessionId/result', (c) => {
  const { sessionId } = c.req.param();
  const session = sessions.get(sessionId);

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  if (session.status !== 'complete') {
    return c.json({ error: 'Review not complete yet', status: session.status }, 202);
  }

  return c.json({
    sessionId,
    fileName: session.fileName,
    regulations: session.regulations,
    report: session.report,
  });
});

// ─── Pipeline runner ──────────────────────────────────────

async function runPipeline(
  sessionId: string,
  fileBuffer: Buffer,
  fileName: string,
  regulations: string[],
  aiConfig: { apiKey: string; providerUrl: string; modelName: string },
) {
  const session = sessions.get(sessionId)!;
  const model = createModel(aiConfig);

  const pushEvent = (agent: string, type: string, content: string) => {
    const event: SSEEvent = {
      id: uuid(),
      agent,
      type,
      content,
      timestamp: new Date().toISOString(),
    };
    session.events.push(event);
    console.log(`[Pipeline] ${agent}: ${content.slice(0, 80)}...`);
  };

  // Step 0: Parse document
  pushEvent('AGENT_01', 'clause_extraction_result', `Parsing document: ${fileName}`);
  const documentText = await parseDocument(fileBuffer, fileName);
  pushEvent('AGENT_01', 'clause_extraction_result', `Document parsed. ${documentText.length} characters extracted.`);

  // Try to create Band room (non-blocking — fail gracefully if Python service isn't running)
  let bandRoomId: string | null = null;
  try {
    const { roomId } = await createBandRoom(sessionId);
    bandRoomId = roomId;
    pushEvent('SYSTEM', 'band_room', `Band room created: ${roomId}`);
  } catch {
    pushEvent('SYSTEM', 'band_room', 'Band service unavailable. Running without Band coordination.');
  }

  const sendToBand = async (type: string, agent: string, data: unknown) => {
    if (!bandRoomId) return;
    try {
      await sendBandMessage(sessionId, {
        type,
        agent,
        content: JSON.stringify(data),
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Band service errors are non-fatal
    }
  };

  // Agent 1: Policy Reader
  pushEvent('AGENT_01', 'clause_extraction_result', 'Extracting and categorizing clauses...');
  const clauses = await runPolicyReader(model, documentText);
  pushEvent('AGENT_01', 'clause_extraction_result', `Extracted ${clauses.length} clauses across ${new Set(clauses.map(c => c.category)).size} categories.`);
  await sendToBand('clause_extraction_result', 'AGENT_01', clauses);

  pushEvent('AGENT_01', 'handoff', `HANDOFF → AGENT_02: Forwarding clause_extraction_result (${clauses.length} items, 0 parse errors).`);

  // Agent 2: Risk Analyzer
  pushEvent('AGENT_02', 'risk_analysis_result', 'Risk analysis started. Scoring clauses by severity...');
  const scoredClauses = await runRiskAnalyzer(model, clauses);
  const highCount = scoredClauses.filter(c => c.severity === 'HIGH').length;
  const medCount = scoredClauses.filter(c => c.severity === 'MEDIUM').length;
  pushEvent('AGENT_02', 'risk_analysis_result', `Risk analysis complete. ${highCount} HIGH, ${medCount} MEDIUM, ${scoredClauses.length - highCount - medCount} LOW.`);
  await sendToBand('risk_analysis_result', 'AGENT_02', scoredClauses);

  pushEvent('AGENT_02', 'handoff', `HANDOFF → AGENT_03: Forwarding risk_analysis_result (${highCount} HIGH, ${medCount} MEDIUM).`);

  // Agent 3: Legal Cross-Checker
  pushEvent('AGENT_03', 'legal_crosscheck_result', `Cross-referencing against: ${regulations.join(', ')}`);
  const legalFindings = await runLegalChecker(model, clauses, scoredClauses, regulations);
  const violations = legalFindings.filter(f => f.status === 'VIOLATION').length;
  pushEvent('AGENT_03', 'legal_crosscheck_result', `Cross-check complete. ${violations} confirmed violations found.`);
  await sendToBand('legal_crosscheck_result', 'AGENT_03', legalFindings);

  pushEvent('AGENT_03', 'handoff', `HANDOFF → AGENT_04: Forwarding legal_crosscheck_result (${violations} violations).`);

  // Agent 4: Compliance Reporter
  pushEvent('AGENT_04', 'final_report', 'Generating compliance report...');
  const report = await runReporter(model, clauses, scoredClauses, legalFindings);
  pushEvent('AGENT_04', 'final_report', `Report generated. Overall risk: ${report.overallRisk}. ${report.criticalCount} critical, ${report.warningCount} warnings.`);
  await sendToBand('final_report', 'AGENT_04', report);

  // Close Band room
  if (bandRoomId) {
    await closeBandRoom(sessionId).catch(() => {});
  }

  // Save report
  session.report = report;
  session.status = 'complete';

  pushEvent('SYSTEM', 'complete', 'Pipeline complete. All 4 agents finished. Report ready.');
}

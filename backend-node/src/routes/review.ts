/**
 * Review routes — the main pipeline.
 *
 * POST /api/review/start   — upload doc + config, create session (pipeline NOT started yet)
 * GET  /api/review/:id/stream — SSE stream, starts the pipeline on first connection
 * GET  /api/review/:id/result — get final compliance report
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
import type { ComplianceReport, ReporterMetadata } from '../agents/reporter.js';

export const reviewRoutes = new Hono();

// In-memory session store
const sessions = new Map<string, {
  status: 'pending' | 'running' | 'complete' | 'error';
  fileName: string;
  regulations: string[];
  report: ComplianceReport | null;
  events: SSEEvent[];
  // Stored config for lazy pipeline start
  fileBuffer: Buffer | null;
  aiConfig: { apiKey: string; providerUrl: string; modelName: string } | null;
  pipelineStarted: boolean;
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

  // Create session in "pending" state — pipeline starts when SSE connects
  sessions.set(sessionId, {
    status: 'pending',
    fileName: file.name,
    regulations,
    report: null,
    events: [],
    fileBuffer: buffer,
    aiConfig: { apiKey, providerUrl, modelName },
    pipelineStarted: false,
  });

  return c.json({ sessionId, status: 'pending' });
});

// ─── GET /api/review/:id/stream ────────────────────────────

reviewRoutes.get('/review/:sessionId/stream', async (c) => {
  const { sessionId } = c.req.param();
  const session = sessions.get(sessionId);

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  return streamSSE(c, async (stream) => {
    // Start the pipeline NOW (SSE is connected, frontend is listening)
    if (!session.pipelineStarted && session.fileBuffer && session.aiConfig) {
      session.pipelineStarted = true;
      session.status = 'running';

      const fileBuffer = session.fileBuffer;
      const aiConfig = session.aiConfig;
      // Free the buffer from session memory
      session.fileBuffer = null;

      // Fire and forget — pipeline runs in background
      runPipeline(sessionId, fileBuffer, session.fileName, session.regulations, aiConfig)
        .catch(err => {
          console.error(`[Pipeline] Session ${sessionId} failed:`, err);
          const s = sessions.get(sessionId);
          if (s) {
            s.status = 'error';

            let errorMessage = err instanceof Error ? err.message : 'Pipeline failed unexpectedly.';

            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid API key')) {
              errorMessage = 'Invalid API key. Please check your settings and try again.';
            } else if (errorMessage.includes('429') || errorMessage.includes('Rate limit') || errorMessage.includes('quota')) {
              errorMessage = 'API rate limit or quota exceeded. Please wait or use a different provider.';
            } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
              errorMessage = 'Access denied. Your API key does not have permission for this model.';
            } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
              errorMessage = 'Cannot reach the AI provider. Please check your network connection.';
            } else if (errorMessage.includes('model') && errorMessage.includes('not found')) {
              errorMessage = 'Model not found. Please check the model name in your settings.';
            } else if (errorMessage.includes('aborted') || errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
              errorMessage = 'Request timed out. The provider may be slow or unreachable. Try again or use a different model.';
            }

            s.events.push({
              id: uuid(),
              agent: 'SYSTEM',
              type: 'error',
              content: errorMessage,
              timestamp: new Date().toISOString(),
            });
          }
        });
    }

    let lastIndex = 0;

    // Send any existing events first
    if (session.events.length > 0) {
      for (const event of session.events) {
        await stream.writeSSE({
          event: event.type,
          data: JSON.stringify(event),
        });
      }
      lastIndex = session.events.length;
    }

    // Poll for new events until pipeline finishes
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
        // Send final status event
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

      await stream.sleep(200);
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
    console.log(`[Pipeline] ${agent}: ${content.slice(0, 100)}`);
  };

  // Step 0: Parse document
  pushEvent('AGENT_01', 'clause_extraction_result', `Parsing document: ${fileName}`);
  const documentText = await parseDocument(fileBuffer, fileName);
  pushEvent('AGENT_01', 'clause_extraction_result', `Document parsed. ${documentText.length} characters extracted.`);

  // Try to create Band room (non-blocking)
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
  const scoredClauses = await runRiskAnalyzer(model, clauses, regulations);
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
  const reporterMetadata: ReporterMetadata = {
    sessionId,
    documentName: fileName,
    regulations,
    provider: aiConfig.providerUrl,
    model: aiConfig.modelName,
  };
  const report = await runReporter(model, clauses, scoredClauses, legalFindings, reporterMetadata);
  pushEvent('AGENT_04', 'final_report', `Report generated. Overall risk: ${report.overallRisk}. ${report.criticalCount} critical, ${report.warningCount} warnings.`);
  await sendToBand('final_report', 'AGENT_04', report);

  // Close Band room
  if (bandRoomId) {
    await closeBandRoom(sessionId).catch(() => {});
  }

  // Save report and mark complete
  session.report = report;
  session.status = 'complete';

  pushEvent('SYSTEM', 'complete', 'Pipeline complete. All 4 agents finished. Report ready.');
}

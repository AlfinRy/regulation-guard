/**
 * Agent 4 — Compliance Reporter
 *
 * Synthesizes all previous agent outputs into a final structured report.
 */

import { generateText } from 'ai';
import type { LanguageModelV1 } from 'ai';
import type { ExtractedClause } from './policyReader.js';
import type { RiskScoredClause } from './riskAnalyzer.js';
import type { CrossCheckFinding } from './legalChecker.js';

const SYSTEM_PROMPT = `You are a compliance report generator AI. You receive the outputs of three previous agents (clause extraction, risk analysis, legal cross-check) and must synthesize them into a single structured compliance report.

Rules:
1. Generate a report with:
   - overallRisk: HIGH, MEDIUM, or LOW
   - summary: a 2-3 sentence executive summary
   - recommendation: a clear actionable recommendation (e.g., "Do not sign without amendments to clauses X, Y, Z")
   - criticalCount: number of VIOLATION findings
   - warningCount: number of WARNING findings
   - passingCount: number of COMPLIANT findings
   - findings: array of all findings merged with clause text
2. Each finding should include the original clause text, risk reasoning, and legal cross-check result.
3. Return ONLY valid JSON. No markdown, no code fences.
4. Be concise with reasoning text — keep each one to 1-2 sentences.

Example output:
{
  "overallRisk": "HIGH",
  "summary": "The document contains 3 critical violations related to GDPR and OJK regulations.",
  "recommendation": "Do not sign without amendments to CL_002, CL_003, and CL_006.",
  "criticalCount": 3,
  "warningCount": 1,
  "passingCount": 4,
  "findings": [
    {
      "id": "CL_002",
      "clauseText": "...",
      "category": "Data Retention",
      "severity": "CRITICAL",
      "status": "VIOLATION",
      "regulation": "GDPR",
      "article": "Art. 5(1)(e)",
      "reasoning": "...",
      "confidence": 96,
      "humanReview": true
    }
  ]
}`;

export interface ReportFinding {
  id: string;
  clauseText: string;
  category: string;
  severity: 'CRITICAL' | 'MEDIUM' | 'LOW';
  status: 'VIOLATION' | 'WARNING' | 'COMPLIANT';
  regulation: string;
  article: string;
  reasoning: string;
  confidence: number;
  humanReview: boolean;
}

export interface ComplianceReport {
  overallRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  recommendation: string;
  criticalCount: number;
  warningCount: number;
  passingCount: number;
  findings: ReportFinding[];
}

/**
 * Attempt to repair truncated JSON by closing open structures.
 */
function tryRepairJSON(raw: string): ComplianceReport | null {
  // Strip markdown fences
  let json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // If it parses as-is, great
  try { return JSON.parse(json); } catch { /* continue */ }

  // Try progressively: find the last complete object in the findings array
  // by closing open brackets/braces
  for (let trimFrom = json.length; trimFrom > 10; trimFrom--) {
    const partial = json.slice(0, trimFrom);

    // Find last complete finding object (closing })
    const lastBrace = partial.lastIndexOf('}');
    if (lastBrace === -1) continue;

    let candidate = partial.slice(0, lastBrace + 1);

    // Count open vs close for [ and {
    const opens = (candidate.match(/[\[{]/g) || []).length;
    const closes = (candidate.match(/[\]}]/g) || []).length;
    const diff = opens - closes;

    // Close what's open
    candidate += ']'.repeat(diff);
    candidate += '}'.repeat(1);

    try {
      const parsed = JSON.parse(candidate);
      if (parsed.overallRisk && parsed.findings && Array.isArray(parsed.findings)) {
        console.log(`[Agent 4] Repaired JSON: recovered ${parsed.findings.length} findings`);
        // Recount since some findings may have been dropped
        parsed.criticalCount = parsed.findings.filter((f: ReportFinding) => f.status === 'VIOLATION').length;
        parsed.warningCount = parsed.findings.filter((f: ReportFinding) => f.status === 'WARNING').length;
        parsed.passingCount = parsed.findings.filter((f: ReportFinding) => f.status === 'COMPLIANT').length;
        return parsed as ComplianceReport;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export async function runReporter(
  model: LanguageModelV1,
  clauses: ExtractedClause[],
  scoredClauses: RiskScoredClause[],
  legalFindings: CrossCheckFinding[],
): Promise<ComplianceReport> {
  const { text } = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `Generate the final compliance report.

Extracted clauses:
${JSON.stringify(clauses, null, 2)}

Risk analysis:
${JSON.stringify(scoredClauses, null, 2)}

Legal cross-check findings:
${JSON.stringify(legalFindings, null, 2)}`,
    maxTokens: 8000,
    abortSignal: AbortSignal.timeout(300_000),
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const report: ComplianceReport = JSON.parse(cleaned);
    return report;
  } catch {
    console.error('[Agent 4] Failed to parse report response. Attempting repair...');
    const repaired = tryRepairJSON(text);
    if (repaired) return repaired;

    console.error('[Agent 4] Repair failed. Raw response:', text.slice(0, 300));
    throw new Error('Agent 4 (Compliance Reporter) failed. The model response was not valid JSON.');
  }
}

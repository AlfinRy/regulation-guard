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
3. Return ONLY valid JSON. No markdown.

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
      "severity": "HIGH",
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
    maxTokens: 4000,
    abortSignal: AbortSignal.timeout(120_000),
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const report: ComplianceReport = JSON.parse(cleaned);
    return report;
  } catch {
    console.error('[Agent 4] Failed to parse report response:', text.slice(0, 200));
    throw new Error('Agent 4 (Compliance Reporter) failed. The model response was not valid JSON.');
  }
}

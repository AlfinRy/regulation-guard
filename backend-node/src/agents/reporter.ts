/**
 * Agent 4 — Compliance Reporter
 *
 * Synthesizes all previous agent outputs into a final structured report.
 *
 * Improvements applied:
 * - Preserves Agent 3 reasoning verbatim (no summarization)
 * - Severity uses HIGH (not CRITICAL) consistently with Agent 2
 * - Cleaner tryRepairJSON — truncate at last complete finding object
 * - Includes metadata (sessionId, provider, regulations, timestamp)
 * - Exports reportToMarkdown() utility
 */

import { generateText } from 'ai';
import type { LanguageModelV1 } from 'ai';
import type { ExtractedClause } from './policyReader.js';
import type { RiskScoredClause } from './riskAnalyzer.js';
import type { CrossCheckFinding } from './legalChecker.js';
import { parseJSONObject } from '../lib/parseJSON.js';

const SYSTEM_PROMPT = `You are a compliance report generator AI. You receive the outputs of three previous agents (clause extraction, risk analysis, legal cross-check) and must synthesize them into a single structured compliance report.

Rules:
1. Generate a report with:
   - overallRisk: HIGH, MEDIUM, or LOW
   - summary: a 2-3 sentence executive summary
   - recommendation: a clear actionable recommendation
   - criticalCount: number of VIOLATION findings
   - warningCount: number of WARNING findings
   - passingCount: number of COMPLIANT findings
   - findings: array of all findings merged with clause text
2. Each finding should include the original clause text, risk reasoning, and legal cross-check result.
3. For each finding, use the reasoning from the legal cross-check findings VERBATIM. Do not summarize or shorten it. Only the executive summary should be your own words.
4. Return ONLY valid JSON. No markdown, no code fences.
5. severity must be one of: HIGH, MEDIUM, or LOW (never use CRITICAL).

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
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
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
  metadata?: {
    sessionId: string;
    documentName: string;
    regulations: string[];
    provider: string;
    model: string;
    generatedAt: string;
  };
}

/**
 * Attempt to repair truncated JSON by finding the last complete finding object.
 */
function tryRepairJSON(raw: string): ComplianceReport | null {
  const json = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try parsing as-is first
  try {
    const parsed = JSON.parse(json);
    if (parsed?.overallRisk && Array.isArray(parsed?.findings)) {
      return parsed as ComplianceReport;
    }
  } catch {
    /* continue */
  }

  // Find the last complete finding entry boundary
  const lastCompleteEntry = Math.max(
    json.lastIndexOf('},\n  {'),
    json.lastIndexOf('},\n{'),
    json.lastIndexOf('}\n  ]'),
    json.lastIndexOf('}\n]'),
  );

  if (lastCompleteEntry === -1) return null;

  // Truncate after the last complete object and close the structures
  const truncated = json.slice(0, lastCompleteEntry + 1) + '\n  ]\n}';

  try {
    const parsed = JSON.parse(truncated);
    if (parsed?.overallRisk && Array.isArray(parsed?.findings)) {
      // Recount based on recovered findings
      parsed.criticalCount = parsed.findings.filter(
        (f: ReportFinding) => f.status === 'VIOLATION',
      ).length;
      parsed.warningCount = parsed.findings.filter(
        (f: ReportFinding) => f.status === 'WARNING',
      ).length;
      parsed.passingCount = parsed.findings.filter(
        (f: ReportFinding) => f.status === 'COMPLIANT',
      ).length;
      console.log(`[Agent 4] Repaired JSON: recovered ${parsed.findings.length} findings`);
      return parsed as ComplianceReport;
    }
  } catch {
    /* fall through */
  }

  return null;
}

export interface ReporterMetadata {
  sessionId: string;
  documentName: string;
  regulations: string[];
  provider: string;
  model: string;
}

export async function runReporter(
  model: LanguageModelV1,
  clauses: ExtractedClause[],
  scoredClauses: RiskScoredClause[],
  legalFindings: CrossCheckFinding[],
  metadata?: ReporterMetadata,
): Promise<ComplianceReport> {
  const metadataContext = metadata
    ? `\n\nReport metadata: sessionId=${metadata.sessionId}, document="${metadata.documentName}", regulations=[${metadata.regulations.join(', ')}], provider=${metadata.provider}, model=${metadata.model}.`
    : '';

  const { text } = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `Generate the final compliance report.

Extracted clauses:
${JSON.stringify(clauses, null, 2)}

Risk analysis:
${JSON.stringify(scoredClauses, null, 2)}

Legal cross-check findings:
${JSON.stringify(legalFindings, null, 2)}
${metadataContext}`,
    maxTokens: 8000,
    abortSignal: AbortSignal.timeout(180_000),
  });

  let report: ComplianceReport;

  try {
    report = parseJSONObject<ComplianceReport>(text, 'Agent 4');
  } catch {
    console.error('[Agent 4] Failed to parse report response. Attempting repair...');
    const repaired = tryRepairJSON(text);
    if (repaired) {
      report = repaired;
    } else {
      console.error('[Agent 4] Repair failed. Raw response:', text.slice(0, 300));
      throw new Error('Agent 4 (Compliance Reporter) failed. The model response was not valid JSON.');
    }
  }

  // Attach metadata (not generated by LLM, added programmatically)
  if (metadata) {
    report.metadata = {
      sessionId: metadata.sessionId,
      documentName: metadata.documentName,
      regulations: metadata.regulations,
      provider: metadata.provider,
      model: metadata.model,
      generatedAt: new Date().toISOString(),
    };
  }

  return report;
}

// ─── Markdown Export Utility ─────────────────────────────

export function reportToMarkdown(report: ComplianceReport): string {
  const lines: string[] = [];

  lines.push('# Compliance Audit Report');
  lines.push('');

  // Metadata section
  if (report.metadata) {
    lines.push('## Report Metadata');
    lines.push('');
    lines.push(`- **Session ID**: ${report.metadata.sessionId}`);
    lines.push(`- **Document**: ${report.metadata.documentName}`);
    lines.push(`- **Regulations**: ${report.metadata.regulations.join(', ')}`);
    lines.push(`- **AI Provider**: ${report.metadata.provider}`);
    lines.push(`- **Model**: ${report.metadata.model}`);
    lines.push(`- **Generated At**: ${report.metadata.generatedAt}`);
    lines.push('');
  }

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(`**Overall Risk Level**: ${report.overallRisk}`);
  lines.push('');
  lines.push(report.summary);
  lines.push('');
  lines.push(`**Recommendation**: ${report.recommendation}`);
  lines.push('');

  // Risk Matrix
  lines.push('## Risk Matrix');
  lines.push('');
  lines.push(`| Category | Count |`);
  lines.push(`|----------|-------|`);
  lines.push(`| ❌ Violations | ${report.criticalCount} |`);
  lines.push(`| ⚠️ Warnings | ${report.warningCount} |`);
  lines.push(`| ✅ Compliant | ${report.passingCount} |`);
  lines.push('');

  // Detailed Findings
  lines.push('## Detailed Findings');
  lines.push('');

  for (const finding of report.findings) {
    const statusIcon = finding.status === 'VIOLATION' ? '❌' : finding.status === 'WARNING' ? '⚠️' : '✅';
    lines.push(`### ${statusIcon} ${finding.id} — ${finding.category}`);
    lines.push('');
    lines.push(`- **Status**: ${finding.status}`);
    lines.push(`- **Severity**: ${finding.severity}`);
    lines.push(`- **Regulation**: ${finding.regulation}`);
    lines.push(`- **Article**: ${finding.article}`);
    lines.push(`- **Confidence**: ${finding.confidence}%`);
    lines.push(`- **Human Review Required**: ${finding.humanReview ? 'Yes' : 'No'}`);
    lines.push('');
    lines.push(`**Clause Text**: ${finding.clauseText}`);
    lines.push('');
    lines.push(`**Reasoning**: ${finding.reasoning}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

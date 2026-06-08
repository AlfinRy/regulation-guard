/**
 * Agent 3 — Legal Cross-Checker
 *
 * Takes high/medium risk clauses and cross-references them
 * against the user's selected regulations.
 */

import { generateText } from 'ai';
import type { LanguageModelV1 } from 'ai';
import type { ExtractedClause } from './policyReader.js';
import type { RiskScoredClause } from './riskAnalyzer.js';

const SYSTEM_PROMPT = `You are a legal compliance cross-checker AI. You receive clauses that have been flagged as HIGH or MEDIUM risk, along with the regulations the user wants to check against.

Rules:
1. For each clause, cross-reference against the specified regulations and provide:
   - id: same as input
   - status: VIOLATION, WARNING, or COMPLIANT
   - regulation: the specific regulation name
   - article: the specific article or section (e.g., "Art. 5(1)(e)")
   - reasoning: detailed explanation of why this clause does or does not comply
   - confidence: a number 0-100 representing your confidence in this finding
   - humanReview: true if this finding should be escalated to a human legal professional
2. Be conservative: mark findings as VIOLATION only when you are confident. Use WARNING when uncertain.
3. Set humanReview to true for any VIOLATION or when confidence is below 90.
4. Return ONLY a valid JSON array. No markdown.

Example output:
[
  {
    "id": "CL_002",
    "status": "VIOLATION",
    "regulation": "GDPR",
    "article": "Art. 5(1)(e)",
    "reasoning": "No deletion timeline specified. GDPR requires data retention to be limited to what is necessary.",
    "confidence": 96,
    "humanReview": true
  }
]`;

export interface CrossCheckFinding {
  id: string;
  status: 'VIOLATION' | 'WARNING' | 'COMPLIANT';
  regulation: string;
  article: string;
  reasoning: string;
  confidence: number;
  humanReview: boolean;
}

export async function runLegalChecker(
  model: LanguageModelV1,
  clauses: ExtractedClause[],
  scoredClauses: RiskScoredClause[],
  regulations: string[],
): Promise<CrossCheckFinding[]> {
  // Only cross-check HIGH and MEDIUM clauses
  const highRiskIds = scoredClauses
    .filter(c => c.severity === 'HIGH' || c.severity === 'MEDIUM')
    .map(c => c.id);

  const riskyClauses = clauses.filter(c => highRiskIds.includes(c.id));
  const riskContext = scoredClauses.filter(c => highRiskIds.includes(c.id));

  if (riskyClauses.length === 0) {
    return clauses.map(c => ({
      id: c.id,
      status: 'COMPLIANT' as const,
      regulation: 'General',
      article: 'N/A',
      reasoning: 'No regulatory concerns identified.',
      confidence: 99,
      humanReview: false,
    }));
  }

  const { text } = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `Cross-check these clauses against the following regulations: ${regulations.join(', ')}.

Clauses to check:
${JSON.stringify(riskyClauses, null, 2)}

Risk analysis context:
${JSON.stringify(riskContext, null, 2)}`,
    maxTokens: 4000,
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const findings: CrossCheckFinding[] = JSON.parse(cleaned);

    if (!Array.isArray(findings)) {
      throw new Error('Response is not an array');
    }

    // Merge: clauses not in findings get COMPLIANT
    const findingsIds = findings.map(f => f.id);
    const compliantFill = clauses
      .filter(c => !findingsIds.includes(c.id))
      .map(c => ({
        id: c.id,
        status: 'COMPLIANT' as const,
        regulation: 'General',
        article: 'N/A',
        reasoning: 'No regulatory concerns identified for this clause.',
        confidence: 98,
        humanReview: false,
      }));

    return [...findings, ...compliantFill];
  } catch {
    console.error('[Agent 3] Failed to parse legal cross-check response:', text.slice(0, 200));
    throw new Error('Agent 3 (Legal Cross-Checker) failed. The model response was not valid JSON.');
  }
}

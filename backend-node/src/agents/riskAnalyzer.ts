/**
 * Agent 2 — Risk Analyzer
 *
 * Takes extracted clauses and produces risk scores with reasoning.
 */

import { generateText } from 'ai';
import type { LanguageModelV1 } from 'ai';
import type { ExtractedClause } from './policyReader.js';

const SYSTEM_PROMPT = `You are a risk analysis AI for legal documents. You receive a list of extracted clauses and must analyze each one for compliance risk.

Rules:
1. For each clause, provide:
   - id: same as input
   - severity: HIGH, MEDIUM, or LOW (you may upgrade or downgrade from the initial assessment)
   - reasoning: a brief explanation of why this risk level was assigned
   - riskFactors: specific regulatory concerns (e.g., "GDPR Art. 5(1)(e)", "OJK POJK 12/2018")
2. Focus especially on clauses related to: data retention, liability caps, subprocessor consent, termination notice, and breach notification.
3. Return ONLY a valid JSON array. No markdown, no explanation.
4. A clause should be marked HIGH if it poses a clear regulatory violation risk.

Example output:
[
  {
    "id": "CL_002",
    "severity": "HIGH",
    "reasoning": "24-month data retention post-termination with no deletion timeline violates GDPR storage limitation.",
    "riskFactors": ["GDPR Art. 5(1)(e)"]
  }
]`;

export interface RiskScoredClause {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
  riskFactors: string[];
}

export async function runRiskAnalyzer(
  model: LanguageModelV1,
  clauses: ExtractedClause[],
): Promise<RiskScoredClause[]> {
  const { text } = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `Analyze the risk level of these clauses:\n\n${JSON.stringify(clauses, null, 2)}`,
    maxTokens: 4000,
    abortSignal: AbortSignal.timeout(120_000),
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const scored: RiskScoredClause[] = JSON.parse(cleaned);

    if (!Array.isArray(scored)) {
      throw new Error('Response is not an array');
    }

    return scored;
  } catch {
    console.error('[Agent 2] Failed to parse risk analysis response:', text.slice(0, 200));
    throw new Error('Agent 2 (Risk Analyzer) failed. The model response was not valid JSON.');
  }
}

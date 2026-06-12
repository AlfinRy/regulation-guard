/**
 * Agent 2 — Risk Analyzer
 *
 * Takes extracted clauses and produces risk scores with reasoning.
 *
 * Improvements applied:
 * - Robust JSON parsing via shared parseJSONArray utility
 * - Injects regulation-specific risk patterns from knowledge files
 * - Validates all input clause IDs appear in output (auto-fills missing as LOW)
 * - Accepts regulations param for knowledge injection
 */

import { generateText } from 'ai';
import type { LanguageModelV1 } from 'ai';
import type { ExtractedClause } from './policyReader.js';
import { parseJSONArray } from '../lib/parseJSON.js';
import { loadRegulationKnowledge } from '../lib/knowledgeLoader.js';

const SYSTEM_PROMPT = `You are a risk analysis AI for legal documents. You receive a list of extracted clauses and must analyze each one for compliance risk.

Rules:
1. For each clause, provide:
   - id: same as input (MANDATORY — every input clause MUST appear in your output)
   - severity: HIGH, MEDIUM, or LOW
   - reasoning: a brief explanation of why this risk level was assigned
   - riskFactors: specific regulatory concerns (e.g., "GDPR Art. 5(1)(e)", "OJK POJK 12/2018")
2. Focus especially on clauses related to: data retention, liability caps, subprocessor consent, termination notice, and breach notification.
3. Return ONLY a valid JSON array. No markdown, no explanation.
4. A clause should be marked HIGH if it poses a clear regulatory violation risk.
5. NEVER skip or omit any clause — every input clause ID must appear in the output array.

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
  regulations: string[] = [],
): Promise<RiskScoredClause[]> {
  // Inject regulation-specific risk patterns
  let systemPrompt = SYSTEM_PROMPT;
  if (regulations.length > 0) {
    const knowledgeContext = await loadRegulationKnowledge(regulations, ['risk_patterns']);
    if (knowledgeContext) {
      systemPrompt = `${SYSTEM_PROMPT}\n\n${knowledgeContext}`;
    }
  }

  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: `Analyze the risk level of these clauses:\n\n${JSON.stringify(clauses, null, 2)}`,
    maxTokens: 6000,
    abortSignal: AbortSignal.timeout(300_000),
  });

  const scored = parseJSONArray<RiskScoredClause>(text, 'Agent 2');

  // Validate all input clause IDs appear in output — fill missing as LOW
  const scoredIds = new Set(scored.map((c) => c.id));
  const missing = clauses
    .filter((c) => !scoredIds.has(c.id))
    .map((c) => ({
      id: c.id,
      severity: 'LOW' as const,
      reasoning: `Clause was not scored by Agent 2 (category: ${c.category}). Manual review recommended.`,
      riskFactors: [] as string[],
    }));

  if (missing.length > 0) {
    console.warn(`[Agent 2] ${missing.length} clauses missing from output, auto-filled as LOW: ${missing.map((m) => m.id).join(', ')}`);
  }

  return [...scored, ...missing];
}

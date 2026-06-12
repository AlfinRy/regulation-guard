/**
 * Agent 3 — Legal Cross-Checker
 *
 * Takes all scored clauses and cross-references them
 * against the user's selected regulations.
 *
 * Improvements applied:
 * - All scored clauses (HIGH + MEDIUM + LOW) go to the model
 * - Missed findings get WARNING + humanReview: true
 * - Regulation knowledge injected from /knowledge/ files at runtime
 * - Batching for large clause sets (8 per batch)
 * - One retry on JSON parse failure
 */

import { generateText } from 'ai';
import type { LanguageModelV1 } from 'ai';
import type { ExtractedClause } from './policyReader.js';
import type { RiskScoredClause } from './riskAnalyzer.js';
import { parseJSONArray } from '../lib/parseJSON.js';
import { loadRegulationKnowledge } from '../lib/knowledgeLoader.js';

const SYSTEM_PROMPT = `You are a legal compliance cross-checker AI. You receive clauses that have been risk-scored, along with the regulations the user wants to check against.

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
5. EVERY input clause MUST appear in your output — never skip any clause.

Critical distinctions:
- "unauthorized data access" (security incident) vs "insufficient data retention period" (storage limitation) — these are different violations with different articles.
- "cross-border transfer without safeguards" vs "domestic processing" — check actual transfer scope.
- "no right to retain after termination" vs "retention period too short" — distinguish legal basis from duration.

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

const BATCH_SIZE = 8;

/**
 * Run legal cross-check on a single batch of clauses.
 */
async function runLegalCheckerBatch(
  model: LanguageModelV1,
  clausesBatch: ExtractedClause[],
  riskContextBatch: RiskScoredClause[],
  regulations: string[],
  systemWithKnowledge: string,
): Promise<CrossCheckFinding[]> {
  const { text } = await generateText({
    model,
    system: systemWithKnowledge,
    prompt: `Cross-check these clauses against the following regulations: ${regulations.join(', ')}.

Clauses to check:
${JSON.stringify(clausesBatch, null, 2)}

Risk analysis context (includes riskFactors from Agent 2):
${JSON.stringify(riskContextBatch, null, 2)}`,
    maxTokens: 6000,
    abortSignal: AbortSignal.timeout(300_000),
  });

  try {
    return parseJSONArray<CrossCheckFinding>(text, 'Agent 3');
  } catch {
    // One retry with a simplified repair prompt
    console.warn('[Agent 3] Parse failed, retrying with repair prompt...');
    try {
      const { text: retryText } = await generateText({
        model,
        system: 'You are a JSON repair assistant. Return ONLY valid JSON, no markdown, no explanation.',
        prompt: `Fix this invalid JSON array and return ONLY the corrected array:\n\n${text.slice(0, 4000)}`,
        maxTokens: 4000,
        abortSignal: AbortSignal.timeout(120_000),
      });
      return parseJSONArray<CrossCheckFinding>(retryText, 'Agent 3 (retry)');
    } catch (retryErr) {
      console.error('[Agent 3] Retry also failed:', retryErr);
      throw new Error('Agent 3 (Legal Cross-Checker) failed after retry. The model response was not valid JSON.');
    }
  }
}

/**
 * Chunk an array into batches of given size.
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function runLegalChecker(
  model: LanguageModelV1,
  clauses: ExtractedClause[],
  scoredClauses: RiskScoredClause[],
  regulations: string[],
): Promise<CrossCheckFinding[]> {
  // Inject regulation knowledge at runtime
  let systemWithKnowledge = SYSTEM_PROMPT;
  if (regulations.length > 0) {
    const knowledgeContext = await loadRegulationKnowledge(
      regulations,
      ['articles', 'incident_reporting', 'data_localization', 'retention', 'cross_border'],
    );
    if (knowledgeContext) {
      systemWithKnowledge = `${SYSTEM_PROMPT}\n\n${knowledgeContext}`;
    }
  }

  // Build scored clause lookup for riskFactors passthrough
  const scoredMap = new Map(scoredClauses.map((sc) => [sc.id, sc]));

  // All scored clauses go to the model — not just HIGH/MEDIUM
  // LOW clauses are sent too so the model can confirm COMPLIANT status
  const clausesWithRisk = clauses.map((c) => ({
    ...c,
    riskFactors: scoredMap.get(c.id)?.riskFactors ?? [],
    riskSeverity: scoredMap.get(c.id)?.severity ?? 'LOW',
  }));

  if (clausesWithRisk.length === 0) {
    return [];
  }

  // Batch processing for large clause sets
  const batches = chunkArray(clausesWithRisk, BATCH_SIZE);
  console.log(`[Agent 3] Processing ${clausesWithRisk.length} clauses in ${batches.length} batch(es)`);

  let allFindings: CrossCheckFinding[];

  if (batches.length === 1) {
    // Single batch — no need for batching overhead
    const riskContextBatch = clausesWithRisk.map((c) => ({
      id: c.id,
      severity: c.riskSeverity,
      reasoning: scoredMap.get(c.id)?.reasoning ?? '',
      riskFactors: c.riskFactors,
    }));
    allFindings = await runLegalCheckerBatch(model, clauses, riskContextBatch, regulations, systemWithKnowledge);
  } else {
    // Multi-batch parallel processing
    const batchResults = await Promise.all(
      batches.map(async (batch) => {
        const riskContextBatch = batch.map((c) => ({
          id: c.id,
          severity: c.riskSeverity,
          reasoning: scoredMap.get(c.id)?.reasoning ?? '',
          riskFactors: c.riskFactors,
        }));
        return runLegalCheckerBatch(model, batch, riskContextBatch, regulations, systemWithKnowledge);
      }),
    );
    allFindings = batchResults.flat();
  }

  // Fill missing clauses with WARNING + humanReview
  const findingsIds = new Set(allFindings.map((f) => f.id));
  const missedFill = clauses
    .filter((c) => !findingsIds.has(c.id))
    .map((c) => ({
      id: c.id,
      status: 'WARNING' as const,
      regulation: regulations[0] || 'General',
      article: 'N/A',
      reasoning: `Clause was not cross-checked by Agent 3 (category: ${c.category}). Manual review recommended.`,
      confidence: 50,
      humanReview: true,
    }));

  if (missedFill.length > 0) {
    console.warn(`[Agent 3] ${missedFill.length} clauses missing from output, auto-filled as WARNING: ${missedFill.map((m) => m.id).join(', ')}`);
  }

  return [...allFindings, ...missedFill];
}

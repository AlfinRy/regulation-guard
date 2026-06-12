/**
 * Agent 1 — Policy Reader
 *
 * Reads the raw document text, extracts and categorizes all clauses.
 *
 * Improvements applied:
 * - Robust JSON parsing via shared parseJSONArray utility
 * - Removed severity field (Agent 2 handles scoring)
 * - Expanded category list to reduce "Other" catchall
 * - Chunking for large documents (>3000 words)
 */

import { generateText } from 'ai';
import type { LanguageModelV1 } from 'ai';
import { parseJSONArray } from '../lib/parseJSON.js';
import { warnIfOversized } from '../lib/tokenEstimate.js';

const SYSTEM_PROMPT = `You are a legal document analyst AI. Your job is to read a contract or policy document and extract every distinct clause as structured JSON.

Rules:
1. Identify every meaningful clause in the document.
2. For each clause, provide:
   - id: "CL_XXX" (sequential number, e.g. CL_001)
   - category: one of [Payment, Liability, IP, Termination, Data, Subprocessor, Audit, Confidentiality, Security, Dispute, ForceMajeure, CrossBorderTransfer, DataRetention, Other]
   - text: the exact or closely paraphrased clause text
3. Return ONLY a valid JSON array. No markdown, no explanation, just the array.
4. If the document is not a legal document, return an empty array.

Example output:
[
  {
    "id": "CL_001",
    "category": "Payment",
    "text": "Payment terms: Net 30 days from invoice receipt."
  },
  {
    "id": "CL_002",
    "category": "DataRetention",
    "text": "Vendor shall retain logs for a minimum of 1 year after contract termination."
  }
]`;

export interface ExtractedClause {
  id: string;
  category: string;
  text: string;
}

const MAX_WORDS_PER_CHUNK = 3000;

/**
 * Split document text into chunks of ~MAX_WORDS_PER_CHUNK words,
 * trying to break at paragraph boundaries.
 */
function chunkDocument(text: string): string[] {
  const words = text.split(/\s+/);
  if (words.length <= MAX_WORDS_PER_CHUNK) return [text];

  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    if (current.split(/\s+/).length >= MAX_WORDS_PER_CHUNK) {
      chunks.push(current.trim());
      current = '';
    }
    current += (current ? ' ' : '') + word;
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * Deduplicate clauses extracted from multiple chunks and re-sequence IDs.
 */
function deduplicateAndReindex(allClauses: ExtractedClause[]): ExtractedClause[] {
  const seen = new Set<string>();
  const unique: ExtractedClause[] = [];

  for (const clause of allClauses) {
    // Normalize text for dedup: lowercase, collapse whitespace
    const key = clause.text.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(clause);
    }
  }

  // Re-sequence IDs
  return unique.map((c, i) => ({
    ...c,
    id: `CL_${String(i + 1).padStart(3, '0')}`,
  }));
}

export async function runPolicyReader(
  model: LanguageModelV1,
  documentText: string,
): Promise<ExtractedClause[]> {
  warnIfOversized('Agent 1 prompt', documentText, 120_000);

  const chunks = chunkDocument(documentText);

  if (chunks.length === 1) {
    // Single chunk — simple path
    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: `Extract all clauses from the following document:\n\n${documentText}`,
      maxTokens: 6000,
      abortSignal: AbortSignal.timeout(300_000),
    });

    return parseJSONArray<ExtractedClause>(text, 'Agent 1');
  }

  // Multi-chunk path
  console.log(`[Agent 1] Document split into ${chunks.length} chunks (${documentText.split(/\s+/).length} words total)`);

  const allClauses: ExtractedClause[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`[Agent 1] Processing chunk ${i + 1}/${chunks.length}...`);

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT + `\n\nNote: This is chunk ${i + 1} of ${chunks.length}. Extract all clauses from this chunk only. Start IDs from CL_${String(i * 50 + 1).padStart(3, '0')}.`,
      prompt: `Extract all clauses from the following document chunk:\n\n${chunks[i]}`,
      maxTokens: 6000,
      abortSignal: AbortSignal.timeout(300_000),
    });

    try {
      const chunkClauses = parseJSONArray<ExtractedClause>(text, `Agent 1 (chunk ${i + 1})`);
      allClauses.push(...chunkClauses);
    } catch (err) {
      console.warn(`[Agent 1] Chunk ${i + 1} failed to parse, continuing...`, err);
    }
  }

  return deduplicateAndReindex(allClauses);
}

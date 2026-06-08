/**
 * Agent 1 — Policy Reader
 *
 * Reads the raw document text, extracts and categorizes all clauses.
 */

import { generateText } from 'ai';
import type { LanguageModelV1 } from 'ai';

const SYSTEM_PROMPT = `You are a legal document analyst AI. Your job is to read a contract or policy document and extract every distinct clause as structured JSON.

Rules:
1. Identify every meaningful clause in the document (payment, liability, intellectual property, termination, data handling, audit, confidentiality, etc.)
2. For each clause, provide:
   - id: "CL_XXX" (sequential number, e.g. CL_001)
   - category: one of [Payment, Liability, IP, Termination, Data, Subprocessor, Audit, Confidentiality, Other]
   - text: the exact or closely paraphrased clause text
   - severity: your initial assessment of risk level — HIGH, MEDIUM, or LOW
3. Return ONLY a valid JSON array. No markdown, no explanation, just the array.
4. If the document is not a legal document, return an empty array.

Example output:
[
  {
    "id": "CL_001",
    "category": "Payment",
    "text": "Payment terms: Net 30 days from invoice receipt.",
    "severity": "LOW"
  }
]`;

export interface ExtractedClause {
  id: string;
  category: string;
  text: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export async function runPolicyReader(
  model: LanguageModelV1,
  documentText: string,
): Promise<ExtractedClause[]> {
  const { text } = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `Extract all clauses from the following document:\n\n${documentText}`,
    maxTokens: 4000,
  });

  try {
    // Try to parse the response as JSON
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const clauses: ExtractedClause[] = JSON.parse(cleaned);

    if (!Array.isArray(clauses)) {
      throw new Error('Response is not an array');
    }

    return clauses;
  } catch {
    console.error('[Agent 1] Failed to parse clause extraction response:', text.slice(0, 200));
    throw new Error('Agent 1 (Policy Reader) failed to extract clauses. The model response was not valid JSON.');
  }
}

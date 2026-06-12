/**
 * Shared JSON parsing utilities for all agents.
 *
 * Handles the common case where LLM responses include markdown fences,
 * preamble text, or other non-JSON content around the actual JSON payload.
 */

/**
 * Parse a JSON array from a raw LLM response string.
 * Finds the first `[` and last `]` to extract the array, regardless
 * of surrounding text or markdown fences.
 *
 * @throws Error with agent name context if no valid array found
 */
export function parseJSONArray<T>(raw: string, agentName: string): T[] {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) {
    throw new Error(
      `${agentName}: No JSON array found in response. Preview: ${cleaned.slice(0, 200)}`,
    );
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed)) {
    throw new Error(`${agentName}: Parsed value is not an array.`);
  }
  return parsed as T[];
}

/**
 * Parse a JSON object from a raw LLM response string.
 * Finds the first `{` and last `}` to extract the object.
 *
 * @throws Error with agent name context if no valid object found
 */
export function parseJSONObject<T>(raw: string, agentName: string): T {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(
      `${agentName}: No JSON object found in response. Preview: ${cleaned.slice(0, 200)}`,
    );
  }
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

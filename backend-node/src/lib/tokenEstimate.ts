/**
 * Simple token estimator for prompt size checks.
 * Uses the heuristic: 1 token ≈ 4 characters.
 * Not exact, but sufficient for guard-rail logging.
 */

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Log a warning if the estimated token count exceeds a threshold
 * percentage of the model's max context.
 */
export function warnIfOversized(
  label: string,
  text: string,
  maxTokens: number,
  thresholdPercent = 80,
): void {
  const estimated = estimateTokens(text);
  const limit = Math.floor(maxTokens * (thresholdPercent / 100));
  if (estimated > limit) {
    console.warn(
      `[TokenEstimate] ${label}: estimated ${estimated} tokens exceeds ${thresholdPercent}% of maxTokens (${maxTokens}). Consider chunking.`,
    );
  }
}

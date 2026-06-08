/**
 * BYOK AI SDK client factory.
 *
 * Accepts provider config via HTTP headers, instantiates the correct
 * AI SDK provider, and returns a callable model.
 *
 * Header contract:
 *   X-API-Key       — user's API key
 *   X-Provider-URL  — base URL of the provider
 *   X-Model-Name    — model identifier string
 */

import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModelV1 } from 'ai';

export interface AIClientConfig {
  apiKey: string;
  providerUrl: string;
  modelName: string;
}

const ANTHROPIC_URL = 'https://api.anthropic.com';

/**
 * Create an AI SDK model instance based on the provider URL.
 * Almost all supported providers use OpenAI-compatible API format,
 * so `createOpenAI` with a custom `baseURL` handles them.
 * Anthropic is the single special case that needs its own SDK.
 */
export function createModel(config: AIClientConfig): LanguageModelV1 {
  const { apiKey, providerUrl, modelName } = config;

  if (providerUrl === ANTHROPIC_URL) {
    const provider = createAnthropic({ apiKey });
    return provider(modelName);
  }

  // All other providers: OpenAI-compatible format with custom base URL
  const provider = createOpenAI({
    baseURL: providerUrl,
    apiKey,
  });

  return provider(modelName);
}

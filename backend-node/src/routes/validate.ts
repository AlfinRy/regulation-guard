/**
 * POST /api/validate-key
 *
 * Tests whether the user's API key is valid for the chosen provider.
 * Makes a minimal LLM call to verify connectivity.
 */

import { Hono } from 'hono';
import { generateText } from 'ai';
import { createModel } from '../lib/aiClient.js';

export const validateRoutes = new Hono();

validateRoutes.post('/validate-key', async (c) => {
  const apiKey = c.req.header('X-API-Key');
  const providerUrl = c.req.header('X-Provider-URL');
  const modelName = c.req.header('X-Model-Name');

  if (!apiKey || !providerUrl || !modelName) {
    return c.json({ valid: false, error: 'Missing required headers: X-API-Key, X-Provider-URL, X-Model-Name' }, 400);
  }

  try {
    const model = createModel({ apiKey, providerUrl, modelName });

    // Minimal LLM call to verify the key works
    await generateText({
      model,
      prompt: 'Reply with exactly: OK',
      maxTokens: 10,
    });

    return c.json({ valid: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ valid: false, error: message }, 200);
  }
});

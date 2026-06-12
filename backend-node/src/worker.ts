/**
 * Cloudflare Workers entry point for RegulationGuard API.
 *
 * This file exports the Hono app directly for Workers runtime.
 * The Node.js entry point (index.ts) uses @hono/node-server instead.
 *
 * On Workers, the ASSETS binding provides access to knowledge files
 * without needing filesystem access.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { reviewRoutes } from './routes/review.js';
import { validateRoutes } from './routes/validate.js';
import { setAssetsBinding } from './lib/knowledgeLoader.js';

type Bindings = {
  ENVIRONMENT: string;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// Inject ASSETS binding into knowledgeLoader before each request
app.use('*', async (c, next) => {
  if (c.env.ASSETS) {
    setAssetsBinding(c.env.ASSETS);
  }
  await next();
});

// Middleware
app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ];
    if (!origin) return origin;
    if (allowed.includes(origin)) return origin;
    if (origin.endsWith('.pages.dev')) return origin;
    if (origin.endsWith('.workers.dev')) return origin;
    return '';
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-API-Key', 'X-Provider-URL', 'X-Model-Name'],
}));
app.use('*', logger());

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
  });
});

// Routes
app.route('/api', reviewRoutes);
app.route('/api', validateRoutes);

// 404
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

export default app;

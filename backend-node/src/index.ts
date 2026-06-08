import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { reviewRoutes } from './routes/review.js';
import { validateRoutes } from './routes/validate.js';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-API-Key', 'X-Provider-URL', 'X-Model-Name'],
}));
app.use('*', logger());

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.route('/api', reviewRoutes);
app.route('/api', validateRoutes);

// 404
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);

serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`[regulation-guard] Node.js backend running on http://localhost:${info.port}`);
});

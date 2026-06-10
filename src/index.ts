import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createDB } from './db';
import { adminRoutes } from './routes/admin';
import { docsRoutes } from './routes/docs';
import { apiRoutes } from './routes/api';
import { mediaRoutes } from './routes/media';
import { DOCFORGE_ICON_SVG } from './assets';
import type { AppType } from './types';

const app = new Hono<AppType>();

app.use('*', cors());
app.use('*', logger());

app.get('/favicon.svg', async (c) => {
  const asset = await c.env.ASSETS?.fetch(new URL('/favicon.svg', c.req.url));
  if (asset?.ok) return asset;
  return c.body(DOCFORGE_ICON_SVG, 200, {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=31536000, immutable',
  });
});

app.get('/favicon.png', (c) => c.env.ASSETS.fetch(new URL('/favicon.png', c.req.url)));
app.get('/favicon.ico', (c) => c.env.ASSETS.fetch(new URL('/favicon.ico', c.req.url)));

app.get('/assets/maps/world.json', async (c) => {
  const asset = await c.env.ASSETS?.fetch(new URL('/assets/maps/world.json', c.req.url));
  if (!asset?.ok) return c.json({ error: 'World map asset not found' }, 404);
  const headers = new Headers(asset.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  headers.set('CDN-Cache-Control', 'public, max-age=604800');
  return new Response(asset.body, { status: asset.status, headers });
});

app.use('*', async (c, next) => {
  const db = createDB(c.env.DB);
  c.set('db', db);
  await next();
});

app.route('/admin', adminRoutes);
app.route('/api', apiRoutes);
app.route('/media', mediaRoutes);
app.route('/', docsRoutes);

export default app;
export type { AppType };

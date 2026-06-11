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

// Build a proxied D1 instance that captures txn_bookmark from write results
function withBookmarkCapture(d1: D1Database, onBookmark: (bm: string) => void): D1Database {
  return new Proxy(d1, {
    get(target, prop: string) {
      if (prop === 'prepare') {
        return (sql: string) => {
          const stmt = (target as any).prepare(sql);
          return new Proxy(stmt, {
            get(st, sp: string) {
              const orig = (st as any)[sp];
              if (sp === 'run' || sp === 'all' || sp === 'first') {
                return (...args: any[]) => {
                  const result: Promise<any> = orig.apply(st, args);
                  return result.then((r: any) => {
                    const bm = r?.meta?.txn_bookmark;
                    if (bm) onBookmark(bm);
                    return r;
                  });
                };
              }
              if (typeof orig === 'function') return orig.bind(st);
              return orig;
            },
          });
        };
      }
      if (prop === 'batch') {
        return async (stmts: any[]) => {
          const results: any[] = await (target as any).batch(stmts);
          for (const r of results) {
            const bm = r?.meta?.txn_bookmark;
            if (bm) onBookmark(bm);
          }
          return results;
        };
      }
      const orig = (target as any)[prop];
      if (typeof orig === 'function') return orig.bind(target);
      return orig;
    },
  }) as unknown as D1Database;
}

app.use('*', async (c, next) => {
  // Read txn_bookmark cookie for read-your-writes consistency after admin writes
  const cookie = c.req.header('Cookie') || '';
  const bmMatch = cookie.match(/(?:^|;\s*)df_bm=([^;]+)/);
  const savedBookmark = bmMatch ? decodeURIComponent(bmMatch[1]) : null;

  // Create D1 session routed to nearest replica (or primary if bookmark provided)
  const rawD1 = c.env.DB as any;
  const session: D1Database = typeof rawD1.withSession === 'function'
    ? rawD1.withSession(savedBookmark ?? 'first-unconstrained')
    : c.env.DB;

  // Wrap to capture any new bookmark from write results
  let pendingBookmark: string | null = null;
  const db = createDB(withBookmarkCapture(session, (bm) => { pendingBookmark = bm; }));
  c.set('db', db);

  await next();

  // Persist new bookmark so next request reads from a consistent position
  if (pendingBookmark) {
    c.header('Set-Cookie', `df_bm=${encodeURIComponent(pendingBookmark)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`, { append: true });
  }
});

app.route('/admin', adminRoutes);
app.route('/api', apiRoutes);
app.route('/media', mediaRoutes);
app.route('/', docsRoutes);

export default app;
export type { AppType };

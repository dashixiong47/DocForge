import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createDB } from './db';
import { adminRoutes } from './routes/admin';
import { docsRoutes } from './routes/docs';
import { apiRoutes } from './routes/api';
import { mediaRoutes } from './routes/media';
import type { AppType } from './types';

const app = new Hono<AppType>();

app.use('*', cors());
app.use('*', logger());

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

import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { media, plugins } from '../db/schema';
import type { AppType } from '../types';

export const mediaRoutes = new Hono<AppType>();

// Serve media files from R2
mediaRoutes.get('/:plugin/*', async (c) => {
  // c.req.param('*') is undefined in Hono v4 sub-routers — use URL pathname instead
  const rawPath = new URL(c.req.url).pathname; // /media/docs/1.png
  const key = rawPath.replace(/^\/media\//, '');  // docs/1.png

  const object = await c.env.MEDIA.get(key);
  if (!object) {
    return new Response('Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('etag', object.httpEtag);
  return new Response(object.body, { headers });
});

// Admin upload endpoint
mediaRoutes.put('/upload/:plugin', async (c) => {
  const pluginSlug = c.req.param('plugin');
  const formData = await c.req.formData();
  const fileEntry = formData.get('file');

  if (!fileEntry || typeof fileEntry === 'string') {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  const file = fileEntry as unknown as { name: string; type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> };

  const db = c.get('db');
  const pluginRecord = await db.select().from(plugins).where(eq(plugins.slug, pluginSlug)).get();
  if (!pluginRecord) {
    return c.json({ error: 'Plugin not found' }, 404);
  }

  const pk = ((formData.get('placeholder_key') as string) || '').trim();
  const buffer = await file.arrayBuffer();
  const key = `${pluginSlug}/${file.name}`;

  await c.env.MEDIA.put(key, buffer, {
    httpMetadata: { contentType: file.type },
  });

  const now = new Date().toISOString();

  // If a placeholder key was provided and a stub record exists for it, replace the stub
  if (pk) {
    const stub = await db.select().from(media)
      .where(and(eq(media.placeholderKey, pk), eq(media.pluginId, pluginRecord.id)))
      .get();
    if (stub && stub.d2Key.startsWith('__ref__')) {
      await db.update(media).set({
        filename: file.name,
        d2Key: key,
        mimeType: file.type,
        sizeBytes: file.size,
      }).where(eq(media.id, stub.id)).run();
      return c.json({ ok: true, url: `/media/${key}`, id: stub.id, stub_replaced: true });
    }
  }

  const result = await db.insert(media).values({
    pluginId: pluginRecord.id,
    filename: file.name,
    d2Key: key,
    mimeType: file.type,
    sizeBytes: file.size,
    placeholderKey: pk || null,
    createdAt: now,
  }).returning().get();

  return c.json({ ok: true, url: `/media/${key}`, id: result.id, record: result });
});

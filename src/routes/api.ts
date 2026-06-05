import { Hono } from 'hono';
import { eq, asc, count, and } from 'drizzle-orm';
import { plugins, sections, contentBlocks, media, siteSettings, admins, translations } from '../db/schema';
import { adminAuth } from '../services/auth';
import type { AppType } from '../types';

function extractI18nKeys(html: string): string[] {
  const matches = [...html.matchAll(/\{\{t:([^}]+)\}\}/g)];
  return [...new Set(matches.map(m => m[1].trim()))];
}

export const apiRoutes = new Hono<AppType>();

// ─── Public: Language Preference ───
apiRoutes.get('/set-lang', (c) => {
  const lang = c.req.query('lang') === 'en' ? 'en' : 'zh';
  c.header('Set-Cookie', `lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`);
  return c.json({ ok: true });
});

apiRoutes.use('/admin/*', async (c, next) => {
  const cookie = c.req.header('Cookie') || '';
  const match = cookie.match(/admin_token=([^;]+)/);
  const token = match ? match[1] : undefined;
  if (!token) return c.json({ error: 'Unauthorized' }, 401);
  const payload = await adminAuth.verifyToken(token, c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);
  await next();
});

// ─── Plugins CRUD ───
apiRoutes.get('/admin/plugins', async (c) => {
  const db = c.get('db');
  const all = await db.select().from(plugins).orderBy(asc(plugins.sortOrder)).all();
  return c.json(all);
});

apiRoutes.post('/admin/plugins', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ slug: string; name: string; version?: string; ueVersion?: string; description?: string; iconUrl?: string; badgeTags?: string; sortOrder?: number }>();
  const now = new Date().toISOString();
  const result = await db.insert(plugins).values({
    slug: body.slug,
    name: body.name,
    version: body.version || '1.0.0',
    ueVersion: body.ueVersion || '5.0+',
    description: body.description || '',
    iconUrl: body.iconUrl || '',
    badgeTags: body.badgeTags || '[]',
    sortOrder: body.sortOrder || 0,
    createdAt: now,
    updatedAt: now,
  }).returning().get();
  return c.json(result);
});

apiRoutes.put('/admin/plugins/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{ slug?: string; name?: string; version?: string; ueVersion?: string; description?: string; iconUrl?: string; badgeTags?: string; sortOrder?: number }>();
  const now = new Date().toISOString();
  await db.update(plugins).set({
    ...(body.slug ? { slug: body.slug } : {}),
    ...(body.name ? { name: body.name } : {}),
    ...(body.version ? { version: body.version } : {}),
    ...(body.ueVersion ? { ueVersion: body.ueVersion } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.iconUrl !== undefined ? { iconUrl: body.iconUrl } : {}),
    ...(body.badgeTags ? { badgeTags: body.badgeTags } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    updatedAt: now,
  }).where(eq(plugins.id, id)).run();
  return c.json({ ok: true });
});

apiRoutes.delete('/admin/plugins/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  await db.delete(plugins).where(eq(plugins.id, id)).run();
  return c.json({ ok: true });
});

// ─── Sections CRUD ───
apiRoutes.post('/admin/sections', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ pluginId: number; parentId?: number | null; titleEn?: string; titleZh?: string; slug: string; sortOrder?: number }>();
  const now = new Date().toISOString();
  const result = await db.insert(sections).values({
    pluginId: body.pluginId,
    parentId: body.parentId ?? null,
    titleEn: body.titleEn || '',
    titleZh: body.titleZh || '',
    slug: body.slug,
    sortOrder: body.sortOrder || 0,
    createdAt: now,
    updatedAt: now,
  }).returning().get();
  return c.json(result);
});

apiRoutes.put('/admin/sections/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{ titleEn?: string; titleZh?: string; slug?: string; sortOrder?: number; parentId?: number | null }>();
  const now = new Date().toISOString();
  await db.update(sections).set({
    ...(body.titleEn ? { titleEn: body.titleEn } : {}),
    ...(body.titleZh ? { titleZh: body.titleZh } : {}),
    ...(body.slug ? { slug: body.slug } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    ...(body.parentId !== undefined ? { parentId: body.parentId } : {}),
    updatedAt: now,
  }).where(eq(sections.id, id)).run();
  return c.json({ ok: true });
});

apiRoutes.delete('/admin/sections/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  await db.delete(sections).where(eq(sections.id, id)).run();
  return c.json({ ok: true });
});

// Bulk-replace all blocks for a section (used by the text editor's save)
apiRoutes.put('/admin/sections/:id/blocks-bulk', async (c) => {
  const sectionId = Number(c.req.param('id'));
  const db = c.get('db');
  const body = await c.req.json<{ blocks: Array<{ type: string; contentJson: string; sortOrder: number }> }>();
  const now = new Date().toISOString();
  await db.delete(contentBlocks).where(eq(contentBlocks.sectionId, sectionId)).run();
  for (const block of body.blocks) {
    await db.insert(contentBlocks).values({
      sectionId,
      type: block.type,
      contentJson: block.contentJson,
      sortOrder: block.sortOrder,
      createdAt: now,
      updatedAt: now,
    }).run();
    await collectKeysFromBlock(db, sectionId, block.contentJson, block.type);
  }
  return c.json({ ok: true, count: body.blocks.length });
});

// Get section with its blocks (used by the plugin editor)
apiRoutes.get('/admin/sections/:id/blocks', async (c) => {
  const id = Number(c.req.param('id'));
  const db = c.get('db');
  const section = await db.select().from(sections).where(eq(sections.id, id)).get();
  if (!section) return c.json({ error: 'Not found' }, 404);
  const blockList = await db.select()
    .from(contentBlocks)
    .where(eq(contentBlocks.sectionId, id))
    .orderBy(asc(contentBlocks.sortOrder))
    .all();
  return c.json({ section, blocks: blockList });
});

apiRoutes.post('/admin/sections/reorder', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ orderedIds: number[] }>();
  const now = new Date().toISOString();
  for (let i = 0; i < body.orderedIds.length; i++) {
    await db.update(sections).set({ sortOrder: i, updatedAt: now }).where(eq(sections.id, body.orderedIds[i])).run();
  }
  return c.json({ ok: true });
});

// ─── Content Blocks CRUD ───
async function collectKeysFromBlock(
  db: ReturnType<typeof import('../db').createDB>,
  sectionId: number,
  contentJson: string,
  blockType?: string,
): Promise<void> {
  let html = '';
  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(contentJson) as Record<string, unknown>; html = (parsed.html as string) || contentJson; } catch { html = contentJson; }

  const section = await db.select({ pluginId: sections.pluginId }).from(sections).where(eq(sections.id, sectionId)).get();
  if (!section) return;
  const now = new Date().toISOString();

  // Collect i18n translation keys from HTML content
  const i18nKeys = extractI18nKeys(html);
  for (const key of i18nKeys) {
    for (const locale of ['zh', 'en']) {
      const exists = await db.select({ id: translations.id }).from(translations)
        .where(and(eq(translations.pluginId, section.pluginId), eq(translations.key, key), eq(translations.locale, locale))).get();
      if (!exists) {
        await db.insert(translations).values({ pluginId: section.pluginId, key, locale, value: '', updatedAt: now }).run();
      }
    }
  }

  // Collect media placeholder keys: {{img:key}} and {{video:key}} from HTML blocks
  const mediaKeys: Array<{ key: string; mimeType: string }> = [];
  for (const m of html.matchAll(/\{\{img:([^}]+)\}\}/g)) mediaKeys.push({ key: m[1].trim(), mimeType: 'image/x-placeholder' });
  for (const m of html.matchAll(/\{\{video:([^}]+)\}\}/g)) mediaKeys.push({ key: m[1].trim(), mimeType: 'video/x-placeholder' });

  // Also collect key from image/video block types
  if ((blockType === 'image' || blockType === 'video') && typeof parsed.key === 'string' && parsed.key) {
    mediaKeys.push({ key: parsed.key, mimeType: blockType === 'image' ? 'image/x-placeholder' : 'video/x-placeholder' });
  }

  // Create stub media records for referenced but not-yet-uploaded media keys
  for (const { key, mimeType } of mediaKeys) {
    if (!key) continue;
    const existing = await db.select({ id: media.id }).from(media).where(eq(media.placeholderKey, key)).get();
    if (!existing) {
      try {
        await db.insert(media).values({
          pluginId: section.pluginId,
          filename: key,
          d2Key: `__ref__/${section.pluginId}/${key}`,
          mimeType,
          sizeBytes: 0,
          placeholderKey: key,
          createdAt: now,
        }).run();
      } catch { /* unique constraint: key already used by another plugin, skip */ }
    }
  }
}

apiRoutes.post('/admin/content-blocks', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ sectionId: number; type?: string; content?: Record<string, unknown>; contentJson?: string; sortOrder?: number }>();
  const now = new Date().toISOString();
  const json = body.contentJson || JSON.stringify(body.content || {});
  const result = await db.insert(contentBlocks).values({
    sectionId: body.sectionId,
    type: body.type || 'html',
    contentJson: json,
    sortOrder: body.sortOrder || 0,
    createdAt: now,
    updatedAt: now,
  }).returning().get();
  await collectKeysFromBlock(db, body.sectionId, json, body.type);
  return c.json(result);
});

apiRoutes.put('/admin/content-blocks/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{ type?: string; content?: Record<string, unknown>; contentJson?: string; sortOrder?: number }>();
  const now = new Date().toISOString();
  const json = body.contentJson || (body.content ? JSON.stringify(body.content) : undefined);
  await db.update(contentBlocks).set({
    ...(body.type ? { type: body.type } : {}),
    ...(json ? { contentJson: json } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    updatedAt: now,
  }).where(eq(contentBlocks.id, id)).run();
  if (json) {
    const existing = await db.select({ sectionId: contentBlocks.sectionId, type: contentBlocks.type }).from(contentBlocks).where(eq(contentBlocks.id, id)).get();
    if (existing) await collectKeysFromBlock(db, existing.sectionId, json, body.type || existing.type);
  }
  return c.json({ ok: true });
});

apiRoutes.delete('/admin/content-blocks/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  await db.delete(contentBlocks).where(eq(contentBlocks.id, id)).run();
  return c.json({ ok: true });
});

// ─── Settings ───
apiRoutes.put('/admin/settings', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<Record<string, string>>();
  const now = new Date().toISOString();
  const existing = await db.select().from(siteSettings).all();
  const existingKeys = new Set(existing.map((s) => s.key));

  for (const [key, value] of Object.entries(body)) {
    if (existingKeys.has(key)) {
      await db.update(siteSettings).set({ value, updatedAt: now }).where(eq(siteSettings.key, key)).run();
    } else {
      await db.insert(siteSettings).values({ key, value, updatedAt: now }).run();
    }
  }
  return c.json({ ok: true });
});

// ─── Media ───
apiRoutes.get('/admin/media', async (c) => {
  const db = c.get('db');
  const pluginSlug = c.req.query('pluginSlug') || '';
  const page = Math.max(1, Number(c.req.query('page')) || 1);
  const limit = Math.min(50, Math.max(1, Number(c.req.query('limit')) || 20));
  let pluginId = 0;
  if (pluginSlug) {
    const plugin = await db.select().from(plugins).where(eq(plugins.slug, pluginSlug)).get();
    if (!plugin) return c.json({ items: [], total: 0, page, limit });
    pluginId = plugin.id;
  }
  const where = pluginId ? eq(media.pluginId, pluginId) : undefined;
  const [{ cnt }] = await db.select({ cnt: count() }).from(media).where(where).all();
  const total = cnt ?? 0;
  const items = await db.select().from(media).where(where).orderBy(asc(media.createdAt)).limit(limit).offset((page - 1) * limit).all();
  return c.json({ items, total, page, limit });
});

apiRoutes.delete('/admin/media/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const record = await db.select().from(media).where(eq(media.id, id)).get();
  if (!record) return c.json({ error: 'Not found' }, 404);
  await c.env.MEDIA.delete(record.d2Key);
  await db.delete(media).where(eq(media.id, id)).run();
  return c.json({ ok: true });
});

apiRoutes.put('/admin/media/:id/placeholder-key', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{ placeholderKey: string | null }>();
  const now = new Date().toISOString();
  const key = body.placeholderKey?.trim() || null;
  await db.update(media).set({ placeholderKey: key }).where(eq(media.id, id)).run();
  return c.json({ ok: true });
});

// ─── Translations ───
apiRoutes.get('/admin/plugins/:id/translations', async (c) => {
  const pluginId = Number(c.req.param('id'));
  const db = c.get('db');
  const rows = await db.select().from(translations)
    .where(eq(translations.pluginId, pluginId))
    .orderBy(asc(translations.key), asc(translations.locale))
    .all();
  // Group by key → {key, zh, en}
  const map = new Map<string, { key: string; zh: string; en: string }>();
  for (const row of rows) {
    if (!map.has(row.key)) map.set(row.key, { key: row.key, zh: '', en: '' });
    if (row.locale === 'zh') map.get(row.key)!.zh = row.value;
    if (row.locale === 'en') map.get(row.key)!.en = row.value;
  }
  return c.json([...map.values()]);
});

apiRoutes.put('/admin/translations', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ pluginId: number; key: string; locale: string; value: string }>();
  const now = new Date().toISOString();
  const existing = await db.select({ id: translations.id })
    .from(translations)
    .where(and(eq(translations.pluginId, body.pluginId), eq(translations.key, body.key), eq(translations.locale, body.locale)))
    .get();
  if (existing) {
    await db.update(translations).set({ value: body.value, updatedAt: now }).where(eq(translations.id, existing.id)).run();
  } else {
    await db.insert(translations).values({ pluginId: body.pluginId, key: body.key, locale: body.locale, value: body.value, updatedAt: now }).run();
  }
  return c.json({ ok: true });
});

apiRoutes.delete('/admin/translations', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ pluginId: number; key: string }>();
  await db.delete(translations)
    .where(and(eq(translations.pluginId, body.pluginId), eq(translations.key, body.key)))
    .run();
  return c.json({ ok: true });
});

// Register i18n keys extracted from HTML content (upsert empty if not existing)
apiRoutes.post('/admin/translations/collect', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ pluginId: number; html: string }>();
  const keys = extractI18nKeys(body.html);
  const now = new Date().toISOString();
  for (const key of keys) {
    for (const locale of ['zh', 'en']) {
      const existing = await db.select({ id: translations.id })
        .from(translations)
        .where(and(eq(translations.pluginId, body.pluginId), eq(translations.key, key), eq(translations.locale, locale)))
        .get();
      if (!existing) {
        await db.insert(translations).values({ pluginId: body.pluginId, key, locale, value: '', updatedAt: now }).run();
      }
    }
  }
  return c.json({ ok: true, registered: keys.length });
});

// ─── Admin Credentials ───
apiRoutes.get('/admin/credentials', async (c) => {
  const db = c.get('db');
  const record = await db.select({ username: admins.username }).from(admins).get();
  return c.json({ username: record?.username ?? '' });
});

apiRoutes.put('/admin/credentials', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ username: string; password: string }>();
  if (!body.username || !body.password) {
    return c.json({ error: 'Username and password are required' }, 400);
  }
  if (body.password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400);
  }
  const hash = await adminAuth.hashPassword(body.password);
  const now = new Date().toISOString();
  const existing = await db.select({ id: admins.id }).from(admins).get();
  if (existing) {
    await db.update(admins).set({ username: body.username, passwordHash: hash }).where(eq(admins.id, existing.id)).run();
  } else {
    await db.insert(admins).values({ username: body.username, passwordHash: hash, createdAt: now }).run();
  }
  return c.json({ ok: true });
});

// ─── Dashboard Stats ───
apiRoutes.get('/admin/stats', async (c) => {
  const db = c.get('db');
  const [pluginCount] = await db.select({ n: count() }).from(plugins).all();
  const [sectionCount] = await db.select({ n: count() }).from(sections).all();
  const [mediaCount] = await db.select({ n: count() }).from(media).all();
  return c.json({
    plugins: pluginCount?.n ?? 0,
    sections: sectionCount?.n ?? 0,
    media: mediaCount?.n ?? 0,
  });
});

import { Hono } from 'hono';
import { eq, asc, count, and, ne, like, notLike, sql } from 'drizzle-orm';
import { analyticsEvents, plugins, sections, contentBlocks, media, siteSettings, admins, translations, extensions, extensionShareEvents } from '../db/schema';
import { extensionManifest, validateManifest } from '../services/extensions';
import { adminAuth } from '../services/auth';
import type { AppType } from '../types';

// ─── Extension i18n sync helpers ─────────────────────────────────────────────
// All extension runtime i18n strings live in a single virtual plugin `__extensions__`
// in the translations table, with keys `<extSlug>.<i18nKey>`.
// This makes them editable from /admin/translations like any other plugin.

async function getOrCreateExtensionsPlugin(
  db: ReturnType<typeof import('../db').createDB>
): Promise<number> {
  const existing = await db.select({ id: plugins.id })
    .from(plugins).where(eq(plugins.slug, '__extensions__')).get();
  if (existing) return existing.id;
  const now = new Date().toISOString();
  const row = await db.insert(plugins).values({
    slug: '__extensions__', name: 'Extensions i18n', version: '1.0.0',
    compatibility: '', description: 'Runtime i18n strings for all enabled extensions',
    sortOrder: 9999, createdAt: now, updatedAt: now,
  }).returning().get();
  return row.id;
}

async function syncExtI18n(
  db: ReturnType<typeof import('../db').createDB>,
  extSlug: string,
  i18nStrings: Record<string, Record<string, string>>
): Promise<void> {
  const pluginId = await getOrCreateExtensionsPlugin(db);
  const now = new Date().toISOString();
  for (const [key, locales] of Object.entries(i18nStrings)) {
    for (const [locale, value] of Object.entries(locales)) {
      const fullKey = `${extSlug}.${key}`;
      const existing = await db.select({ id: translations.id }).from(translations)
        .where(and(eq(translations.pluginId, pluginId), eq(translations.key, fullKey), eq(translations.locale, locale))).get();
      if (existing) {
        await db.update(translations).set({ value, updatedAt: now }).where(eq(translations.id, existing.id)).run();
      } else {
        await db.insert(translations).values({ pluginId, key: fullKey, locale, value, updatedAt: now }).run();
      }
    }
  }
}

async function deleteExtI18n(
  db: ReturnType<typeof import('../db').createDB>,
  extSlug: string
): Promise<void> {
  const extPlugin = await db.select({ id: plugins.id })
    .from(plugins).where(eq(plugins.slug, '__extensions__')).get();
  if (!extPlugin) return;
  const rows = await db.select({ id: translations.id }).from(translations)
    .where(and(eq(translations.pluginId, extPlugin.id), like(translations.key, `${extSlug}.%`))).all();
  for (const row of rows) {
    await db.delete(translations).where(eq(translations.id, row.id)).run();
  }
}

function extractI18nKeys(html: string): string[] {
  const matches = [...html.matchAll(/\{\{t:([^}]+)\}\}/g)];
  return [...new Set(matches.map(m => m[1].trim()))];
}

function originOf(c: { req: { url: string; header: (k: string) => string | undefined } }): string {
  const u = new URL(c.req.url);
  const proto = c.req.header('X-Forwarded-Proto') || u.protocol.replace(':', '');
  const host = c.req.header('X-Forwarded-Host') || c.req.header('Host') || u.host;
  return `${proto}://${host}`;
}

function clientIp(c: { req: { header: (k: string) => string | undefined } }): string {
  return c.req.header('CF-Connecting-IP')
    || (c.req.header('X-Forwarded-For') || '').split(',')[0].trim()
    || c.req.header('X-Real-IP')
    || '';
}

function ensureShareToken(row: { id: number; shareToken: string }): string {
  if (row.shareToken) return row.shareToken;
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

const AI_BASE_URLS: Record<string, string> = {
  DeepSeek: 'https://api.deepseek.com',
  OpenAI: 'https://api.openai.com/v1',
};

const AI_MODEL_ALIASES: Record<string, Record<string, string>> = {
  DeepSeek: {
    'deepseek-chat': 'deepseek-v4-flash',
    'deepseek-reasoner': 'deepseek-v4-flash',
  },
};

function normalizeAiModel(provider: string, model: string): string {
  return AI_MODEL_ALIASES[provider]?.[model] || model;
}

function cleanAiJson(content: string): string {
  let text = content.trim()
    .replace(/^```json\s*\n?/i, '')
    .replace(/^```\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) text = objectMatch[0];
  return text;
}

function localeDisplayName(locale: string): string {
  const map: Record<string, string> = {
    zh: 'Simplified Chinese',
    'zh-CN': 'Simplified Chinese',
    'zh-TW': 'Traditional Chinese',
    en: 'English',
    ja: 'Japanese',
    ko: 'Korean',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    pt: 'Portuguese',
    ru: 'Russian',
    ar: 'Arabic',
    it: 'Italian',
    th: 'Thai',
    vi: 'Vietnamese',
  };
  return map[locale] || locale;
}

function compareVersion(a = '', b = ''): number {
  const pa = String(a).split(/[.-]/).map(v => Number.parseInt(v, 10) || 0);
  const pb = String(b).split(/[.-]/).map(v => Number.parseInt(v, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da !== db) return da > db ? 1 : -1;
  }
  return 0;
}

const BUILTIN_DOC_I18N: Record<string, Record<string, string>> = {
  'bp.sec.document':     { zh: '文档',     en: 'Document' },
  'bp.sec.localization': { zh: '多语言',   en: 'Localization' },
  'bp.sec.dom':          { zh: 'DOM',      en: 'DOM' },
  'bp.sec.data':         { zh: '数据模型', en: 'Data' },
  'bp.sec.context':      { zh: '上下文绑定', en: 'Context' },
  'bp.sec.debug':        { zh: '调试',     en: 'Debug' },
  'bp.sec.reflection':   { zh: '反射',     en: 'Reflection' },
  'bp.sec.assets':       { zh: '资产',     en: 'Assets' },
};

async function loadDefaultI18n(
  db: ReturnType<typeof import('../db').createDB>,
  keys: string[]
): Promise<Record<string, Record<string, string>>> {
  const wanted = new Set(keys);
  const defaults: Record<string, Record<string, string>> = {};

  for (const [key, locales] of Object.entries(BUILTIN_DOC_I18N)) {
    if (wanted.has(key)) defaults[key] = { ...locales };
  }

  const extRows = await db.select({ i18n: extensions.i18n }).from(extensions).all();
  for (const row of extRows) {
    let extI18n: Record<string, Record<string, string>> = {};
    try { extI18n = JSON.parse(row.i18n || '{}'); } catch { continue; }
    for (const key of wanted) {
      if (!defaults[key] && extI18n[key]) defaults[key] = extI18n[key];
    }
  }

  return defaults;
}

async function registerI18nKeys(
  db: ReturnType<typeof import('../db').createDB>,
  pluginId: number,
  keys: string[]
): Promise<number> {
  const uniqueKeys = [...new Set(keys.filter(Boolean))];
  const defaults = await loadDefaultI18n(db, uniqueKeys);
  const now = new Date().toISOString();
  let changed = 0;

  for (const key of uniqueKeys) {
    const locales = [...new Set(['zh', 'en', ...Object.keys(defaults[key] || {})])];
    for (const locale of locales) {
      const defaultValue = defaults[key]?.[locale] || '';
      const existing = await db.select({ id: translations.id, value: translations.value }).from(translations)
        .where(and(eq(translations.pluginId, pluginId), eq(translations.key, key), eq(translations.locale, locale))).get();
      if (!existing) {
        await db.insert(translations).values({ pluginId, key, locale, value: defaultValue, updatedAt: now }).run();
        changed++;
      } else if (!existing.value.trim() && defaultValue) {
        await db.update(translations).set({ value: defaultValue, updatedAt: now }).where(eq(translations.id, existing.id)).run();
        changed++;
      }
    }
  }

  return changed;
}

async function upsertTranslation(
  db: ReturnType<typeof import('../db').createDB>,
  pluginId: number,
  key: string,
  locale: string,
  value: string,
): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db.select({ id: translations.id })
    .from(translations)
    .where(and(eq(translations.pluginId, pluginId), eq(translations.key, key), eq(translations.locale, locale)))
    .get();
  if (existing) {
    await db.update(translations).set({ value, updatedAt: now }).where(eq(translations.id, existing.id)).run();
  } else {
    await db.insert(translations).values({ pluginId, key, locale, value, updatedAt: now }).run();
  }
}

async function ensureTranslation(
  db: ReturnType<typeof import('../db').createDB>,
  pluginId: number,
  key: string,
  locale: string,
  defaultValue = '',
): Promise<void> {
  const existing = await db.select({ id: translations.id })
    .from(translations)
    .where(and(eq(translations.pluginId, pluginId), eq(translations.key, key), eq(translations.locale, locale)))
    .get();
  if (!existing) {
    await db.insert(translations).values({
      pluginId,
      key,
      locale,
      value: defaultValue,
      updatedAt: new Date().toISOString(),
    }).run();
  }
}

async function syncPluginMetaTranslations(
  db: ReturnType<typeof import('../db').createDB>,
  pluginId: number,
  body: { name?: string; description?: string },
): Promise<void> {
  if (body.name !== undefined) {
    await upsertTranslation(db, pluginId, 'meta.name', 'zh', body.name || '');
    await ensureTranslation(db, pluginId, 'meta.name', 'en');
  }
  if (body.description !== undefined) {
    await upsertTranslation(db, pluginId, 'meta.description', 'zh', body.description || '');
    await ensureTranslation(db, pluginId, 'meta.description', 'en');
  }
}

export const apiRoutes = new Hono<AppType>();

// ─── Public: Language Preference ───
apiRoutes.get('/set-lang', (c) => {
  const raw = c.req.query('lang') || 'zh';
  // Allow any valid locale code (e.g. zh, en, zh-TW, pt-BR)
  const lang = /^[a-zA-Z]{2,8}(-[a-zA-Z]{2,4})?$/.test(raw) ? raw : 'zh';
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
  const all = await db.select().from(plugins).where(and(ne(plugins.slug, '__system__'), notLike(plugins.slug, '__ext%'))).orderBy(asc(plugins.sortOrder)).all();
  return c.json(all);
});

apiRoutes.post('/admin/plugins', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ slug: string; name: string; version?: string; compatibility?: string; description?: string; iconUrl?: string; badgeTags?: string; sortOrder?: number; enabled?: number | boolean; listed?: number | boolean }>();
  const now = new Date().toISOString();
  const result = await db.insert(plugins).values({
    slug: body.slug,
    name: body.name,
    version: body.version || '1.0.0',
    compatibility: body.compatibility || '',
    description: body.description || '',
    iconUrl: body.iconUrl || '',
    badgeTags: body.badgeTags || '[]',
    sortOrder: body.sortOrder || 0,
    enabled: body.enabled ? 1 : 0,
    listed: body.listed === false || body.listed === 0 ? 0 : 1,
    createdAt: now,
    updatedAt: now,
  }).returning().get();
  await syncPluginMetaTranslations(db, result.id, { name: result.name, description: result.description || '' });
  return c.json(result);
});

apiRoutes.put('/admin/plugins/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{ slug?: string; name?: string; version?: string; compatibility?: string; description?: string; iconUrl?: string; badgeTags?: string; sortOrder?: number; enabled?: number | boolean; listed?: number | boolean; customCss?: string; customJs?: string }>();
  const now = new Date().toISOString();
  await db.update(plugins).set({
    ...(body.slug ? { slug: body.slug } : {}),
    ...(body.name ? { name: body.name } : {}),
    ...(body.version ? { version: body.version } : {}),
    ...(body.compatibility !== undefined ? { compatibility: body.compatibility } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.iconUrl !== undefined ? { iconUrl: body.iconUrl } : {}),
    ...(body.badgeTags ? { badgeTags: body.badgeTags } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    ...(body.enabled !== undefined ? { enabled: body.enabled ? 1 : 0 } : {}),
    ...(body.listed !== undefined ? { listed: body.listed ? 1 : 0 } : {}),
    ...(body.customCss !== undefined ? { customCss: body.customCss } : {}),
    ...(body.customJs !== undefined ? { customJs: body.customJs } : {}),
    updatedAt: now,
  }).where(eq(plugins.id, id)).run();
  await syncPluginMetaTranslations(db, id, body);
  return c.json({ ok: true });
});

apiRoutes.put('/admin/plugins/:id/toggle', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const plugin = await db.select({ enabled: plugins.enabled }).from(plugins).where(eq(plugins.id, id)).get();
  if (!plugin) return c.json({ ok: false }, 404);
  const next = plugin.enabled ? 0 : 1;
  await db.update(plugins).set({ enabled: next, updatedAt: new Date().toISOString() }).where(eq(plugins.id, id)).run();
  return c.json({ ok: true, enabled: next });
});

apiRoutes.put('/admin/plugins/:id/listed-toggle', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const plugin = await db.select({ listed: plugins.listed }).from(plugins).where(eq(plugins.id, id)).get();
  if (!plugin) return c.json({ ok: false }, 404);
  const next = plugin.listed ? 0 : 1;
  await db.update(plugins).set({ listed: next, updatedAt: new Date().toISOString() }).where(eq(plugins.id, id)).run();
  return c.json({ ok: true, listed: next });
});

apiRoutes.delete('/admin/plugins/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  await db.delete(plugins).where(eq(plugins.id, id)).run();
  return c.json({ ok: true });
});

// ─── Sections CRUD ───
apiRoutes.get('/admin/plugins/:id/sections', async (c) => {
  const db = c.get('db');
  const pluginId = Number(c.req.param('id'));
  const rows = await db.select()
    .from(sections)
    .where(eq(sections.pluginId, pluginId))
    .orderBy(asc(sections.sortOrder), asc(sections.id))
    .all();
  return c.json(rows);
});

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

  // Also collect from card/cards titleKey + textKey fields
  if (blockType === 'card') {
    if (typeof parsed.titleKey === 'string' && parsed.titleKey) i18nKeys.push(parsed.titleKey);
    if (typeof parsed.textKey === 'string' && parsed.textKey) i18nKeys.push(parsed.textKey);
  } else if (blockType === 'cards' && Array.isArray(parsed.cards)) {
    for (const card of parsed.cards as Record<string, unknown>[]) {
      if (typeof card.titleKey === 'string' && card.titleKey) i18nKeys.push(card.titleKey);
      if (typeof card.textKey === 'string' && card.textKey) i18nKeys.push(card.textKey);
    }
  } else if (blockType === 'list' && Array.isArray(parsed.items)) {
    for (const item of parsed.items as unknown[]) {
      if (typeof item === 'object' && item !== null && 'key' in item && typeof (item as Record<string, unknown>).key === 'string') {
        i18nKeys.push((item as { key: string }).key);
      }
    }
  }

  await registerI18nKeys(db, section.pluginId, i18nKeys);

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

// Replace the actual file in R2 while keeping the same d2Key / placeholderKey / URL
apiRoutes.put('/admin/media/:id/file', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const record = await db.select().from(media).where(eq(media.id, id)).get();
  if (!record) return c.json({ error: 'Not found' }, 404);
  const formData = await c.req.formData();
  const fileEntry = formData.get('file');
  if (!fileEntry || typeof fileEntry === 'string') return c.json({ error: 'No file' }, 400);
  const file = fileEntry as unknown as { name: string; type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> };
  const buffer = await file.arrayBuffer();
  // Overwrite the same R2 key so existing URLs keep working
  await c.env.MEDIA.put(record.d2Key, buffer, { httpMetadata: { contentType: file.type } });
  const now = new Date().toISOString();
  await db.update(media).set({ filename: file.name, mimeType: file.type, sizeBytes: file.size }).where(eq(media.id, id)).run();
  return c.json({ ok: true, url: `/media/${record.d2Key}` });
});

apiRoutes.put('/admin/media/:id/placeholder-key', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{ placeholderKey: string | null }>();
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
  // Group by key → { key, [locale]: value, ... } — all locales, not just zh/en
  const map = new Map<string, Record<string, string>>();
  for (const row of rows) {
    if (!map.has(row.key)) map.set(row.key, { key: row.key });
    map.get(row.key)![row.locale] = row.value;
  }
  return c.json([...map.values()]);
});

apiRoutes.put('/admin/translations', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{
    pluginId: number;
    key?: string; locale?: string; value?: string;        // single-entry form
    entries?: Array<{ key: string; locale: string; value: string }>; // batch form
  }>();
  const now = new Date().toISOString();
  const toSave = body.entries
    ? body.entries.map(e => ({ pluginId: body.pluginId, key: e.key, locale: e.locale, value: e.value }))
    : [{ pluginId: body.pluginId, key: body.key!, locale: body.locale!, value: body.value! }];

  for (const item of toSave) {
    const existing = await db.select({ id: translations.id })
      .from(translations)
      .where(and(eq(translations.pluginId, item.pluginId), eq(translations.key, item.key), eq(translations.locale, item.locale)))
      .get();
    if (existing) {
      await db.update(translations).set({ value: item.value, updatedAt: now }).where(eq(translations.id, existing.id)).run();
    } else {
      await db.insert(translations).values({ pluginId: item.pluginId, key: item.key, locale: item.locale, value: item.value, updatedAt: now }).run();
    }
  }
  return c.json({ ok: true });
});

apiRoutes.post('/admin/translations/ai', async (c) => {
  const body = await c.req.json<{
    apiKey?: string;
    provider?: string;
    model?: string;
    sourceLocale?: string;
    targetLocale?: string;
    texts?: string[];
  }>();
  const provider = body.provider || 'DeepSeek';
  const baseURL = AI_BASE_URLS[provider];
  if (!baseURL) return c.json({ error: `Unsupported AI provider: ${provider}` }, 400);
  const apiKey = (body.apiKey || c.env.AI_TRANSLATE_API_KEY || '').trim();
  if (!apiKey) return c.json({ error: 'API key required' }, 400);
  const texts = Array.isArray(body.texts) ? body.texts.map(v => String(v ?? '')) : [];
  if (!texts.length) return c.json({ error: 'texts required' }, 400);
  if (texts.length > 100) return c.json({ error: 'too many texts' }, 400);

  const sourceLanguage = localeDisplayName(body.sourceLocale || '');
  const targetLanguage = localeDisplayName(body.targetLocale || 'en');
  const model = normalizeAiModel(provider, body.model || (provider === 'OpenAI' ? 'gpt-4.1-mini' : 'deepseek-v4-flash'));
  const payload: Record<string, unknown> = {
    model,
    temperature: 0.2,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a professional UI localization API. Translate every input string from ${sourceLanguage || 'the source language'} to ${targetLanguage}.

Return only valid JSON in this exact shape: {"translations":["..."]}.
Keep the translations array length exactly the same as the input array.
Preserve placeholders, variables, HTML tags, markdown, code identifiers, shortcut keys, punctuation placeholders, and template markers such as {{name}}, {{0}}, {value}, %s, <tag>, </tag>, data-key.
Do not add explanations, markdown fences, or extra fields.`,
      },
      { role: 'user', content: JSON.stringify(texts) },
    ],
  };
  if (provider === 'DeepSeek') {
    payload.thinking = { type: 'disabled' };
  }

  const resp = await fetch(`${baseURL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await resp.json().catch(() => ({})) as any;
  if (!resp.ok) {
    return c.json({ error: data?.error?.message || `AI HTTP ${resp.status}` }, resp.status as 400 | 401 | 403 | 429 | 500);
  }

  const raw = data?.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== 'string') return c.json({ error: 'Empty AI response' }, 502);

  let translationsOut: unknown;
  try {
    const parsed = JSON.parse(cleanAiJson(raw));
    translationsOut = Array.isArray(parsed) ? parsed : parsed?.translations;
  } catch {
    return c.json({ error: 'Failed to parse AI response', raw }, 502);
  }
  if (!Array.isArray(translationsOut) || translationsOut.length !== texts.length) {
    return c.json({ error: 'Invalid AI response length', raw }, 502);
  }

  return c.json({
    ok: true,
    translations: translationsOut.map(v => String(v ?? '')),
    metadata: { model: data?.model || model, usage: data?.usage || null },
  });
});

apiRoutes.delete('/admin/translations', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ pluginId: number; key: string }>();
  await db.delete(translations)
    .where(and(eq(translations.pluginId, body.pluginId), eq(translations.key, body.key)))
    .run();
  return c.json({ ok: true });
});

// Add a new locale to an existing plugin — creates empty rows for all existing keys
apiRoutes.post('/admin/translations/add-locale', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ pluginId: number; locale: string }>();
  const { pluginId, locale } = body;
  if (!pluginId || !locale) return c.json({ error: 'pluginId and locale required' }, 400);
  const now = new Date().toISOString();
  // Get all distinct keys for this plugin
  const keyRows = await db.select({ key: translations.key }).from(translations)
    .where(eq(translations.pluginId, pluginId)).all();
  const keys = [...new Set(keyRows.map(r => r.key))];
  let added = 0;
  for (const key of keys) {
    const exists = await db.select({ id: translations.id }).from(translations)
      .where(and(eq(translations.pluginId, pluginId), eq(translations.key, key), eq(translations.locale, locale)))
      .get();
    if (!exists) {
      await db.insert(translations).values({ pluginId, key, locale, value: '', updatedAt: now }).run();
      added++;
    }
  }
  return c.json({ ok: true, added, total: keys.length });
});

// Remove all translations for a locale from a plugin
apiRoutes.delete('/admin/translations/locale', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ pluginId: number; locale: string }>();
  const { pluginId, locale } = body;
  if (!pluginId || !locale) return c.json({ error: 'pluginId and locale required' }, 400);
  await db.delete(translations)
    .where(and(eq(translations.pluginId, pluginId), eq(translations.locale, locale)))
    .run();
  return c.json({ ok: true });
});

// Register i18n keys extracted from HTML content (upsert empty if not existing)
apiRoutes.post('/admin/translations/collect', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ pluginId: number; html: string }>();
  const keys = extractI18nKeys(body.html);
  const changed = await registerI18nKeys(db, body.pluginId, keys);
  return c.json({ ok: true, registered: keys.length, changed });
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
  const [pluginCount] = await db.select({ n: count() }).from(plugins).where(and(ne(plugins.slug, '__system__'), notLike(plugins.slug, '__ext%'))).all();
  const [sectionCount] = await db.select({ n: count() }).from(sections).all();
  const [mediaCount] = await db.select({ n: count() }).from(media).all();
  const [extCount] = await db.select({ n: count() }).from(extensions).all();
  const since = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();
  const events = await db.select({
    pluginSlug: analyticsEvents.pluginSlug,
    ip: analyticsEvents.ip,
    country: analyticsEvents.country,
    userAgent: analyticsEvents.userAgent,
    createdAt: analyticsEvents.createdAt,
  }).from(analyticsEvents).where(sql`${analyticsEvents.createdAt} >= ${sinceIso}`).all();

  const dayMap: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  const docMap: Record<string, number> = {};
  const countryMap: Record<string, number> = {};
  const ipSet = new Set<string>();
  for (const e of events) {
    const day = e.createdAt.slice(0, 10);
    dayMap[day] = (dayMap[day] || 0) + 1;
    docMap[e.pluginSlug] = (docMap[e.pluginSlug] || 0) + 1;
    countryMap[e.country || 'Unknown'] = (countryMap[e.country || 'Unknown'] || 0) + 1;
    if (e.ip) ipSet.add(e.ip);
  }
  const topDocs = Object.entries(docMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([slug, views]) => ({ slug, views }));
  const countries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([country, views]) => ({ country, views }));
  const recentIps = events.slice(-10).reverse().map(e => ({
    ip: e.ip || 'unknown',
    country: e.country || 'Unknown',
    doc: e.pluginSlug,
    at: e.createdAt,
  }));
  const shareEvents = await db.select({
    extensionSlug: extensionShareEvents.extensionSlug,
    installerOrigin: extensionShareEvents.installerOrigin,
    country: extensionShareEvents.country,
    createdAt: extensionShareEvents.createdAt,
  }).from(extensionShareEvents).all();
  const shareRecent = shareEvents.filter(e => e.createdAt >= sinceIso);
  const shareMap: Record<string, number> = {};
  for (const e of shareEvents) shareMap[e.extensionSlug] = (shareMap[e.extensionSlug] || 0) + 1;
  const topShared = Object.entries(shareMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([slug, installs]) => ({ slug, installs }));
  const recentInstalls = shareEvents.slice(-10).reverse().map(e => ({
    slug: e.extensionSlug,
    origin: e.installerOrigin || 'unknown',
    country: e.country || 'Unknown',
    at: e.createdAt,
  }));
  const shareStates = await db.select({
    slug: extensions.slug,
    name: extensions.name,
    shareNotify: extensions.shareNotify,
  }).from(extensions).orderBy(asc(extensions.slug)).all();
  return c.json({
    plugins: pluginCount?.n ?? 0,
    sections: sectionCount?.n ?? 0,
    media: mediaCount?.n ?? 0,
    extensions: extCount?.n ?? 0,
    analytics: {
      views7d: events.length,
      visitors7d: ipSet.size,
      series: Object.entries(dayMap).map(([date, views]) => ({ date, views })),
      topDocs,
      countries,
      recentIps,
    },
    shares: {
      installs7d: shareRecent.length,
      installsTotal: shareEvents.length,
      topShared,
      recentInstalls,
      states: shareStates.map(s => ({ slug: s.slug, name: s.name, shareNotify: s.shareNotify ? 1 : 0 })),
    },
  });
});

// ─── Extensions ───────────────────────────────────────────────────────────────

apiRoutes.get('/admin/extensions', async (c) => {
  const db = c.get('db');
  const rows = await db.select().from(extensions).all();
  return c.json(rows);
});

// Public: tag schemas for all enabled extensions (used by admin editor autocomplete).
// Extensions store their tag schemas in configSchema under the key "tagSchema".
apiRoutes.get('/extensions/tag-schemas', async (c) => {
  const db = c.get('db');
  const rows = await db.select({
    slug: extensions.slug,
    tags: extensions.tags,
    name: extensions.name,
    configSchema: extensions.configSchema,
  }).from(extensions).where(eq(extensions.enabled, 1)).all();

  const schemas: Record<string, unknown> = {};
  for (const row of rows) {
    let tagList: string[] = [];
    try { tagList = JSON.parse(row.tags || '[]'); } catch { /* empty */ }
    if (tagList.length === 0) continue;

    let cfg: Record<string, unknown> = {};
    try { cfg = JSON.parse(row.configSchema || '{}'); } catch { /* empty */ }

    const tagSchema = cfg.tagSchema as Record<string, unknown> | undefined;
    if (tagSchema) {
      Object.assign(schemas, tagSchema);
    } else {
      // Fallback: minimal schema from tags list
      for (const tag of tagList) {
        if (!schemas[tag]) schemas[tag] = { description: `Tag provided by ${row.name}`, attrs: [] };
      }
    }
  }
  return c.json(schemas);
});

apiRoutes.get('/admin/extensions/:id', async (c) => {
  const db = c.get('db');
  const row = await db.select().from(extensions).where(eq(extensions.id, Number(c.req.param('id')))).get();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

apiRoutes.get('/extensions/:slug/manifest.json', async (c) => {
  const db = c.get('db');
  const slug = c.req.param('slug');
  const row = await db.select().from(extensions).where(eq(extensions.slug, slug)).get();
  if (!row) return c.json({ error: 'Not found' }, 404);
  let manifest = {};
  try {
    const { loadExtensionById } = await import('../services/extensions');
    const ext = await loadExtensionById(db, row.id);
    if (ext) {
      const base = originOf(c);
      manifest = extensionManifest(ext, ext.shareToken ? {
        token: ext.shareToken,
        notifyUrl: `${base}/api/extensions/share-install`,
        installUrl: `${base}/admin/extensions?install=${encodeURIComponent(`${base}/api/extensions/${slug}/manifest.json`)}`,
        enabled: !!ext.shareNotify,
      } : undefined);
    }
  } catch {
    manifest = {};
  }
  c.header('Cache-Control', 'no-store');
  return c.json(manifest);
});

apiRoutes.post('/extensions/share-install', async (c) => {
  const db = c.get('db');
  const body: { token?: string; slug?: string; sourceUrl?: string; installerOrigin?: string } =
    await c.req.json<{ token?: string; slug?: string; sourceUrl?: string; installerOrigin?: string }>().catch(() => ({}));
  const token = String(body.token || '').trim();
  if (!/^[a-f0-9]{32}$/.test(token)) return c.json({ ok: false, error: 'Invalid token' }, 400);
  const row = await db.select({
    id: extensions.id,
    slug: extensions.slug,
    shareNotify: extensions.shareNotify,
  }).from(extensions).where(eq(extensions.shareToken, token)).get();
  if (!row) return c.json({ ok: false, error: 'Unknown share token' }, 404);
  if (!row.shareNotify) return c.json({ ok: true, disabled: true });
  const now = new Date().toISOString();
  await db.insert(extensionShareEvents).values({
    extensionId: row.id,
    extensionSlug: row.slug,
    token,
    eventType: 'install',
    sourceUrl: String(body.sourceUrl || ''),
    installerOrigin: String(body.installerOrigin || ''),
    installerUserAgent: c.req.header('User-Agent') || '',
    ip: clientIp(c),
    country: c.req.header('CF-IPCountry') || '',
    createdAt: now,
  }).run();
  return c.json({ ok: true });
});

// Fetch manifest JSON from a URL (server-side, avoids CORS issues)
apiRoutes.post('/admin/extensions/fetch-manifest', async (c) => {
  const body = await c.req.json<{ url: string }>();
  const url = (body.url || '').trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return c.json({ error: 'Invalid URL' }, 400);
  }
  try {
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) return c.json({ error: `HTTP ${resp.status}` }, 400);
    const text = await resp.text();
    JSON.parse(text); // validate it's parseable JSON
    return c.json({ json: text, sourceUrl: url });
  } catch (e) {
    return c.json({ error: String(e) }, 400);
  }
});

apiRoutes.get('/admin/extensions/:id/manifest', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const row = await db.select().from(extensions).where(eq(extensions.id, id)).get();
  if (!row) return c.json({ error: 'Not found' }, 404);
  const ext = {
    ...row,
    extType: row.extType as any,
    blockTypes: JSON.parse(row.blockTypes || '[]'),
    tags: JSON.parse(row.tags || '[]'),
    i18nStrings: JSON.parse(row.i18n || '{}'),
    configSchema: JSON.parse(row.configSchema || '{}'),
    config: JSON.parse(row.config || '{}'),
    shareToken: row.shareToken || '',
    shareNotify: row.shareNotify ?? 1,
  };
  return c.json(extensionManifest(ext));
});

apiRoutes.get('/admin/extensions/:id/share', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const row = await db.select({
    id: extensions.id,
    slug: extensions.slug,
    shareToken: extensions.shareToken,
    shareNotify: extensions.shareNotify,
  }).from(extensions).where(eq(extensions.id, id)).get();
  if (!row) return c.json({ error: 'Not found' }, 404);
  const token = ensureShareToken(row);
  if (token !== row.shareToken) {
    await db.update(extensions).set({ shareToken: token, updatedAt: new Date().toISOString() }).where(eq(extensions.id, id)).run();
  }
  const base = originOf(c);
  const manifestUrl = `${base}/api/extensions/${row.slug}/manifest.json`;
  const installUrl = `${base}/admin/extensions?install=${encodeURIComponent(manifestUrl)}`;
  const notifyUrl = `${base}/api/extensions/share-install`;
  return c.json({ ok: true, installUrl, manifestUrl, notifyUrl, token, shareNotify: row.shareNotify ? 1 : 0 });
});

apiRoutes.put('/admin/extensions/:id/share-notify', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const row = await db.select({ shareNotify: extensions.shareNotify }).from(extensions).where(eq(extensions.id, id)).get();
  if (!row) return c.json({ error: 'Not found' }, 404);
  const next = row.shareNotify ? 0 : 1;
  await db.update(extensions).set({ shareNotify: next, updatedAt: new Date().toISOString() }).where(eq(extensions.id, id)).run();
  return c.json({ ok: true, shareNotify: next });
});

apiRoutes.post('/admin/extensions/check-updates', async (c) => {
  const db = c.get('db');
  const rows = await db.select().from(extensions).all();
  const out: Record<number, { latestVersion?: string; hasUpdate?: boolean; url?: string; error?: string }> = {};
  for (const row of rows) {
    let config: Record<string, unknown> = {};
    try { config = JSON.parse(row.config || '{}'); } catch { /* empty */ }
    const url = typeof config.__sourceUrl === 'string' ? config.__sourceUrl : '';
    if (!url) continue;
    try {
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const manifest = await resp.json() as Record<string, unknown>;
      const latestVersion = typeof manifest.version === 'string' ? manifest.version : '';
      out[row.id] = { latestVersion, hasUpdate: compareVersion(latestVersion, row.version) > 0, url };
    } catch (e) {
      out[row.id] = { error: String(e), url };
    }
  }
  return c.json({ ok: true, updates: out });
});

apiRoutes.post('/admin/extensions/:id/update-from-url', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const row = await db.select().from(extensions).where(eq(extensions.id, id)).get();
  if (!row) return c.json({ error: 'Not found' }, 404);
  let config: Record<string, unknown> = {};
  try { config = JSON.parse(row.config || '{}'); } catch { /* empty */ }
  const url = typeof config.__sourceUrl === 'string' ? config.__sourceUrl : '';
  if (!url) return c.json({ error: 'No source URL' }, 400);
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!resp.ok) return c.json({ error: `HTTP ${resp.status}` }, 400);
  const raw = await resp.json();
  const result = validateManifest(raw);
  if (!result.ok) return c.json({ error: result.error }, 400);
  const m = result.manifest;
  if (m.slug !== row.slug) return c.json({ error: 'Manifest slug mismatch' }, 400);
  const now = new Date().toISOString();
  await db.update(extensions).set({
    name: m.name!,
    description: m.description ?? '',
    version: m.version ?? row.version,
    author: m.author ?? '',
    icon: m.icon ?? '🧩',
    homepage: m.homepage ?? '',
    extType: m.extType ?? 'widget',
    html: m.html ?? '',
    css: m.css ?? '',
    js: m.js ?? '',
    headHtml: m.headHtml ?? '',
    blockTypes: JSON.stringify(m.blockTypes ?? []),
    tags: JSON.stringify(m.tags ?? []),
    i18n: JSON.stringify(m.i18nStrings ?? {}),
    configSchema: JSON.stringify(m.configSchema ?? {}),
    config: JSON.stringify({ ...(m.config || {}), __sourceUrl: url }),
    updatedAt: now,
  }).where(eq(extensions.id, id)).run();
  await deleteExtI18n(db, row.slug);
  if (m.i18nStrings && Object.keys(m.i18nStrings).length > 0) await syncExtI18n(db, row.slug, m.i18nStrings);
  return c.json({ ok: true });
});

// Install from manifest JSON
apiRoutes.post('/admin/extensions', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();
  const sourceUrl = typeof body.__sourceUrl === 'string' ? body.__sourceUrl : '';
  const share = typeof body.share === 'object' && body.share ? body.share as Record<string, unknown> : {};
  const shareNotifyUrl = typeof share.notifyUrl === 'string' ? share.notifyUrl : '';
  const shareToken = typeof share.token === 'string' ? share.token : '';
  const shareInstallUrl = typeof share.installUrl === 'string' ? share.installUrl : '';
  const result = validateManifest(body);
  if (!result.ok) return c.json({ error: result.error }, 400);
  const m = result.manifest;
  const now = new Date().toISOString();
  const row = await db.insert(extensions).values({
    slug:         m.slug!,
    name:         m.name!,
    description:  m.description  ?? '',
    version:      m.version      ?? '1.0.0',
    author:       m.author       ?? '',
    icon:         m.icon         ?? '🧩',
    homepage:     m.homepage     ?? '',
    extType:      m.extType      ?? 'widget',
    enabled:      1,
    html:         m.html         ?? '',
    css:          m.css          ?? '',
    js:           m.js           ?? '',
    headHtml:     m.headHtml     ?? '',
    blockTypes:   JSON.stringify(m.blockTypes   ?? []),
    tags:         JSON.stringify(m.tags         ?? []),
    i18n:         JSON.stringify(m.i18nStrings  ?? {}),
    configSchema: JSON.stringify(m.configSchema ?? {}),
    config:       JSON.stringify({
      ...(m.config ?? {}),
      ...(sourceUrl ? { __sourceUrl: sourceUrl } : {}),
      ...(shareNotifyUrl && shareToken ? { __shareNotifyUrl: shareNotifyUrl, __shareToken: shareToken, __shareInstallUrl: shareInstallUrl } : {}),
    }),
    createdAt: now, updatedAt: now,
  }).returning().get();
  // Sync i18n strings to translations table so they appear in /admin/translations
  if (m.i18nStrings && Object.keys(m.i18nStrings).length > 0) {
    await syncExtI18n(db, m.slug!, m.i18nStrings);
  }
  if (shareNotifyUrl && shareToken) {
    c.executionCtx.waitUntil(
      fetch(shareNotifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: shareToken,
          slug: m.slug,
          sourceUrl,
          installerOrigin: originOf(c),
        }),
      }).catch(() => undefined)
    );
  }
  return c.json({ ok: true, id: row.id });
});

// i18n for extension editor translation tab
apiRoutes.get('/admin/extensions/:id/i18n', async (c) => {
  const id = Number(c.req.param('id'));
  const db = c.get('db');
  const ext = await db.select({ i18n: extensions.i18n }).from(extensions).where(eq(extensions.id, id)).get();
  if (!ext) return c.json([]);
  const i18nObj: Record<string, Record<string, string>> = JSON.parse(ext.i18n || '{}');
  return c.json(Object.entries(i18nObj).map(([key, locales]) => ({ key, ...locales })));
});

// Full update (from editor)
apiRoutes.put('/admin/extensions/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{
    name?: string; description?: string; version?: string; author?: string;
    icon?: string; homepage?: string; extType?: string;
    html?: string; css?: string; js?: string; headHtml?: string;
    blockTypes?: string[]; tags?: string[];
    i18n?: Record<string, Record<string, string>>;
    configSchema?: object; config?: object;
  }>();
  const now = new Date().toISOString();
  // Get current slug to use when syncing i18n
  const current = await db.select({ slug: extensions.slug }).from(extensions).where(eq(extensions.id, id)).get();
  await db.update(extensions).set({
    ...(body.name        !== undefined ? { name:         body.name }                       : {}),
    ...(body.description !== undefined ? { description:  body.description }                : {}),
    ...(body.version     !== undefined ? { version:      body.version }                    : {}),
    ...(body.author      !== undefined ? { author:       body.author }                     : {}),
    ...(body.icon        !== undefined ? { icon:         body.icon }                       : {}),
    ...(body.homepage    !== undefined ? { homepage:     body.homepage }                   : {}),
    ...(body.extType     !== undefined ? { extType:      body.extType }                    : {}),
    ...(body.html        !== undefined ? { html:         body.html }                       : {}),
    ...(body.css         !== undefined ? { css:          body.css }                        : {}),
    ...(body.js          !== undefined ? { js:           body.js }                         : {}),
    ...(body.headHtml    !== undefined ? { headHtml:     body.headHtml }                   : {}),
    ...(body.blockTypes  !== undefined ? { blockTypes:   JSON.stringify(body.blockTypes) } : {}),
    ...(body.tags        !== undefined ? { tags:         JSON.stringify(body.tags) }       : {}),
    ...(body.i18n        !== undefined ? { i18n:         JSON.stringify(body.i18n) }       : {}),
    ...(body.configSchema!== undefined ? { configSchema: JSON.stringify(body.configSchema)}: {}),
    ...(body.config      !== undefined ? { config:       JSON.stringify(body.config) }     : {}),
    updatedAt: now,
  }).where(eq(extensions.id, id)).run();
  // Sync updated i18n strings to translations table
  if (body.i18n !== undefined && current) {
    await deleteExtI18n(db, current.slug);
    if (Object.keys(body.i18n).length > 0) {
      await syncExtI18n(db, current.slug, body.i18n);
    }
  }
  return c.json({ ok: true });
});

// Toggle enabled
apiRoutes.put('/admin/extensions/:id/toggle', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const row = await db.select({ enabled: extensions.enabled }).from(extensions).where(eq(extensions.id, id)).get();
  if (!row) return c.json({ error: 'Not found' }, 404);
  const newEnabled = row.enabled ? 0 : 1;
  await db.update(extensions).set({ enabled: newEnabled, updatedAt: new Date().toISOString() }).where(eq(extensions.id, id)).run();
  return c.json({ ok: true, enabled: newEnabled });
});

// Delete extension
apiRoutes.delete('/admin/extensions/:id', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const row = await db.select({ slug: extensions.slug }).from(extensions).where(eq(extensions.id, id)).get();
  await db.delete(extensions).where(eq(extensions.id, id)).run();
  // Clean up i18n strings from translations table
  if (row) await deleteExtI18n(db, row.slug);
  return c.json({ ok: true });
});

// ─── Extension i18n (direct read/write on extensions.i18n JSON field) ─────────

// GET: returns flat {key, locale, value} rows from extensions.i18n
apiRoutes.get('/admin/extensions/:id/i18n', async (c) => {
  const db = c.get('db');
  const row = await db.select({ i18n: extensions.i18n, slug: extensions.slug })
    .from(extensions).where(eq(extensions.id, Number(c.req.param('id')))).get();
  if (!row) return c.json({ error: 'Not found' }, 404);
  let i18nObj: Record<string, Record<string, string>> = {};
  try { i18nObj = JSON.parse(row.i18n || '{}'); } catch { /* empty */ }
  const flatRows: Array<{ key: string; locale: string; value: string }> = [];
  for (const [key, locales] of Object.entries(i18nObj)) {
    for (const [locale, value] of Object.entries(locales)) {
      flatRows.push({ key, locale, value });
    }
  }
  return c.json({ rows: flatRows, slug: row.slug });
});

// PUT: accepts {i18n: {key: {locale: value}}} and saves to extensions.i18n + syncs to translations table
apiRoutes.put('/admin/extensions/:id/i18n', async (c) => {
  const db = c.get('db');
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{ i18n: Record<string, Record<string, string>> }>();
  if (!body.i18n || typeof body.i18n !== 'object') return c.json({ error: 'i18n required' }, 400);
  const current = await db.select({ slug: extensions.slug }).from(extensions).where(eq(extensions.id, id)).get();
  if (!current) return c.json({ error: 'Not found' }, 404);
  const now = new Date().toISOString();
  await db.update(extensions).set({ i18n: JSON.stringify(body.i18n), updatedAt: now }).where(eq(extensions.id, id)).run();
  await deleteExtI18n(db, current.slug);
  if (Object.keys(body.i18n).length > 0) {
    await syncExtI18n(db, current.slug, body.i18n);
  }
  return c.json({ ok: true });
});

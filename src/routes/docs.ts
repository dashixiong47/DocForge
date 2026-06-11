import { Hono } from 'hono';
import { eq, asc, inArray, sql, ne, and, notLike } from 'drizzle-orm';
import { analyticsEvents, plugins, sections, contentBlocks, translations, media } from '../db/schema';
import { docPage } from '../templates/doc_page';
import type { TranslationsMap, MediaMap } from '../templates/doc_page';
import { notFoundPage } from '../templates/error_pages';
import { getSettingsMap } from '../services/settings';
import { loadEnabledExtensions, buildExtensionHead, buildExtensionHtmlTemplates, buildExtensionScripts, buildExtensionI18nInject, buildExtensionMediaInject, buildDocTransInject } from '../services/extensions';
import {
  KV_PLUGIN_SLUG_PREFIX,
  KV_PLUGIN_ID_SLUG_PREFIX,
  KV_PLUGIN_DATA_PREFIX,
  KV_PLUGIN_TTL,
} from '../services/kv';
import type { AppType } from '../types';

type SectionRow = typeof sections.$inferSelect;
type ContentBlockRow = typeof contentBlocks.$inferSelect;
type PluginRow = typeof plugins.$inferSelect;

interface SectionWithChildren extends SectionRow {
  children: SectionRow[];
}

interface PluginDataBundle {
  allSections: SectionRow[];
  allBlocks: ContentBlockRow[];
  transRows: Array<{ key: string; locale: string; value: string }>;
  mediaRows: Array<{ placeholderKey: string | null; d2Key: string; altText: string | null; mimeType: string }>;
}

function getLang(c: { req: { header: (k: string) => string | undefined } }): string {
  const cookie = c.req.header('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)lang=([^;]+)/);
  return m?.[1] || 'zh';
}

function clientIp(c: { req: { header: (k: string) => string | undefined } }): string {
  return c.req.header('CF-Connecting-IP')
    || (c.req.header('X-Forwarded-For') || '').split(',')[0].trim()
    || c.req.header('X-Real-IP')
    || '';
}

function buildTranslationsMap(rows: Array<{ key: string; locale: string; value: string }>): TranslationsMap {
  const map: TranslationsMap = new Map();
  for (const row of rows) {
    if (!map.has(row.key)) map.set(row.key, {});
    map.get(row.key)![row.locale] = row.value;
  }
  return map;
}

function buildMediaMap(rows: Array<{ placeholderKey: string | null; d2Key: string; altText: string | null; mimeType: string }>): MediaMap {
  const map: MediaMap = new Map();
  for (const row of rows) {
    if (row.placeholderKey) {
      map.set(row.placeholderKey, {
        url: `/media/${row.d2Key}`,
        alt: row.altText || '',
        mimeType: row.mimeType,
      });
    }
  }
  return map;
}

function buildSectionTree(allSections: SectionRow[]): SectionWithChildren[] {
  const topSections: SectionWithChildren[] = [];
  const parentMap = new Map<number, SectionWithChildren>();
  for (const s of allSections) {
    if (!s.parentId) {
      const sec: SectionWithChildren = { ...s, children: [] };
      topSections.push(sec);
      parentMap.set(s.id, sec);
    }
  }
  for (const s of allSections) {
    if (s.parentId && parentMap.has(s.parentId)) {
      parentMap.get(s.parentId)!.children.push(s);
    }
  }
  for (const [, sec] of parentMap) {
    sec.children.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  topSections.sort((a, b) => a.sortOrder - b.sortOrder);
  return topSections;
}

function buildBlocksBySection(allBlocks: ContentBlockRow[]): Map<number, ContentBlockRow[]> {
  const map = new Map<number, ContentBlockRow[]>();
  for (const b of allBlocks) {
    if (!map.has(b.sectionId)) map.set(b.sectionId, []);
    map.get(b.sectionId)!.push(b);
  }
  return map;
}

export const docsRoutes = new Hono<AppType>();

function normalizeSlugAlias(slug: string): string {
  return slug.trim().toLowerCase().replace(/[-_]/g, '');
}

docsRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const normalizedSlug = normalizeSlugAlias(slug);
  const db = c.get('db');
  const kv = c.env.KV;
  const lang = getLang(c);

  // ── KV: try plugin record cache ──
  let plugin: PluginRow | null = null;
  if (kv) {
    const raw = await kv.get(KV_PLUGIN_SLUG_PREFIX + normalizedSlug);
    if (raw) {
      try { plugin = JSON.parse(raw); } catch {}
    }
  }

  // ── D1 fallback for plugin lookup ──
  if (!plugin) {
    plugin = await db.select().from(plugins)
      .where(sql`lower(${plugins.slug}) = lower(${slug})`)
      .get() ?? null;
    if (!plugin) {
      plugin = await db.select().from(plugins)
        .where(sql`lower(replace(replace(${plugins.slug}, '-', ''), '_', '')) = ${normalizedSlug}`)
        .get() ?? null;
    }
    if (plugin && kv) {
      const ns = normalizeSlugAlias(plugin.slug);
      kv.put(KV_PLUGIN_SLUG_PREFIX + ns, JSON.stringify(plugin), { expirationTtl: KV_PLUGIN_TTL }).catch(() => {});
      kv.put(KV_PLUGIN_ID_SLUG_PREFIX + plugin.id, ns, { expirationTtl: KV_PLUGIN_TTL }).catch(() => {});
    }
  }

  if (!plugin || !plugin.enabled) return c.html(notFoundPage(slug));

  c.executionCtx.waitUntil(
    db.insert(analyticsEvents).values({
      pluginId: plugin.id,
      pluginSlug: plugin.slug,
      path: c.req.path,
      ip: clientIp(c),
      country: c.req.header('CF-IPCountry') || '',
      userAgent: c.req.header('User-Agent') || '',
      createdAt: new Date().toISOString(),
    }).run().catch(() => undefined)
  );

  // ── KV: try plugin data bundle ──
  let allSections: SectionRow[] = [];
  let allBlocks: ContentBlockRow[] = [];
  let t: TranslationsMap = new Map();
  let mediaMap: MediaMap = new Map();

  let bundleLoaded = false;
  if (kv) {
    const rawBundle = await kv.get(KV_PLUGIN_DATA_PREFIX + plugin.id);
    if (rawBundle) {
      try {
        const bundle: PluginDataBundle = JSON.parse(rawBundle);
        allSections = bundle.allSections;
        allBlocks = bundle.allBlocks;
        t = buildTranslationsMap(bundle.transRows);
        mediaMap = buildMediaMap(bundle.mediaRows);
        bundleLoaded = true;
      } catch {}
    }
  }

  // ── D1 fallback for plugin data ──
  if (!bundleLoaded) {
    allSections = await db.select()
      .from(sections)
      .where(eq(sections.pluginId, plugin.id))
      .orderBy(asc(sections.sortOrder))
      .all();

    const sectionIds = allSections.map(s => s.id);
    allBlocks = sectionIds.length > 0
      ? await db.select()
          .from(contentBlocks)
          .where(inArray(contentBlocks.sectionId, sectionIds))
          .orderBy(asc(contentBlocks.sortOrder))
          .all()
      : [];

    const [transRows, mediaRows] = await Promise.all([
      db.select({ key: translations.key, locale: translations.locale, value: translations.value })
        .from(translations).where(eq(translations.pluginId, plugin.id)).all(),
      db.select({ placeholderKey: media.placeholderKey, d2Key: media.d2Key, altText: media.altText, mimeType: media.mimeType })
        .from(media).where(eq(media.pluginId, plugin.id)).all(),
    ]);

    t = buildTranslationsMap(transRows);
    mediaMap = buildMediaMap(mediaRows);

    if (kv) {
      const bundle: PluginDataBundle = { allSections, allBlocks, transRows, mediaRows };
      kv.put(KV_PLUGIN_DATA_PREFIX + plugin.id, JSON.stringify(bundle), { expirationTtl: KV_PLUGIN_TTL }).catch(() => {});
    }
  }

  const [settings, enabledExts] = await Promise.all([
    getSettingsMap(db, kv),
    loadEnabledExtensions(db, kv),
  ]);

  const topSections = buildSectionTree(allSections);
  const blocksBySection = buildBlocksBySection(allBlocks);

  const availableLocales = [...new Set(
    [...t.values()].flatMap(entry =>
      Object.entries(entry).filter(([, v]) => v.trim()).map(([k]) => k)
    )
  )];
  if (!availableLocales.includes('zh')) availableLocales.unshift('zh');
  if (!availableLocales.includes('en') && availableLocales.length < 2) availableLocales.push('en');

  const html = docPage.docLayout({
    plugin, sections: topSections, blocksBySection, settings, lang,
    translations: t, mediaMap, availableLocales,
    extHeadHtml:      buildExtensionHead(enabledExts, lang, mediaMap),
    extI18nHtml:      buildExtensionI18nInject(enabledExts),
    extMediaHtml:     buildExtensionMediaInject(mediaMap),
    extTemplatesHtml: buildExtensionHtmlTemplates(enabledExts, lang, mediaMap),
    extDocTransHtml:  buildDocTransInject(t, lang),
    extScriptsHtml:   buildExtensionScripts(enabledExts),
  });
  return c.html(html);
});

docsRoutes.get('/', async (c) => {
  const db = c.get('db');
  const kv = c.env.KV;
  const lang = getLang(c);
  const [allPlugins, settings, enabledExts] = await Promise.all([
    db.select().from(plugins).where(and(ne(plugins.slug, '__system__'), notLike(plugins.slug, '__ext%'), eq(plugins.enabled, 1), eq(plugins.listed, 1))).orderBy(asc(plugins.sortOrder)).all(),
    getSettingsMap(db, kv),
    loadEnabledExtensions(db, kv),
  ]);
  const pluginTranslations = new Map<number, TranslationsMap>();
  const pluginIds = allPlugins.map(p => p.id);
  if (pluginIds.length > 0) {
    const metaRows = await db.select().from(translations)
      .where(inArray(translations.pluginId, pluginIds))
      .all();
    for (const row of metaRows) {
      if (row.key !== 'meta.name' && row.key !== 'meta.description') continue;
      if (!pluginTranslations.has(row.pluginId)) pluginTranslations.set(row.pluginId, new Map());
      const map = pluginTranslations.get(row.pluginId)!;
      if (!map.has(row.key)) map.set(row.key, {});
      map.get(row.key)![row.locale] = row.value;
    }
  }
  let availableLocales: string[] = ['zh', 'en'];
  const systemTranslations: TranslationsMap = new Map();
  const systemPlugin = await db.select().from(plugins).where(eq(plugins.slug, '__system__')).get();
  if (systemPlugin) {
    const locRows = await db.select({ key: translations.key, locale: translations.locale, value: translations.value })
      .from(translations).where(eq(translations.pluginId, systemPlugin.id)).all();
    for (const row of locRows) {
      if (!systemTranslations.has(row.key)) systemTranslations.set(row.key, {});
      systemTranslations.get(row.key)![row.locale] = row.value;
    }
    const locs = [...new Set(locRows.map(r => r.locale))].filter(Boolean);
    if (locs.length > 0) availableLocales = locs;
  }
  return c.html(docPage.home({
    plugins: allPlugins, settings, lang, availableLocales, pluginTranslations, systemTranslations,
    extHeadHtml:    buildExtensionHead(enabledExts, lang),
    extI18nHtml:    buildExtensionI18nInject(enabledExts),
    extMediaHtml:   '',
    extTemplatesHtml: buildExtensionHtmlTemplates(enabledExts, lang),
    extScriptsHtml: buildExtensionScripts(enabledExts),
  }));
});

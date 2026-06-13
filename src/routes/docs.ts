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
import { staticKeyForSlug, staticKeyForHome, edgeCacheKeyUrl } from '../services/static-pages';
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
  const activeVersion = c.req.query('v') || '';
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

  // If this is a version fork, redirect to canonical?v=
  if (plugin.versionGroup && plugin.versionGroup !== plugin.slug) {
    return c.redirect(`/${plugin.versionGroup}?v=${encodeURIComponent(plugin.version)}`, 301);
  }

  // Canonical slug = this plugin's slug (versionGroup may be null for legacy non-versioned docs)
  const canonicalSlug = plugin.slug;
  const versionGroupKey = plugin.versionGroup || plugin.slug;

  // Load all enabled siblings (same versionGroup) to build version switcher
  const siblings = await db.select().from(plugins)
    .where(and(eq(plugins.versionGroup, versionGroupKey), eq(plugins.enabled, 1)))
    .orderBy(asc(plugins.sortOrder))
    .all();

  // Switch to the appropriate sibling:
  // - If ?v= given → match by version string
  // - If no ?v= and siblings exist → default to newest (last in ascending sortOrder)
  if (siblings.length > 0) {
    if (activeVersion) {
      const matched = siblings.find(s => s.version === activeVersion);
      if (matched) plugin = matched;
    } else {
      plugin = siblings[siblings.length - 1];
    }
  }

  // ── Static: load settings early to check static_generation flag ──
  const settings = await getSettingsMap(db, kv);
  const staticEnabled = settings['plugin_static_' + canonicalSlug] !== '0';
  const r2Key = staticKeyForSlug(canonicalSlug, lang, activeVersion || undefined);
  const origin = new URL(c.req.url).origin;
  const eckUrl = edgeCacheKeyUrl(origin, c.req.path, lang) + (activeVersion ? `&__v=${encodeURIComponent(activeVersion)}` : '');
  const edgeCache = typeof caches !== 'undefined' ? (caches as unknown as CacheStorage).default : null;

  const analyticsTask = db.insert(analyticsEvents).values({
    pluginId: plugin.id,
    pluginSlug: plugin.slug,
    path: c.req.path,
    ip: clientIp(c),
    country: c.req.header('CF-IPCountry') || '',
    userAgent: c.req.header('User-Agent') || '',
    createdAt: new Date().toISOString(),
  }).run().catch(() => undefined);

  if (staticEnabled) {
    // Layer 1: Edge cache (PoP-local, ~0ms within same datacenter)
    if (edgeCache) {
      const cached = await edgeCache.match(new Request(eckUrl)).catch(() => null);
      if (cached) {
        c.executionCtx.waitUntil(analyticsTask);
        return new Response(await cached.text(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
      }
    }

    // Layer 2: R2 (persistent across PoPs, warms edge cache for next request)
    if (c.env.MEDIA) {
      const obj = await c.env.MEDIA.get(r2Key);
      if (obj) {
        const html = await obj.text();
        c.executionCtx.waitUntil(Promise.all([
          analyticsTask,
          edgeCache ? edgeCache.put(new Request(eckUrl), new Response(html, {
            headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=60' },
          })).catch(() => {}) : Promise.resolve(),
        ]));
        return c.html(html);
      }
    }
  }

  c.executionCtx.waitUntil(analyticsTask);

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

  if (!bundleLoaded) {
    allSections = await db.select()
      .from(sections)
      .where(eq(sections.pluginId, plugin.id))
      .orderBy(asc(sections.sortOrder))
      .all();

    const sectionIds = allSections.map((s: SectionRow) => s.id);
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

  // Build version switcher — only meaningful when multiple sibling versions exist; newest first
  const availableVersions = siblings.length > 1
    ? [...siblings].reverse().filter(s => s.version).map(s => ({
        version: s.version,
        url: `/${canonicalSlug}?v=${encodeURIComponent(s.version)}`,
        isCurrent: s.id === plugin!.id,
      }))
    : [];

  const enabledExts = await loadEnabledExtensions(db, kv);

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
    translations: t, mediaMap, availableLocales, availableVersions,
    extHeadHtml:      buildExtensionHead(enabledExts, lang, mediaMap),
    extI18nHtml:      buildExtensionI18nInject(enabledExts),
    extMediaHtml:     buildExtensionMediaInject(mediaMap),
    extTemplatesHtml: buildExtensionHtmlTemplates(enabledExts, lang, mediaMap),
    extDocTransHtml:  buildDocTransInject(t, lang),
    extScriptsHtml:   buildExtensionScripts(enabledExts),
  });

  // Layer 3 fallback: SSR complete — write to R2 + edge cache in background
  if (staticEnabled) {
    const writeTasks: Promise<unknown>[] = [];
    if (c.env.MEDIA) {
      writeTasks.push(c.env.MEDIA.put(r2Key, html, { httpMetadata: { contentType: 'text/html;charset=UTF-8' } }).catch(() => {}));
    }
    if (edgeCache) {
      writeTasks.push(edgeCache.put(new Request(eckUrl), new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=60' },
      })).catch(() => {}));
    }
    c.executionCtx.waitUntil(Promise.all(writeTasks));
  }

  return c.html(html);
});

docsRoutes.get('/', async (c) => {
  const db = c.get('db');
  const kv = c.env.KV;
  const lang = getLang(c);

  const homeSettings = await getSettingsMap(db, kv);
  const homeStaticEnabled = homeSettings.static_home !== '0';
  const homeR2Key = staticKeyForHome(lang);
  const homeOrigin = new URL(c.req.url).origin;
  const homeEckUrl = edgeCacheKeyUrl(homeOrigin, '/', lang);
  const homeEdgeCache = typeof caches !== 'undefined' ? (caches as unknown as CacheStorage).default : null;

  if (homeStaticEnabled) {
    // Layer 1: Edge cache
    if (homeEdgeCache) {
      const cached = await homeEdgeCache.match(new Request(homeEckUrl)).catch(() => null);
      if (cached) return new Response(await cached.text(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }
    // Layer 2: R2
    if (c.env.MEDIA) {
      const obj = await c.env.MEDIA.get(homeR2Key);
      if (obj) {
        const html = await obj.text();
        if (homeEdgeCache) {
          c.executionCtx.waitUntil(homeEdgeCache.put(new Request(homeEckUrl), new Response(html, {
            headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=60' },
          })).catch(() => {}));
        }
        return c.html(html);
      }
    }
  }

  const [allPlugins, enabledExts] = await Promise.all([
    db.select().from(plugins).where(and(ne(plugins.slug, '__system__'), notLike(plugins.slug, '__ext%'), eq(plugins.enabled, 1), eq(plugins.listed, 1))).orderBy(asc(plugins.sortOrder)).all(),
    loadEnabledExtensions(db, kv),
  ]);
  const settings = homeSettings;
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
  const homeHtml = docPage.home({
    plugins: allPlugins, settings, lang, availableLocales, pluginTranslations, systemTranslations,
    extHeadHtml:    buildExtensionHead(enabledExts, lang),
    extI18nHtml:    buildExtensionI18nInject(enabledExts),
    extMediaHtml:   '',
    extTemplatesHtml: buildExtensionHtmlTemplates(enabledExts, lang),
    extScriptsHtml: buildExtensionScripts(enabledExts),
  });

  if (homeStaticEnabled) {
    const writeTasks: Promise<unknown>[] = [];
    if (c.env.MEDIA) {
      writeTasks.push(c.env.MEDIA.put(homeR2Key, homeHtml, { httpMetadata: { contentType: 'text/html;charset=UTF-8' } }).catch(() => {}));
    }
    if (homeEdgeCache) {
      writeTasks.push(homeEdgeCache.put(new Request(homeEckUrl), new Response(homeHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=60' },
      })).catch(() => {}));
    }
    c.executionCtx.waitUntil(Promise.all(writeTasks));
  }

  return c.html(homeHtml);
});

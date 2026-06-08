import { Hono } from 'hono';
import { eq, asc, inArray, sql, ne, and, notLike } from 'drizzle-orm';
import { analyticsEvents, plugins, sections, contentBlocks, translations, media } from '../db/schema';
import { docPage } from '../templates/doc_page';
import type { TranslationsMap, MediaMap } from '../templates/doc_page';
import { notFoundPage } from '../templates/error_pages';
import { getSettingsMap } from '../services/settings';
import { loadEnabledExtensions, buildExtensionHead, buildExtensionHtmlTemplates, buildExtensionScripts, buildExtensionI18nInject, buildExtensionMediaInject, buildDocTransInject } from '../services/extensions';
import type { AppType } from '../types';

type SectionRow = typeof sections.$inferSelect;
type ContentBlockRow = typeof contentBlocks.$inferSelect;

interface SectionWithChildren extends SectionRow {
  children: SectionRow[];
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

async function loadTranslations(db: ReturnType<typeof import('../db').createDB>, pluginId: number): Promise<TranslationsMap> {
  const rows = await db.select().from(translations).where(eq(translations.pluginId, pluginId)).all();
  const map: TranslationsMap = new Map();
  for (const row of rows) {
    if (!map.has(row.key)) map.set(row.key, {});
    map.get(row.key)![row.locale] = row.value;
  }
  return map;
}

async function loadMediaMap(db: ReturnType<typeof import('../db').createDB>, pluginId: number): Promise<MediaMap> {
  const rows = await db.select()
    .from(media)
    .where(eq(media.pluginId, pluginId))
    .all();
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

export const docsRoutes = new Hono<AppType>();


docsRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const db = c.get('db');
  const lang = getLang(c);

  // Case-insensitive slug lookup (/MyDoc -> mydoc); only serve enabled docs
  const plugin = await db.select().from(plugins)
    .where(sql`lower(${plugins.slug}) = lower(${slug})`)
    .get();
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

  const allSections = await db.select()
    .from(sections)
    .where(eq(sections.pluginId, plugin.id))
    .orderBy(asc(sections.sortOrder))
    .all();

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

  const sectionIds = allSections.map(s => s.id);
  const allBlocks: ContentBlockRow[] = sectionIds.length > 0
    ? await db.select()
        .from(contentBlocks)
        .where(inArray(contentBlocks.sectionId, sectionIds))
        .orderBy(asc(contentBlocks.sortOrder))
        .all()
    : [];

  const blocksBySection = new Map<number, ContentBlockRow[]>();
  for (const b of allBlocks) {
    if (!blocksBySection.has(b.sectionId)) blocksBySection.set(b.sectionId, []);
    blocksBySection.get(b.sectionId)!.push(b);
  }

  const [settings, t, mediaMap, enabledExts] = await Promise.all([
    getSettingsMap(db),
    loadTranslations(db, plugin.id),
    loadMediaMap(db, plugin.id),
    loadEnabledExtensions(db),
  ]);

  // Collect locales that have at least one non-empty translation
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
  const lang = getLang(c);
  const [allPlugins, settings, enabledExts] = await Promise.all([
    db.select().from(plugins).where(and(ne(plugins.slug, '__system__'), notLike(plugins.slug, '__ext%'), eq(plugins.enabled, 1), eq(plugins.listed, 1))).orderBy(asc(plugins.sortOrder)).all(),
    getSettingsMap(db),
    loadEnabledExtensions(db),
  ]);
  // Collect available locales from system translations
  let availableLocales: string[] = ['zh', 'en'];
  const systemPlugin = await db.select().from(plugins).where(eq(plugins.slug, '__system__')).get();
  if (systemPlugin) {
    const locRows = await db.select({ locale: translations.locale })
      .from(translations).where(eq(translations.pluginId, systemPlugin.id)).all();
    const locs = [...new Set(locRows.map(r => r.locale))].filter(Boolean);
    if (locs.length > 0) availableLocales = locs;
  }
  return c.html(docPage.home({
    plugins: allPlugins, settings, lang, availableLocales,
    extHeadHtml:    buildExtensionHead(enabledExts, lang),
    extI18nHtml:    buildExtensionI18nInject(enabledExts),
    extMediaHtml:   '',
    extTemplatesHtml: buildExtensionHtmlTemplates(enabledExts, lang),
    extScriptsHtml: buildExtensionScripts(enabledExts),
  }));
});

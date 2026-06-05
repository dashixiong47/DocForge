import { Hono } from 'hono';
import { eq, asc, inArray, sql } from 'drizzle-orm';
import { plugins, sections, contentBlocks, translations, media } from '../db/schema';
import { docPage } from '../templates/doc_page';
import type { TranslationsMap, MediaMap } from '../templates/doc_page';
import { notFoundPage } from '../templates/error_pages';
import { getSettingsMap } from '../services/settings';
import type { AppType } from '../types';

type SectionRow = typeof sections.$inferSelect;
type ContentBlockRow = typeof contentBlocks.$inferSelect;

interface SectionWithChildren extends SectionRow {
  children: SectionRow[];
}

function getLang(c: { req: { header: (k: string) => string | undefined } }): 'zh' | 'en' {
  const cookie = c.req.header('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)lang=([^;]+)/);
  return m?.[1] === 'en' ? 'en' : 'zh';
}

async function loadTranslations(db: ReturnType<typeof import('../db').createDB>, pluginId: number): Promise<TranslationsMap> {
  const rows = await db.select().from(translations).where(eq(translations.pluginId, pluginId)).all();
  const map: TranslationsMap = new Map();
  for (const row of rows) {
    if (!map.has(row.key)) map.set(row.key, { zh: '', en: '' });
    const entry = map.get(row.key)!;
    if (row.locale === 'zh') entry.zh = row.value;
    if (row.locale === 'en') entry.en = row.value;
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

  // Case-insensitive slug lookup (/WebUIX → webuix)
  const plugin = await db.select().from(plugins)
    .where(sql`lower(${plugins.slug}) = lower(${slug})`)
    .get();
  if (!plugin) return c.html(notFoundPage(slug));

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

  const [settings, t, mediaMap] = await Promise.all([
    getSettingsMap(db),
    loadTranslations(db, plugin.id),
    loadMediaMap(db, plugin.id),
  ]);

  const html = docPage.docLayout({ plugin, sections: topSections, blocksBySection, settings, lang, translations: t, mediaMap });
  return c.html(html);
});

docsRoutes.get('/', async (c) => {
  const db = c.get('db');
  const lang = getLang(c);
  const allPlugins = await db.select().from(plugins).orderBy(asc(plugins.sortOrder)).all();
  const settings = await getSettingsMap(db);
  return c.html(docPage.home({ plugins: allPlugins, settings, lang }));
});

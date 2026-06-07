import { Hono } from 'hono';
import { eq, asc, and, count, ne, notLike } from 'drizzle-orm';
import { plugins, sections, contentBlocks, admins, translations } from '../db/schema';
import { getSettingsMap } from '../services/settings';
import { adminAuth } from '../services/auth';
import { adminPage, cssEditor, setSysI18n, setSysLocales } from '../templates/admin';
import { extensionsList, extensionDetail, extensionTranslations } from '../templates/extensions';
import type { I18nRow } from '../templates/extensions';
import { loadAllExtensions, loadExtensionById } from '../services/extensions';
import type { AppType } from '../types';

function getLang(c: { req: { header: (k: string) => string | undefined } }): string {
  const cookie = c.req.header('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)lang=([^;]+)/);
  return m?.[1] || 'zh';
}

const TRANS_PAGE_SIZE = 20;

export const adminRoutes = new Hono<AppType>();

adminRoutes.get('/login', (c) => c.html(adminPage.login()));

adminRoutes.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const username = String(body.username || '');
  const password = String(body.password || '');
  const db = c.get('db');
  let authenticated = false;
  const dbAdmin = await db.select().from(admins).where(eq(admins.username, username)).get();
  if (dbAdmin) {
    authenticated = await adminAuth.verifyPassword(password, dbAdmin.passwordHash);
  } else {
    authenticated = username === c.env.ADMIN_USERNAME && password === c.env.ADMIN_PASSWORD;
  }
  if (authenticated) {
    const token = await adminAuth.signToken(username, c.env.JWT_SECRET);
    c.header('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`);
    return c.redirect('/admin');
  }
  return c.html(adminPage.login('账号或密码错误'));
});

adminRoutes.get('/logout', (c) => {
  c.header('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  return c.redirect('/admin/login');
});

adminRoutes.use('*', async (c, next) => {
  if (c.req.path === '/admin/login') return next();
  const cookie = c.req.header('Cookie') || '';
  const match = cookie.match(/admin_token=([^;]+)/);
  const token = match ? match[1] : undefined;
  if (!token) return c.redirect('/admin/login');
  const payload = await adminAuth.verifyToken(token, c.env.JWT_SECRET);
  if (!payload) {
    c.header('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0');
    return c.redirect('/admin/login');
  }
  // Load system translations from DB and attach to context
  const db = c.get('db');
  const sysPlugin = await db.select({ id: plugins.id }).from(plugins)
    .where(eq(plugins.slug, '__system__')).get();
  const sysI18n: Record<string, { zh: string; en: string }> = {};
  if (sysPlugin) {
    const rows = await db.select().from(translations)
      .where(eq(translations.pluginId, sysPlugin.id)).all();
    for (const row of rows) {
      if (!sysI18n[row.key]) sysI18n[row.key] = { zh: '', en: '' };
      if (row.locale === 'zh') sysI18n[row.key].zh = row.value;
      else if (row.locale === 'en') sysI18n[row.key].en = row.value;
    }
  }
  // Distinct locales with at least one non-empty value in system translations
  const sysLocales = sysPlugin
    ? [...new Set(
        (await db.select({ locale: translations.locale, value: translations.value })
          .from(translations).where(eq(translations.pluginId, sysPlugin.id)).all())
          .filter(r => r.value.trim())
          .map(r => r.locale)
      )]
    : ['zh', 'en'];

  c.set('sysI18n', sysI18n);
  setSysI18n(sysI18n);
  setSysLocales(sysLocales);
  await next();
});

adminRoutes.get('/', async (c) => {
  const db = c.get('db');
  const settings = await getSettingsMap(db);
  return c.html(adminPage.dashboard({ settings }));
});

adminRoutes.get('/plugins', async (c) => {
  const db = c.get('db');
  const all = await db.select().from(plugins).where(and(ne(plugins.slug, '__system__'), notLike(plugins.slug, '__ext%'))).orderBy(asc(plugins.sortOrder)).all();
  return c.html(adminPage.plugins(all));
});

adminRoutes.get('/plugins/:id/editor', async (c) => {
  const pluginId = Number(c.req.param('id'));
  const sParam = c.req.query('s');
  const db = c.get('db');
  const plugin = await db.select().from(plugins).where(eq(plugins.id, pluginId)).get();
  if (!plugin) return c.html(adminPage.notFound('Plugin not found'));
  const [allPlugins, allSections] = await Promise.all([
    db.select().from(plugins).where(and(ne(plugins.slug, '__system__'), notLike(plugins.slug, '__ext%'))).orderBy(asc(plugins.sortOrder)).all(),
    db.select().from(sections).where(eq(sections.pluginId, pluginId)).orderBy(asc(sections.sortOrder)).all(),
  ]);
  let activeSection: (typeof allSections)[0] | null = null;
  let blockList: any[] = [];
  if (sParam) activeSection = allSections.find(s => s.id === Number(sParam)) ?? null;
  if (!activeSection && allSections.length > 0) activeSection = allSections[0];
  if (activeSection) {
    const child = allSections.find(s => s.parentId === activeSection!.id);
    if (child) activeSection = child;
  }
  if (activeSection) {
    blockList = await db.select()
      .from(contentBlocks)
      .where(eq(contentBlocks.sectionId, activeSection.id))
      .orderBy(asc(contentBlocks.sortOrder))
      .all();
  }
  const settings = await getSettingsMap(db);
  return c.html(adminPage.pluginEditor(
    plugin,
    allPlugins,
    allSections,
    activeSection,
    blockList,
    settings.editor_theme || '',
    plugin.customCss || '',
    (plugin as any).customJs || '',
    c.get('sysI18n') || {},
  ));
});

adminRoutes.get('/plugins/:id/sections', async (c) => {
  const id = Number(c.req.param('id'));
  const db = c.get('db');
  const plugin = await db.select().from(plugins).where(eq(plugins.id, id)).get();
  if (!plugin) return c.html(adminPage.notFound('Plugin not found'));
  const allSections = await db.select().from(sections).where(eq(sections.pluginId, id)).orderBy(asc(sections.sortOrder)).all();
  return c.html(adminPage.sections(plugin, allSections));
});

adminRoutes.get('/sections/:id/edit', async (c) => {
  const id = Number(c.req.param('id'));
  const db = c.get('db');
  const section = await db.select().from(sections).where(eq(sections.id, id)).get();
  if (!section) return c.html(adminPage.notFound('Section not found'));
  const blocks = await db.select().from(contentBlocks)
    .where(eq(contentBlocks.sectionId, id))
    .orderBy(asc(contentBlocks.sortOrder))
    .all();
  return c.html(adminPage.editSection(section, blocks));
});

// ─── Translations list ────────────────────────────────────────────────────────
adminRoutes.get('/translations', async (c) => {
  const db = c.get('db');
  const tab = (c.req.query('tab') || 'docs') as 'docs' | 'ext';
  const page = Math.max(1, Number(c.req.query('page')) || 1);

  // Document plugins (exclude __system__ and __ext*)
  const allPlugins = await db.select().from(plugins)
    .where(and(ne(plugins.slug, '__system__'), notLike(plugins.slug, '__ext%')))
    .orderBy(asc(plugins.sortOrder)).all();
  const total = allPlugins.length;
  const pagePlugins = allPlugins.slice((page - 1) * TRANS_PAGE_SIZE, page * TRANS_PAGE_SIZE);

  const countRows = await db
    .select({ pluginId: translations.pluginId, cnt: count() })
    .from(translations)
    .groupBy(translations.pluginId)
    .all();
  const transCounts: Record<number, number> = {};
  for (const r of countRows) transCounts[r.pluginId] = Math.round(Number(r.cnt) / 2);

  // Extensions with i18n strings
  const { loadAllExtensions } = await import('../services/extensions');
  const allExts = await loadAllExtensions(db);
  const extsWithI18n = allExts.filter(e => Object.keys(e.i18nStrings).length > 0);

  return c.html(adminPage.translationsList(pagePlugins, page, total, TRANS_PAGE_SIZE, transCounts, extsWithI18n, tab));
});

// ─── Site UI translations (system plugin) ─────────────────────────────────────
adminRoutes.get('/translations/system', async (c) => {
  const db = c.get('db');
  const systemPlugin = await db.select({ id: plugins.id }).from(plugins)
    .where(eq(plugins.slug, '__system__')).get();
  const systemId = systemPlugin?.id ?? 0;
  const rows = await db.select().from(translations)
    .where(eq(translations.pluginId, systemId))
    .orderBy(asc(translations.key), asc(translations.locale))
    .all();
  return c.html(adminPage.systemTranslations(rows.map(r => ({ key: r.key, locale: r.locale, value: r.value })), systemId));
});

// ─── Per-plugin translations (optional ?section=slug filter) ──────────────────
adminRoutes.get('/plugins/:id/translations', async (c) => {
  const id = Number(c.req.param('id'));
  const sectionSlug = c.req.query('section') || '';
  const db = c.get('db');
  const plugin = await db.select().from(plugins).where(eq(plugins.id, id)).get();
  if (!plugin) return c.html(adminPage.notFound('Plugin not found'));

  // All top-level sections (for the filter sidebar)
  const allSections = await db.select().from(sections)
    .where(and(eq(sections.pluginId, id), eq(sections.parentId, null as any)))
    .orderBy(asc(sections.sortOrder)).all();

  // Resolve section filter → set of block key prefixes
  let filterPrefixes: string[] = [];
  let filterSection: (typeof allSections)[0] | null = null;
  if (sectionSlug) {
    const sec = allSections.find(s => s.slug === sectionSlug) ?? null;
    if (sec) {
      filterSection = sec;
      // Include child sections too
      const children = await db.select({ id: sections.id }).from(sections)
        .where(and(eq(sections.pluginId, id), eq(sections.parentId, sec.id))).all();
      const sectionIds = [sec.id, ...children.map(s => s.id)];
      for (const sid of sectionIds) {
        const blocks = await db.select({ id: contentBlocks.id }).from(contentBlocks)
          .where(eq(contentBlocks.sectionId, sid)).all();
        for (const b of blocks) filterPrefixes.push(`block.${b.id}.`);
      }
      filterPrefixes.push(`sec.${sectionSlug}.`);
    }
  }

  const allRows = await db.select().from(translations)
    .where(eq(translations.pluginId, id))
    .orderBy(asc(translations.key), asc(translations.locale))
    .all();

  const rawRows = filterPrefixes.length
    ? allRows.filter(r => filterPrefixes.some(p => r.key.startsWith(p)))
    : allRows;

  return c.html(adminPage.pluginTranslations(
    plugin,
    rawRows.map(r => ({ key: r.key, locale: r.locale, value: r.value })),
    allSections,
    filterSection,
  ));
});

adminRoutes.get('/settings', async (c) => {
  const db = c.get('db');
  const settings = await getSettingsMap(db);
  return c.html(adminPage.settings(settings));
});

adminRoutes.get('/settings/account', (c) => c.html(adminPage.accountSettings()));

// ─── Extensions (plugin ecosystem) ───────────────────────────────────────────
adminRoutes.get('/extensions', async (c) => {
  const db = c.get('db');
  const exts = await loadAllExtensions(db);
  return c.html(extensionsList(exts));
});

adminRoutes.get('/extensions/install', (c) => c.redirect('/admin/extensions'));

adminRoutes.get('/extensions/:id/translations', async (c) => {
  const db = c.get('db');
  const ext = await loadExtensionById(db, Number(c.req.param('id')));
  if (!ext) return c.text('Not found', 404);
  const rows: I18nRow[] = [];
  for (const [key, locales] of Object.entries(ext.i18nStrings)) {
    for (const [locale, value] of Object.entries(locales)) {
      rows.push({ key, locale, value });
    }
  }
  return c.html(extensionTranslations(ext, rows));
});

adminRoutes.get('/extensions/:id', async (c) => {
  const db = c.get('db');
  const ext = await loadExtensionById(db, Number(c.req.param('id')));
  if (!ext) return c.text('Not found', 404);
  const settings = await getSettingsMap(db);
  return c.html(extensionDetail(ext, getLang(c), settings.editor_theme || '', c.get('sysI18n') || {}));
});

adminRoutes.get('/settings/css-editor', async (c) => {
  const db = c.get('db');
  const settings = await getSettingsMap(db);
  return c.html(cssEditor(settings.custom_css || ''));
});

adminRoutes.get('/media', async (c) => {
  const db = c.get('db');
  const allPlugins = await db.select().from(plugins).where(and(ne(plugins.slug, '__system__'), notLike(plugins.slug, '__ext%'))).orderBy(asc(plugins.sortOrder)).all();
  return c.html(adminPage.media(c.req.query('plugin') || '', allPlugins));
});

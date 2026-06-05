import { Hono } from 'hono';
import { eq, asc, and } from 'drizzle-orm';
import { plugins, sections, contentBlocks, admins, translations } from '../db/schema';
import { getSettingsMap } from '../services/settings';
import { adminAuth } from '../services/auth';
import { adminPage } from '../templates/admin_page';
import type { AppType } from '../types';

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
  await next();
});

adminRoutes.get('/', async (c) => {
  const db = c.get('db');
  const settings = await getSettingsMap(db);
  return c.html(adminPage.dashboard({ settings }));
});

adminRoutes.get('/plugins', async (c) => {
  const db = c.get('db');
  const all = await db.select().from(plugins).orderBy(asc(plugins.sortOrder)).all();
  return c.html(adminPage.plugins(all));
});

adminRoutes.get('/plugins/:id/editor', async (c) => {
  const pluginId = Number(c.req.param('id'));
  const sParam = c.req.query('s');
  const db = c.get('db');
  const plugin = await db.select().from(plugins).where(eq(plugins.id, pluginId)).get();
  if (!plugin) return c.html(adminPage.notFound('Plugin not found'));
  const [allPlugins, allSections] = await Promise.all([
    db.select().from(plugins).orderBy(asc(plugins.sortOrder)).all(),
    db.select().from(sections).where(eq(sections.pluginId, pluginId)).orderBy(asc(sections.sortOrder)).all(),
  ]);
  let activeSection: (typeof allSections)[0] | null = null;
  let blockList: any[] = [];
  if (sParam) activeSection = allSections.find(s => s.id === Number(sParam)) ?? null;
  if (!activeSection && allSections.length > 0) activeSection = allSections[0];
  if (activeSection) {
    blockList = await db.select()
      .from(contentBlocks)
      .where(eq(contentBlocks.sectionId, activeSection.id))
      .orderBy(asc(contentBlocks.sortOrder))
      .all();
  }
  const settings = await getSettingsMap(db);
  return c.html(adminPage.pluginEditor(plugin, allPlugins, allSections, activeSection, blockList, settings.editor_theme || ''));
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

// Translations page per plugin
adminRoutes.get('/plugins/:id/translations', async (c) => {
  const id = Number(c.req.param('id'));
  const db = c.get('db');
  const plugin = await db.select().from(plugins).where(eq(plugins.id, id)).get();
  if (!plugin) return c.html(adminPage.notFound('Plugin not found'));
  const rows = await db.select().from(translations)
    .where(eq(translations.pluginId, id))
    .orderBy(asc(translations.key), asc(translations.locale))
    .all();
  const rawRows = rows.map(r => ({ key: r.key, locale: r.locale, value: r.value }));
  return c.html(adminPage.pluginTranslations(plugin, rawRows));
});

adminRoutes.get('/settings', async (c) => {
  const db = c.get('db');
  const settings = await getSettingsMap(db);
  return c.html(adminPage.settings(settings));
});

adminRoutes.get('/media', async (c) => {
  const db = c.get('db');
  const allPlugins = await db.select().from(plugins).orderBy(asc(plugins.sortOrder)).all();
  return c.html(adminPage.media(c.req.query('plugin') || '', allPlugins));
});

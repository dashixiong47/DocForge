-- Migration: 0016_site_i18n_defaults
-- Seeds homepage/site settings into the editable system translation table.

INSERT OR IGNORE INTO plugins (
  slug, name, version, compatibility, description, badge_tags, sort_order, enabled, listed, created_at, updated_at
) VALUES (
  '__system__',
  'System i18n',
  '1.0.0',
  '',
  'Site UI and homepage translation strings',
  '[]',
  10000,
  0,
  0,
  datetime('now'),
  datetime('now')
);

INSERT OR IGNORE INTO translations (plugin_id, key, locale, value, updated_at)
SELECT id, 'site.title', 'zh', 'DocForge', datetime('now') FROM plugins WHERE slug='__system__';
INSERT OR IGNORE INTO translations (plugin_id, key, locale, value, updated_at)
SELECT id, 'site.title', 'en', 'DocForge', datetime('now') FROM plugins WHERE slug='__system__';

INSERT OR IGNORE INTO translations (plugin_id, key, locale, value, updated_at)
SELECT id, 'site.subtitle', 'zh', '面向项目和插件文档的开放文档平台。', datetime('now') FROM plugins WHERE slug='__system__';
INSERT OR IGNORE INTO translations (plugin_id, key, locale, value, updated_at)
SELECT id, 'site.subtitle', 'en', 'Open documentation platform for projects and plugins.', datetime('now') FROM plugins WHERE slug='__system__';

INSERT OR IGNORE INTO translations (plugin_id, key, locale, value, updated_at)
SELECT id, 'site.logo', 'zh', 'DocForge', datetime('now') FROM plugins WHERE slug='__system__';
INSERT OR IGNORE INTO translations (plugin_id, key, locale, value, updated_at)
SELECT id, 'site.logo', 'en', 'DocForge', datetime('now') FROM plugins WHERE slug='__system__';

UPDATE translations
SET value='面向项目和插件文档的开放文档平台。', updated_at=datetime('now')
WHERE key='site.subtitle'
  AND locale='zh'
  AND value IN ('', 'Plugin documentation', 'Open documentation platform for projects and plugins.');

UPDATE translations
SET value='DocForge', updated_at=datetime('now')
WHERE key='site.logo'
  AND locale='zh'
  AND value IN ('', 'Plugin Docs', 'UE5 Plugin Docs');

INSERT OR IGNORE INTO translations (plugin_id, key, locale, value, updated_at)
SELECT id, 'meta.name', 'zh', 'DocForge', datetime('now') FROM plugins WHERE slug='docforge';
INSERT OR IGNORE INTO translations (plugin_id, key, locale, value, updated_at)
SELECT id, 'meta.name', 'en', 'DocForge', datetime('now') FROM plugins WHERE slug='docforge';
INSERT OR IGNORE INTO translations (plugin_id, key, locale, value, updated_at)
SELECT id, 'meta.description', 'zh', '面向插件和项目文档的开源文档 CMS。', datetime('now') FROM plugins WHERE slug='docforge';
INSERT OR IGNORE INTO translations (plugin_id, key, locale, value, updated_at)
SELECT id, 'meta.description', 'en', 'Open-source documentation CMS for plugin and project docs.', datetime('now') FROM plugins WHERE slug='docforge';

UPDATE translations
SET value='面向插件和项目文档的开源文档 CMS。', updated_at=datetime('now')
WHERE key='meta.description'
  AND locale='zh'
  AND value IN ('', 'Open-source documentation CMS for plugin and project docs.');

import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';

export const plugins = sqliteTable('plugins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  version: text('version').notNull().default('1.0.0'),
  compatibility: text('compatibility').notNull().default(''),
  description: text('description').default(''),
  iconUrl: text('icon_url').default(''),
  badgeTags: text('badge_tags').default('[]'),
  sortOrder: integer('sort_order').notNull().default(0),
  enabled: integer('enabled').notNull().default(0),
  listed: integer('listed').notNull().default(1),
  customCss: text('custom_css').default(''),
  customJs:  text('custom_js').default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const sections = sqliteTable('sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pluginId: integer('plugin_id').notNull().references(() => plugins.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id').references((): any => sections.id, { onDelete: 'set null' }),
  titleEn: text('title_en').notNull().default(''),
  titleZh: text('title_zh').notNull().default(''),
  slug: text('slug').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  pluginIdx: index('idx_sections_plugin').on(table.pluginId),
  parentIdx: index('idx_sections_parent').on(table.parentId),
}));

export const contentBlocks = sqliteTable('content_blocks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sectionId: integer('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('html'),
  contentJson: text('content_json').notNull().default('{}'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  sectionIdx: index('idx_content_blocks_section').on(table.sectionId),
}));

export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pluginId: integer('plugin_id').notNull().references(() => plugins.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  d2Key: text('d2_key').notNull().unique(),
  mimeType: text('mime_type').notNull().default('application/octet-stream'),
  sizeBytes: integer('size_bytes').notNull().default(0),
  altText: text('alt_text').default(''),
  placeholderKey: text('placeholder_key').unique(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  pluginIdx: index('idx_media_plugin').on(table.pluginId),
}));

export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull().default(''),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  keyIdx: index('idx_site_settings_key').on(table.key),
}));

export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const extensions = sqliteTable('extensions', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  slug:         text('slug').notNull().unique(),
  name:         text('name').notNull(),
  description:  text('description').notNull().default(''),
  version:      text('version').notNull().default('1.0.0'),
  author:       text('author').notNull().default(''),
  icon:         text('icon').notNull().default('🧩'),
  homepage:     text('homepage').notNull().default(''),
  extType:      text('ext_type').notNull().default('general'),
  enabled:      integer('enabled').notNull().default(1),
  html:         text('html').notNull().default(''),
  css:          text('css').notNull().default(''),
  js:           text('js').notNull().default(''),
  headHtml:     text('head_html').notNull().default(''),
  blockTypes:   text('block_types').notNull().default('[]'),
  tags:         text('tags').notNull().default('[]'),
  i18n:         text('i18n').notNull().default('{}'),
  configSchema: text('config_schema').notNull().default('{}'),
  config:       text('config').notNull().default('{}'),
  shareToken:   text('share_token').notNull().default(''),
  shareNotify:  integer('share_notify').notNull().default(1),
  createdAt:    text('created_at').notNull(),
  updatedAt:    text('updated_at').notNull(),
});

export const extensionShareEvents = sqliteTable('extension_share_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  extensionId: integer('extension_id').notNull().references(() => extensions.id, { onDelete: 'cascade' }),
  extensionSlug: text('extension_slug').notNull(),
  token: text('token').notNull(),
  eventType: text('event_type').notNull().default('install'),
  sourceUrl: text('source_url').notNull().default(''),
  installerOrigin: text('installer_origin').notNull().default(''),
  installerUserAgent: text('installer_user_agent').notNull().default(''),
  ip: text('ip').notNull().default(''),
  country: text('country').notNull().default(''),
  createdAt: text('created_at').notNull(),
}, (t) => ({
  tokenIdx: index('idx_extension_share_events_token').on(t.token, t.createdAt),
  extensionIdx: index('idx_extension_share_events_extension').on(t.extensionId, t.createdAt),
}));

export const translations = sqliteTable('translations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pluginId: integer('plugin_id').notNull().references(() => plugins.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  locale: text('locale').notNull(),
  value: text('value').notNull().default(''),
  updatedAt: text('updated_at').notNull(),
}, (t) => ({
  uniq: index('idx_translations_uniq').on(t.pluginId, t.key, t.locale),
}));

export const analyticsEvents = sqliteTable('analytics_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pluginId: integer('plugin_id').notNull().references(() => plugins.id, { onDelete: 'cascade' }),
  pluginSlug: text('plugin_slug').notNull(),
  path: text('path').notNull().default(''),
  ip: text('ip').notNull().default(''),
  country: text('country').notNull().default(''),
  userAgent: text('user_agent').notNull().default(''),
  createdAt: text('created_at').notNull(),
}, (t) => ({
  createdIdx: index('idx_analytics_events_created').on(t.createdAt),
  pluginIdx: index('idx_analytics_events_plugin').on(t.pluginId, t.createdAt),
  countryIdx: index('idx_analytics_events_country').on(t.country, t.createdAt),
}));

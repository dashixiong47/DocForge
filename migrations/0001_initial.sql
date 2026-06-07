-- Migration: 0001_initial
-- Creates the core schema for DocForge

CREATE TABLE IF NOT EXISTS plugins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  version       TEXT NOT NULL DEFAULT '1.0.0',
  compatibility TEXT NOT NULL DEFAULT '',
  description   TEXT DEFAULT '',
  icon_url      TEXT DEFAULT '',
  badge_tags    TEXT DEFAULT '[]',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sections (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id     INTEGER NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  parent_id     INTEGER DEFAULT NULL REFERENCES sections(id) ON DELETE SET NULL,
  title_en      TEXT NOT NULL DEFAULT '',
  title_zh      TEXT NOT NULL DEFAULT '',
  slug          TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS content_blocks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id    INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'html',
  content_json  TEXT NOT NULL DEFAULT '{}',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id     INTEGER NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  filename      TEXT NOT NULL,
  d2_key        TEXT NOT NULL UNIQUE,
  mime_type     TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes    INTEGER NOT NULL DEFAULT 0,
  alt_text      TEXT DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  key           TEXT NOT NULL UNIQUE,
  value         TEXT NOT NULL DEFAULT '',
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default site settings (safe for re-run)
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('site_title', 'DocForge');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('site_subtitle', 'Plugin documentation');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('header_logo_text', 'Plugin Docs');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('header_accent_color', '#58a6ff');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('footer_text', '');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('custom_css', '');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('custom_head_html', '');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('ga_tracking_id', '');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sections_plugin ON sections(plugin_id);
CREATE INDEX IF NOT EXISTS idx_sections_parent ON sections(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_section ON content_blocks(section_id);
CREATE INDEX IF NOT EXISTS idx_media_plugin ON media(plugin_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

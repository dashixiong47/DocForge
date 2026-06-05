-- Migration: 0002_translations
-- Adds i18n translation key store

CREATE TABLE IF NOT EXISTS translations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id  INTEGER NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  locale     TEXT NOT NULL,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_translations_uniq ON translations(plugin_id, key, locale);

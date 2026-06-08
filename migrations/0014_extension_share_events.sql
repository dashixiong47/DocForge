ALTER TABLE extensions ADD COLUMN share_token TEXT NOT NULL DEFAULT '';
ALTER TABLE extensions ADD COLUMN share_notify INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS extension_share_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  extension_id INTEGER NOT NULL,
  extension_slug TEXT NOT NULL,
  token TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'install',
  source_url TEXT NOT NULL DEFAULT '',
  installer_origin TEXT NOT NULL DEFAULT '',
  installer_user_agent TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_extension_share_events_token ON extension_share_events(token, created_at);
CREATE INDEX IF NOT EXISTS idx_extension_share_events_extension ON extension_share_events(extension_id, created_at);

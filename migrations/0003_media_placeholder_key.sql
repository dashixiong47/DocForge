-- Migration 0003: Add placeholder_key to media table
-- Allows media files to be referenced by semantic keys in content blocks
-- using {{img:key}} and {{video:key}} syntax

ALTER TABLE media ADD COLUMN placeholder_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_media_placeholder_key
  ON media(placeholder_key)
  WHERE placeholder_key IS NOT NULL;

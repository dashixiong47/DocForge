-- Add enabled/published status to plugins (0 = draft, 1 = published)
ALTER TABLE plugins ADD COLUMN enabled INTEGER NOT NULL DEFAULT 0;

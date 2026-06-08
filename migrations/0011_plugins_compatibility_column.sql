ALTER TABLE plugins ADD COLUMN compatibility TEXT NOT NULL DEFAULT '';

UPDATE plugins
SET compatibility = COALESCE(NULLIF(ue_version, ''), compatibility)
WHERE compatibility = '';

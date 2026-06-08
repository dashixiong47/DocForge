INSERT OR IGNORE INTO site_settings (key, value) VALUES ('site_icon', 'DF');

UPDATE site_settings SET value='DocForge' WHERE key='site_title' AND value IN ('UE5 Plugin Docs', 'Plugin Docs');
UPDATE site_settings SET value='Open documentation platform for projects and plugins.' WHERE key='site_subtitle' AND value IN ('Unreal Engine Plugin Documentation', 'Plugin documentation', '');
UPDATE site_settings SET value='DocForge' WHERE key='header_logo_text' AND value IN ('Plugin Docs', 'UE5 Plugin Docs', '');

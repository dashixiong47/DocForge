import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const dbName = process.env.D1_DATABASE || 'docforge-db';
const tmpDir = resolve(root, '.wrangler');
const wranglerBin = resolve(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const outputPath = resolve(tmpDir, 'document-content-current-schema.sql');

function sqlString(value) {
  if (value === null || value === undefined || value === 'null') return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function queryJson(sql, label) {
  const result = spawnSync(process.execPath, [
    wranglerBin,
    'd1',
    'execute',
    dbName,
    '--local',
    '--command',
    sql,
    '--json',
  ], {
    cwd: root,
    shell: false,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`D1 query failed: ${label}`);
  }
  const lines = (result.stdout || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const candidate = lines.slice(i).join('\n');
    if (!candidate.startsWith('[') && !candidate.startsWith('{')) continue;
    try {
      const parsed = JSON.parse(candidate);
      return Array.isArray(parsed) ? (parsed[0]?.results || []) : (parsed.results || []);
    } catch {
      // Wrangler can emit progress text before JSON.
    }
  }
  throw new Error(`Unable to parse D1 JSON output: ${label}`);
}

function insert(table, columns, rows) {
  if (!rows.length) return '';
  return rows.map(row => {
    const values = columns.map(col => {
      const value = row[col];
      return typeof value === 'number' ? String(value) : sqlString(value);
    }).join(',');
    return `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(',')}) VALUES(${values});`;
  }).join('\n');
}

mkdirSync(tmpDir, { recursive: true });

const plugins = queryJson(`
SELECT id, slug, name, version, compatibility, description, icon_url, badge_tags,
       sort_order, created_at, updated_at, custom_css, enabled, custom_js, listed
FROM plugins
ORDER BY id;
`, 'plugins');

const sections = queryJson(`
SELECT id, plugin_id, parent_id, title_en, title_zh, slug, sort_order, created_at, updated_at
FROM sections
ORDER BY id;
`, 'sections');

const blocks = queryJson(`
SELECT id, section_id, type, content_json, sort_order, created_at, updated_at
FROM content_blocks
ORDER BY id;
`, 'content_blocks');

const media = queryJson(`
SELECT id, plugin_id, filename, d2_key, mime_type, size_bytes, alt_text, placeholder_key, created_at
FROM media
ORDER BY id;
`, 'media');

const translations = queryJson(`
SELECT id, plugin_id, key, locale, value, updated_at
FROM translations
ORDER BY id;
`, 'translations');

const extensions = queryJson(`
SELECT id, slug, name, description, version, author, icon, homepage, ext_type, enabled,
       css, js, head_html, block_types, config_schema, config, created_at, updated_at,
       tags, i18n, html, share_token, share_notify
FROM extensions
ORDER BY id;
`, 'extensions');

const sql = [
  'PRAGMA defer_foreign_keys=TRUE;',
  insert('plugins', [
    'id', 'slug', 'name', 'version', 'compatibility', 'description', 'icon_url',
    'badge_tags', 'sort_order', 'created_at', 'updated_at', 'custom_css',
    'enabled', 'custom_js', 'listed',
  ], plugins),
  insert('sections', [
    'id', 'plugin_id', 'parent_id', 'title_en', 'title_zh', 'slug', 'sort_order',
    'created_at', 'updated_at',
  ], sections),
  insert('content_blocks', [
    'id', 'section_id', 'type', 'content_json', 'sort_order', 'created_at', 'updated_at',
  ], blocks),
  insert('media', [
    'id', 'plugin_id', 'filename', 'd2_key', 'mime_type', 'size_bytes', 'alt_text',
    'placeholder_key', 'created_at',
  ], media),
  insert('translations', [
    'id', 'plugin_id', 'key', 'locale', 'value', 'updated_at',
  ], translations),
  insert('extensions', [
    'id', 'slug', 'name', 'description', 'version', 'author', 'icon', 'homepage',
    'ext_type', 'enabled', 'css', 'js', 'head_html', 'block_types', 'config_schema',
    'config', 'created_at', 'updated_at', 'tags', 'i18n', 'html', 'share_token',
    'share_notify',
  ], extensions),
].filter(Boolean).join('\n\n');

writeFileSync(outputPath, `${sql}\n`);
writeFileSync(resolve(tmpDir, 'document-media-keys.json'), JSON.stringify(media.map(m => ({
  d2Key: m.d2_key,
  mimeType: m.mime_type,
})), null, 2));

console.log(`Exported ${plugins.length} plugins, ${sections.length} sections, ${blocks.length} blocks, ${translations.length} translations, ${media.length} media records, ${extensions.length} extensions.`);
console.log(outputPath);

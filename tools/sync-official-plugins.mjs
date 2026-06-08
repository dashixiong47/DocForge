import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const mode = process.argv.includes('--remote') ? 'remote' : 'local';
const modeFlag = mode === 'remote' ? '--remote' : '--local';
const dbName = process.env.D1_DATABASE || 'docforge-db';
const root = process.cwd();
const pluginsDir = resolve(root, 'Plugins');
const tmpDir = resolve(root, '.wrangler');

function sqlString(value) {
  return String(value ?? '').replace(/'/g, "''");
}

function jsonString(value) {
  return JSON.stringify(value ?? {});
}

function normalizeManifest(raw, file) {
  if (!raw || typeof raw !== 'object') throw new Error(`${file}: invalid JSON object`);
  const slug = String(raw.slug || '').trim();
  const name = String(raw.name || '').trim();
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`${file}: invalid slug`);
  if (!name) throw new Error(`${file}: missing name`);
  return {
    slug,
    name,
    description: String(raw.description || ''),
    version: String(raw.version || '1.0.0'),
    author: String(raw.author || 'DocForge'),
    icon: String(raw.icon || '🧩'),
    homepage: String(raw.homepage || ''),
    extType: ['theme', 'widget', 'system'].includes(raw.type) ? raw.type : 'widget',
    enabled: raw.enabled === false ? 0 : 1,
    html: String(raw.html || ''),
    css: String(raw.css || ''),
    js: String(raw.js || ''),
    headHtml: String(raw.headHtml || ''),
    blockTypes: Array.isArray(raw.blockTypes) ? raw.blockTypes.filter(v => typeof v === 'string') : [],
    tags: Array.isArray(raw.tags) ? raw.tags.filter(v => typeof v === 'string') : [],
    i18n: raw.i18n && typeof raw.i18n === 'object' ? raw.i18n : {},
    configSchema: raw.configSchema && typeof raw.configSchema === 'object' ? raw.configSchema : {},
    config: raw.config && typeof raw.config === 'object' ? raw.config : {},
  };
}

if (!existsSync(pluginsDir)) {
  console.log('No Plugins directory found.');
  process.exit(0);
}

const files = readdirSync(pluginsDir)
  .filter(name => name.endsWith('.docforge-plugin.json'))
  .sort();

if (!files.length) {
  console.log('No official plugin manifests found.');
  process.exit(0);
}

const rows = files.map(file => {
  const raw = JSON.parse(readFileSync(resolve(pluginsDir, file), 'utf8'));
  return normalizeManifest(raw, file);
});

const values = rows.map(m => `(
  '${sqlString(m.slug)}',
  '${sqlString(m.name)}',
  '${sqlString(m.description)}',
  '${sqlString(m.version)}',
  '${sqlString(m.author)}',
  '${sqlString(m.icon)}',
  '${sqlString(m.homepage)}',
  '${sqlString(m.extType)}',
  ${m.enabled},
  '${sqlString(m.html)}',
  '${sqlString(m.css)}',
  '${sqlString(m.js)}',
  '${sqlString(m.headHtml)}',
  '${sqlString(jsonString(m.blockTypes))}',
  '${sqlString(jsonString(m.tags))}',
  '${sqlString(jsonString(m.i18n))}',
  '${sqlString(jsonString(m.configSchema))}',
  '${sqlString(jsonString(m.config))}',
  datetime('now'),
  datetime('now')
)`).join(',\n');

mkdirSync(tmpDir, { recursive: true });
const sql = `INSERT INTO extensions (
  slug, name, description, version, author, icon, homepage, ext_type, enabled,
  html, css, js, head_html, block_types, tags, i18n, config_schema, config,
  created_at, updated_at
) VALUES
${values}
ON CONFLICT(slug) DO UPDATE SET
  name=excluded.name,
  description=excluded.description,
  version=excluded.version,
  author=excluded.author,
  icon=excluded.icon,
  homepage=excluded.homepage,
  ext_type=excluded.ext_type,
  enabled=excluded.enabled,
  html=excluded.html,
  css=excluded.css,
  js=excluded.js,
  head_html=excluded.head_html,
  block_types=excluded.block_types,
  tags=excluded.tags,
  i18n=excluded.i18n,
  config_schema=excluded.config_schema,
  config=excluded.config,
  updated_at=datetime('now');`;

const out = resolve(tmpDir, `sync-official-plugins-${mode}.sql`);
writeFileSync(out, sql);

const result = spawnSync('npx', ['wrangler', 'd1', 'execute', dbName, modeFlag, '--file', out], {
  cwd: root,
  shell: true,
  stdio: 'inherit',
});
if (result.status !== 0) process.exit(result.status ?? 1);

console.log(`Synced ${rows.length} official plugin(s): ${rows.map(r => r.slug).join(', ')}`);

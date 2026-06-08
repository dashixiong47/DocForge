import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const mode = process.argv.includes('--remote') ? 'remote' : 'local';
const modeFlag = mode === 'remote' ? '--remote' : '--local';
const r2ModeFlag = mode === 'remote' ? null : '--local';
const root = process.cwd();
const dbName = process.env.D1_DATABASE || 'docforge-db';
const bucketName = process.env.R2_BUCKET || 'docforge-media';
const tmpDir = resolve(root, '.wrangler');
const wranglerBin = resolve(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');

const assets = [
  {
    file: 'public/favicon.png',
    d2Key: 'docforge/favicon.png',
    mimeType: 'image/png',
    placeholderKey: 'docforge-favicon',
    altText: 'DocForge icon',
  },
  {
    file: 'public/favicon.svg',
    d2Key: 'docforge/favicon.svg',
    mimeType: 'image/svg+xml',
    placeholderKey: 'docforge-favicon-svg',
    altText: 'DocForge icon SVG',
  },
  {
    file: 'public/favicon.ico',
    d2Key: 'docforge/favicon.ico',
    mimeType: 'image/x-icon',
    placeholderKey: 'docforge-favicon-ico',
    altText: 'DocForge icon ICO',
  },
];

function sqlString(value) {
  return String(value ?? '').replace(/'/g, "''");
}

function runWrangler(args, options = {}) {
  const result = spawnSync(process.execPath, [wranglerBin, ...args], {
    cwd: root,
    shell: false,
    stdio: 'inherit',
    ...options,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

mkdirSync(tmpDir, { recursive: true });

const existingAssets = assets
  .map(asset => ({ ...asset, absPath: resolve(root, asset.file) }))
  .filter(asset => existsSync(asset.absPath));

if (!existingAssets.length) {
  console.log('No project media assets found.');
  process.exit(0);
}

for (const asset of existingAssets) {
  const args = [
    'r2',
    'object',
    'put',
    `${bucketName}/${asset.d2Key}`,
    '--file',
    asset.absPath,
    '--content-type',
    asset.mimeType,
  ];
  if (r2ModeFlag) args.push(r2ModeFlag);
  runWrangler(args);
}

const now = new Date().toISOString();
const mediaValues = existingAssets.map(asset => {
  const size = statSync(asset.absPath).size;
  return `(
    (SELECT id FROM plugins WHERE slug='docforge'),
    '${sqlString(basename(asset.file))}',
    '${sqlString(asset.d2Key)}',
    '${sqlString(asset.mimeType)}',
    ${size},
    '${sqlString(asset.altText)}',
    '${sqlString(asset.placeholderKey)}',
    '${sqlString(now)}'
  )`;
}).join(',\n');

const sql = `
INSERT INTO plugins (
  slug, name, version, compatibility, description, icon_url, badge_tags,
  sort_order, enabled, listed, created_at, updated_at
) VALUES (
  'docforge',
  'DocForge',
  '1.0.0',
  'Cloudflare Workers',
  'Open-source documentation CMS for plugin and project docs.',
  '/media/docforge/favicon.png',
  '["Cloudflare Workers","Workers","D1","R2"]',
  -100,
  1,
  0,
  datetime('now'),
  datetime('now')
) ON CONFLICT(slug) DO UPDATE SET
  icon_url = CASE
    WHEN COALESCE(plugins.icon_url, '') = '' OR plugins.icon_url = 'DF'
      THEN excluded.icon_url
    ELSE plugins.icon_url
  END,
  updated_at = datetime('now');

INSERT INTO media (
  plugin_id, filename, d2_key, mime_type, size_bytes, alt_text, placeholder_key, created_at
) VALUES
${mediaValues}
ON CONFLICT(d2_key) DO UPDATE SET
  filename = excluded.filename,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  alt_text = excluded.alt_text,
  placeholder_key = excluded.placeholder_key;
`;

const out = resolve(tmpDir, `sync-project-media-${mode}.sql`);
writeFileSync(out, sql);
runWrangler(['d1', 'execute', dbName, modeFlag, '--file', out]);

console.log(`Synced ${existingAssets.length} project media asset(s): ${existingAssets.map(a => a.d2Key).join(', ')}`);

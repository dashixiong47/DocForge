import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const sourceRoot = process.cwd();
const targetRoot = process.argv[2] ? resolve(process.argv[2]) : sourceRoot;
const bucketName = process.env.R2_BUCKET || 'docforge-media';
const tmpDir = resolve(sourceRoot, '.wrangler', 'media-export');
const keysPath = resolve(sourceRoot, '.wrangler', 'document-media-keys.json');

if (!existsSync(keysPath)) {
  console.error('Missing .wrangler/document-media-keys.json. Run export-content-for-current-schema.mjs first.');
  process.exit(1);
}

const keys = JSON.parse(readFileSync(keysPath, 'utf8'));
mkdirSync(tmpDir, { recursive: true });

function wrangler(root, args) {
  const wranglerBin = resolve(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  const result = spawnSync(process.execPath, [wranglerBin, ...args], {
    cwd: root,
    shell: false,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const item of keys) {
  if (!item?.d2Key || String(item.d2Key).startsWith('__ref__')) continue;
  const localPath = resolve(tmpDir, item.d2Key.replace(/[\\/]/g, '__'));
  wrangler(sourceRoot, ['r2', 'object', 'get', `${bucketName}/${item.d2Key}`, '--local', '--file', localPath]);
  const args = [
    'r2',
    'object',
    'put',
    `${bucketName}/${item.d2Key}`,
    '--file',
    localPath,
  ];
  if (item.mimeType) args.push('--content-type', item.mimeType);
  wrangler(targetRoot, args);
}

console.log(`Copied ${keys.length} media record(s) from local R2 to remote R2.`);

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const inputPath = resolve(root, '.dev.vars');
const outputPath = resolve(root, '.wrangler', 'dev-vars-secrets.json');

if (!existsSync(inputPath)) {
  console.error('Missing .dev.vars. Create it first: Copy-Item .dev.vars.example .dev.vars');
  process.exit(1);
}

const secrets = {};

for (const rawLine of readFileSync(inputPath, 'utf8').split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) continue;

  const eq = line.indexOf('=');
  if (eq <= 0) continue;

  const key = line.slice(0, eq).trim();
  let value = line.slice(eq + 1).trim();
  if (!key || !value) continue;

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  secrets[key] = value;
}

if (!Object.keys(secrets).length) {
  console.error('No non-empty variables found in .dev.vars.');
  process.exit(1);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(secrets, null, 2));

console.log(`Uploading ${Object.keys(secrets).length} variables from .dev.vars to Cloudflare Secrets...`);

const result = spawnSync('npx', ['wrangler', 'secret', 'bulk', outputPath], {
  cwd: root,
  shell: true,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);

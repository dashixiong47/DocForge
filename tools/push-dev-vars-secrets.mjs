import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const inputPath = resolve(root, '.dev.vars');
const wranglerBin = resolve(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const secretKeys = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'JWT_SECRET', 'AI_TRANSLATE_API_KEY'];

if (!existsSync(inputPath)) {
  console.error('Missing .dev.vars. Create it first: Copy-Item .dev.vars.example .dev.vars');
  process.exit(1);
}

const originalText = readFileSync(inputPath, 'utf8');
const parsedLines = originalText.split(/\r?\n/);
const secrets = {};

for (const rawLine of parsedLines) {
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

function setDevVar(key, value) {
  let found = false;
  const next = parsedLines.map((line) => {
    if (!line.trim().startsWith(`${key}=`)) return line;
    found = true;
    return `${key}=${value}`;
  });
  if (!found) next.push(`${key}=${value}`);
  writeFileSync(inputPath, next.join('\n').replace(/\n*$/, '\n'));
}

if (!secrets.ADMIN_USERNAME || !secrets.ADMIN_PASSWORD) {
  console.error('ADMIN_USERNAME and ADMIN_PASSWORD are required in .dev.vars.');
  process.exit(1);
}

if (!secrets.JWT_SECRET || secrets.JWT_SECRET === 'local-dev-secret-change-me' || secrets.JWT_SECRET === 'change-me-in-production') {
  secrets.JWT_SECRET = randomBytes(48).toString('hex');
  setDevVar('JWT_SECRET', secrets.JWT_SECRET);
  console.log('Generated JWT_SECRET and wrote it back to .dev.vars.');
}

const secretsToUpload = Object.fromEntries(
  Object.entries(secrets).filter(([key]) => secretKeys.includes(key))
);

console.log(`Uploading ${Object.keys(secretsToUpload).length} secrets from .dev.vars to Cloudflare...`);

for (const [key, value] of Object.entries(secretsToUpload)) {
  console.log(`Uploading ${key}...`);
  const result = spawnSync(process.execPath, [wranglerBin, 'secret', 'put', key], {
    cwd: root,
    input: `${value}\n`,
    shell: false,
    stdio: ['pipe', 'inherit', 'inherit'],
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

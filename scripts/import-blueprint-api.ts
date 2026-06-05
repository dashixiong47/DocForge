/**
 * Import Blueprint API content from DOCUMENTATION.html into the database.
 * Usage: npx tsx scripts/import-blueprint-api.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const DOC_HTML = 'F:\\ue5\\Test5_0\\Plugins\\WebUIX\\DOCUMENTATION.html';
const API_URL  = 'http://127.0.0.1:8787';
const PLUGIN_SLUG = 'webuix';
const SECTION_SLUG = 'blueprint-api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface ApiCategory {
  id: string; zh: string; en: string;
  items: string[][];
}

// ── Extract apiCategories from HTML ──────────────────────────────────────────

function extractCategories(html: string): ApiCategory[] {
  const m = html.match(/const apiCategories\s*=\s*(\[[\s\S]*?\]);\s*\n/);
  if (!m) throw new Error('apiCategories not found in DOCUMENTATION.html');
  // Safe eval inside a controlled function scope
  const fn = new Function('return ' + m[1]);
  return fn() as ApiCategory[];
}

// ── Generate static HTML card for one API function ───────────────────────────

function renderCard(raw: string[]): string {
  const [fn, zh, en, ret, paramsZh, paramsEn, purposeZh, purposeEn, scenarioZh, scenarioEn] = raw;
  return `<article class="api-card">
  <div class="api-headline">
    <div class="api-title"><strong><span data-lang="zh">${esc(zh)}</span><span data-lang="en">${esc(en)}</span></strong></div>
    <code style="font-size:11px;color:var(--c-accent);white-space:nowrap">→ ${esc(ret)}</code>
  </div>
  <div class="api-meta">
    <b>C++</b><span><code style="font-size:11px">${esc(fn)}</code></span>
    <b><span data-lang="zh">参数</span><span data-lang="en">Params</span></b>
    <span><span data-lang="zh">${esc(paramsZh)}</span><span data-lang="en">${esc(paramsEn)}</span></span>
    <b><span data-lang="zh">用途</span><span data-lang="en">Purpose</span></b>
    <span><span data-lang="zh">${esc(purposeZh)}</span><span data-lang="en">${esc(purposeEn)}</span></span>
    <b><span data-lang="zh">场景</span><span data-lang="en">Use Case</span></b>
    <span><span data-lang="zh">${esc(scenarioZh)}</span><span data-lang="en">${esc(scenarioEn)}</span></span>
  </div>
</article>`;
}

// ── Generate full HTML for all categories ────────────────────────────────────

function buildHtml(categories: ApiCategory[]): string {
  return categories.map(cat => {
    const cards = cat.items.map(renderCard).join('\n');
    return `<div class="subsection">
  <h3><span data-lang="zh">${esc(cat.zh)}</span><span data-lang="en">${esc(cat.en)}</span></h3>
  <div class="api-grid">${cards}</div>
</div>`;
  }).join('\n');
}

// ── Admin API helpers ─────────────────────────────────────────────────────────

async function login(): Promise<string> {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'username=admin&password=admin123',
    redirect: 'manual',
  });
  const cookie = res.headers.get('set-cookie') || '';
  const m = cookie.match(/admin_token=([^;]+)/);
  if (!m) throw new Error('Login failed — check wrangler dev is running');
  return m[1];
}

async function getPluginId(token: string): Promise<number> {
  // Use the stats API, then find plugin via sections
  const res = await fetch(`${API_URL}/api/admin/plugins`, {
    headers: { Cookie: `admin_token=${token}` },
  });
  // api/admin/plugins does not exist — use D1 query via wrangler instead
  // Fall back: GET /admin/plugins page and parse, or use a known approach
  // Since API route doesn't exist, we'll use the section slug approach
  throw new Error('Use section slug approach');
}

// Since /api/admin/plugins doesn't exist, we query D1 via wrangler directly
// and then use the section's API endpoint

async function findSectionBlockId(token: string): Promise<{ sectionId: number; blockId: number | null }> {
  // Get plugins list from dashboard stats approach — use admin page HTML
  // Instead, use D1 directly via child process
  const { execSync } = await import('child_process');
  const sectionResult = execSync(
    `npx wrangler d1 execute ue5-docs --local --command "SELECT id FROM sections WHERE slug='${SECTION_SLUG}' AND plugin_id=(SELECT id FROM plugins WHERE slug='${PLUGIN_SLUG}');"`,
    { encoding: 'utf8', cwd: path.resolve(__dirname, '..') }
  );
  const sectionMatch = sectionResult.match(/"id":\s*(\d+)/);
  if (!sectionMatch) throw new Error(`Section '${SECTION_SLUG}' not found for plugin '${PLUGIN_SLUG}'`);
  const sectionId = Number(sectionMatch[1]);

  const blockResult = execSync(
    `npx wrangler d1 execute ue5-docs --local --command "SELECT id FROM content_blocks WHERE section_id=${sectionId} LIMIT 1;"`,
    { encoding: 'utf8', cwd: path.resolve(__dirname, '..') }
  );
  const blockMatch = blockResult.match(/"id":\s*(\d+)/);
  const blockId = blockMatch ? Number(blockMatch[1]) : null;

  return { sectionId, blockId };
}

async function upsertBlock(token: string, sectionId: number, blockId: number | null, html: string): Promise<void> {
  const contentJson = JSON.stringify({ html });
  if (blockId) {
    const res = await fetch(`${API_URL}/api/admin/content-blocks/${blockId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` },
      body: JSON.stringify({ type: 'html', contentJson, sortOrder: 0 }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (!data.ok) throw new Error('PUT failed: ' + JSON.stringify(data));
    console.log(`✓ Updated block ${blockId}`);
  } else {
    const res = await fetch(`${API_URL}/api/admin/content-blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` },
      body: JSON.stringify({ sectionId, type: 'html', contentJson, sortOrder: 0 }),
    });
    const data = await res.json() as { id?: number; error?: string };
    if (!data.id) throw new Error('POST failed: ' + JSON.stringify(data));
    console.log(`✓ Created block ${data.id}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Reading DOCUMENTATION.html...');
  if (!fs.existsSync(DOC_HTML)) {
    throw new Error(`File not found: ${DOC_HTML}`);
  }
  const html = fs.readFileSync(DOC_HTML, 'utf8');

  console.log('Extracting apiCategories...');
  const categories = extractCategories(html);
  console.log(`  Found ${categories.length} categories, ${categories.reduce((s, c) => s + c.items.length, 0)} functions`);

  console.log('Generating static HTML...');
  const blockHtml = buildHtml(categories);
  console.log(`  Generated ${blockHtml.length} bytes of HTML`);

  console.log('Logging in to admin...');
  const token = await login();

  console.log(`Looking up section '${SECTION_SLUG}'...`);
  const { sectionId, blockId } = await findSectionBlockId(token);
  console.log(`  sectionId=${sectionId}, blockId=${blockId ?? 'none (will create)'}`);

  console.log('Upserting content block...');
  await upsertBlock(token, sectionId, blockId, blockHtml);

  console.log('Done! Visit http://127.0.0.1:8787/webuix#blueprint-api to verify.');
}

main().catch(err => { console.error('ERROR:', err.message); process.exit(1); });

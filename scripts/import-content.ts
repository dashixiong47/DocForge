import * as fs from 'node:fs';
import * as path from 'node:path';

function esc(s: string): string {
  return s.replace(/'/g, "''").replace(/\\/g, '\\\\');
}
function escJson(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "'||CHR(39)||'").replace(/\n/g, '\\n');
}
function escJsonSimple(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n').replace(/\r/g, '');
}

const sectionSlugs = [
  'overview', 'quick-start', 'editor-workflow', 'html-css-basics',
  'css-filters', 'ui-sound', 'animations', 'ext-animation-watch',
  'custom-components', 'data-binding', 'event-bridge', 'ext-drag',
  'ext-forms', 'ext-modal', 'ext-password', 'perf-pipeline',
  'perf-pool', 'perf-warmup', 'perf-cook', 'inspector',
  'debug-stats', 'blueprint-api', 'ref-index', 'settings', 'limitations'
];

const htmlPath = 'F:/ue5/Test5_0/Plugins/WebUIX/DOCUMENTATION.html';
const html = fs.readFileSync(htmlPath, 'utf-8');

const parts = html.split(/<section class="section" id="([^"]+)">/);
const sectionMap = new Map<string, string>();
for (let i = 1; i < parts.length; i += 2) {
  const id = parts[i];
  let content = parts[i + 1] || '';
  const endIdx = content.indexOf('</section>');
  if (endIdx > -1) {
    content = content.substring(0, endIdx);
  }
  sectionMap.set(id, content.trim());
}

const inserts: string[] = [];

for (const slug of sectionSlugs) {
  let innerHtml = sectionMap.get(slug);
  if (!innerHtml) { console.warn('Warning: No content for section:', slug); continue; }

  const h2End = innerHtml.indexOf('</h2>');
  if (h2End > -1) { innerHtml = innerHtml.substring(h2End + 5).trim(); }

  if (innerHtml) {
    const escaped = escJsonSimple(innerHtml);
    inserts.push(
      `INSERT INTO content_blocks (section_id, type, content_json, sort_order) VALUES ((SELECT id FROM sections WHERE slug='${slug}' AND plugin_id=(SELECT id FROM plugins WHERE slug='WebUIX')), 'html', '{"html":"${escaped}"}', 0);`
    );
  }
}

const outputPath = path.join(__dirname, 'content_seed.sql');
const lines = [
  '-- Auto-generated content seed for WebUIX',
  '-- Generated from DOCUMENTATION.html',
  '-- Safe for re-run',
  '',
  "DELETE FROM content_blocks WHERE section_id IN (SELECT id FROM sections WHERE plugin_id = (SELECT id FROM plugins WHERE slug = 'WebUIX'));",
  '',
  ...inserts,
];
fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
console.log('Written', inserts.length, 'content blocks');

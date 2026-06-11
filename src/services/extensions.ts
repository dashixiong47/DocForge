import { eq } from 'drizzle-orm';
import { extensions } from '../db/schema';
import type { MediaMap, TranslationsMap } from '../templates/doc_page';
import { KV_EXTENSIONS_KEY, KV_EXTENSIONS_TTL } from './kv';

export type ExtType = 'theme' | 'widget' | 'system';

export interface Extension {
  id: number;
  slug: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  homepage: string;
  extType: ExtType;
  enabled: number;
  html: string;
  css: string;
  js: string;
  headHtml: string;
  blockTypes: string[];
  tags: string[];
  /** { "key": { "zh": "...", "en": "..." } } — runtime i18n strings for DocForge.t() */
  i18nStrings: Record<string, Record<string, string>>;
  configSchema: object;
  config: object;
  shareToken: string;
  shareNotify: number;
  createdAt: string;
  updatedAt: string;
}

export function extensionManifest(
  ext: Extension,
  share?: { token: string; notifyUrl: string; installUrl?: string; enabled?: boolean }
): Record<string, unknown> {
  const manifest: Record<string, unknown> = {
    slug: ext.slug,
    name: ext.name,
    description: ext.description,
    version: ext.version,
    author: ext.author,
    icon: ext.icon,
    homepage: ext.homepage,
    type: ext.extType,
    html: ext.html,
    css: ext.css,
    js: ext.js,
    headHtml: ext.headHtml,
    blockTypes: ext.blockTypes,
    tags: ext.tags,
    i18n: ext.i18nStrings,
    configSchema: ext.configSchema,
    config: ext.config,
  };
  if (share) {
    manifest.share = {
      protocol: 'docforge-extension-share-v1',
      token: share.token,
      notifyUrl: share.notifyUrl,
      installUrl: share.installUrl || '',
      notifyEnabled: share.enabled !== false,
    };
  }
  return manifest;
}

function parseExt(row: typeof extensions.$inferSelect): Extension {
  return {
    ...row,
    extType:      row.extType as ExtType,
    blockTypes:   JSON.parse(row.blockTypes   || '[]'),
    tags:         JSON.parse(row.tags         || '[]'),
    i18nStrings:  JSON.parse(row.i18n         || '{}'),
    configSchema: JSON.parse(row.configSchema || '{}'),
    config:       JSON.parse(row.config       || '{}'),
    shareToken:    row.shareToken || '',
    shareNotify:   row.shareNotify ?? 1,
  };
}

export async function loadEnabledExtensions(
  db: ReturnType<typeof import('../db').createDB>,
  kv?: KVNamespace,
): Promise<Extension[]> {
  if (kv) {
    const cached = await kv.get(KV_EXTENSIONS_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
  }
  const rows = await db.select().from(extensions).where(eq(extensions.enabled, 1)).all();
  const result = rows.map(parseExt);
  if (kv) {
    kv.put(KV_EXTENSIONS_KEY, JSON.stringify(result), { expirationTtl: KV_EXTENSIONS_TTL }).catch(() => {});
  }
  return result;
}

export async function loadAllExtensions(
  db: ReturnType<typeof import('../db').createDB>
): Promise<Extension[]> {
  const rows = await db.select().from(extensions).all();
  return rows.map(parseExt);
}

export async function loadExtensionById(
  db: ReturnType<typeof import('../db').createDB>,
  id: number
): Promise<Extension | null> {
  const row = await db.select().from(extensions).where(eq(extensions.id, id)).get();
  return row ? parseExt(row) : null;
}

/**
 * Resolve {{t:key}} (extension's own i18n) and {{img:key}} / {{video:key}}
 * (page media map) in extension CSS / headHtml at SSR time.
 */
function resolveExtContent(
  content: string,
  lang: string,
  extI18n: Record<string, Record<string, string>>,
  mediaMap?: MediaMap
): string {
  // {{t:key}} → extension's own i18n strings
  let s = content.replace(/\{\{t:([^}]+)\}\}/g, (match, raw) => {
    const entry = extI18n[raw.trim()];
    if (!entry) return match;
    return entry[lang] || entry['zh'] || entry['en'] || Object.values(entry)[0] || match;
  });
  // {{img:key}} → media URL (useful in CSS background-image, headHtml src, etc.)
  if (mediaMap) {
    s = s.replace(/\{\{img:([^}]+)\}\}/g, (match, raw) => {
      const m = mediaMap.get(raw.trim());
      return m ? m.url : match;
    });
    s = s.replace(/\{\{video:([^}]+)\}\}/g, (match, raw) => {
      const m = mediaMap.get(raw.trim());
      return m ? m.url : match;
    });
  }
  return s;
}

/** Build the HTML fragment to inject into <head> for all enabled extensions.
 *  Resolves {{t:key}} and {{img:key}} placeholders at SSR time. */
export function buildExtensionHead(exts: Extension[], lang = 'zh', mediaMap?: MediaMap): string {
  return exts.map(ext => {
    const parts: string[] = [];
    if (ext.headHtml) parts.push(resolveExtContent(ext.headHtml, lang, ext.i18nStrings, mediaMap));
    if (ext.css) {
      const css = resolveExtContent(ext.css, lang, ext.i18nStrings, mediaMap);
      parts.push(`<style>/* ext:${ext.slug} */\n${css}</style>`);
    }
    return parts.join('\n');
  }).join('\n');
}

/**
 * Build a <script> that populates DocForge._media with placeholderKey → URL pairs
 * so extension JS can call DocForge.media('key') at runtime.
 */
export function buildExtensionMediaInject(mediaMap: MediaMap): string {
  if (mediaMap.size === 0) return '';
  const data: Record<string, string> = {};
  for (const [key, m] of mediaMap) data[key] = m.url;
  return `<script>Object.assign(DocForge._media,${JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e')});</script>`;
}

/**
 * Inject the current plugin's translations into DocForge._docTrans so that
 * extension JS can call DocForge.docT('key') to read document-specific strings.
 *
 * This enables a clean separation of concerns:
 *   - t('key')           → extension's own universal UI strings (generic, in ext.i18n)
 *   - DocForge.docT(key) → current document's content strings (plugin translations table)
 *
 * Example: a chart widget can use DocForge.docT('chart.title') to read
 * document-specific strings defined in the plugin's own translations panel.
 */
export function buildDocTransInject(t: TranslationsMap, lang: string): string {
  if (t.size === 0) return '';
  const data: Record<string, string> = {};
  for (const [key, entry] of t) {
    const val = entry[lang] || entry['zh'] || entry['en'] || Object.values(entry)[0] || '';
    if (val) data[key] = val;
  }
  if (Object.keys(data).length === 0) return '';
  return `<script>Object.assign(DocForge._docTrans,${JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e')});</script>`;
}

/**
 * Build a <script> that populates DocForge._i18n with per-extension i18n strings.
 * Must be injected AFTER the DocForge runtime script and BEFORE the extension JS IIFEs.
 */
export function buildExtensionI18nInject(exts: Extension[]): string {
  const data: Record<string, Record<string, Record<string, string>>> = {};
  for (const ext of exts) {
    if (Object.keys(ext.i18nStrings).length > 0) {
      data[ext.slug] = ext.i18nStrings;
    }
  }
  if (Object.keys(data).length === 0) return '';
  return `<script>Object.assign(DocForge._i18n,${JSON.stringify(data)});</script>`;
}

function parseHtmlTemplates(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  html.replace(/<template\b([^>]*)>([\s\S]*?)<\/template>/gi, (_match, attrs: string, body: string) => {
    const tag = (attrs.match(/\bdata-tag\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)?.slice(1).find(Boolean) || '').trim().toLowerCase();
    if (tag && /^[a-z][a-z0-9-]*-[a-z0-9-]+$/.test(tag)) out[tag] = body.trim();
    return '';
  });
  return out;
}

/**
 * Build a <script> that registers optional HTML templates for custom tags.
 * Template syntax:
 *   <template data-tag="my-card">
 *     <div class="my-card" data-title="{{attr:title}}">{{slot}}</div>
 *   </template>
 */
export function buildExtensionHtmlTemplates(exts: Extension[], lang = 'zh', mediaMap?: MediaMap): string {
  const data: Record<string, Record<string, string>> = {};
  for (const ext of exts) {
    if (!ext.html) continue;
    const resolved = resolveExtContent(ext.html, lang, ext.i18nStrings, mediaMap);
    const templates = parseHtmlTemplates(resolved);
    if (Object.keys(templates).length > 0) data[ext.slug] = templates;
  }
  if (Object.keys(data).length === 0) return '';
  return `<script>Object.assign(DocForge._templates,${JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e')});</script>`;
}

/**
 * Build the <script> block for all enabled extensions.
 * Each extension IIFE receives (config, t) where t = DocForge.createT(slug).
 * Plugins call t('key') to get translated text in the user's current language.
 */
export function buildExtensionScripts(exts: Extension[]): string {
  const scripts = exts.filter(e => e.js).map(ext => {
    const cfg  = JSON.stringify(ext.config);
    const slug = JSON.stringify(ext.slug);
    return `/* ext:${ext.slug} v${ext.version} */\n(function(config,t){\n${ext.js}\n})(${cfg},DocForge.createT(${slug}));`;
  });
  if (!scripts.length) return '';
  return `<script>\n${scripts.join('\n\n')}\n</script>`;
}

/** Get the custom block renderer extension for a given block type, if any handles it */
export function findBlockRenderer(exts: Extension[], type: string): Extension | null {
  return exts.find(e => e.blockTypes.includes(type)) ?? null;
}

/** Validate a manifest JSON (for install flow) */
export function validateManifest(raw: unknown): { ok: true; manifest: Partial<Extension & { i18nStrings: Record<string, Record<string, string>> }> } | { ok: false; error: string } {
  if (typeof raw !== 'object' || !raw) return { ok: false, error: 'Invalid JSON' };
  const m = raw as Record<string, unknown>;
  if (!m.slug || typeof m.slug !== 'string') return { ok: false, error: 'Missing or invalid "slug"' };
  if (!m.name || typeof m.name !== 'string') return { ok: false, error: 'Missing or invalid "name"' };
  if (!/^[a-z0-9-]+$/.test(m.slug)) return { ok: false, error: 'slug must be lowercase alphanumeric with hyphens' };

  // Parse i18n: { key: { locale: text } }
  let i18nStrings: Record<string, Record<string, string>> = {};
  if (typeof m.i18n === 'object' && m.i18n) {
    for (const [key, locales] of Object.entries(m.i18n as Record<string, unknown>)) {
      if (typeof locales === 'object' && locales) {
        i18nStrings[key] = {};
        for (const [locale, val] of Object.entries(locales as Record<string, unknown>)) {
          if (typeof val === 'string') i18nStrings[key][locale] = val;
        }
      }
    }
  }

  return {
    ok: true,
    manifest: {
      slug:         m.slug as string,
      name:         m.name as string,
      description:  typeof m.description === 'string' ? m.description : '',
      version:      typeof m.version     === 'string' ? m.version     : '1.0.0',
      author:       typeof m.author      === 'string' ? m.author      : '',
      icon:         typeof m.icon        === 'string' ? m.icon        : '🧩',
      homepage:     typeof m.homepage    === 'string' ? m.homepage    : '',
      extType:      (['theme','widget','system'].includes(m.type as string) ? m.type : (m.type === 'renderer' ? 'widget' : m.type === 'general' ? 'system' : 'widget')) as ExtType,
      css:          typeof m.css         === 'string' ? m.css         : '',
      html:         typeof m.html        === 'string' ? m.html        : '',
      js:           typeof m.js          === 'string' ? m.js          : '',
      headHtml:     typeof m.headHtml    === 'string' ? m.headHtml    : '',
      blockTypes:   Array.isArray(m.blockTypes) ? m.blockTypes.filter(t => typeof t === 'string') : [],
      tags:         Array.isArray(m.tags)       ? m.tags.filter(t => typeof t === 'string')       : [],
      i18nStrings,
      configSchema: typeof m.configSchema === 'object' && m.configSchema ? m.configSchema as object : {},
      config:       typeof m.config      === 'object' && m.config      ? m.config      as object : {},
    },
  };
}

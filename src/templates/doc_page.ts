import { docThemeCSS } from './error_pages';

// Client-side plugin runtime — injected once per page when extensions are active.
// Plugins are wrapped: (function(config, t){ ... })(cfg, DocForge.createT(slug))
// t('key') returns translated text for the extension's own i18n strings.
// DOMContentLoaded triggers _run(): renders ext-block placeholders and calls onLoad hooks.
const DOCFORGE_RUNTIME = `window.DocForge=(function(){
var _lang=(document.cookie.match(/(?:^|;\\s*)lang=([^;]+)/)||[])[1]||document.documentElement.lang||'zh';
var _i18n={};
var _media={};
var _docTrans={};
var _templates={};
var R={};
function createT(id){return function(key){var m=_i18n[id];return m&&m[key]?(m[key][_lang]||m[key].zh||key):key;};}
function getMedia(key){return _media[key]||'';}
// docT: read from current plugin's translations (injected at SSR time).
// Use this in extension JS for document-specific strings (NOT extension UI strings).
// Extension UI strings → t('key');  Document content → DocForge.docT('key')
function docT(key){return _docTrans[key]||key;}
function escAttr(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function readAttr(el,names){var list=String(names||'').split(/[|,]/).map(function(n){return n.trim();}).filter(Boolean);for(var i=0;i<list.length;i++){var v=el.getAttribute(list[i]);if(v)return v;}return '';}
function renderTemplate(tpl,el){
var out=tpl.replace(/\{\{slot\}\}/g,el.innerHTML);
out=out.replace(/\{\{media:attr:([^}]+)\}\}/g,function(m,n){var key=readAttr(el,n);return escAttr(getMedia(key)||key);});
out=out.replace(/\{\{media:([^}]+)\}\}/g,function(m,n){var key=String(n).trim();return escAttr(getMedia(key)||key);});
out=out.replace(/\{\{attr:([^}]+)\}\}/g,function(m,n){return escAttr(readAttr(el,n));});
return out;
}
function runTemplates(){
Object.keys(_templates).forEach(function(id){var map=_templates[id]||{};
Object.keys(map).forEach(function(tag){Array.from(document.querySelectorAll(tag)).forEach(function(el){
try{var tmp=document.createElement('div');tmp.innerHTML=renderTemplate(map[tag],el);
var nodes=Array.from(tmp.childNodes);
if(nodes.length===1&&nodes[0].nodeType===1)el.parentNode.replaceChild(nodes[0],el);
else{var frag=document.createDocumentFragment();nodes.forEach(function(n){frag.appendChild(n);});el.parentNode.replaceChild(frag,el);}
}catch(e){console.error('[DocForge] template['+tag+'] error:',e);}
});});});
}
function run(){
// 1. HTML templates: replace custom tags declared by optional extension HTML templates
runTemplates();
// 2. renderTags: replace custom HTML tags registered by extensions
Object.keys(R).forEach(function(id){var p=R[id];
if(!p.renderTags)return;
var t=createT(id);
Object.keys(p.renderTags).forEach(function(tag){var fn=p.renderTags[tag];
var els=Array.from(document.querySelectorAll(tag));
els.forEach(function(el,idx){
try{var tmp=document.createElement('div');tmp.innerHTML=fn(el,_lang,t,idx);
var node=tmp.firstElementChild;if(node)el.parentNode.replaceChild(node,el);
}catch(e){console.error('[DocForge] renderTags['+tag+'] error:',e);}
});});});
// 3. renderBlock: replace .ext-block placeholders (legacy JSON blocks)
Object.keys(R).forEach(function(id){var p=R[id];
if(p.renderBlock){Object.keys(p.renderBlock).forEach(function(type){var fn=p.renderBlock[type];
document.querySelectorAll('.ext-block[data-type="'+type+'"]').forEach(function(el){
var d={};try{d=JSON.parse(el.getAttribute('data-content')||'{}');}catch(e){}
var lang=el.getAttribute('data-lang')||_lang;
try{el.innerHTML=fn(d,lang);}catch(e){console.error('[DocForge] renderBlock['+type+'] error:',e);}
});});}
if(p.onLoad){try{p.onLoad();}catch(e){console.error('[DocForge] '+id+' onLoad error:',e);}}
});}
function getTagSchemas(){var s={};Object.keys(R).forEach(function(id){var p=R[id];if(p.tagSchema)Object.assign(s,p.tagSchema);});return s;}
return{_i18n:_i18n,_media:_media,_docTrans:_docTrans,_templates:_templates,register:function(opts){if(opts&&opts.id)R[opts.id]=opts;},createT:createT,t:function(id,key){return createT(id)(key);},media:getMedia,docT:docT,_run:run,getTagSchemas:getTagSchemas};
})();document.addEventListener('DOMContentLoaded',function(){window.DocForge._run();});`;

interface Plugin {
  id: number; slug: string; name: string; version: string;
  compatibility: string; description: string | null; iconUrl: string | null;
  badgeTags: string | null; sortOrder: number; customCss?: string | null; customJs?: string | null;
}

interface Section {
  id: number; pluginId: number; parentId: number | null;
  titleEn: string; titleZh: string; slug: string;
  sortOrder: number; children?: Section[];
}

interface ContentBlock {
  id: number; sectionId: number; type: string;
  contentJson: string; sortOrder: number;
}

interface CardData {
  titleZh?: string; titleEn?: string;
  textZh?: string; textEn?: string;
  titleKey?: string; textKey?: string;
}

interface ListData {
  ordered?: boolean;
  items?: Array<string | { zh: string; en: string } | { key: string }>;
}

// Locale display info (mirrors i18n.ts LOCALES — kept inline so doc_page has no service import)
const LOCALE_INFO: Record<string, { name: string; country: string }> = {
  // East Asia
  'zh':    { name: '中文 (简体)',        country: 'cn'     },
  'zh-TW': { name: '中文 (繁體)',        country: 'tw'     },
  'ja':    { name: '日本語',             country: 'jp'     },
  'ko':    { name: '한국어',             country: 'kr'     },
  'mn':    { name: 'Монгол',             country: 'mn'     },
  // Southeast Asia
  'id':    { name: 'Bahasa Indonesia',   country: 'id'     },
  'ms':    { name: 'Bahasa Melayu',      country: 'my'     },
  'tl':    { name: 'Filipino',           country: 'ph'     },
  'vi':    { name: 'Tiếng Việt',         country: 'vn'     },
  'th':    { name: 'ภาษาไทย',            country: 'th'     },
  'km':    { name: 'ភាសាខ្មែរ',          country: 'kh'     },
  'lo':    { name: 'ພາສາລາວ',            country: 'la'     },
  'my':    { name: 'မြန်မာဘာသာ',         country: 'mm'     },
  // South Asia
  'hi':    { name: 'हिन्दी',              country: 'in'     },
  'bn':    { name: 'বাংলা',              country: 'bd'     },
  'ur':    { name: 'اردو',               country: 'pk'     },
  'ne':    { name: 'नेपाली',             country: 'np'     },
  'si':    { name: 'සිංහල',              country: 'lk'     },
  'ta':    { name: 'தமிழ்',              country: 'sg'     },
  // Middle East & Central Asia
  'ar':    { name: 'العربية',            country: 'sa'     },
  'fa':    { name: 'فارسی',              country: 'ir'     },
  'he':    { name: 'עברית',              country: 'il'     },
  'ps':    { name: 'پښتو',               country: 'af'     },
  'tr':    { name: 'Türkçe',             country: 'tr'     },
  'az':    { name: 'Azərbaycan',         country: 'az'     },
  'kk':    { name: 'Қазақша',            country: 'kz'     },
  'uz':    { name: "O'zbek",             country: 'uz'     },
  'ky':    { name: 'Кыргызча',           country: 'kg'     },
  'tg':    { name: 'Тоҷикӣ',             country: 'tj'     },
  'tk':    { name: 'Türkmen',            country: 'tm'     },
  // Caucasus
  'ka':    { name: 'ქართული',            country: 'ge'     },
  'hy':    { name: 'Հայերեն',            country: 'am'     },
  // Western Europe
  'en':    { name: 'English',            country: 'us'     },
  'de':    { name: 'Deutsch',            country: 'de'     },
  'fr':    { name: 'Français',           country: 'fr'     },
  'es':    { name: 'Español',            country: 'es'     },
  'pt':    { name: 'Português',          country: 'br'     },
  'it':    { name: 'Italiano',           country: 'it'     },
  'nl':    { name: 'Nederlands',         country: 'nl'     },
  'sv':    { name: 'Svenska',            country: 'se'     },
  'da':    { name: 'Dansk',              country: 'dk'     },
  'fi':    { name: 'Suomi',              country: 'fi'     },
  'no':    { name: 'Norsk',              country: 'no'     },
  'is':    { name: 'Íslenska',           country: 'is'     },
  'ca':    { name: 'Català',             country: 'ad'     },
  'ga':    { name: 'Gaeilge',            country: 'ie'     },
  'cy':    { name: 'Cymraeg',            country: 'gb-wls' },
  'mt':    { name: 'Malti',              country: 'mt'     },
  'lb':    { name: 'Lëtzebuergesch',     country: 'lu'     },
  // Eastern Europe
  'ru':    { name: 'Русский',            country: 'ru'     },
  'uk':    { name: 'Українська',         country: 'ua'     },
  'pl':    { name: 'Polski',             country: 'pl'     },
  'cs':    { name: 'Čeština',            country: 'cz'     },
  'sk':    { name: 'Slovenčina',         country: 'sk'     },
  'ro':    { name: 'Română',             country: 'ro'     },
  'hu':    { name: 'Magyar',             country: 'hu'     },
  'bg':    { name: 'Български',          country: 'bg'     },
  'hr':    { name: 'Hrvatski',           country: 'hr'     },
  'sr':    { name: 'Српски',             country: 'rs'     },
  'sl':    { name: 'Slovenščina',        country: 'si'     },
  'mk':    { name: 'Македонски',         country: 'mk'     },
  'sq':    { name: 'Shqip',              country: 'al'     },
  'be':    { name: 'Беларуская',         country: 'by'     },
  'el':    { name: 'Ελληνικά',           country: 'gr'     },
  // Baltic
  'lt':    { name: 'Lietuvių',           country: 'lt'     },
  'lv':    { name: 'Latviešu',           country: 'lv'     },
  'et':    { name: 'Eesti',              country: 'ee'     },
  // Africa
  'sw':    { name: 'Kiswahili',          country: 'ke'     },
  'am':    { name: 'አማርኛ',              country: 'et'     },
  'yo':    { name: 'Yorùbá',             country: 'ng'     },
  'ha':    { name: 'Hausa',              country: 'ng'     },
  'ig':    { name: 'Igbo',               country: 'ng'     },
  'af':    { name: 'Afrikaans',          country: 'za'     },
  'zu':    { name: 'isiZulu',            country: 'za'     },
  'so':    { name: 'Soomaali',           country: 'so'     },
  'rw':    { name: 'Kinyarwanda',        country: 'rw'     },
  'mg':    { name: 'Malagasy',           country: 'mg'     },
};

function localeName(code: string): string {
  return LOCALE_INFO[code]?.name || code;
}

function localeCountry(code: string): string {
  return LOCALE_INFO[code]?.country || code;
}

// CSS flag-icons span — works cross-platform (SVG, no emoji font dependency)
function flagSpan(code: string): string {
  return `<span class="fi fi-${localeCountry(code)}"></span>`;
}

// Static UI strings for doc page chrome — extend per locale as needed
const DOC_UI: Record<string, Record<string, string>> = {
  'nav.docs':        { zh: '文档',     en: 'Docs' },
  'main.empty':      { zh: '暂无文档内容', en: 'No documentation yet.' },
  'home.noPlugins':  { zh: '暂无插件',  en: 'No plugins yet.' },
  'home.enterAdmin': { zh: '进入管理后台', en: 'Go to admin panel' },
  'home.openDoc':    { zh: '打开文档', en: 'Open docs' },
  'home.available':  { zh: '可用文档', en: 'Available docs' },
  'nav.backTop':     { zh: '回到顶部', en: 'Back to top' },
};

function docUI(key: string, lang: string): string {
  return DOC_UI[key]?.[lang] || DOC_UI[key]?.['zh'] || DOC_UI[key]?.['en'] || key;
}

// key → { locale → value }  (supports any number of locales)
export type TranslationsMap = Map<string, Record<string, string>>;

// media: placeholderKey → {url, alt, mimeType}
export type MediaMap = Map<string, { url: string; alt: string; mimeType: string }>;

// SSR: replace {{t:key}} with the text for the current lang
function applyI18n(html: string, t: TranslationsMap, lang: string): string {
  return html.replace(/\{\{t:([^}]+)\}\}/g, (match, rawKey) => {
    const key = rawKey.trim();
    const entry = t.get(key);
    if (!entry) return match;
    return entry[lang] || entry['zh'] || entry['en'] || Object.values(entry)[0] || match;
  });
}

function applyPlaceholders(html: string, mediaMap: MediaMap): string {
  return html
    .replace(/\{\{img:([^}]+)\}\}/g, (match, rawKey) => {
      return mediaUrl(mediaMap, rawKey.trim(), 'img', match);
    })
    .replace(/\{\{video:([^}]+)\}\}/g, (match, rawKey) => {
      return mediaUrl(mediaMap, rawKey.trim(), 'video', match);
    });
}

function mediaUrl(mediaMap: MediaMap, key: string, kind: 'img' | 'video', fallback: string): string {
  const m = mediaMap.get(key);
  if (m?.url && !m.url.includes('/__ref__/')) return esc(m.url);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" fill="#0d1117"/><rect x="40" y="40" width="880" height="460" rx="18" fill="none" stroke="#30363d" stroke-width="3" stroke-dasharray="16 12"/><text x="480" y="252" dominant-baseline="middle" text-anchor="middle" fill="#8b949e" font-family="Arial, sans-serif" font-size="34">${kind === 'img' ? 'Image' : 'Video'} missing</text><text x="480" y="306" dominant-baseline="middle" text-anchor="middle" fill="#58a6ff" font-family="Consolas, monospace" font-size="22">${fallback.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function faviconLink(icon: string): string {
  const raw = (icon || '').trim();
  if (!raw) return '<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" type="image/png" href="/favicon.png">\n<link rel="icon" type="image/svg+xml" href="/favicon.svg">';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) {
    return `<link rel="icon" href="${esc(raw)}">`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="52">${raw}</text></svg>`;
  return `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`;
}

// Resolve a translation key to text for the current lang, with zh/en fallback
function resolve(t: TranslationsMap, key: string, lang: string, fallback = ''): string {
  const entry = t.get(key);
  if (!entry) return fallback || key;
  return entry[lang] || entry['zh'] || entry['en'] || fallback || key;
}

// Resolve section title: prefer DB translation key, then schema fields, then slug
function sectionTitle(s: Section, t: TranslationsMap, lang: string): string {
  const key = `sec.${s.slug}.title`;
  const entry = t.get(key);
  if (entry) return entry[lang] || entry['zh'] || entry['en'] || s.slug;
  // Fallback to schema fields (titleZh / titleEn)
  if (lang === 'en') return s.titleEn || s.titleZh || s.slug;
  return s.titleZh || s.titleEn || s.slug;
}

export function docLayout(params: {
  plugin: Plugin;
  sections: Section[];
  blocksBySection: Map<number, ContentBlock[]>;
  settings: Record<string, string>;
  lang: string;
  translations: TranslationsMap;
  mediaMap?: MediaMap;
  availableLocales?: string[];
  extHeadHtml?: string;
  extScriptsHtml?: string;
  extI18nHtml?: string;
  extMediaHtml?: string;
  extTemplatesHtml?: string;
  extDocTransHtml?: string;
}): string {
  const { plugin, sections, blocksBySection, settings, lang, translations, mediaMap = new Map(), availableLocales = ['zh', 'en'], extHeadHtml = '', extScriptsHtml = '', extI18nHtml = '', extMediaHtml = '', extTemplatesHtml = '', extDocTransHtml = '' } = params;
  const badgeTags = JSON.parse(plugin.badgeTags || '[]') as string[];
  const htmlLang = lang === 'zh' ? 'zh-CN' : lang;

  return `<!doctype html>
<html lang="${htmlLang}" class="${lang === 'en' ? 'lang-en' : 'lang-zh'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(plugin.name)} ${docUI('nav.docs', lang)}</title>
${faviconLink(plugin.iconUrl || '')}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/cpp.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/css.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/json.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/typescript.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/bash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/powershell.min.js"></script>
${settings.custom_head_html || ''}
${docThemeCSS()}
${settings.custom_css ? `<style>${settings.custom_css}</style>` : ''}
${extHeadHtml}
${plugin.customCss ? `<style>/* doc: ${esc(plugin.slug)} */\n${plugin.customCss}</style>` : ''}
${extHeadHtml || extScriptsHtml || extTemplatesHtml ? `<script>${DOCFORGE_RUNTIME}</script>` : ''}
${extI18nHtml}
${extMediaHtml}
${extTemplatesHtml}
${extDocTransHtml}
<style>
.doc-lp{position:relative;display:inline-block}
.doc-lp-btn{display:flex;align-items:center;gap:6px;padding:5px 12px;border:1px solid var(--c-border);border-radius:6px;background:var(--c-surface);color:var(--c-text);cursor:pointer;font:inherit;font-size:13px;white-space:nowrap}
.doc-lp-btn:hover{border-color:var(--c-accent)}
.doc-lp-menu{position:absolute;right:0;top:calc(100% + 6px);min-width:180px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:8px;z-index:999;list-style:none;margin:0;padding:4px 0;box-shadow:0 8px 24px rgba(0,0,0,.4);display:none}
.doc-lp-menu.open{display:block}
.doc-lp-menu li{display:flex;align-items:center;gap:8px;padding:8px 16px;cursor:pointer;font-size:14px}
.doc-lp-menu li:hover{background:rgba(88,166,255,.08);color:var(--c-accent)}
.doc-lp-menu li.active{color:var(--c-accent);font-weight:600}
.code-block{border:1px solid var(--c-border);border-radius:var(--radius);background:var(--c-surface);box-shadow:var(--shadow-sm);overflow:hidden;margin:14px 0}
.code-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;border-bottom:1px solid var(--c-border);background:rgba(13,17,23,.6)}
.code-lang{font-family:var(--mono);font-size:11px;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:.04em}
.code-copy{border:1px solid var(--c-border);background:var(--c-code-bg);color:var(--c-muted);padding:3px 8px;border-radius:6px;font:inherit;font-size:11px;cursor:pointer}
.code-copy:hover{border-color:var(--c-accent);color:var(--c-accent)}
.code-block pre{margin:0;border:0;border-radius:0;box-shadow:none;background:transparent}
.code-block pre code{white-space:pre}
.code-block pre code.hljs{padding:16px 20px;background:transparent}
.back-top{position:fixed;right:22px;bottom:24px;z-index:8700;width:42px;height:42px;border:1px solid var(--c-border);border-radius:12px;background:var(--c-surface);color:var(--c-muted);box-shadow:var(--shadow-sm);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .16s,visibility .16s,transform .16s,color .16s,border-color .16s}
.back-top.visible{opacity:1;visibility:visible;transform:translateY(0)}
.back-top:hover{color:var(--c-accent);border-color:var(--c-accent)}
@media(max-width:720px){.back-top{right:16px;bottom:22px}}
</style>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.hljs) {
      var aliases = { cpp: 'cpp', cxx: 'cpp', cc: 'cpp', h: 'cpp', hpp: 'cpp', xml: 'xml', html: 'xml', rml: 'xml', text: 'plaintext', txt: 'plaintext' };
      document.querySelectorAll('.content pre').forEach(function(pre) {
        var code = pre.querySelector('code');
        if (!code) return;
        var langClass = Array.from(code.classList).find(function(c) { return c.indexOf('language-') === 0; }) || '';
        var lang = (langClass.replace('language-', '') || code.dataset.lang || '').toLowerCase();
        var normalized = aliases[lang] || lang;
        if (normalized) {
          if (langClass) code.classList.remove(langClass);
          code.classList.add('language-' + normalized);
        }
        if (!pre.parentElement || !pre.parentElement.classList.contains('code-block')) {
          var wrap = document.createElement('div');
          wrap.className = 'code-block';
          var toolbar = document.createElement('div');
          toolbar.className = 'code-toolbar';
          var copyLabel = document.documentElement.classList.contains('lang-en') ? 'Copy' : '复制';
          var copiedLabel = document.documentElement.classList.contains('lang-en') ? 'Copied' : '已复制';
          toolbar.innerHTML = '<span class="code-lang">' + (lang || 'code') + '</span><button type="button" class="code-copy">' + copyLabel + '</button>';
          pre.parentNode.insertBefore(wrap, pre);
          wrap.appendChild(toolbar);
          wrap.appendChild(pre);
          toolbar.querySelector('.code-copy').addEventListener('click', function() {
            navigator.clipboard.writeText(code.textContent || '').then(function() {
              toolbar.querySelector('.code-copy').textContent = copiedLabel;
              setTimeout(function() { toolbar.querySelector('.code-copy').textContent = copyLabel; }, 1200);
            });
          });
        }
        try { window.hljs.highlightElement(code); } catch (_) {}
      });
    }

    // Lang picker
    var dlpBtn=document.getElementById('doc-lp-btn');
    var dlpMenu=document.getElementById('doc-lp-menu');
    if(dlpBtn&&dlpMenu){
      dlpBtn.addEventListener('click',function(e){e.stopPropagation();dlpMenu.classList.toggle('open');});
      document.addEventListener('click',function(){dlpMenu.classList.remove('open');});
      dlpMenu.querySelectorAll('li').forEach(function(li){
        li.addEventListener('click',function(){
          fetch('/api/set-lang?lang='+li.dataset.code).then(function(){location.reload();});
        });
      });
    }

    window.switchDocLang = function(lang) {
      fetch('/api/set-lang?lang=' + lang).then(function() { location.reload(); });
    };
    window.docImgErr = function(el) {
      var alt = el.getAttribute('alt') || '';
      var ph = document.createElement('div');
      ph.className = 'img-ph';
      ph.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
        + (alt ? '<span>' + alt + '</span>' : '');
      if (el.parentNode) el.parentNode.replaceChild(ph, el);
    };
    var tocLinks = Array.from(document.querySelectorAll('.toc-link[href^="#"]'));
    var sectionEls = tocLinks.map(function(l) {
      return document.getElementById(l.getAttribute('href').slice(1));
    }).filter(Boolean);
    var tocLockUntil = 0;
    var tocLockTarget = '';
    var backTopBtn = document.getElementById('back-top');
    if (backTopBtn) {
      backTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    function setActiveToc(id) {
      tocLinks.forEach(function(l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + id);
      });
    }

    tocLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var target = document.getElementById(link.getAttribute('href').slice(1));
        if (!target) return;
        e.preventDefault();
        setActiveToc(target.id);
        tocLockTarget = target.id;
        tocLockUntil = Date.now() + 1800;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + target.id);
      });
    });

    function onScroll() {
      if (tocLockTarget && Date.now() < tocLockUntil) {
        var lockedEl = document.getElementById(tocLockTarget);
        if (lockedEl && Math.abs(lockedEl.getBoundingClientRect().top) > 6) {
          setActiveToc(tocLockTarget);
          return;
        }
        tocLockTarget = '';
        tocLockUntil = 0;
      }
      var marker = window.scrollY + Math.min(100, window.innerHeight * 0.15);
      var best = sectionEls[0];
      for (var i = 0; i < sectionEls.length; i++) {
        var el = sectionEls[i];
        if (el && el.getBoundingClientRect().top + window.scrollY <= marker) best = el;
        else break;
      }
      if (best) setActiveToc(best.id);
      if (backTopBtn) backTopBtn.classList.toggle('visible', window.scrollY > 420);
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    var initHash = window.location.hash ? window.location.hash.slice(1) : '';
    if (initHash) {
      setActiveToc(initHash);
      var initEl = document.getElementById(initHash);
      if (initEl) {
        tocLockTarget = initHash;
        tocLockUntil = Date.now() + 1800;
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        setTimeout(function() {
          initEl.scrollIntoView({ block: 'start' });
          setActiveToc(initHash);
          setTimeout(function() { tocLockTarget = ''; tocLockUntil = 0; setActiveToc(initHash); }, 250);
        }, 0);
      }
    } else {
      onScroll();
    }
  });
</script>
</head>
<body>
<nav class="topbar">
  <div class="topbar-inner">
    <div class="topbar-title">
      <span>${esc(plugin.name)}</span>
      <span style="color:var(--c-muted);font-weight:400;font-size:14px"> ${docUI('nav.docs', lang)}</span>
    </div>
    <div class="topbar-actions">
      <div class="doc-lp" id="doc-lp">
        <button class="doc-lp-btn" id="doc-lp-btn" type="button">
          ${flagSpan(lang)} <span id="doc-lp-name">${localeName(lang)}</span>
          <svg width="10" height="10" viewBox="0 0 12 12" style="opacity:.5"><path d="M6 8L1 3h10z" fill="currentColor"/></svg>
        </button>
        <ul class="doc-lp-menu" id="doc-lp-menu">
          ${availableLocales.map(code =>
            `<li data-code="${code}"${code === lang ? ' class="active"' : ''}>${flagSpan(code)} ${localeName(code)}</li>`
          ).join('')}
        </ul>
      </div>
    </div>
  </div>
</nav>

<header class="hero">
  <h1>${esc(plugin.name)}</h1>
  <p class="subtitle">${esc(plugin.description || '')}</p>
  <div class="badges">
    <span class="badge">v${esc(plugin.version)}</span>
    ${plugin.compatibility ? `<span class="badge ok">${esc(plugin.compatibility)}</span>` : ''}
    ${badgeTags.map((t: string, i: number) => `<span class="badge${i > 2 ? ' warn' : ''}">${esc(t)}</span>`).join('')}
  </div>
</header>

<div class="page"><div class="layout">
<aside class="sidebar"><nav class="toc">
${renderTOC(sections, translations, lang)}
</nav></aside>
<main class="content">
${sections.length > 0
  ? renderSections(sections, blocksBySection, translations, mediaMap, lang)
  : `<div style="padding:40px;text-align:center;color:var(--c-muted)"><p>${docUI('main.empty', lang)}</p></div>`}
</main>
</div></div>

<footer style="text-align:center;padding:40px 24px;color:var(--c-muted);font-size:13px;border-top:1px solid var(--c-border);margin-top:24px">
  ${settings.footer_text ? settings.footer_text : `&copy; ${new Date().getFullYear()} ${esc(plugin.name)} Documentation`}
</footer>
<button id="back-top" class="back-top" type="button" aria-label="${esc(docUI('nav.backTop', lang))}" title="${esc(docUI('nav.backTop', lang))}">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>
</button>
${plugin.customJs ? `<script>/* doc: ${esc(plugin.slug)} */\n${plugin.customJs}\n</script>` : ''}
${extScriptsHtml}
</body></html>`;
}

function renderTOC(sections: Section[], t: TranslationsMap, lang: string): string {
  return sections.map(s => {
    const children = s.children || [];
    let html = '';
    if (children.length > 0) {
      html += `<div class="toc-section"><div class="toc-category">${esc(sectionTitle(s, t, lang))}</div>`;
      for (const child of children) {
        html += `<a href="#${esc(child.slug)}" class="toc-link toc-child-link">${esc(sectionTitle(child, t, lang))}</a>`;
      }
      html += `</div>`;
    } else {
      html += `<a href="#${esc(s.slug)}" class="toc-link">${esc(sectionTitle(s, t, lang))}</a>`;
    }
    return html;
  }).join('');
}

function renderSections(
  sections: Section[],
  blocksBySection: Map<number, ContentBlock[]>,
  t: TranslationsMap,
  m: MediaMap,
  lang: string,
): string {
  return sections.map(s => renderSection(s, s.children || [], blocksBySection, t, m, lang)).join('');
}

function renderSection(
  section: Section,
  children: Section[],
  blocksBySection: Map<number, ContentBlock[]>,
  t: TranslationsMap,
  m: MediaMap,
  lang: string,
): string {
  const blocks = blocksBySection.get(section.id) || [];
  if (blocks.length === 0 && children.length > 0) {
    return children.map(child => renderSection(child, child.children || [], blocksBySection, t, m, lang)).join('');
  }
  let html = `<section class="section" id="${esc(section.slug)}">`;
  html += `<h2>${esc(sectionTitle(section, t, lang))}</h2>`;
  for (const block of blocks) html += renderBlock(block, t, m, lang);
  for (const child of children) {
    const childBlocks = blocksBySection.get(child.id) || [];
    html += `<div class="subsection" id="${esc(child.slug)}">`;
    html += `<h3>${esc(sectionTitle(child, t, lang))}</h3>`;
    for (const block of childBlocks) html += renderBlock(block, t, m, lang);
    html += `</div>`;
  }
  html += `</section>`;
  return html;
}

function renderBlock(block: ContentBlock, t: TranslationsMap, m: MediaMap = new Map(), lang: string): string {
  let content: Record<string, unknown>;
  try { content = JSON.parse(block.contentJson || '{}'); } catch { return ''; }

  switch (block.type) {
    case 'html':
      return applyPlaceholders(applyI18n(String(content.html || ''), t, lang), m);

    case 'text': {
      const text = content.key
        ? resolve(t, String(content.key), lang)
        : String(lang === 'en' ? (content.textEn || content.textZh) : (content.textZh || content.textEn)) || '';
      return text ? `<p>${text}</p>` : '';
    }

    case 'callout': {
      const text = content.key
        ? resolve(t, String(content.key), lang)
        : String(lang === 'en' ? (content.textEn || content.textZh) : (content.textZh || content.textEn)) || '';
      return text ? `<div class="callout">${text}</div>` : '';
    }

    case 'code':
      return `<pre><code class="language-${esc(String(content.language || ''))}">${esc(String(content.code || ''))}</code></pre>`;

    case 'table':
      return renderTable(content as { headers?: Array<string | { text: string }>; rows?: Array<Array<string | { text: string }>> });

    case 'card':
      return renderCard(content as CardData, t, lang);

    case 'cards':
      return `<div class="grid2">${((content.cards || []) as CardData[]).map(c => renderCard(c, t, lang)).join('')}</div>`;

    case 'code-tags':
      return `<div class="code-tags">${((content.tags || []) as string[]).map(tag => `<code>${esc(tag)}</code>`).join('')}</div>`;

    case 'list':
      return renderList(content as ListData, t, lang);

    case 'image': {
      if (content.key) {
        const md = m.get(String(content.key));
        const src = md ? md.url : mediaUrl(m, String(content.key), 'img', `{{img:${String(content.key)}}}`);
        return `<img src="${esc(src)}" alt="${esc(String(content.alt || md?.alt || ''))}" loading="lazy" onerror="docImgErr(this)" style="max-width:100%;border-radius:8px;margin:12px 0;display:block" />`;
      }
      return content.src ? `<img src="${esc(String(content.src))}" alt="${esc(String(content.alt || ''))}" loading="lazy" onerror="docImgErr(this)" style="max-width:100%;border-radius:8px;margin:12px 0;display:block" />` : '';
    }

    case 'video': {
      if (content.key) {
        const md = m.get(String(content.key));
        const src = md ? md.url : mediaUrl(m, String(content.key), 'video', `{{video:${String(content.key)}}}`);
        return `<video src="${esc(src)}" controls style="max-width:100%;border-radius:8px;margin:12px 0;display:block"></video>`;
      }
      return content.src ? `<video src="${esc(String(content.src))}" controls style="max-width:100%;border-radius:8px;margin:12px 0;display:block"></video>` : '';
    }

    default:
      // Placeholder div for client-side extension renderers.
      // DocForge.register({renderBlock:{[type]: fn}}) will replace this at DOMContentLoaded.
      return `<div class="ext-block" data-type="${esc(block.type)}" data-content="${esc(block.contentJson)}" data-lang="${esc(lang)}"><span style="opacity:.4;font-size:12px;font-family:monospace;color:var(--c-muted)">[${esc(block.type)}]</span></div>`;
  }
}

function renderTable(content: { headers?: Array<string | { text: string }>; rows?: Array<Array<string | { text: string }>> }): string {
  if (!content.headers || !content.rows) return '';
  const cell = (v: string | { text: string }) => typeof v === 'object' ? v.text : v;
  let html = '<table><tr>';
  for (const h of content.headers) html += `<th>${esc(cell(h))}</th>`;
  html += '</tr>';
  for (const row of content.rows) {
    html += '<tr>';
    for (const c of row) html += `<td>${esc(cell(c))}</td>`;
    html += '</tr>';
  }
  return html + '</table>';
}

function renderCard(content: CardData, t: TranslationsMap, lang: string): string {
  let title = '', text = '';
  if (content.titleKey) {
    title = resolve(t, content.titleKey, lang);
  } else {
    title = lang === 'en' ? (content.titleEn || content.titleZh || '') : (content.titleZh || content.titleEn || '');
  }
  if (content.textKey) {
    text = resolve(t, content.textKey, lang);
  } else {
    text = lang === 'en' ? (content.textEn || content.textZh || '') : (content.textZh || content.textEn || '');
  }
  return `<div class="card"><h4>${title}</h4><p>${text}</p></div>`;
}

function renderList(content: ListData, t: TranslationsMap, lang: string): string {
  const tag = content.ordered ? 'ol' : 'ul';
  let html = `<${tag}>`;
  for (const item of content.items || []) {
    if (typeof item === 'string') {
      html += `<li>${esc(item)}</li>`;
    } else if ('key' in item) {
      html += `<li>${resolve(t, (item as { key: string }).key, lang)}</li>`;
    } else {
      const i = item as { zh: string; en: string };
      html += `<li>${lang === 'en' ? (i.en || i.zh) : (i.zh || i.en)}</li>`;
    }
  }
  return html + `</${tag}>`;
}

// ─── Home Page ───
export function home(params: {
  plugins: Plugin[];
  settings: Record<string, string>;
  lang: string;
  availableLocales?: string[];
  extHeadHtml?: string;
  extScriptsHtml?: string;
  extI18nHtml?: string;
  extMediaHtml?: string;
  extTemplatesHtml?: string;
}): string {
  const { plugins: pluginList, settings, lang, availableLocales = ['zh', 'en'], extHeadHtml = '', extScriptsHtml = '', extI18nHtml = '', extMediaHtml = '', extTemplatesHtml = '' } = params;
  const htmlLang = lang === 'zh' ? 'zh-CN' : lang;
  return `<!doctype html><html lang="${htmlLang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(settings.site_title || 'DocForge')}</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css">
${settings.custom_css ? `<style>${settings.custom_css}</style>` : docThemeCSS()}
${extHeadHtml}
${extHeadHtml || extScriptsHtml || extTemplatesHtml ? `<script>${DOCFORGE_RUNTIME}</script>` : ''}
${extI18nHtml}
${extMediaHtml}
${extTemplatesHtml}
<style>
.home-shell{max-width:1120px;margin:0 auto;padding:46px 24px 72px}
.home-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:end;margin-bottom:28px}
.home-eyebrow{margin:0 0 10px;color:var(--c-accent);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.home-hero h1{font-size:clamp(34px,4vw,52px);line-height:1.05;margin:0 0 12px}
.home-hero p{font-size:16px;line-height:1.65;max-width:700px;margin:0;color:var(--c-muted)}
.home-count{min-width:132px;border:1px solid var(--c-border);border-radius:12px;background:var(--c-surface);padding:14px 16px;text-align:right;box-shadow:var(--shadow-sm)}
.home-count strong{display:block;font-size:28px;color:var(--c-text)}
.home-count span{font-size:12px;color:var(--c-muted)}
.plugin-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
.plugin-card{display:flex;flex-direction:column;gap:14px;min-height:178px;padding:18px;border:1px solid var(--c-border);border-radius:12px;background:var(--c-surface);transition:.15s;position:relative;overflow:hidden}
.plugin-card:hover{border-color:var(--c-accent);box-shadow:var(--shadow);transform:translateY(-1px)}
.plugin-card-top{display:flex;align-items:center;gap:12px}
.plugin-card-icon{width:46px;height:46px;border-radius:10px;background:var(--c-code-bg);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden}
.plugin-card-icon img{width:100%;height:100%;object-fit:cover}
.plugin-card-info{flex:1;min-width:0}
.plugin-card-info h3{margin:0;font-size:17px;color:var(--c-text)}
.plugin-card-info p{margin:4px 0 0;font-size:12px;color:var(--c-muted)}
.plugin-card-desc{margin:0;color:var(--c-muted);font-size:13px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.plugin-card-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto}
.plugin-card-badges{display:flex;gap:6px;flex-wrap:wrap}
.plugin-open{font-size:12px;font-weight:800;color:var(--c-accent);white-space:nowrap}
.topbar-home{position:sticky;top:0;z-index:100;background:rgba(13,17,23,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--c-border);padding:10px 0}
.topbar-inner{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between}
.doc-lp{position:relative;display:inline-block}
.doc-lp-btn{display:flex;align-items:center;gap:6px;padding:5px 12px;border:1px solid var(--c-border);border-radius:6px;background:var(--c-surface);color:var(--c-text);cursor:pointer;font:inherit;font-size:13px;white-space:nowrap}
.doc-lp-btn:hover{border-color:var(--c-accent)}
.doc-lp-menu{position:absolute;right:0;top:calc(100% + 6px);min-width:180px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:8px;z-index:999;list-style:none;margin:0;padding:4px 0;box-shadow:0 8px 24px rgba(0,0,0,.4);display:none;max-height:320px;overflow-y:auto}
.doc-lp-menu.open{display:block}
.doc-lp-menu li{display:flex;align-items:center;gap:8px;padding:8px 16px;cursor:pointer;font-size:14px}
.doc-lp-menu li:hover{background:rgba(88,166,255,.08);color:var(--c-accent)}
.doc-lp-menu li.active{color:var(--c-accent);font-weight:600}
@media(max-width:720px){.home-shell{padding-top:28px}.home-hero{grid-template-columns:1fr}.home-count{text-align:left}.plugin-card{min-height:0}}
</style>
<script>
document.addEventListener('DOMContentLoaded', function() {
  var btn=document.getElementById('doc-lp-btn'),menu=document.getElementById('doc-lp-menu');
  if(btn&&menu){
    btn.addEventListener('click',function(e){e.stopPropagation();menu.classList.toggle('open');});
    document.addEventListener('click',function(){menu.classList.remove('open');});
    menu.querySelectorAll('li').forEach(function(li){
      li.addEventListener('click',function(){
        fetch('/api/set-lang?lang='+li.dataset.code).then(function(){location.reload();});
      });
    });
  }
});
</script>
</head><body>
<nav class="topbar-home">
  <div class="topbar-inner">
    <div style="font-weight:800;font-size:18px;color:var(--c-text)">${esc(settings.header_logo_text || 'Plugin Docs')}</div>
    <div class="doc-lp" id="doc-lp">
      <button class="doc-lp-btn" id="doc-lp-btn" type="button">
        ${flagSpan(lang)} <span>${localeName(lang)}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" style="opacity:.5"><path d="M6 8L1 3h10z" fill="currentColor"/></svg>
      </button>
      <ul class="doc-lp-menu" id="doc-lp-menu">
        ${availableLocales.map(code =>
          `<li data-code="${code}"${code === lang ? ' class="active"' : ''}>${flagSpan(code)} ${localeName(code)}</li>`
        ).join('')}
      </ul>
    </div>
  </div>
</nav>
<main class="home-shell">
  <section class="home-hero">
    <div>
      <p class="home-eyebrow">${esc(settings.header_logo_text || 'Plugin Docs')}</p>
      <h1>${esc(settings.site_title || 'DocForge')}</h1>
      <p>${esc(settings.site_subtitle || 'Plugin documentation')}</p>
    </div>
    <div class="home-count"><strong>${pluginList.length}</strong><span>${docUI('home.available', lang)}</span></div>
  </section>
  <section class="plugin-list">
    ${pluginList.map(p => {
      const badgeTags = JSON.parse(p.badgeTags || '[]') as string[];
      return `
    <a href="/${esc(p.slug)}" class="plugin-card">
      <div class="plugin-card-top">
        <div class="plugin-card-icon">${p.iconUrl ? `<img src="${esc(p.iconUrl)}" alt="" />` : '<span style="color:var(--c-accent)">&#9679;</span>'}</div>
        <div class="plugin-card-info">
          <h3>${esc(p.name)}</h3>
          <p>/${esc(p.slug)}</p>
        </div>
      </div>
      <p class="plugin-card-desc">${esc(p.description || '')}</p>
      <div class="plugin-card-foot">
        <div class="plugin-card-badges">
          <span class="badge" style="font-size:11px;padding:4px 8px">v${esc(p.version)}</span>
          ${p.compatibility ? `<span class="badge ok" style="font-size:11px;padding:4px 8px">${esc(p.compatibility)}</span>` : ''}
          ${badgeTags.slice(0, 2).map(t => `<span class="badge" style="font-size:11px;padding:4px 8px">${esc(t)}</span>`).join('')}
        </div>
        <span class="plugin-open">${docUI('home.openDoc', lang)} →</span>
      </div>
    </a>`;
    }).join('')}
    ${pluginList.length === 0 ? `<p style="text-align:center;color:var(--c-muted);grid-column:1/-1">${docUI('home.noPlugins', lang)}，<a href="/admin">${docUI('home.enterAdmin', lang)}</a></p>` : ''}
  </section>
</main>
${extScriptsHtml}
</body></html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const docPage = { docLayout, home };

import { docThemeCSS } from './error_pages';

interface Plugin {
  id: number; slug: string; name: string; version: string;
  ueVersion: string; description: string | null; iconUrl: string | null;
  badgeTags: string | null; sortOrder: number;
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

// translations: key → {zh, en}
export type TranslationsMap = Map<string, { zh: string; en: string }>;

// media: placeholderKey → {url, alt, mimeType}
export type MediaMap = Map<string, { url: string; alt: string; mimeType: string }>;

function applyI18n(html: string, t: TranslationsMap): string {
  return html.replace(/\{\{t:([^}]+)\}\}/g, (match, rawKey) => {
    const key = rawKey.trim();
    const entry = t.get(key);
    if (!entry) return match;
    const zh = entry.zh || entry.en || match;
    const en = entry.en || entry.zh || match;
    if (zh === en) return zh;
    return `<span data-lang="zh">${zh}</span><span data-lang="en">${en}</span>`;
  });
}

function applyPlaceholders(html: string, mediaMap: MediaMap): string {
  return html
    .replace(/\{\{img:([^}]+)\}\}/g, (match, rawKey) => {
      const m = mediaMap.get(rawKey.trim());
      if (!m) return `<span style="display:inline-block;padding:4px 8px;border:1px dashed var(--c-border);border-radius:4px;color:var(--c-muted);font-size:12px">📷 ${esc(rawKey.trim())}</span>`;
      return `<img src="${esc(m.url)}" alt="${esc(m.alt)}" loading="lazy" style="max-width:100%;border-radius:8px;margin:8px 0;display:block">`;
    })
    .replace(/\{\{video:([^}]+)\}\}/g, (match, rawKey) => {
      const m = mediaMap.get(rawKey.trim());
      if (!m) return `<span style="display:inline-block;padding:4px 8px;border:1px dashed var(--c-border);border-radius:4px;color:var(--c-muted);font-size:12px">🎬 ${esc(rawKey.trim())}</span>`;
      return `<video src="${esc(m.url)}" controls style="max-width:100%;border-radius:8px;margin:8px 0;display:block"></video>`;
    });
}

export function docLayout(params: {
  plugin: Plugin;
  sections: Section[];
  blocksBySection: Map<number, ContentBlock[]>;
  settings: Record<string, string>;
  lang: 'zh' | 'en';
  translations: TranslationsMap;
  mediaMap?: MediaMap;
}): string {
  const { plugin, sections, blocksBySection, settings, lang, translations, mediaMap = new Map() } = params;
  const badgeTags = JSON.parse(plugin.badgeTags || '[]') as string[];
  const htmlLang = lang === 'zh' ? 'zh-CN' : 'en';

  return `<!doctype html>
<html lang="${htmlLang}" class="lang-${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(plugin.name)} ${lang === 'zh' ? '文档' : 'Docs'}</title>
${settings.custom_head_html || ''}
${docThemeCSS()}
${settings.custom_css ? `<style>${settings.custom_css}</style>` : ''}
<script>
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var lang = btn.dataset.switchLang;
        document.documentElement.className = 'lang-' + lang;
        document.querySelectorAll('.lang-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.switchLang === lang);
        });
        fetch('/api/set-lang?lang=' + lang);
      });
    });
    // Track which section is most visible for scroll-based active state
    var tocLinks = Array.from(document.querySelectorAll('.toc-link[href^="#"]'));
    var sectionEls = tocLinks.map(function(l) {
      return document.getElementById(l.getAttribute('href').slice(1));
    }).filter(Boolean);

    function setActiveToc(id) {
      tocLinks.forEach(function(l) {
        var active = l.getAttribute('href') === '#' + id;
        l.classList.toggle('active', active);
      });
    }

    // Click: smooth scroll + immediate active
    tocLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var target = document.getElementById(link.getAttribute('href').slice(1));
        if (!target) return;
        e.preventDefault();
        setActiveToc(target.id);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + target.id);
      });
    });

    // Scroll: update active based on scroll position
    function onScroll() {
      var marker = window.scrollY + Math.min(100, window.innerHeight * 0.15);
      var best = sectionEls[0];
      for (var i = 0; i < sectionEls.length; i++) {
        var el = sectionEls[i];
        if (el && el.getBoundingClientRect().top + window.scrollY <= marker) best = el;
        else break;
      }
      if (best) setActiveToc(best.id);
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial state from hash or scroll
    var initHash = window.location.hash ? window.location.hash.slice(1) : '';
    if (initHash) {
      setActiveToc(initHash);
      var initEl = document.getElementById(initHash);
      if (initEl) setTimeout(function() { initEl.scrollIntoView({ block: 'start' }); }, 0);
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
      <a href="/" style="color:inherit;text-decoration:none">${esc(settings.header_logo_text || plugin.name)}</a>
      <span data-lang="zh" style="color:var(--c-muted);font-weight:400;font-size:14px"> / ${esc(plugin.name)} 文档</span>
      <span data-lang="en" style="color:var(--c-muted);font-weight:400;font-size:14px"> / ${esc(plugin.name)} Docs</span>
    </div>
    <div class="topbar-actions">
      <button class="lang-btn${lang === 'zh' ? ' active' : ''}" data-switch-lang="zh">中文</button>
      <button class="lang-btn${lang === 'en' ? ' active' : ''}" data-switch-lang="en">English</button>
    </div>
  </div>
</nav>

<header class="hero">
  <h1>${esc(plugin.name)}</h1>
  <p class="subtitle">${esc(plugin.description || '')}</p>
  <div class="badges">
    <span class="badge">v${esc(plugin.version)}</span>
    <span class="badge ok">UE ${esc(plugin.ueVersion)}</span>
    ${badgeTags.map((t: string, i: number) => `<span class="badge${i > 2 ? ' warn' : ''}">${esc(t)}</span>`).join('')}
  </div>
</header>

<div class="page"><div class="layout">
<aside class="sidebar"><nav class="toc">
${renderTOC(sections, translations)}
</nav></aside>
<main class="content">
${sections.length > 0 ? renderSections(sections, blocksBySection, translations, mediaMap) : `<div style="padding:40px;text-align:center;color:var(--c-muted)"><p data-lang="zh">暂无文档内容</p><p data-lang="en">No documentation yet.</p></div>`}
</main>
</div></div>

<footer style="text-align:center;padding:40px 24px;color:var(--c-muted);font-size:13px;border-top:1px solid var(--c-border);margin-top:24px">
  ${settings.footer_text ? settings.footer_text : `&copy; ${new Date().getFullYear()} ${esc(plugin.name)} Documentation`}
</footer>
</body></html>`;
}

function renderTOC(sections: Section[], t: TranslationsMap): string {
  return sections.map(s => {
    const children = s.children || [];
    let html = '';

    if (children.length > 0) {
      // Category header (non-clickable)
      const catTitle = sectionTitle(s, t);
      html += `<div class="toc-category">`;
      html += `<span data-lang="zh">${esc(catTitle.zh)}</span>`;
      html += `<span data-lang="en">${esc(catTitle.en)}</span>`;
      html += `</div>`;
      for (const child of children) {
        const childTitle = sectionTitle(child, t);
        html += `<a href="#${esc(child.slug)}" class="toc-link">`;
        html += `<span data-lang="zh">${esc(childTitle.zh)}</span>`;
        html += `<span data-lang="en">${esc(childTitle.en)}</span>`;
        html += `</a>`;
      }
    } else {
      // Standalone clickable link
      const title = sectionTitle(s, t);
      html += `<a href="#${esc(s.slug)}" class="toc-link">`;
      html += `<span data-lang="zh">${esc(title.zh)}</span>`;
      html += `<span data-lang="en">${esc(title.en)}</span>`;
      html += `</a>`;
    }

    return html;
  }).join('');
}

function renderSections(sections: Section[], blocksBySection: Map<number, ContentBlock[]>, t: TranslationsMap, m: MediaMap): string {
  return sections.map(s => renderSection(s, s.children || [], blocksBySection, t, m)).join('');
}

function sectionTitle(s: Section, t: TranslationsMap): { zh: string; en: string } {
  const key = `sec.${s.slug}.title`;
  const entry = t.get(key);
  return {
    zh: entry?.zh || s.titleZh || s.slug,
    en: entry?.en || s.titleEn || s.titleZh || s.slug,
  };
}

function renderSection(section: Section, children: Section[], blocksBySection: Map<number, ContentBlock[]>, t: TranslationsMap, m: MediaMap): string {
  const blocks = blocksBySection.get(section.id) || [];
  const title = sectionTitle(section, t);
  let html = `<section class="section" id="${esc(section.slug)}">`;
  html += `<h2><span data-lang="zh">${esc(title.zh)}</span><span data-lang="en">${esc(title.en)}</span></h2>`;
  for (const block of blocks) html += renderBlock(block, t, m);
  for (const child of children) {
    const childBlocks = blocksBySection.get(child.id) || [];
    const childTitle = sectionTitle(child, t);
    html += `<div class="subsection" id="${esc(child.slug)}">`;
    html += `<h3><span data-lang="zh">${esc(childTitle.zh)}</span><span data-lang="en">${esc(childTitle.en)}</span></h3>`;
    for (const block of childBlocks) html += renderBlock(block, t, m);
    html += `</div>`;
  }
  html += `</section>`;
  return html;
}

function renderBlock(block: ContentBlock, t: TranslationsMap, m: MediaMap = new Map()): string {
  let content: Record<string, unknown>;
  try { content = JSON.parse(block.contentJson || '{}'); } catch { return ''; }

  switch (block.type) {
    case 'html':
      return applyPlaceholders(applyI18n(String(content.html || ''), t), m);
    case 'text':
      return renderBilingual(String(content.textZh || ''), String(content.textEn || ''));
    case 'code':
      return `<pre><code class="language-${esc(String(content.language || ''))}">${esc(String(content.code || ''))}</code></pre>`;
    case 'table':
      return renderTable(content as { headers?: Array<string | { text: string }>; rows?: Array<Array<string | { text: string }>> });
    case 'card':
      return renderCard(content as { titleZh?: string; titleEn?: string; textZh?: string; textEn?: string });
    case 'cards':
      return `<div class="grid2">${((content.cards || []) as Array<{ titleZh?: string; titleEn?: string; textZh?: string; textEn?: string }>).map(renderCard).join('')}</div>`;
    case 'callout':
      return `<div class="callout">${renderBilingual(String(content.textZh || ''), String(content.textEn || ''))}</div>`;
    case 'code-tags':
      return `<div class="code-tags">${((content.tags || []) as string[]).map(t => `<code>${esc(t)}</code>`).join('')}</div>`;
    case 'list':
      return renderList(content as { ordered?: boolean; items?: Array<string | { zh: string; en: string }> });
    case 'image':
      return content.src ? `<img src="${esc(String(content.src))}" alt="${esc(String(content.alt || ''))}" style="max-width:100%;border-radius:8px;margin:12px 0" />` : '';
    default:
      return '';
  }
}

function renderBilingual(zh: string, en: string): string {
  if (!zh && !en) return '';
  return `<span data-lang="zh">${zh || en}</span><span data-lang="en">${en || zh}</span>`;
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

function renderCard(content: { titleZh?: string; titleEn?: string; textZh?: string; textEn?: string }): string {
  return `<div class="card">
    <h4>${renderBilingual(content.titleZh || '', content.titleEn || '')}</h4>
    <p>${renderBilingual(content.textZh || '', content.textEn || '')}</p>
  </div>`;
}

function renderList(content: { ordered?: boolean; items?: Array<string | { zh: string; en: string }> }): string {
  const tag = content.ordered ? 'ol' : 'ul';
  let html = `<${tag}>`;
  for (const item of content.items || []) {
    if (typeof item === 'string') {
      html += `<li>${esc(item)}</li>`;
    } else {
      html += `<li>${renderBilingual(item.zh || '', item.en || '')}</li>`;
    }
  }
  return html + `</${tag}>`;
}

// ─── Home Page ───
export function home(params: { plugins: Plugin[]; settings: Record<string, string>; lang: 'zh' | 'en' }): string {
  const { plugins: pluginList, settings, lang } = params;
  const htmlLang = lang === 'zh' ? 'zh-CN' : 'en';
  return `<!doctype html><html lang="${htmlLang}" class="lang-${lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(settings.site_title || 'UE5 Plugin Docs')}</title>
${docThemeCSS()}
<style>
.home-hero{text-align:center;padding:80px 24px 48px}
.home-hero h1{font-size:clamp(36px,5vw,56px);margin-bottom:12px}
.home-hero h1 span{color:var(--c-accent)}
.home-hero p{font-size:18px;max-width:600px;margin:0 auto 32px}
.plugin-list{max-width:800px;margin:0 auto;padding:0 24px 60px;display:grid;gap:16px}
.plugin-card{display:flex;align-items:center;gap:16px;padding:20px 24px;border:1px solid var(--c-border);border-radius:var(--radius);background:var(--c-surface);transition:.15s}
.plugin-card:hover{border-color:var(--c-accent);box-shadow:var(--shadow)}
.plugin-card-icon{width:48px;height:48px;border-radius:10px;background:var(--c-code-bg);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden}
.plugin-card-icon img{width:100%;height:100%;object-fit:cover}
.plugin-card-info{flex:1;min-width:0}
.plugin-card-info h3{margin:0;font-size:18px;color:var(--c-text)}
.plugin-card-info p{margin:4px 0 0;font-size:14px;color:var(--c-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.plugin-card-badges{display:flex;gap:6px;flex-shrink:0}
.topbar-home{position:sticky;top:0;z-index:100;background:rgba(13,17,23,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--c-border);padding:10px 0}
.topbar-inner{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between}
</style>
<script>
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var lang=btn.dataset.switchLang;
      document.documentElement.className='lang-'+lang;
      document.querySelectorAll('.lang-btn').forEach(function(b){b.classList.toggle('active',b.dataset.switchLang===lang);});
      fetch('/api/set-lang?lang='+lang);
    });
  });
});
</script>
</head><body>
<nav class="topbar-home">
  <div class="topbar-inner">
    <div style="font-weight:800;font-size:18px;color:var(--c-text)">${esc(settings.header_logo_text || 'Plugin Docs')}</div>
    <div style="display:flex;gap:8px">
      <button class="lang-btn${lang === 'zh' ? ' active' : ''}" data-switch-lang="zh">中文</button>
      <button class="lang-btn${lang === 'en' ? ' active' : ''}" data-switch-lang="en">English</button>
    </div>
  </div>
</nav>
<div class="home-hero">
  <h1>${esc(settings.header_logo_text || 'Plugin Docs')}</h1>
  <p>${esc(settings.site_subtitle || 'Unreal Engine Plugin Documentation')}</p>
</div>
<div class="plugin-list">
  ${pluginList.map(p => `
    <a href="/${esc(p.slug)}" class="plugin-card">
      <div class="plugin-card-icon">${p.iconUrl ? `<img src="${esc(p.iconUrl)}" alt="" />` : '<span style="color:var(--c-accent)">&#9679;</span>'}</div>
      <div class="plugin-card-info">
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description || '')}</p>
      </div>
      <div class="plugin-card-badges">
        <span class="badge" style="font-size:11px;padding:4px 8px">v${esc(p.version)}</span>
        <span class="badge ok" style="font-size:11px;padding:4px 8px">UE ${esc(p.ueVersion)}</span>
      </div>
    </a>`).join('')}
  ${pluginList.length === 0 ? `<p style="text-align:center;color:var(--c-muted);grid-column:1/-1"><span data-lang="zh">暂无插件，</span><span data-lang="en">No plugins yet. </span><a href="/admin">进入管理后台</a></p>` : ''}
</div>
</body></html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const docPage = { docLayout, home };

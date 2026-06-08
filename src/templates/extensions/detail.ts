import type { Extension } from '../../services/extensions';
import { ADMIN_I18N } from '../../services/i18n';
import { SHARED_EDITOR_CSS } from '../admin/editor';
import { AI_TRANSLATE_CONTROLS, AI_TRANSLATE_SCRIPT } from '../admin/ai-translation';

function safeJSON(v: unknown): string {
  return JSON.stringify(v).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

const ACE = 'https://cdn.bootcdn.net/ajax/libs/ace/1.32.6';

const ACE_THEMES = [
  'one_dark','monokai','github_dark','nord_dark','dracula',
  'tomorrow_night_blue','tomorrow_night','tomorrow_night_bright',
  'tomorrow_night_eighties','tomorrow','solarized_dark','solarized_light',
  'gruvbox_dark_hard','gruvbox_light_hard','gruvbox','ambiance','chaos',
  'chrome','clouds','clouds_midnight','cobalt','crimson_editor','dawn',
  'dreamweaver','eclipse','github','gob','idle_fingers','iplastic',
  'katzenmilch','kr_theme','kuroir','merbivore','merbivore_soft',
  'mono_industrial','pastel_on_dark','sqlserver','terminal','textmate',
  'twilight','vibrant_ink','xcode',
];

function esc(s: string) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function iconHtml(icon: string, size = 18): string {
  if (/^https?:\/\//.test(icon))
    return `<img src="${esc(icon)}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:4px" onerror="this.style.display='none'">`;
  return `<span style="font-size:${size}px;line-height:1">${esc(icon || '🧩')}</span>`;
}
function ti(key: string, lang: string): string {
  const entry = ADMIN_I18N[key];
  if (!entry) return key;
  return (entry as Record<string,string>)[lang] || entry.zh || key;
}

const EXT_CSS = `
.ide-sb{overflow-y:auto;padding:14px}
.ide-sb h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 10px}
.fg{margin-bottom:10px}
.fg label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:4px}
.fg input,.fg select{width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px;outline:none;transition:.12s;-webkit-appearance:none;appearance:none}
.fg input:focus,.fg select:focus{border-color:var(--accent)}
.sep{border:0;border-top:1px solid var(--border);margin:12px 0}
.chips{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:5px}
.chip{font-size:10px;padding:2px 7px;border-radius:4px;font-family:monospace}
.chip-block{background:rgba(88,166,255,.1);color:var(--accent);border:1px solid rgba(88,166,255,.2)}
.chip-tag{background:rgba(63,185,80,.1);color:var(--ok);border:1px solid rgba(63,185,80,.2)}
`;

export function extensionDetail(
  ext: Extension,
  lang = 'zh',
  editorTheme = '',
  sysI18n: Record<string, { zh: string; en: string }> = {},
): string {
  const typeLabel: Record<string, Record<string,string>> = {
    theme:    { zh:'🎨 主题', en:'🎨 Theme'  },
    widget:   { zh:'🧩 组件', en:'🧩 Widget' },
    system:   { zh:'⚙️ 系统', en:'⚙️ System' },
    renderer: { zh:'🧩 组件', en:'🧩 Widget' },
    general:  { zh:'⚙️ 系统', en:'⚙️ System' },
  };
  function tl(k: string) { return typeLabel[k]?.[lang] || typeLabel[k]?.zh || k; }

  const activeTheme = editorTheme || 'one_dark';
  const i18n: Record<string, { zh: string; en: string }> = { ...ADMIN_I18N };
  for (const [key, entry] of Object.entries(sysI18n)) {
    i18n[key] = {
      ...(i18n[key] || { zh: '', en: '' }),
      ...(entry.zh ? { zh: entry.zh } : {}),
      ...(entry.en ? { en: entry.en } : {}),
    };
  }

  return `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(ext.name)} — 插件编辑</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css">
<script src="${ACE}/ace.min.js"></script>
<script src="${ACE}/ext-language_tools.min.js"></script>
<script src="${ACE}/ext-searchbox.min.js"></script>
<script src="${ACE}/ext-beautify.min.js"></script>
<script src="${ACE}/theme-${esc(activeTheme)}.min.js"></script>
<style>${SHARED_EDITOR_CSS}${EXT_CSS}</style>
</head><body>

<!-- ── Topbar ── -->
<div class="topbar">
  <div class="icon-preview" id="icon-preview">${iconHtml(ext.icon)}</div>
  <span style="font-weight:700;color:var(--accent)">${esc(ext.name)}</span>
  <div class="t-right">
    <a href="/admin/extensions" class="btn btn-sm" style="color:var(--muted)">${ti('ext.backList', lang)}</a>
    <select class="sel-theme" id="sel-theme" data-i18n-title="editor.theme" title="编辑器主题"></select>
    <div class="lang-dd" id="lang-dd">
      <button class="lang-dd-btn" id="lang-dd-btn" type="button">
        <span class="fi fi-cn" id="lang-dd-flag"></span>
        <span id="lang-dd-name">中文</span>
        <svg width="9" height="9" viewBox="0 0 12 12" style="opacity:.5"><path d="M6 8L1 3h10z" fill="currentColor"/></svg>
      </button>
      <ul class="lang-dd-menu" id="lang-dd-menu">
        <li data-lang="zh" data-country="cn"><span class="fi fi-cn"></span> 中文</li>
        <li data-lang="en" data-country="us"><span class="fi fi-us"></span> English</li>
      </ul>
    </div>
  </div>
</div>

<!-- ── Body ── -->
<div class="ide-body">

  <!-- Sidebar -->
  <aside class="ide-sb">
    <h3>${ti('ext.infoSection', lang)}</h3>
    <div class="fg">
      <label>${ti('ext.icon', lang)} <span style="font-weight:400;opacity:.6;font-size:10px">${ti('ext.iconHint', lang)}</span></label>
      <input id="f-icon" value="${esc(ext.icon)}" oninput="updateIconPreview(this.value)">
    </div>
    <div class="fg"><label>${ti('ext.name', lang)}</label><input id="f-name" value="${esc(ext.name)}"></div>
    <div class="fg"><label>Slug</label><input id="f-slug" value="${esc(ext.slug)}"></div>
    <div class="fg"><label>${ti('ext.type', lang)}</label>
      <select id="f-type">
        ${(['theme','widget','system'] as const).map(t => {
          const legacyMatch = (t==='widget' && (ext.extType as string)==='renderer') || (t==='system' && (ext.extType as string)==='general');
          return `<option value="${t}"${(t===ext.extType || legacyMatch)?' selected':''}>${esc(tl(t))}</option>`;
        }).join('')}
      </select>
    </div>
    <div class="fg"><label>${ti('ext.version', lang)}</label><input id="f-version" value="${esc(ext.version)}"></div>
    <div class="fg"><label>${ti('ext.author', lang)}</label><input id="f-author" value="${esc(ext.author)}"></div>
    <div class="fg"><label>${ti('ext.desc', lang)}</label><input id="f-desc" value="${esc(ext.description)}"></div>
    <div class="fg"><label>${ti('ext.homepage', lang)}</label><input id="f-homepage" value="${esc(ext.homepage)}"></div>
    <hr class="sep">
    <h3>${ti('ext.capSection', lang)}</h3>
    <div class="fg">
      <label>Tags <span style="font-weight:400;opacity:.6;font-size:10px">${ti('ext.tagsSep', lang)}</span></label>
      ${ext.tags.length ? `<div class="chips">${ext.tags.map(t=>`<span class="chip chip-tag">#${esc(t)}</span>`).join('')}</div>` : ''}
      <input id="f-tags" value="${esc(ext.tags.join(','))}" placeholder="${ti('ext.tagsSep', lang)}">
    </div>
    <div class="fg">
      <label>${ti('ext.blockTypes', lang)} <span style="font-weight:400;opacity:.6;font-size:10px">${ti('ext.blockTypesSep', lang)}</span></label>
      ${ext.blockTypes.length ? `<div class="chips">${ext.blockTypes.map(t=>`<span class="chip chip-block">${esc(t)}</span>`).join('')}</div>` : ''}
      <input id="f-blocktypes" value="${esc(ext.blockTypes.join(','))}" placeholder="${ti('ext.blockTypesSep', lang)}">
    </div>
  </aside>

  <!-- Main editor area -->
  <main class="ide-main">
    <!-- Tab bar -->
    <div class="ed-tabs">
      <button class="ed-tab" id="etab-css" onclick="switchEdTab('css',this)">
        CSS<span id="css-dot" style="color:var(--warn);font-size:9px"></span>
      </button>
      <button class="ed-tab" id="etab-html" onclick="switchEdTab('html',this)" data-i18n-title="editor.extHtmlTitle" title="组件 HTML 模板">
        HTML<span id="html-dot" style="color:var(--warn);font-size:9px"></span>
      </button>
      <button class="ed-tab" id="etab-js" onclick="switchEdTab('js',this)">
        JS<span id="js-dot" style="color:var(--warn);font-size:9px"></span>
      </button>
      <div class="ed-tab-sep"></div>
      <button class="ed-tab" id="etab-trans" onclick="switchEdTab('trans',this)" data-i18n="editor.translations">🌐 翻译</button>
      <button class="ed-tab" id="etab-media" onclick="switchEdTab('media',this)" data-i18n="editor.media">📷 媒体</button>
      <div class="ed-tabs-right">
        <!-- Editor buttons -->
        <button class="btn btn-sm ed-only" onclick="formatActive()"><span data-i18n="editor.format">⇥ 格式化</span> <kbd>Ctrl+Shift+F</kbd></button>
        <button class="btn btn-primary btn-sm ed-only" onclick="saveAll()"><span data-i18n="editor.save">💾 保存</span> <kbd>Ctrl+S</kbd></button>
        <!-- Trans buttons -->
        <button class="btn btn-sm trans-only" id="trans-scan-btn" onclick="loadTransPanel()" style="display:none" data-i18n="editor.scan">↻ 扫描</button>
        <button class="btn btn-ok btn-sm trans-only" id="trans-save-btn" onclick="saveTrans()" style="display:none" data-i18n="editor.saveTranslations">💾 保存翻译</button>
        <!-- Media buttons -->
        <button class="btn btn-sm media-only" onclick="loadMediaPanel()" style="display:none" data-i18n="editor.refresh">↻ 刷新</button>
      </div>
    </div>

    <!-- Editor + panels -->
    <div class="ed-wrap">
      <!-- Code editors -->
      <div class="ed-panel" id="panel-css">
        <div id="ace-css" class="ed-panel-ace"></div>
      </div>
      <div class="ed-panel" id="panel-html">
        <div id="ace-html" class="ed-panel-ace"></div>
      </div>
      <div class="ed-panel" id="panel-js">
        <div id="ace-js" class="ed-panel-ace"></div>
      </div>

      <!-- Translation panel -->
      <div class="ed-panel" id="panel-trans" style="overflow:auto;background:var(--bg)">
        <div style="padding:12px 16px;min-width:600px">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:10;border-bottom:1px solid var(--border)">
            <input id="trans-filter" data-i18n-placeholder="editor.searchKey" placeholder="搜索 key…"
              style="padding:5px 9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text);font:inherit;font-size:12px;flex:1;min-width:100px;max-width:160px;outline:none"
              onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'"
              oninput="filterTrans(this.value)">
            <input id="trans-new-key" data-i18n-placeholder="editor.addKeyPlaceholder" placeholder="添加 key…"
              style="padding:5px 9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text);font:inherit;font-size:12px;width:110px;outline:none"
              onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'"
              onkeydown="if(event.key==='Enter')transAddKeyInline()">
            <button class="btn btn-sm btn-ok" onclick="transAddKeyInline()" style="padding:4px 9px" data-i18n-title="editor.addKeyTitle" title="添加 key">+</button>
            <div style="width:1px;background:var(--border);height:18px;margin:0 2px;flex-shrink:0"></div>
            <input id="trans-add-locale" data-i18n-placeholder="editor.addLocalePlaceholder" placeholder="添加语言 (如 ja)"
              style="padding:5px 9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text);font:inherit;font-size:12px;width:120px;outline:none"
              onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'"
              onkeydown="if(event.key==='Enter')transAddLocale()">
            <button class="btn btn-sm" onclick="transAddLocale()" data-i18n-title="editor.addLocaleTitle" title="添加新语言列" data-i18n="editor.addLanguage">+ 语言</button>
            <span id="trans-src-flag" class="fi fi-cn" style="font-size:18px"></span>
            <select id="trans-src" class="sel-theme" style="min-width:90px" onchange="updateTransFlag('src');renderTransTable()"></select>
            <span style="color:var(--muted)">→</span>
            <span id="trans-dst-flag" class="fi fi-us" style="font-size:18px"></span>
            <select id="trans-dst" class="sel-theme" style="min-width:90px" onchange="updateTransFlag('dst');renderTransTable()"></select>
            ${AI_TRANSLATE_CONTROLS}
            <span style="font-size:11px;color:var(--muted)" id="trans-key-count"></span>
          </div>
          <table id="trans-table" style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="position:sticky;top:46px;background:var(--bg)">
                <th style="text-align:left;padding:4px 8px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border);width:35%">Key</th>
                <th id="trans-th-src" style="text-align:left;padding:4px 8px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border);width:30%" data-i18n="trans.source">原文</th>
                <th id="trans-th-dst" style="text-align:left;padding:4px 8px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border);width:30%" data-i18n="trans.translation">翻译</th>
                <th style="border-bottom:1px solid var(--border);width:5%"></th>
              </tr>
            </thead>
            <tbody id="trans-tbody"></tbody>
          </table>
          <div id="trans-empty-msg" style="display:none;padding:32px;text-align:center;color:var(--muted);font-size:13px">
            <span data-i18n="editor.noTransKeysExt">暂无翻译 key，点击 + 添加</span>
          </div>
        </div>
      </div>

      <!-- Media panel — browse all media for reference in plugin code -->
      <div class="ed-panel" id="panel-media" style="overflow:auto;background:var(--bg)">
        <div style="padding:12px 16px;min-width:600px">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:10;border-bottom:1px solid var(--border)">
            <input id="media-filter" data-i18n-placeholder="editor.searchFilename" placeholder="搜索文件名…"
              style="padding:5px 9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text);font:inherit;font-size:12px;flex:1;min-width:120px;max-width:220px;outline:none"
              onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'"
              oninput="filterMedia(this.value)">
            <span id="media-count" style="font-size:11px;color:var(--muted)"></span>
          </div>
          <div id="media-grid" class="media-ref-grid"></div>
          <div id="media-empty-msg" style="display:none;padding:32px;text-align:center;color:var(--muted);font-size:13px" data-i18n="media.empty">暂无媒体文件</div>
          <div id="media-loading" style="display:none;padding:32px;text-align:center;color:var(--muted);font-size:13px">
            <div class="spinner" style="margin:0 auto 8px"></div><span data-i18n="editor.loading">加载中…</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- Media preview lightbox -->
<div id="media-preview-ov" style="position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:3000;display:none;align-items:center;justify-content:center;cursor:zoom-out" onclick="closeMediaPreview()">
  <img id="media-preview-img" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:8px;box-shadow:0 0 60px rgba(0,0,0,.6)">
  <video id="media-preview-vid" controls style="max-width:90vw;max-height:90vh;display:none;border-radius:8px"></video>
  <button style="position:absolute;top:16px;right:20px;background:none;border:none;color:#fff;font-size:24px;cursor:pointer;opacity:.7;padding:4px 8px" onclick="closeMediaPreview()">✕</button>
</div>

<div class="toast" id="toast"></div>

<script>
ace.config.set('basePath', '${ACE}');
var ACE_THEMES = ${JSON.stringify(ACE_THEMES)};
var ACTIVE_THEME = '${esc(activeTheme)}';
var ACE_BASE = '${ACE}';
var EDITOR_I18N = ${safeJSON(i18n)};
var EDITOR_LANG = (document.cookie.match(/(?:^|;\s*)lang=([^;]+)/) || [])[1] || ((navigator.language||'').toLowerCase().indexOf('zh')===0?'zh':'en');
if (!(document.cookie.match(/(?:^|;\s*)lang=([^;]+)/) || [])[1]) fetch('/api/set-lang?lang=' + EDITOR_LANG).catch(function(){});
function t(key) { var entry = EDITOR_I18N[key]; return entry ? (entry[EDITOR_LANG] || entry.zh || entry.en || key) : key; }
function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(function(el) { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) { el.placeholder = t(el.dataset.i18nPlaceholder); });
}
var themeLoaded = {}; themeLoaded[ACTIVE_THEME] = true;

var ACE_OPTS = {
  fontSize:'13px', fontFamily:'"Cascadia Code","Consolas","Courier New",monospace',
  tabSize:2, useSoftTabs:true, showPrintMargin:false, wrap:true,
  enableBasicAutocompletion:true, enableSnippets:true, enableLiveAutocompletion:true,
  scrollPastEnd:.3, displayIndentGuides:true, mergeUndoDeltas:'always'
};

var edCSS  = ace.edit('ace-css');  edCSS.setTheme('ace/theme/'+ACTIVE_THEME);  edCSS.session.setMode('ace/mode/css');        edCSS.setOptions(ACE_OPTS);
var edHTML = ace.edit('ace-html'); edHTML.setTheme('ace/theme/'+ACTIVE_THEME); edHTML.session.setMode('ace/mode/html');      edHTML.setOptions(ACE_OPTS);
var edJS   = ace.edit('ace-js');   edJS.setTheme('ace/theme/'+ACTIVE_THEME);   edJS.session.setMode('ace/mode/javascript');  edJS.setOptions(ACE_OPTS);
var ALL_EDITORS = [edCSS, edHTML, edJS];

edCSS.setValue(${safeJSON(ext.css)}, -1);
edHTML.setValue(${safeJSON(ext.html)}, -1);
edJS.setValue(${safeJSON(ext.js)}, -1);

var beautify = null;
try { beautify = ace.require('ace/ext/beautify'); } catch(e) {}

setTimeout(function() { ALL_EDITORS.forEach(function(ed) { ed.resize(true); }); }, 50);

// ── Theme ─────────────────────────────────────────────────────────────────────
function loadTheme(t, cb) {
  if (themeLoaded[t]) { cb(); return; }
  var s = document.createElement('script'); s.src = ACE_BASE + '/theme-' + t + '.min.js';
  s.onload = function() { themeLoaded[t] = true; cb(); };
  document.head.appendChild(s);
}
function switchTheme(t) {
  loadTheme(t, function() {
    ALL_EDITORS.forEach(function(ed) { ed.setTheme('ace/theme/' + t); });
    localStorage.setItem('ace-theme', t);
    ACTIVE_THEME = t;
    fetch('/api/admin/settings', {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({editor_theme:t})}).catch(function(){});
  });
}
(function() {
  var sel = document.getElementById('sel-theme');
  ACE_THEMES.forEach(function(t) {
    var o = document.createElement('option'); o.value = t;
    o.textContent = t.replace(/_/g,' '); if (t === ACTIVE_THEME) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener('change', function() { switchTheme(this.value); });
})();

// ── Language switcher ─────────────────────────────────────────────────────────
function switchEditorLang(l) { document.cookie = 'lang=' + l + ';path=/;max-age=31536000'; fetch('/api/set-lang?lang=' + l).finally(function(){location.reload();}); }
(function() {
  var curLang = EDITOR_LANG;
  var ddBtn = document.getElementById('lang-dd-btn'), ddMenu = document.getElementById('lang-dd-menu');
  var ddFlag = document.getElementById('lang-dd-flag'), ddName = document.getElementById('lang-dd-name');
  if (!ddBtn || !ddMenu) return;
  function setLang(lang) {
    var li = ddMenu.querySelector('[data-lang="' + lang + '"]');
    if (li) {
      if (ddFlag) ddFlag.className = 'fi fi-' + li.dataset.country;
      if (ddName) ddName.textContent = li.querySelector('span').nextSibling.textContent.trim();
    }
    ddMenu.querySelectorAll('li').forEach(function(l) { l.classList.toggle('active', l.dataset.lang === lang); });
  }
  setLang(curLang);
  ddBtn.addEventListener('click', function(e) { e.stopPropagation(); ddMenu.classList.toggle('open'); });
  document.addEventListener('click', function() { ddMenu.classList.remove('open'); });
  ddMenu.querySelectorAll('li').forEach(function(li) {
    li.addEventListener('click', function() { switchEditorLang(li.dataset.lang); });
  });
})();
applyStaticI18n();

// ── Tab switching ─────────────────────────────────────────────────────────────
var EXT_PANELS  = ['css', 'html', 'js', 'trans', 'media'];
var EXT_EDITORS = { css: edCSS, html: edHTML, js: edJS };
var EXT_TAB_STORAGE_KEY = 'docforge.extension.tab.${ext.id}';
function normalizeExtTab(name) {
  return EXT_PANELS.indexOf(name) !== -1 ? name : 'css';
}
function initialExtTab() {
  try { return normalizeExtTab(localStorage.getItem(EXT_TAB_STORAGE_KEY) || 'css'); }
  catch(e) { return 'css'; }
}
var ACTIVE_ED_TAB = initialExtTab();

function switchEdTab(name, btn) {
  name = normalizeExtTab(name);
  ACTIVE_ED_TAB = name;
  try { localStorage.setItem(EXT_TAB_STORAGE_KEY, name); } catch(e) {}
  document.querySelectorAll('.ed-tab[id^="etab-"]').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  EXT_PANELS.forEach(function(n) {
    var el = document.getElementById('panel-' + n); if (el) el.classList.toggle('active', n === name);
  });
  var isEd = (name === 'css' || name === 'html' || name === 'js');
  document.querySelectorAll('.ed-only').forEach(function(el)    { el.style.display = isEd ? '' : 'none'; });
  document.querySelectorAll('.trans-only').forEach(function(el)  { el.style.display = name === 'trans' ? '' : 'none'; });
  document.querySelectorAll('.media-only').forEach(function(el)  { el.style.display = name === 'media' ? '' : 'none'; });
  if (EXT_EDITORS[name]) setTimeout(function() { EXT_EDITORS[name].resize(); }, 10);
  if (name === 'trans') loadTransPanel();
  if (name === 'media') loadMediaPanel();
}
switchEdTab(ACTIVE_ED_TAB, document.getElementById('etab-' + ACTIVE_ED_TAB));

// ── Dirty tracking ────────────────────────────────────────────────────────────
var saved = {
  css: ${safeJSON(ext.css)}, html: ${safeJSON(ext.html)}, js: ${safeJSON(ext.js)},
  name: ${safeJSON(ext.name)}, icon: ${safeJSON(ext.icon)}, type: ${safeJSON(ext.extType)},
  tags: ${safeJSON(ext.tags.join(','))}, bts: ${safeJSON(ext.blockTypes.join(','))}
};
function fv(id) { var el = document.getElementById(id); return el ? el.value : ''; }
function markDirty() {
  var DOTS = {css:'css-dot',html:'html-dot',js:'js-dot'};
  var cur = {css:edCSS.getValue(),html:edHTML.getValue(),js:edJS.getValue()};
  Object.keys(DOTS).forEach(function(k) {
    var d = document.getElementById(DOTS[k]); if (d) d.textContent = cur[k] !== saved[k] ? ' ●' : '';
  });
}
ALL_EDITORS.forEach(function(ed) { ed.session.on('change', markDirty); });
document.querySelectorAll('.ide-sb input,.ide-sb select').forEach(function(el) { el.addEventListener('input', markDirty); });

// ── Format ────────────────────────────────────────────────────────────────────
function formatActive() {
  var ed = EXT_EDITORS[ACTIVE_ED_TAB];
  if (ed && beautify && typeof beautify.beautify === 'function') beautify.beautify(ed.session);
  else showToast(t('editor.fmtNotLoaded'), 'err');
}

// ── Icon preview ──────────────────────────────────────────────────────────────
function updateIconPreview(val) {
  var p = document.getElementById('icon-preview');
  if (/^https?:\\/\\//.test(val)) {
    p.innerHTML = '<img src="' + val.replace(/[<>"]/g, '') + '" style="width:18px;height:18px;object-fit:cover;border-radius:3px">';
  } else { p.textContent = val || '🧩'; }
}

// ── Save (code + metadata) ────────────────────────────────────────────────────
async function saveAll() {
  var bts  = fv('f-blocktypes').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  var tags = fv('f-tags').split(',').map(function(s) { return s.trim().replace(/^#+/, ''); }).filter(Boolean);
  var body = {
    name: fv('f-name'), slug: fv('f-slug'), icon: fv('f-icon'), extType: fv('f-type'),
    version: fv('f-version'), author: fv('f-author'), description: fv('f-desc'), homepage: fv('f-homepage'),
    blockTypes: bts, tags: tags,
    css: edCSS.getValue(), html: edHTML.getValue(), js: edJS.getValue()
  };
  var r = await fetch('/api/admin/extensions/${ext.id}', {
    method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
  });
  var d = await r.json();
  if (d.ok) {
    saved = Object.assign(saved, {css:body.css,html:body.html,js:body.js,name:body.name,icon:body.icon,type:body.extType,tags:body.tags.join(','),bts:body.blockTypes.join(',')});
    ['css-dot','html-dot','js-dot'].forEach(function(id) { var el=document.getElementById(id); if(el)el.textContent=''; });
    showToast('✓ ' + t('trans.saved'), 'ok');
  } else showToast(t('editor.saveFailed'), 'err');
}
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveAll(); }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') { e.preventDefault(); formatActive(); }
});

// ── Translation panel ─────────────────────────────────────────────────────────
var _transAllRows = [];
var _transContentKeys = [];
var _transLocales = ['zh', 'en'];

function getPluginMetaTransEntries() {
  var defs = [
    ['meta.name', 'f-name'],
    ['meta.slug', 'f-slug'],
    ['meta.type', 'f-type'],
    ['meta.version', 'f-version'],
    ['meta.author', 'f-author'],
    ['meta.description', 'f-desc'],
    ['meta.homepage', 'f-homepage'],
    ['meta.tags', 'f-tags'],
    ['meta.blockTypes', 'f-blocktypes']
  ];
  return defs.map(function(def) {
    var el = document.getElementById(def[1]);
    var value = el ? String(el.value || '').trim() : '';
    return { key: def[0], locale: EDITOR_LANG || 'zh', value: value };
  }).filter(function(item) { return item.value; });
}

async function loadTransPanel() {
  try {
    var r = await fetch('/api/admin/extensions/${ext.id}/i18n');
    if (r.ok) {
      var rows = await r.json();
      if (!Array.isArray(rows)) rows = rows.rows || [];
      var metaRows = getPluginMetaTransEntries();
      var rowMap = {};
      rows.forEach(function(row) { rowMap[row.key] = Object.assign({}, row); });
      metaRows.forEach(function(item) {
        if (!rowMap[item.key]) rowMap[item.key] = { key: item.key };
        rowMap[item.key][item.locale] = item.value;
      });
      _transAllRows = Object.keys(rowMap).map(function(k) { return rowMap[k]; });
      var locs = new Set(['zh', 'en']);
      locs.add(EDITOR_LANG || 'zh');
      _transAllRows.forEach(function(row) { Object.keys(row).filter(function(k){return k!=='key';}).forEach(function(l){locs.add(l);}); });
      _transLocales = [...locs];
      var keySet = new Set(metaRows.map(function(item) { return item.key; }));
      _transAllRows.forEach(function(row) { keySet.add(row.key); });
      _transContentKeys = [...keySet];
    }
  } catch(e) {}
  renderTransLocaleSelects();
  renderTransTable();
}

function renderTransLocaleSelects() {
  var src = document.getElementById('trans-src'), dst = document.getElementById('trans-dst');
  if (!src || !dst) return;
  var opts = _transLocales.map(function(l) { return '<option value="' + l + '">' + l + '</option>'; }).join('');
  src.innerHTML = opts; dst.innerHTML = opts;
  src.value = _transLocales[0] || 'zh';
  dst.value = _transLocales[1] || _transLocales[0] || 'en';
  updateTransFlag('src'); updateTransFlag('dst');
}

function updateTransFlag(which) {
  var sel = document.getElementById('trans-' + which), flag = document.getElementById('trans-' + which + '-flag');
  if (!sel || !flag) return;
  var COUNTRIES = {zh:'cn','zh-TW':'tw',ja:'jp',ko:'kr',en:'us',de:'de',fr:'fr',es:'es',pt:'br',ru:'ru',ar:'sa'};
  flag.className = 'fi fi-' + (COUNTRIES[sel.value] || sel.value);
}

function renderTransTable() {
  var src = (document.getElementById('trans-src')||{}).value || 'zh';
  var dst = (document.getElementById('trans-dst')||{}).value || 'en';
  var filter = (document.getElementById('trans-filter')||{}).value || '';
  var rowMap = {};
  _transAllRows.forEach(function(row) {
    rowMap[row.key] = row;
  });
  var allKeys = _transContentKeys.slice();
  var filtered = filter ? allKeys.filter(function(k) { return k.toLowerCase().indexOf(filter.toLowerCase()) !== -1; }) : allKeys;
  var count = document.getElementById('trans-key-count'); if (count) count.textContent = filtered.length + ' ' + t('editor.keyCount');
  var th1 = document.getElementById('trans-th-src'); if (th1) th1.textContent = t('trans.source') + ' (' + src + ')';
  var th2 = document.getElementById('trans-th-dst'); if (th2) th2.textContent = t('trans.translation') + ' (' + dst + ')';
  var empty = document.getElementById('trans-empty-msg');
  if (!filtered.length) {
    document.getElementById('trans-tbody').innerHTML = '';
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  var html = filtered.map(function(k) {
    var row = rowMap[k] || {key:k};
    var srcVal = row[src] || ''; var dstVal = row[dst] || '';
    return '<tr data-key="' + k + '" style="border-bottom:1px solid rgba(48,54,61,.4)">'
      + '<td style="padding:3px 8px;font-family:var(--mono);font-size:11px;color:var(--accent)">' + k + '</td>'
      + '<td style="padding:2px 4px"><input class="t-cell" style="width:100%;padding:3px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text);font:inherit;font-size:12px" data-key="' + k + '" data-locale="' + src + '" value="' + srcVal.replace(/"/g,'&quot;') + '" oninput="markTransMod(this)"></td>'
      + '<td style="padding:2px 4px"><input class="t-cell" style="width:100%;padding:3px 6px;border:1px solid ' + (dstVal ? 'var(--border)' : 'rgba(248,81,73,.4)') + ';border-radius:4px;background:var(--bg);color:var(--text);font:inherit;font-size:12px" data-key="' + k + '" data-locale="' + dst + '" value="' + dstVal.replace(/"/g,'&quot;') + '" oninput="markTransMod(this)"></td>'
      + '<td style="padding:2px 4px;text-align:center"><button class="btn btn-danger btn-sm" style="padding:2px 6px;font-size:10px" data-key="' + k.replace(/"/g,'&quot;') + '" onclick="transDelKey(this.dataset.key)">×</button></td>'
      + '</tr>';
  }).join('');
  document.getElementById('trans-tbody').innerHTML = html;
}

function filterTrans(q) { renderTransTable(); }
function markTransMod(inp) { inp.style.borderColor = 'var(--warn)'; }

function transAddKeyInline() {
  var inp = document.getElementById('trans-new-key');
  var k = (inp ? inp.value : '').trim();
  if (!k) return;
  if (_transContentKeys.indexOf(k) === -1) { _transContentKeys.push(k); _transAllRows.push({key:k}); }
  if (inp) inp.value = '';
  renderTransTable();
}

function transAddLocale() {
  var inp = document.getElementById('trans-add-locale');
  var loc = (inp ? inp.value : '').trim().toLowerCase().replace(/\s+/g,'');
  if (!loc) return;
  if (!/^[a-z]{2,8}(-[a-zA-Z]{2,4})?$/.test(loc)) { showToast('Invalid locale code, e.g. ja, zh-TW', 'err'); return; }
  if (_transLocales.indexOf(loc) !== -1) { showToast('Locale exists: ' + loc, 'err'); return; }
  _transLocales.push(loc);
  if (inp) inp.value = '';
  renderTransLocaleSelects();
  var dst = document.getElementById('trans-dst'); if (dst) { dst.value = loc; updateTransFlag('dst'); }
  renderTransTable();
  showToast(t('trans.addLang') + ': ' + loc, 'ok');
}

async function transDelKey(key) {
  if (!confirm(t('trans.confirmDelete') + key + ' ?')) return;
  _transAllRows = _transAllRows.filter(function(r) { return r.key !== key; });
  _transContentKeys = _transContentKeys.filter(function(k) { return k !== key; });
  renderTransTable();
}

async function saveTrans() {
  // Collect all table rows → rebuild i18n object
  var i18n = {};
  // Seed with all existing rows (preserves locales not shown in current view)
  _transAllRows.forEach(function(row) {
    i18n[row.key] = Object.assign({}, row);
    delete i18n[row.key].key;
  });
  // Overlay with current table input values
  document.querySelectorAll('#trans-tbody tr[data-key]').forEach(function(tr) {
    var key = tr.dataset.key;
    if (!i18n[key]) i18n[key] = {};
    tr.querySelectorAll('.t-cell').forEach(function(inp) {
      i18n[key][inp.dataset.locale] = inp.value;
    });
  });
  // Remove keys that were deleted
  Object.keys(i18n).forEach(function(k) {
    if (_transContentKeys.indexOf(k) === -1) delete i18n[k];
  });
  var r = await fetch('/api/admin/extensions/${ext.id}', {
    method:'PUT', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ i18n: i18n })
  });
  if ((await r.json()).ok) {
    document.querySelectorAll('#trans-tbody .t-cell').forEach(function(i) { i.style.borderColor='var(--border)'; });
    // Refresh local state
    _transAllRows = Object.keys(i18n).map(function(k) { return Object.assign({key:k}, i18n[k]); });
    showToast('✓ ' + t('trans.saved'), 'ok');
  } else showToast(t('editor.saveFailed'), 'err');
}

${AI_TRANSLATE_SCRIPT}

// ── Media panel (global browse — extensions reference any media by URL) ────────
var _mediaItems = [];
var _mediaRefs = [];

function getExtMediaRefs() {
  var content = edCSS.getValue() + edHTML.getValue() + edJS.getValue();
  var refs = [];
  var seen = {};
  [...content.matchAll(/\{\{img:([^}]+)\}\}/g)].forEach(function(m) { var key=m[1].trim(); if(key&&!seen['img:'+key]){seen['img:'+key]=true;refs.push({kind:'img',key:key});} });
  [...content.matchAll(/\{\{video:([^}]+)\}\}/g)].forEach(function(m) { var key=m[1].trim(); if(key&&!seen['video:'+key]){seen['video:'+key]=true;refs.push({kind:'video',key:key});} });
  return refs;
}

async function loadMediaPanel() {
  var loading = document.getElementById('media-loading'), empty = document.getElementById('media-empty-msg');
  if (loading) loading.style.display = 'flex';
  if (empty) empty.style.display = 'none';
  _mediaRefs = getExtMediaRefs();
  try {
    var r = await fetch('/api/admin/media?limit=200');
    var d = await r.json();
    _mediaItems = d.items || [];
  } catch(e) { _mediaItems = []; }
  if (loading) loading.style.display = 'none';
  filterMedia('');
}

function filterMedia(q) {
  var itemByKey = {};
  _mediaItems.forEach(function(m){ if(m.placeholderKey)itemByKey[m.placeholderKey]=m; });
  var refs = _mediaRefs.filter(function(ref){
    if(!q)return true;
    var m=itemByKey[ref.key];
    return (ref.key+' '+(m?m.filename:'')).toLowerCase().indexOf(q.toLowerCase())!==-1;
  });
  var cnt = document.getElementById('media-count'); if (cnt) cnt.textContent = refs.length + ' / ' + _mediaRefs.length + ' ' + t('editor.keyCount');
  var empty = document.getElementById('media-empty-msg');
  if (!refs.length) { document.getElementById('media-grid').innerHTML = ''; if (empty) empty.style.display = ''; return; }
  if (empty) empty.style.display = 'none';
  document.getElementById('media-grid').innerHTML = refs.map(function(ref){return renderMediaRefCard(ref,itemByKey[ref.key]);}).join('');
}

function renderMediaRefCard(ref,m){
  var token='{{'+ref.kind+':'+ref.key+'}}';
  var elementToken=ref.kind==='video'
    ? '<video src="'+token+'" controls></video>'
    : '<img src="'+token+'" alt="" loading="lazy" />';
  var exists=!!(m&&!String(m.d2Key||'').startsWith('__ref__'));
  var isVideo=exists&&(m.mimeType||'').startsWith('video/');
  var isImage=exists&&(m.mimeType||'').startsWith('image/');
  var thumb=exists&&isImage?'<img src="/media/'+m.d2Key+'" loading="lazy" onerror="this.remove()">':'<span>'+(ref.kind==='video'?'🎬':'📷')+'</span>';
  var meta=exists?(((m.sizeBytes||0)>1048576?((m.sizeBytes||0)/1048576).toFixed(1)+'MB':Math.round((m.sizeBytes||0)/1024)+'KB')+' · '+(m.mimeType||'')):t('editor.mediaMissing');
  return '<div class="media-ref-card'+(exists?'':' missing')+'">'
    +'<div class="media-ref-thumb" '+(exists?'data-preview-url="/media/'+String(m.d2Key||'').replace(/"/g,'&quot;')+'" data-preview-video="'+(isVideo?'1':'0')+'" onclick="openMediaPreview(this.dataset.previewUrl,!!Number(this.dataset.previewVideo))" style="cursor:zoom-in"':'')+'>'+thumb+'<span class="media-ref-badge">'+ref.kind+'</span></div>'
    +'<div class="media-ref-body"><div class="media-ref-key" title="'+token+'">'+token+'</div><div class="media-ref-name">'+(exists?m.filename:ref.key)+'</div><div class="media-ref-meta">'+meta+'</div></div>'
    +'<div class="media-ref-actions"><button class="btn btn-sm" data-copy="'+elementToken.replace(/"/g,'&quot;')+'" onclick="copyText(this.dataset.copy)">&lt;&gt;</button>'+(exists?'<button class="btn btn-sm" data-copy="'+token.replace(/"/g,'&quot;')+'" onclick="copyText(this.dataset.copy)">URL</button>':'')+'</div>'
    +'</div>';
}

// ── Media preview lightbox ────────────────────────────────────────────────────
function openMediaPreview(url, isVideo) {
  var ov=document.getElementById('media-preview-ov'), img=document.getElementById('media-preview-img'), vid=document.getElementById('media-preview-vid');
  if (!ov) return;
  if (isVideo) { img.style.display='none'; vid.style.display=''; vid.src=url; }
  else { vid.style.display='none'; img.style.display=''; img.src=url; }
  ov.style.display='flex';
}
function closeMediaPreview() {
  var ov=document.getElementById('media-preview-ov'), vid=document.getElementById('media-preview-vid');
  if (ov) ov.style.display='none';
  if (vid) { vid.pause(); vid.src=''; }
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var ov = document.getElementById('media-preview-ov');
    if (ov && ov.style.display !== 'none') { closeMediaPreview(); return; }
  }
});

// ── Utilities ─────────────────────────────────────────────────────────────────
function copyText(txt) {
  navigator.clipboard ? navigator.clipboard.writeText(txt).then(function(){showToast(t('media.copied'),'ok');}) : (function(){var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast(t('media.copied'),'ok');})();
}
function showToast(msg, type) {
  var t = document.getElementById('toast'); t.textContent = msg;
  t.className = 'toast toast-' + (type||'ok') + ' show';
  clearTimeout(t._tmr); t._tmr = setTimeout(function() { t.className = 'toast'; }, 2400);
}
</script>
</body></html>`;
}

import { ADMIN_I18N } from '../../services/i18n';
import { esc, blocksToEditorText } from './layout';
import { AI_TRANSLATE_CONTROLS, AI_TRANSLATE_SCRIPT } from './ai-translation';

const ACE = 'https://cdn.bootcdn.net/ajax/libs/ace/1.32.6';

/** Safely encode a value as JSON for embedding inside an HTML <script> block.
 *  JSON.stringify alone is unsafe because </script> in the data closes the tag. */
function safeJSON(v: unknown): string {
  return JSON.stringify(v)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

const ACE_THEMES = ['one_dark','monokai','github_dark','nord_dark','dracula','tomorrow_night_blue','tomorrow_night','tomorrow_night_bright','tomorrow_night_eighties','tomorrow','solarized_dark','solarized_light','gruvbox_dark_hard','gruvbox_light_hard','gruvbox','ambiance','chaos','chrome','clouds','clouds_midnight','cobalt','crimson_editor','dawn','dreamweaver','eclipse','github','gob','idle_fingers','iplastic','katzenmilch','kr_theme','kuroir','merbivore','merbivore_soft','mono_industrial','pastel_on_dark','sqlserver','terminal','textmate','twilight','vibrant_ink','xcode'];

// ── Shared editor CSS ─────────────────────────────────────────────────────────
export const SHARED_EDITOR_CSS = `
:root{--bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#e6edf3;--muted:#8b949e;--accent:#58a6ff;--danger:#f85149;--ok:#3fb950;--warn:#d2991d;--radius:8px;--font:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;--mono:"Cascadia Code","Consolas",monospace}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);font-size:14px;color:var(--text);background:var(--bg);height:100vh;overflow:hidden;display:flex;flex-direction:column}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px}
a{color:var(--accent);text-decoration:none}input:focus,textarea:focus{outline:none;border-color:var(--accent)!important}
/* Ace */
.ace_editor{font-family:var(--mono)!important;font-size:13px!important}
/* Topbar */
.topbar{height:44px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 14px;gap:10px;flex-shrink:0;z-index:100}
.t-right{margin-left:auto;display:flex;align-items:center;gap:6px}
/* Layout */
.ide-body{flex:1;display:flex;overflow:hidden;min-height:0}
/* Sidebar */
.ide-sb{width:240px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;flex-shrink:0}
.sb-hd{padding:9px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.sb-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.sb-tree{flex:1;overflow-y:auto;padding:3px 0}
.si-row{display:flex;align-items:center}
.si{display:flex;align-items:center;gap:6px;padding:5px 10px;color:var(--muted);font-size:13px;text-decoration:none;transition:.1s;border-left:2px solid transparent;flex:1;min-width:0}
.si:hover{color:var(--text);background:rgba(88,166,255,.05)}
.si.active{color:var(--text);background:rgba(88,166,255,.09);border-left-color:var(--accent)}
.si-category{cursor:default;color:var(--text);font-weight:700}
.si-category:hover{color:var(--text);background:transparent}
.si.child{padding-left:24px;font-size:12px}
.si-ic{font-size:9px;color:var(--accent);flex-shrink:0}
.si-lbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.icon-add{width:26px;height:26px;min-width:26px;padding:0;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;line-height:1}
.si-add{border:1px solid transparent;background:transparent;color:var(--muted);cursor:pointer;width:24px;height:24px;min-width:24px;padding:0;font-size:16px;font-weight:800;line-height:1;border-radius:6px;transition:.1s;flex-shrink:0;opacity:.45;display:inline-flex;align-items:center;justify-content:center;margin-right:6px}
.si-row:hover .si-add{opacity:1}
.si-add:hover{color:#fff;border-color:var(--ok);background:var(--ok)}
.sb-ft{border-top:1px solid var(--border);padding:7px 12px;font-size:11px;color:var(--muted);flex-shrink:0;display:flex;justify-content:space-between;align-items:center}
/* Main area */
.ide-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
/* Editor tabs */
.ed-tabs{height:36px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:stretch;flex-shrink:0}
.ed-tab{display:inline-flex;align-items:center;gap:5px;padding:0 14px;font-size:13px;font-weight:600;color:var(--muted);border:none;border-bottom:2px solid transparent;background:none;cursor:pointer;font-family:var(--font);transition:.1s;white-space:nowrap;text-decoration:none}
.ed-tab:hover{color:var(--text)}.ed-tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.ed-tab-sep{width:1px;background:var(--border);margin:8px 2px;flex-shrink:0}
.ed-tabs-right{margin-left:auto;display:flex;align-items:center;gap:6px;padding:0 8px}
/* Section info bar */
.ed-info{height:32px;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 12px;gap:8px;flex-shrink:0;font-size:12px;overflow:hidden}
#sec-name-wrap{position:relative;display:inline-flex;align-items:center}
#sec-name{font-weight:600;font-size:13px;cursor:text;padding:2px 5px;border-radius:4px;border:1px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px}
#sec-name:hover{border-color:var(--border);background:rgba(255,255,255,.04)}
#sec-name-input{font-weight:600;font-size:13px;padding:2px 5px;border:1px solid var(--accent);border-radius:4px;background:var(--bg);color:var(--text);font-family:var(--font);width:240px;position:absolute;left:0;top:50%;transform:translateY(-50%);visibility:hidden;pointer-events:none}
#sec-name-input:focus{outline:none;box-shadow:0 0 0 2px rgba(88,166,255,.2)}
.sec-slug{font-size:11px;color:var(--accent);font-family:var(--mono);flex-shrink:0;opacity:.8}
/* Editors wrap */
.ed-wrap{flex:1;overflow:hidden;position:relative;min-height:0}
.ed-panel{display:none;position:absolute;inset:0}
.ed-panel.active{display:block}
.ed-panel-ace{position:absolute;inset:0}
/* Translations panel */
.t-entry{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:4px;align-items:center;padding:3px 0;border-bottom:1px solid rgba(48,54,61,.5)}
.t-entry:hover{background:rgba(88,166,255,.03)}
.t-key{font-family:var(--mono);font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 4px}
.t-input{width:100%;padding:3px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text);font:inherit;font-size:12px;transition:.1s}
.t-input:focus{outline:none;border-color:var(--accent)}
.t-input.modified{border-color:var(--warn)}
/* Media panel */
.m-entry{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(48,54,61,.5)}
.m-key{font-family:var(--mono);font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis}
.m-status{font-size:11px;padding:2px 7px;border-radius:4px}
.m-status.ok{background:rgba(63,185,80,.12);color:var(--ok)}
.m-status.missing{background:rgba(248,81,73,.12);color:var(--danger)}
.media-ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}
.media-ref-card{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);overflow:hidden;display:flex;flex-direction:column;min-height:190px}
.media-ref-card.missing{border-style:dashed;border-color:rgba(210,153,29,.75)}
.media-ref-thumb{height:116px;background:var(--bg);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:28px;position:relative;overflow:hidden}
.media-ref-thumb img{width:100%;height:100%;object-fit:cover}
.media-ref-badge{position:absolute;top:7px;right:7px;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,.68);color:#fff;text-transform:uppercase}
.media-ref-body{padding:9px 10px;display:flex;flex-direction:column;gap:5px;flex:1}
.media-ref-key{font-family:var(--mono);font-size:11px;color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-ref-name{font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-ref-meta{font-size:11px;color:var(--muted)}
.media-ref-actions{display:flex;gap:6px;padding:0 10px 10px;margin-top:auto}
/* Buttons */
.btn{padding:5px 12px;border:1px solid var(--border);border-radius:var(--radius);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;text-decoration:none;background:transparent;color:var(--text)}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}.btn-primary:hover{opacity:.85;color:#fff}
.btn-danger{background:var(--danger);color:#fff;border-color:var(--danger)}.btn-danger:hover{opacity:.85;color:#fff}
.btn-ok{background:var(--ok);color:#fff;border-color:var(--ok)}.btn-ok:hover{opacity:.85;color:#fff}
.btn-sm{padding:3px 9px;font-size:12px}
.btn-group{display:flex;gap:6px;align-items:center}
kbd{font-size:11px;background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:2px 5px;color:var(--muted);font-family:var(--mono)}
/* Modals */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:2000;align-items:center;justify-content:center;backdrop-filter:blur(2px);display:none}
.modal-ov.open{display:flex}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;width:400px;max-width:calc(100vw - 32px)}
.modal-wide{width:520px}
.modal h3{margin:0 0 18px;font-size:16px;font-weight:700}
.modal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.modal-hd h3{margin:0}
.modal-close{background:none;border:none;color:var(--muted);cursor:pointer;font-size:20px;line-height:1;padding:2px 6px;border-radius:4px;transition:.1s}
.modal-close:hover{color:var(--text);background:rgba(255,255,255,.07)}
.mfg{margin-bottom:12px}
.mfg label{display:block;margin-bottom:4px;color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.mfg input,.mfg textarea,.mfg select{width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px}
.mfg textarea{min-height:80px;resize:vertical;font-family:var(--mono);font-size:12px}
.mfg-row{display:flex;gap:10px}.mfg-row>.mfg{flex:1}
.modal-footer{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}
/* Toast */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;opacity:0;pointer-events:none;transition:opacity .2s;z-index:9999;white-space:nowrap}
.toast.show{opacity:1}
.toast-ok{background:#122d1f;border:1px solid #1a3d2a;color:var(--ok)}
.toast-err{background:#2d1216;border:1px solid #5a1e27;color:var(--danger)}
.spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
/* Theme + lang dropdowns */
.sel-theme{background:var(--surface);border:1px solid var(--border);border-radius:5px;color:var(--text);font-size:11px;padding:3px 6px;cursor:pointer;font-family:var(--font);min-width:130px}
.sel-theme:focus{outline:none;border-color:var(--accent)}
.sel-theme option{background:var(--surface);color:var(--text)}
.lang-dd{position:relative}
.lang-dd-btn{display:flex;align-items:center;gap:5px;padding:3px 9px;border:1px solid var(--border);border-radius:5px;background:var(--surface);color:var(--text);cursor:pointer;font:inherit;font-size:11px;white-space:nowrap;height:28px}
.lang-dd-btn:hover{border-color:var(--accent)}
.lang-dd-menu{position:absolute;right:0;top:calc(100% + 4px);background:var(--surface);border:1px solid var(--border);border-radius:6px;list-style:none;margin:0;padding:3px 0;z-index:999;min-width:110px;display:none;box-shadow:0 4px 12px rgba(0,0,0,.4)}
.lang-dd-menu.open{display:block}
.lang-dd-menu li{display:flex;align-items:center;gap:7px;padding:6px 12px;cursor:pointer;font-size:12px;color:var(--text)}
.lang-dd-menu li:hover{background:rgba(88,166,255,.08);color:var(--accent)}
.lang-dd-menu li.active{color:var(--accent);font-weight:700}
`;

// ── Plugin (document) Editor ──────────────────────────────────────────────────
export function pluginEditor(
  plugin: any, allPlugins: any[], allSections: any[],
  activeSection: any | null, blocks: any[],
  editorTheme = '', customCss = '', customJs = '',
  sysI18n: Record<string, { zh: string; en: string }> = {}
): string {
  const roots: any[] = [], childMap = new Map<number, any[]>();
  for (const s of allSections) {
    if (!s.parentId) roots.push(s);
    else { if (!childMap.has(s.parentId)) childMap.set(s.parentId, []); childMap.get(s.parentId)!.push(s); }
  }
  const activeSectionId = activeSection?.id ?? -1;

  const treeHtml = roots.map((s: any) => {
    const active = s.id === activeSectionId;
    const children = childMap.get(s.id) || [];
    let h = `<div class="si-row">`;
    if (children.length > 0) {
      h += `<div class="si si-category">`;
      h += `<span class="si-ic">▾</span>`;
      h += `<span class="si-lbl" data-zh="${esc(s.titleZh || s.slug)}" data-en="${esc(s.titleEn || s.slug)}">${esc(s.titleZh || s.slug)}</span>`;
      h += `</div>`;
    } else {
      h += `<a href="?s=${s.id}" class="si${active ? ' active' : ''}">`;
      h += `<span class="si-ic">${active ? '▶' : '▷'}</span>`;
      h += `<span class="si-lbl" data-zh="${esc(s.titleZh || s.slug)}" data-en="${esc(s.titleEn || s.slug)}">${esc(s.titleZh || s.slug)}</span>`;
      h += `</a>`;
    }
    h += `<button class="si-add" onclick="openAddSub(${s.id},event)" title="添加子章节">+</button>`;
    h += `</div>`;
    for (const child of children) {
      const ca = child.id === activeSectionId;
      h += `<a href="?s=${child.id}" class="si child${ca ? ' active' : ''}">`;
      h += `<span class="si-ic">${ca ? '▸' : '·'}</span>`;
      h += `<span class="si-lbl" data-zh="${esc(child.titleZh || child.slug)}" data-en="${esc(child.titleEn || child.slug)}">${esc(child.titleZh || child.slug)}</span>`;
      h += `</a>`;
    }
    return h;
  }).join('');

  const initialText = blocksToEditorText(blocks);
  const activeTheme = editorTheme || 'one_dark';
  const editorI18n: Record<string, { zh: string; en: string }> = { ...ADMIN_I18N };
  for (const [key, entry] of Object.entries(sysI18n)) {
    editorI18n[key] = {
      ...(editorI18n[key] || { zh: '', en: '' }),
      ...(entry.zh ? { zh: entry.zh } : {}),
      ...(entry.en ? { en: entry.en } : {}),
    };
  }

  return String.raw`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(plugin.name)} — 编辑器</title>
<link rel="preconnect" href="https://cdn.bootcdn.net">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css">
<script src="${ACE}/ace.min.js"></script>
<script src="${ACE}/ext-language_tools.min.js"></script>
<script src="${ACE}/ext-searchbox.min.js"></script>
<script src="${ACE}/ext-beautify.min.js"></script>
<script src="${ACE}/theme-${esc(activeTheme)}.min.js"></script>
<style>${SHARED_EDITOR_CSS}</style>
</head><body>

<!-- ── Topbar ── -->
<div class="topbar">
  <span style="font-weight:700;color:var(--accent)">📁 ${esc(plugin.name)}</span>
  <div class="t-right">
    <a href="/admin/plugins" class="btn btn-sm" style="color:var(--muted)" data-i18n="editor.back">← 文档列表</a>
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
    <a href="/${esc(plugin.slug)}" target="_blank" class="btn btn-sm" data-i18n="editor.preview">👁 预览</a>
  </div>
</div>

<!-- ── Body ── -->
<div class="ide-body">
  <!-- Sidebar -->
  <aside class="ide-sb">
    <div class="sb-hd" style="flex-direction:column;align-items:stretch;gap:6px;padding:9px 10px">
      <div style="display:flex;gap:5px;align-items:center">
        <select class="sel-theme" id="sel-doc" style="flex:1;font-size:12px;padding:5px 8px;min-width:0">
          ${allPlugins.map((p: any) => `<option value="${p.id}" ${p.id === plugin.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
        </select>
        <button class="btn btn-sm btn-ok icon-add" onclick="openInlinePanel('newdoc')" data-i18n-title="editor.newDoc" title="新建文档">+</button>
      </div>
    </div>
    <div class="sb-hd">
      <span class="sb-lbl" data-i18n="editor.sections">章节</span>
      <button class="btn btn-sm btn-ok icon-add" onclick="openInlinePanel('addsec')" data-i18n-title="editor.addSection" title="添加顶级章节">+</button>
    </div>
    <div class="sb-tree">
      ${allSections.length === 0
        ? `<div style="padding:24px 12px;text-align:center;color:var(--muted);font-size:12px"><span data-i18n="editor.noSections">暂无章节</span><br><span data-i18n="editor.createHint">点击 + 创建</span></div>`
        : treeHtml}
    </div>
    <div class="sb-ft"><span>${allSections.length} <span data-i18n="editor.sectionsCount">个章节</span></span></div>
  </aside>

  <!-- Main editor area -->
  <main class="ide-main">
    <!-- Tab bar -->
    <div class="ed-tabs">
      <button class="ed-tab" id="etab-css"  onclick="switchEdTab('css',this)"
        data-i18n-title="editor.cssScopeTitle" title="文档级 CSS，作用于当前文档前台页面">
        CSS<span id="css-dot" style="color:var(--warn);font-size:9px"></span>
      </button>
      <button class="ed-tab active" id="etab-html" onclick="switchEdTab('html',this)"
        data-i18n-title="editor.htmlScopeTitle" title="当前章节 HTML 内容">HTML</button>
      <button class="ed-tab" id="etab-js"   onclick="switchEdTab('js',this)"
        data-i18n-title="editor.jsScopeTitle" title="文档级 JS，作用于当前文档前台页面">
        JS<span id="js-dot" style="color:var(--warn);font-size:9px"></span>
      </button>
      <div class="ed-tab-sep"></div>
      <button class="ed-tab" id="etab-trans" onclick="switchEdTab('trans',this)"
        style="${activeSection ? '' : 'opacity:.4;pointer-events:none'}" data-i18n="editor.translations">🌐 翻译</button>
      <button class="ed-tab" id="etab-media" onclick="switchEdTab('media',this)"
        style="${activeSection ? '' : 'opacity:.4;pointer-events:none'}" data-i18n="editor.media">📷 媒体</button>
      <div class="ed-tabs-right">
        <!-- Editor buttons (shown for css/html/js) -->
        <button class="btn btn-sm ed-only" id="fmt-btn" onclick="formatActive()"
          style="${activeSection ? '' : 'display:none'}"><span data-i18n="editor.format">⇥ 格式化</span> <kbd>Ctrl+Shift+F</kbd></button>
        <button class="btn btn-sm ed-only" id="secset-btn" onclick="openInlinePanel('secset')"
          style="${activeSection ? '' : 'display:none'}" data-i18n="editor.settings">⚙ 设置</button>
        <button class="btn btn-primary btn-sm ed-only" id="save-btn" onclick="saveAll()"
          style="${activeSection ? '' : 'display:none'}"><span data-i18n="editor.save">💾 保存</span> <kbd>Ctrl+S</kbd></button>
        <!-- Trans buttons (shown for trans tab) -->
        <button class="btn btn-sm trans-only" id="trans-scan-btn" onclick="loadTransPanel()" style="display:none" data-i18n="editor.scan">↻ 扫描</button>
        <button class="btn btn-ok btn-sm trans-only" id="trans-save-btn" onclick="saveTrans()" style="display:none" data-i18n="editor.saveTranslations">💾 保存翻译</button>
        <!-- Media buttons (shown for media tab) -->
        <button class="btn btn-sm media-only" id="media-refresh-btn" onclick="loadMediaPanel()" style="display:none" data-i18n="editor.scan">↻ 扫描</button>
      </div>
    </div>

    <!-- Section info bar -->
    <div class="ed-info">
      <span id="sec-name-wrap" style="${activeSection ? '' : 'display:none'}">
        <span id="sec-name" onclick="startRename()" data-i18n-title="editor.clickRename" title="点击重命名">${esc(activeSection?.titleZh || activeSection?.slug || '')}</span>
        <input id="sec-name-input" value="${esc(activeSection?.titleZh || activeSection?.slug || '')}"
          onblur="finishRename()" onkeydown="renameKey(event)" autocomplete="off">
      </span>
      <span class="sec-slug" style="${activeSection ? '' : 'display:none'}">#${esc(activeSection?.slug || '')}</span>
      <span id="ed-hint" style="${activeSection ? 'display:none' : 'color:var(--muted)'}" data-i18n="editor.selectHint">← 选择或创建章节</span>
      <span style="flex:1"></span>
      <span id="ed-tab-label" style="font-size:11px;color:var(--muted)"></span>
    </div>

    <!-- Editor + view panels (all absolute, one active at a time) -->
    <div class="ed-wrap">
      <!-- CSS editor -->
      <div class="ed-panel" id="panel-css">
        <div id="ace-css" class="ed-panel-ace"></div>
      </div>
      <!-- HTML editor -->
      <div class="ed-panel active" id="panel-html">
        <div id="ace-html" class="ed-panel-ace"></div>
        <div id="ed-placeholder" style="position:absolute;inset:0;display:${activeSection ? 'none' : 'flex'};align-items:center;justify-content:center;background:var(--bg);color:var(--muted);font-size:14px;pointer-events:none" data-i18n="editor.selectHint">← 从左侧选择章节开始编辑</div>
        <div id="ed-loading" style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(13,17,23,.85);z-index:100;flex-direction:column;gap:12px"><div class="spinner"></div><span style="color:var(--muted);font-size:13px" data-i18n="editor.loading">加载中…</span></div>
      </div>
      <!-- JS editor -->
      <div class="ed-panel" id="panel-js">
        <div id="ace-js" class="ed-panel-ace"></div>
      </div>

      <!-- Translation view panel -->
      <div class="ed-panel" id="panel-trans" style="overflow:auto;background:var(--bg)">
        <div style="padding:12px 16px;min-width:600px">
          <!-- Toolbar -->
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:10;border-bottom:1px solid var(--border)">
            <input id="trans-filter" data-i18n-placeholder="editor.searchKey" placeholder="搜索 key…"
              style="padding:5px 9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text);font:inherit;font-size:12px;flex:1;min-width:120px;max-width:160px;outline:none"
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
          <!-- Table -->
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
            <span data-i18n="editor.noTransKeys">当前章节内容没有 {{t:key}} 引用</span>
          </div>
        </div>
      </div>

      <!-- Media view panel -->
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
          <div id="media-empty-msg" style="display:none;padding:32px;text-align:center;color:var(--muted);font-size:13px">
            <span data-i18n="media.empty">暂无媒体文件</span>
          </div>
          <div id="media-loading" style="display:none;padding:32px;text-align:center;color:var(--muted);font-size:13px">
            <div class="spinner" style="margin:0 auto 8px"></div>
            <span data-i18n="editor.loading">加载中…</span>
          </div>
        </div>
      </div>

    </div>
  </main>
</div>

<!-- Form modals -->
<div class="modal-ov" id="modal-newdoc" onclick="if(event.target===this)closeInlinePanel()">
  <div class="modal">
    <div class="modal-hd"><h3 data-i18n="editor.newDoc">新建文档</h3><button class="modal-close" onclick="closeInlinePanel()">×</button></div>
    <div class="mfg"><label data-i18n="docs.slug">文档标识 (slug)</label><input id="nd-slug" placeholder="my-project" autocomplete="off"></div>
    <div class="mfg"><label data-i18n="docs.name">名称</label><input id="nd-name" placeholder="My Project" autocomplete="off"></div>
    <div class="modal-footer"><button class="btn" onclick="closeInlinePanel()" data-i18n="docs.cancel">取消</button><button class="btn btn-primary" onclick="doCreateDoc()" data-i18n="docs.createBtn">创建</button></div>
  </div>
</div>
<div class="modal-ov" id="modal-addsec" onclick="if(event.target===this)closeInlinePanel()">
  <div class="modal">
    <div class="modal-hd"><h3 data-i18n="editor.addSec">添加章节</h3><button class="modal-close" onclick="closeInlinePanel()">×</button></div>
    <div class="mfg"><label data-i18n="editor.nameZh">名称（中文）</label><input id="as-title" placeholder="如：安装说明" autocomplete="off"></div>
    <div class="mfg"><label data-i18n="editor.slugAnchor">Slug（URL锚点）</label><input id="as-slug" placeholder="installation" autocomplete="off"></div>
    <div class="modal-footer"><button class="btn" onclick="closeInlinePanel()" data-i18n="docs.cancel">取消</button><button class="btn btn-primary" onclick="doAddSection(null)" data-i18n="docs.createBtn">创建</button></div>
  </div>
</div>
<div class="modal-ov" id="modal-addsub" onclick="if(event.target===this)closeInlinePanel()">
  <div class="modal">
    <div class="modal-hd"><h3 data-i18n="editor.addSub">添加子章节</h3><button class="modal-close" onclick="closeInlinePanel()">×</button></div>
    <input type="hidden" id="sub-parent-id">
    <div class="mfg"><label data-i18n="editor.nameZh">名称（中文）</label><input id="sub-title" data-i18n-placeholder="editor.subName" placeholder="子章节名称" autocomplete="off"></div>
    <div class="mfg"><label data-i18n="editor.slugAnchor">Slug（URL锚点）</label><input id="sub-slug" placeholder="subsection-slug" autocomplete="off"></div>
    <div class="modal-footer"><button class="btn" onclick="closeInlinePanel()" data-i18n="docs.cancel">取消</button><button class="btn btn-primary" onclick="doAddSection(+document.getElementById('sub-parent-id').value)" data-i18n="docs.createBtn">创建</button></div>
  </div>
</div>
<div class="modal-ov" id="modal-secset" onclick="if(event.target===this)closeInlinePanel()">
  <div class="modal modal-wide">
    <div class="modal-hd"><h3 data-i18n="editor.secSettingsTitle">章节设置</h3><button class="modal-close" onclick="closeInlinePanel()">×</button></div>
    <div class="mfg-row">
      <div class="mfg"><label data-i18n="editor.nameZh">名称（中文）</label><input id="ss-title" value="${esc(activeSection?.titleZh || activeSection?.slug || '')}"></div>
      <div class="mfg"><label>Slug</label><input id="ss-slug" value="${esc(activeSection?.slug || '')}"></div>
    </div>
    <div class="modal-footer" style="justify-content:space-between">
      <button class="btn btn-danger" onclick="doDelSection()" data-i18n="editor.deleteSec">删除章节</button>
      <div class="btn-group"><button class="btn" onclick="closeInlinePanel()" data-i18n="docs.cancel">取消</button><button class="btn btn-primary" onclick="doSaveSecSettings()" data-i18n="docs.save">保存</button></div>
    </div>
  </div>
</div>


<!-- Media preview lightbox -->
<div id="media-preview-ov" style="position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:3000;display:none;align-items:center;justify-content:center;cursor:zoom-out" onclick="closeMediaPreview()">
  <img id="media-preview-img" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:8px;box-shadow:0 0 60px rgba(0,0,0,.6)">
  <video id="media-preview-vid" controls style="max-width:90vw;max-height:90vh;display:none;border-radius:8px"></video>
  <button style="position:absolute;top:16px;right:20px;background:none;border:none;color:#fff;font-size:24px;cursor:pointer;opacity:.7;padding:4px 8px" onclick="closeMediaPreview()">✕</button>
</div>
<!-- Shared replace-file input (one per session) -->
<input type="file" id="media-replace-input" style="display:none" accept="image/*,video/*,.gif,.webp">
<input type="file" id="media-upload-ref-input" style="display:none" accept="image/*,video/*,.gif,.webp">

<div class="toast" id="toast"></div>

<script>
var SECTION_ID = ${activeSection ? activeSection.id : 'null'};
var SECTION_SLUG = '${esc(activeSection?.slug || '')}';
var PLUGIN_ID = ${plugin.id};
var INITIAL_TEXT = ${safeJSON(initialText)};
var ALL_SECTIONS_COUNT = ${allSections.length};
var ACTIVE_THEME = '${esc(activeTheme)}';
var ACE_BASE = '${ACE}';
var ACE_THEMES = ${safeJSON(ACE_THEMES)};
function initialEditorLang() {
  var cookieLang = (document.cookie.match(/(?:^|;\s*)lang=([^;]+)/)||[])[1];
  if (cookieLang) return cookieLang === 'en' ? 'en' : 'zh';
  var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
  return nav.indexOf('zh') === 0 ? 'zh' : 'en';
}
var EDITOR_LANG = initialEditorLang();
if (!(document.cookie.match(/(?:^|;\s*)lang=([^;]+)/)||[])[1]) {
  fetch('/api/set-lang?lang=' + EDITOR_LANG).catch(function(){});
}
var EDITOR_I18N = ${safeJSON(editorI18n)};
function t(key) {
  var entry = EDITOR_I18N[key];
  return entry ? (entry[EDITOR_LANG] || entry.zh || entry.en || key) : key;
}
function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}
function setSaveButtonIdle(btn) {
  btn.innerHTML = '<span data-i18n="editor.save">' + t('editor.save') + '</span> <kbd>Ctrl+S</kbd>';
}
function setTabLabel(name) {
  var labels = {
    css: 'CSS - ' + t('editor.docStyle'),
    html: 'HTML - ' + t('editor.sectionContent'),
    js: 'JS - ' + t('editor.docScript'),
    trans: t('editor.translations') + ' - ' + t('editor.currentSection'),
    media: t('editor.media') + ' - ' + t('editor.currentSection')
  };
  var lbl = document.getElementById('ed-tab-label');
  if (lbl) lbl.textContent = labels[name] || '';
}

// ── Ace setup ────────────────────────────────────────────────────────────────
ace.config.set('basePath', ACE_BASE);
ace.require('ace/ext/language_tools');
var beautify = null;
try { beautify = ace.require('ace/ext/beautify'); } catch(e) {}

var themeLoaded = {}; themeLoaded[ACTIVE_THEME] = true;
function loadTheme(t, cb) {
  if (themeLoaded[t]) { cb(); return; }
  var s = document.createElement('script'); s.src = ACE_BASE + '/theme-' + t + '.min.js';
  s.onload = function() { themeLoaded[t] = true; cb(); };
  document.head.appendChild(s);
}
function switchTheme(t) {
  loadTheme(t, function() {
    [edHTML, edCSS, edJS].forEach(function(e) { if(e) e.setTheme('ace/theme/' + t); });
    localStorage.setItem('ace-theme', t);
    ACTIVE_THEME = t;
    fetch('/api/admin/settings', {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({editor_theme:t})}).catch(function(){});
  });
}

var ACE_OPTS = {
  enableBasicAutocompletion:true,enableSnippets:true,enableLiveAutocompletion:true,
  fontSize:'13px',fontFamily:'"Cascadia Code","Consolas","Courier New",monospace',
  tabSize:2,useSoftTabs:true,showPrintMargin:false,wrap:true,
  scrollPastEnd:.3,displayIndentGuides:true,mergeUndoDeltas:'always'
};

// HTML editor
var edHTML = ace.edit('ace-html');
edHTML.setTheme('ace/theme/' + ACTIVE_THEME);
edHTML.session.setMode('ace/mode/html');
edHTML.setOptions(ACE_OPTS);
if (SECTION_ID) { edHTML.setValue(INITIAL_TEXT, -1); edHTML.focus(); }
else { edHTML.setReadOnly(true); }
edHTML.session.on('change', function() { /* content change - panels reload on tab switch */ });
// Force resize after layout settles
setTimeout(function() { edHTML.resize(true); edCSS.resize(true); edJS.resize(true); }, 50);

// CSS editor (document-level)
var edCSS = ace.edit('ace-css');
edCSS.setTheme('ace/theme/' + ACTIVE_THEME);
edCSS.session.setMode('ace/mode/css');
edCSS.setOptions(ACE_OPTS);
edCSS.setValue(${safeJSON(customCss)}, -1);
var cssSaved = ${safeJSON(customCss)};
edCSS.session.on('change', function() {
  document.getElementById('css-dot').textContent = edCSS.getValue() !== cssSaved ? ' ●' : '';
});

// JS editor (document-level)
var edJS = ace.edit('ace-js');
edJS.setTheme('ace/theme/' + ACTIVE_THEME);
edJS.session.setMode('ace/mode/javascript');
edJS.setOptions(ACE_OPTS);
edJS.setValue(${safeJSON(customJs)}, -1);
var jsSaved = ${safeJSON(customJs)};
edJS.session.on('change', function() {
  document.getElementById('js-dot').textContent = edJS.getValue() !== jsSaved ? ' ●' : '';
});

// ── Theme selector ────────────────────────────────────────────────────────────
(function() {
  var sel = document.getElementById('sel-theme');
  ACE_THEMES.forEach(function(t) {
    var o = document.createElement('option'); o.value = t;
    o.textContent = t.replace(/_/g,' '); if (t === ACTIVE_THEME) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener('change', function() { switchTheme(this.value); });
})();

// ── Doc switcher ──────────────────────────────────────────────────────────────
var selDoc = document.getElementById('sel-doc');
if (selDoc) selDoc.addEventListener('change', function() {
  location.href = '/admin/plugins/' + this.value + '/editor';
});

// ── Active editor tab ─────────────────────────────────────────────────────────
var ACTIVE_ED_TAB = 'html';
var FORM_PANELS = ['newdoc','addsec','addsub','secset'];
var ALL_PANELS  = ['css','html','js','trans','media'];
var ED_TAB_STORAGE_KEY = 'docforge.editor.tab.' + PLUGIN_ID;
function validEdTab(name) {
  return ['css','html','js','trans','media'].indexOf(name) !== -1;
}
function normalizeEdTab(name) {
  if (!validEdTab(name)) return 'html';
  if (!SECTION_ID && (name === 'trans' || name === 'media')) return 'html';
  return name;
}
function initialEdTab() {
  try { return normalizeEdTab(localStorage.getItem(ED_TAB_STORAGE_KEY) || 'html'); }
  catch(e) { return 'html'; }
}
function switchEdTab(name, btn) {
  name = normalizeEdTab(name);
  ACTIVE_ED_TAB = name;
  try { localStorage.setItem(ED_TAB_STORAGE_KEY, name); } catch(e) {}
  document.querySelectorAll('.ed-tab[id^="etab-"]').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  ALL_PANELS.forEach(function(n) {
    var el = document.getElementById('panel-' + n); if (el) el.classList.toggle('active', n === name);
  });
  // Show/hide contextual toolbar buttons
  var isEd = (name === 'css' || name === 'html' || name === 'js');
  document.querySelectorAll('.ed-only').forEach(function(el) { el.style.display = isEd ? '' : 'none'; });
  document.querySelectorAll('.trans-only').forEach(function(el) { el.style.display = name === 'trans' ? '' : 'none'; });
  document.querySelectorAll('.media-only').forEach(function(el) { el.style.display = name === 'media' ? '' : 'none'; });
  // Keep fmt/secset/save hidden if no section selected
  if (!SECTION_ID && isEd) {
    ['fmt-btn','secset-btn','save-btn'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.style.display = 'none';
    });
  }
  setTabLabel(name);
  // Resize active ace editor
  var eds = {css: edCSS, html: edHTML, js: edJS};
  if (eds[name]) setTimeout(function() { eds[name].resize(); }, 10);
  // Load panel data on first visit
  if (name === 'trans') loadTransPanel();
  if (name === 'media') loadMediaPanel();
}
switchEdTab(initialEdTab(), document.getElementById('etab-' + initialEdTab()));

function openInlinePanel(panelName) {
  if (FORM_PANELS.indexOf(panelName) === -1) return;
  document.querySelectorAll('.modal-ov[id^="modal-"]').forEach(function(el) { el.classList.remove('open'); });
  var modal = document.getElementById('modal-' + panelName);
  if (!modal) return;
  modal.classList.add('open');
  var inp = modal.querySelector('input:not([type=hidden])');
  if (inp) setTimeout(function() { inp.focus(); }, 50);
}

function closeInlinePanel() {
  document.querySelectorAll('.modal-ov[id^="modal-"]').forEach(function(el) { el.classList.remove('open'); });
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
function bindCommands(ed) {
  ed.commands.addCommand({name:'save',bindKey:{win:'Ctrl-S',mac:'Command-S'},exec:saveAll});
  ed.commands.addCommand({name:'format',bindKey:{win:'Ctrl-Shift-F',mac:'Command-Shift-F'},exec:function(e){
    if (beautify && typeof beautify.beautify === 'function') beautify.beautify(e.session);
    else showToast(t('editor.fmtNotLoaded'),'err');
  }});
  ed.commands.addCommand({name:'insertTKey',bindKey:{win:'Ctrl-Shift-T',mac:'Command-Shift-T'},exec:function(e){
    var p = e.getCursorPosition(); e.insert('{{t:}}'); e.moveCursorTo(p.row, p.column + 4);
  }});
}
bindCommands(edHTML); bindCommands(edCSS); bindCommands(edJS);

function formatActive() {
  var eds = {css: edCSS, html: edHTML, js: edJS};
  var ed = eds[ACTIVE_ED_TAB];
  if (ed && beautify && typeof beautify.beautify === 'function') beautify.beautify(ed.session);
  else showToast(t('editor.fmtNotLoaded'), 'err');
}

// ── Section loading ───────────────────────────────────────────────────────────
document.querySelectorAll('.sb-tree .si[href]').forEach(function(l) {
  l.addEventListener('click', function(e) {
    e.preventDefault();
    var m = l.getAttribute('href').match(/[?&]s=(\d+)/);
    if (m) _loadSection(Number(m[1]), l);
  });
});

async function _loadSection(sid, clk) {
  var ld = document.getElementById('ed-loading');
  if (ld) ld.style.display = 'flex';
  try {
    var r = await fetch('/api/admin/sections/' + sid + '/blocks');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    var d = await r.json(), sec = d.section, blks = d.blocks;
    SECTION_ID = sec.id; SECTION_SLUG = sec.slug;
    history.pushState({s: sid}, '', '?s=' + sid);
    document.querySelectorAll('.sb-tree .si').forEach(function(si) { si.classList.remove('active'); });
    if (clk) clk.classList.add('active');
    var nm = document.getElementById('sec-name'),
        inp = document.getElementById('sec-name-input'),
        slg = document.querySelector('.sec-slug'),
        h = document.getElementById('ed-hint'),
        w = document.getElementById('sec-name-wrap');
    var secTitle = (EDITOR_LANG === 'en' ? sec.titleEn : sec.titleZh) || sec.slug;
    if (w) w.style.display = '';
    if (nm) nm.textContent = secTitle;
    if (inp) inp.value = secTitle;
    if (slg) { slg.textContent = '#' + sec.slug; slg.style.display = ''; }
    if (h) h.style.display = 'none';
    ['fmt-btn','secset-btn','save-btn'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.style.display = '';
    });
    ['etab-trans','etab-media'].forEach(function(id) {
      var el = document.getElementById(id); if (el) { el.style.opacity = ''; el.style.pointerEvents = ''; }
    });
    var ss = document.getElementById('ss-title'), sk = document.getElementById('ss-slug');
    if (ss) ss.value = sec.titleZh || ''; if (sk) sk.value = sec.slug || '';
    var ph = document.getElementById('ed-placeholder'); if (ph) ph.style.display = 'none';
    edHTML.setReadOnly(false);
    edHTML.setValue(blocksToText(blks), -1);
    var rememberedTab = initialEdTab();
    switchEdTab(rememberedTab, document.getElementById('etab-' + rememberedTab));
    var focusedEditor = {css: edCSS, html: edHTML, js: edJS}[ACTIVE_ED_TAB];
    if (focusedEditor) focusedEditor.focus();
  } catch(e) { showToast('加载失败: ' + e.message, 'err'); }
  if (ld) ld.style.display = 'none';
}
window.addEventListener('popstate', function(e) {
  if (e.state && e.state.s) {
    var l = document.querySelector('.sb-tree .si[href="?s=' + e.state.s + '"]');
    _loadSection(e.state.s, l);
  }
});

// ── Save ──────────────────────────────────────────────────────────────────────
async function saveAll() {
  var btn = document.getElementById('save-btn');
  if (btn) { btn.disabled = true; btn.textContent = t('editor.saving'); }
  try {
    var tasks = [];
    // Save HTML (section content) if section is selected
    if (SECTION_ID) {
      var bl = textToBlocks(edHTML.getValue());
      tasks.push(fetch('/api/admin/sections/' + SECTION_ID + '/blocks-bulk', {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({blocks: bl})
      }).then(r => r.json()));
    }
    // Save CSS if modified
    var cssVal = edCSS.getValue();
    if (cssVal !== cssSaved) {
      tasks.push(fetch('/api/admin/plugins/' + PLUGIN_ID, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({customCss: cssVal})
      }).then(r => { if (r.ok) { cssSaved = cssVal; document.getElementById('css-dot').textContent = ''; } }));
    }
    // Save JS if modified
    var jsVal = edJS.getValue();
    if (jsVal !== jsSaved) {
      tasks.push(fetch('/api/admin/plugins/' + PLUGIN_ID, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({customJs: jsVal})
      }).then(r => { if (r.ok) { jsSaved = jsVal; document.getElementById('js-dot').textContent = ''; } }));
    }
    await Promise.all(tasks);
    showToast('✓ ' + t('trans.saved'), 'ok');
  } catch(e) { showToast(t('editor.saveFailed') + ': ' + e.message, 'err'); }
  finally {
    if (btn) { btn.disabled = false; setSaveButtonIdle(btn); }
  }
}

// ── Translation panel ──────────────────────────────────────────────────────────
var _transAllRows = []; // all key/locale/value rows for this plugin
var _transContentKeys = []; // keys found in current HTML content
var _transLocales = ['zh', 'en'];

async function loadTransPanel() {
  if (!SECTION_ID) return;
  // Scan current HTML for {{t:key}} refs
  var html = edHTML.getValue();
  _transContentKeys = [...new Set([...html.matchAll(/\{\{t:([^}]+)\}\}/g)].map(function(m){return m[1].trim();}))];
  if (_transContentKeys.length) {
    await fetch('/api/admin/translations/collect', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({pluginId: PLUGIN_ID, html: html})
    }).catch(function(){});
  }
  // Fetch all plugin translations
  try {
    var r = await fetch('/api/admin/plugins/' + PLUGIN_ID + '/translations');
    if (r.ok) {
      var rows = await r.json(); // [{key, zh, en, ...}]
      _transAllRows = rows;
      // Collect active locales
      var locs = new Set(['zh', 'en']);
      rows.forEach(function(row) { Object.keys(row).filter(function(k){return k!=='key';}).forEach(function(l){locs.add(l);}); });
      _transLocales = [...locs];
    }
  } catch(e) {}
  renderTransLocaleSelects();
  renderTransTable();
}

function renderTransLocaleSelects() {
  var src = document.getElementById('trans-src');
  var dst = document.getElementById('trans-dst');
  if (!src || !dst) return;
  var oldSrc = src.value;
  var oldDst = dst.value;
  var opts = _transLocales.map(function(l){ return '<option value="' + l + '">' + transLocaleLabel(l) + '</option>'; }).join('');
  src.innerHTML = opts; dst.innerHTML = opts;
  var preferredSrc = oldSrc && _transLocales.indexOf(oldSrc) !== -1
    ? oldSrc
    : (_transLocales.indexOf(EDITOR_LANG) !== -1 ? EDITOR_LANG : (_transLocales[0] || 'zh'));
  var preferredDst = oldDst && oldDst !== preferredSrc && _transLocales.indexOf(oldDst) !== -1
    ? oldDst
    : pickDefaultTargetLocale(preferredSrc);
  src.value = preferredSrc;
  dst.value = preferredDst;
  updateTransFlag('src'); updateTransFlag('dst');
}

function transLocaleLabel(code) {
  var names = {
    zh: '中文',
    en: 'English',
    'zh-TW': '中文 (繁體)',
    ja: '日本語',
    ko: '한국어',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    pt: 'Português',
    ru: 'Русский',
    ar: 'العربية'
  };
  return names[code] || code;
}

function pickDefaultTargetLocale(src) {
  if (src === 'zh' && _transLocales.indexOf('en') !== -1) return 'en';
  if (src !== 'zh' && _transLocales.indexOf('zh') !== -1) return 'zh';
  for (var i = 0; i < _transLocales.length; i++) {
    if (_transLocales[i] !== src) return _transLocales[i];
  }
  return src || 'en';
}

function updateTransFlag(which) {
  var sel = document.getElementById('trans-' + which);
  var flag = document.getElementById('trans-' + which + '-flag');
  if (!sel || !flag) return;
  var COUNTRIES = {zh:'cn','zh-TW':'tw',ja:'jp',ko:'kr',en:'us',de:'de',fr:'fr',es:'es',pt:'br',ru:'ru',ar:'sa'};
  flag.className = 'fi fi-' + (COUNTRIES[sel.value] || sel.value);
}

function renderTransTable() {
  var src = (document.getElementById('trans-src') || {}).value || 'zh';
  var dst = (document.getElementById('trans-dst') || {}).value || 'en';
  var filter = (document.getElementById('trans-filter') || {}).value || '';
  var onlyRef = false; // show all keys in content
  // Build a key→{locale→value} map
  var rowMap = {};
  _transAllRows.forEach(function(row) {
    if (!rowMap[row.key]) rowMap[row.key] = {};
    Object.keys(row).filter(function(k){return k!=='key';}).forEach(function(l){ rowMap[row.key][l] = row[l] || ''; });
  });
  // Keys to show: only keys referenced in current section HTML + manually added ones
  var allKeys = _transContentKeys.slice();
  var filtered = filter
    ? allKeys.filter(function(k){ return k.toLowerCase().indexOf(filter.toLowerCase()) !== -1; })
    : allKeys;

  var count = document.getElementById('trans-key-count');
  if (count) count.textContent = filtered.length + ' ' + t('editor.keyCount');
  var th1 = document.getElementById('trans-th-src'); if (th1) th1.textContent = t('trans.source') + ' (' + src + ')';
  var th2 = document.getElementById('trans-th-dst'); if (th2) th2.textContent = t('trans.translation') + ' (' + dst + ')';
  var empty = document.getElementById('trans-empty-msg');
  if (filtered.length === 0) {
    document.getElementById('trans-tbody').innerHTML = '';
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  var html = filtered.map(function(k) {
    var srcVal = (rowMap[k] && rowMap[k][src]) ? rowMap[k][src] : '';
    var dstVal = (rowMap[k] && rowMap[k][dst]) ? rowMap[k][dst] : '';
    var inContent = _transContentKeys.indexOf(k) !== -1;
    return '<tr data-key="' + k + '" style="border-bottom:1px solid rgba(48,54,61,.4)">'
      + '<td style="padding:3px 8px;font-family:var(--mono);font-size:11px;color:' + (inContent ? 'var(--accent)' : 'var(--muted)') + '">' + k + '</td>'
      + '<td style="padding:2px 4px"><input class="t-cell" style="width:100%;padding:3px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text);font:inherit;font-size:12px" data-key="' + k + '" data-locale="' + src + '" value="' + srcVal.replace(/"/g,'&quot;') + '" oninput="markTransMod(this)"></td>'
      + '<td style="padding:2px 4px"><input class="t-cell' + (dstVal ? '' : ' t-missing') + '" style="width:100%;padding:3px 6px;border:1px solid ' + (dstVal ? 'var(--border)' : 'rgba(248,81,73,.4)') + ';border-radius:4px;background:var(--bg);color:var(--text);font:inherit;font-size:12px" data-key="' + k + '" data-locale="' + dst + '" value="' + dstVal.replace(/"/g,'&quot;') + '" oninput="markTransMod(this)"></td>'
      + '<td style="padding:2px 4px;text-align:center"><button class="btn btn-danger btn-sm" style="padding:2px 6px;font-size:10px" data-delkey="' + k + '" onclick="transDelKey(this.dataset.delkey)">×</button></td>'
      + '</tr>';
  }).join('');
  document.getElementById('trans-tbody').innerHTML = html;
}

function filterTrans(q) { renderTransTable(); }

function markTransMod(inp) {
  inp.style.borderColor = 'var(--warn)';
}

function transAddKeyInline() {
  var inp = document.getElementById('trans-new-key');
  var k = (inp ? inp.value : '').trim();
  if (!k) return;
  if (_transContentKeys.indexOf(k) === -1) _transContentKeys.push(k);
  if (inp) inp.value = '';
  renderTransTable();
}

function transAddLocale() {
  var inp = document.getElementById('trans-add-locale');
  var loc = (inp ? inp.value : '').trim().toLowerCase().replace(/\s+/g, '');
  if (!loc) return;
  if (!/^[a-z]{2,8}(-[a-zA-Z]{2,4})?$/.test(loc)) { showToast('Invalid locale code, e.g. ja, zh-TW', 'err'); return; }
  if (_transLocales.indexOf(loc) !== -1) { showToast('Locale exists: ' + loc, 'err'); return; }
  _transLocales.push(loc);
  if (inp) inp.value = '';
  renderTransLocaleSelects();
  // Switch dst to the newly added locale
  var dst = document.getElementById('trans-dst');
  if (dst) { dst.value = loc; updateTransFlag('dst'); }
  renderTransTable();
  showToast(t('trans.addLang') + ': ' + loc, 'ok');
}

async function transDelKey(key) {
  if (!confirm(t('trans.confirmDelete') + key + ' ?')) return;
  _transAllRows = _transAllRows.filter(function(r){ return r.key !== key; });
  _transContentKeys = _transContentKeys.filter(function(k){ return k !== key; });
  await fetch('/api/admin/translations', {method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:PLUGIN_ID,key:key})});
  renderTransTable();
}

async function saveTrans() {
  var entries = [];
  document.querySelectorAll('#trans-tbody .t-cell').forEach(function(inp) {
    entries.push({key:inp.dataset.key, locale:inp.dataset.locale, value:inp.value});
  });
  if (!entries.length) return;
  var r = await fetch('/api/admin/translations', {
    method:'PUT',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({pluginId:PLUGIN_ID, entries:entries})
  });
  if ((await r.json()).ok) {
    document.querySelectorAll('#trans-tbody .t-cell').forEach(function(i){ i.style.borderColor='var(--border)'; });
    showToast('✓ ' + t('trans.saved'), 'ok');
    // Refresh allRows cache
    var allR = await fetch('/api/admin/plugins/' + PLUGIN_ID + '/translations');
    if (allR.ok) _transAllRows = await allR.json();
  } else showToast(t('editor.saveFailed'), 'err');
}

${AI_TRANSLATE_SCRIPT}

// ── Media panel ───────────────────────────────────────────────────────────────
var _mediaItems = []; // all media for plugin
var _mediaRefs = []; // refs found in current HTML: {kind,key}
var _mediaPending = null; // {mode, id, key}

async function loadMediaPanel() {
  var loading = document.getElementById('media-loading');
  var empty = document.getElementById('media-empty-msg');
  if (loading) loading.style.display = 'flex';
  if (empty) empty.style.display = 'none';
  // Scan current HTML for referenced keys
  var html = SECTION_ID ? edHTML.getValue() : '';
  _mediaRefs = scanMediaRefs(html);
  try {
    var r = await fetch('/api/admin/media?pluginSlug=${esc(plugin.slug)}&limit=200');
    var d = await r.json();
    _mediaItems = d.items || [];
  } catch(e) { _mediaItems = []; }
  if (loading) loading.style.display = 'none';
  filterMedia('');
}

function scanMediaRefs(text) {
  var refs = [];
  var seen = {};
  [...text.matchAll(/\{\{img:([^}]+)\}\}/g)].forEach(function(m){
    var key = m[1].trim(); if (key && !seen.img?.[key]) { seen.img = seen.img || {}; seen.img[key] = true; refs.push({kind:'img', key:key}); }
  });
  [...text.matchAll(/\{\{video:([^}]+)\}\}/g)].forEach(function(m){
    var key = m[1].trim(); if (key && !seen.video?.[key]) { seen.video = seen.video || {}; seen.video[key] = true; refs.push({kind:'video', key:key}); }
  });
  return refs;
}

function filterMedia(q) {
  var itemByKey = {};
  _mediaItems.forEach(function(m){ if(m.placeholderKey)itemByKey[m.placeholderKey]=m; });
  var refs = _mediaRefs.filter(function(ref){
    if (!q) return true;
    var m = itemByKey[ref.key];
    var s = (ref.key + ' ' + (m ? m.filename : '')).toLowerCase();
    return s.indexOf(q.toLowerCase()) !== -1;
  });
  var count = document.getElementById('media-count');
  if (count) count.textContent = refs.length + ' / ' + _mediaRefs.length + ' ' + t('editor.keyCount');
  var empty = document.getElementById('media-empty-msg');
  if (!refs.length) { document.getElementById('media-grid').innerHTML = ''; if (empty) empty.style.display = ''; return; }
  if (empty) empty.style.display = 'none';
  document.getElementById('media-grid').innerHTML = refs.map(function(ref){ return renderMediaRefCard(ref, itemByKey[ref.key]); }).join('');
}

function renderMediaRefCard(ref, m) {
  var token = '{{' + ref.kind + ':' + ref.key + '}}';
  var elementToken = ref.kind === 'video'
    ? '<video src="' + token + '" controls></video>'
    : '<img src="' + token + '" alt="" loading="lazy" />';
  var exists = !!(m && !String(m.d2Key || '').startsWith('__ref__'));
  var isVideo = exists && (m.mimeType||'').startsWith('video/');
  var isImage = exists && (m.mimeType||'').startsWith('image/');
  var thumb = exists && isImage
    ? '<img src="/media/' + m.d2Key + '" loading="lazy" onerror="this.remove()">'
    : '<span>' + (ref.kind === 'video' ? '🎬' : '📷') + '</span>';
  var meta = exists
    ? ((m.sizeBytes||0) > 1048576 ? ((m.sizeBytes||0)/1048576).toFixed(1)+'MB' : Math.round((m.sizeBytes||0)/1024)+'KB') + ' · ' + (m.mimeType||'')
    : t('editor.mediaMissing');
  var action = exists
    ? '<button class="btn btn-sm" onclick="pickReplaceMedia(' + m.id + ')">' + t('editor.replace') + '</button>'
    : '<button class="btn btn-primary btn-sm" data-key="' + ref.key.replace(/"/g,'&quot;') + '" onclick="pickUploadMediaRef(this.dataset.key)">' + t('editor.upload').replace(/^⬆\\s*/,'') + '</button>';
  return '<div class="media-ref-card' + (exists ? '' : ' missing') + '">'
    + '<div class="media-ref-thumb" ' + (exists ? 'data-preview-url="/media/' + String(m.d2Key || '').replace(/"/g,'&quot;') + '" data-preview-video="' + (isVideo?'1':'0') + '" onclick="openMediaPreview(this.dataset.previewUrl,!!Number(this.dataset.previewVideo))" style="cursor:zoom-in"' : '') + '>'
      + thumb + '<span class="media-ref-badge">' + ref.kind + '</span>'
    + '</div>'
    + '<div class="media-ref-body">'
      + '<div class="media-ref-key" title="' + token + '">' + token + '</div>'
      + '<div class="media-ref-name">' + (exists ? m.filename : ref.key) + '</div>'
      + '<div class="media-ref-meta">' + meta + '</div>'
    + '</div>'
    + '<div class="media-ref-actions">'
      + action
      + '<button class="btn btn-sm" data-copy="' + elementToken.replace(/"/g,'&quot;') + '" onclick="copyText(this.dataset.copy)">&lt;&gt;</button>'
      + (exists ? '<button class="btn btn-sm" data-copy="' + token.replace(/"/g,'&quot;') + '" onclick="copyText(this.dataset.copy)">URL</button>' : '')
    + '</div>'
  + '</div>';
}

function copyText(txt) {
  navigator.clipboard ? navigator.clipboard.writeText(txt).then(function(){showToast(t('media.copied'),'ok');}) : (function(){var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast(t('media.copied'),'ok');})();
}

// ── Media preview lightbox ────────────────────────────────────────────────────
function openMediaPreview(url, isVideo) {
  var ov = document.getElementById('media-preview-ov');
  var img = document.getElementById('media-preview-img');
  var vid = document.getElementById('media-preview-vid');
  if (!ov) return;
  if (isVideo) {
    img.style.display = 'none'; vid.style.display = ''; vid.src = url;
  } else {
    vid.style.display = 'none'; img.style.display = ''; img.src = url;
  }
  ov.style.display = 'flex';
}
function closeMediaPreview() {
  var ov = document.getElementById('media-preview-ov');
  var vid = document.getElementById('media-preview-vid');
  if (ov) ov.style.display = 'none';
  if (vid) { vid.pause(); vid.src = ''; }
}

// ── Media upload / replace from scanned references ───────────────────────────
function pickReplaceMedia(id) {
  _mediaPending = {mode:'replace', id:id};
  var inp = document.getElementById('media-replace-input');
  if (inp) inp.click();
}
function pickUploadMediaRef(key) {
  _mediaPending = {mode:'upload', key:key};
  var inp = document.getElementById('media-upload-ref-input');
  if (inp) inp.click();
}
async function uploadMediaRefFile(file) {
  if (!file || !_mediaPending) return;
  var fd = new FormData();
  fd.append('file', file);
  var url = '';
  if (_mediaPending.mode === 'replace') {
    url = '/api/admin/media/' + _mediaPending.id + '/file';
  } else {
    fd.append('placeholder_key', _mediaPending.key || '');
    url = '/media/upload/${esc(plugin.slug)}';
  }
  try {
    var r = await fetch(url, { method: _mediaPending.mode === 'replace' ? 'PUT' : 'PUT', body: fd });
    var d = await r.json();
    if (d.ok) { showToast('✓ ' + (_mediaPending.mode === 'replace' ? t('editor.replace') : t('media.uploaded')), 'ok'); loadMediaPanel(); }
    else showToast((EDITOR_LANG === 'zh' ? '上传失败' : 'Upload failed') + ': ' + (d.error || ''), 'err');
  } catch(e) { showToast((EDITOR_LANG === 'zh' ? '上传失败' : 'Upload failed') + ': ' + e.message, 'err'); }
  _mediaPending = null;
}

document.addEventListener('DOMContentLoaded', function() {
  var repInp = document.getElementById('media-replace-input');
  if (repInp) repInp.addEventListener('change', function(e) {
    if (e.target.files.length) uploadMediaRefFile(e.target.files[0]);
    this.value = '';
  });
  var upInp = document.getElementById('media-upload-ref-input');
  if (upInp) upInp.addEventListener('change', function(e) {
    if (e.target.files.length) uploadMediaRefFile(e.target.files[0]);
    this.value = '';
  });
});

// ── scheduleBottomRefresh (no-op now, panels load on demand) ──────────────────
function scheduleBottomRefresh() {
  // Translation/media panels now load on tab switch, no need for auto-refresh
}

// Dummy scanAndRender kept for compat
async function scanAndRender() {
  if (ACTIVE_ED_TAB === 'trans') await loadTransPanel();
  if (ACTIVE_ED_TAB === 'media') await loadMediaPanel();
}


// ── Section rename ────────────────────────────────────────────────────────────
function startRename() {
  var nm = document.getElementById('sec-name'), inp = document.getElementById('sec-name-input');
  inp.value = nm.textContent; nm.style.visibility = 'hidden';
  inp.style.visibility = 'visible'; inp.style.pointerEvents = 'auto';
  requestAnimationFrame(function() { inp.focus(); inp.select(); });
}
function renameKey(e) {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('sec-name-input').blur(); }
  if (e.key === 'Escape') { cancelRename(); }
}
function cancelRename() {
  var nm = document.getElementById('sec-name'), inp = document.getElementById('sec-name-input');
  inp.style.visibility = 'hidden'; inp.style.pointerEvents = 'none'; nm.style.visibility = 'visible';
}
async function finishRename() {
  var nm = document.getElementById('sec-name'), inp = document.getElementById('sec-name-input');
  inp.style.visibility = 'hidden'; inp.style.pointerEvents = 'none'; nm.style.visibility = 'visible';
  var nt = inp.value.trim();
  if (!nt || nt === nm.textContent) return;
  var r = await fetch('/api/admin/sections/' + SECTION_ID, {
    method: 'PUT', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({titleZh: nt, titleEn: nt})
  });
  if (r.ok) {
    nm.textContent = nt;
    var lbl = document.querySelector('.si.active .si-lbl'); if (lbl) lbl.textContent = nt;
    await fetch('/api/admin/translations', {
      method: 'PUT', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({pluginId: PLUGIN_ID, key: 'sec.' + SECTION_SLUG + '.title', locale: 'zh', value: nt})
    });
    showToast('✓ 已重命名', 'ok');
  } else showToast('重命名失败', 'err');
}

// ── Keyboard: ESC closes modal panels or media preview ───────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  var ov = document.getElementById('media-preview-ov');
  if (ov && ov.style.display !== 'none') { closeMediaPreview(); return; }
  if (document.querySelector('.modal-ov.open[id^="modal-"]')) closeInlinePanel();
});
(function() {
  function w(a, b) {
    document.getElementById(a).addEventListener('input', function() {
      var s = document.getElementById(b);
      if (!s.dataset.manual) s.value = this.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'');
    });
    document.getElementById(b).addEventListener('input', function() { this.dataset.manual = '1'; });
  }
  w('as-title','as-slug'); w('sub-title','sub-slug');
})();
function openAddSub(pid, e) {
  e.stopPropagation();
  document.getElementById('sub-parent-id').value = pid;
  document.getElementById('sub-title').value = '';
  document.getElementById('sub-slug').value = '';
  delete document.getElementById('sub-slug').dataset.manual;
  openInlinePanel('addsub');
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
async function doCreateDoc() {
  var slug = document.getElementById('nd-slug').value.trim(), name = document.getElementById('nd-name').value.trim();
  if (!slug || !name) { showToast('请填写标识和名称', 'err'); return; }
  var r = await fetch('/api/admin/plugins', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,name})});
  if (r.ok) { var d = await r.json(); closeInlinePanel(); location.href = '/admin/plugins/' + d.id + '/editor'; }
  else showToast('创建失败', 'err');
}
async function doAddSection(pid) {
  var isRoot = pid === null, prefix = isRoot ? 'as' : 'sub';
  var title = document.getElementById(prefix + '-title').value.trim(), slug = document.getElementById(prefix + '-slug').value.trim();
  if (!title || !slug) { showToast('请填写名称和 slug', 'err'); return; }
  var body = {pluginId: PLUGIN_ID, titleZh: title, titleEn: title, slug, sortOrder: ALL_SECTIONS_COUNT};
  if (pid) body.parentId = pid;
  var r = await fetch('/api/admin/sections', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if (!r.ok) { showToast('创建失败', 'err'); return; }
  var d = await r.json();
  await Promise.all([
    fetch('/api/admin/translations', {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:PLUGIN_ID,key:'sec.'+slug+'.title',locale:'zh',value:title})}),
    fetch('/api/admin/translations', {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:PLUGIN_ID,key:'sec.'+slug+'.title',locale:'en',value:''})})
  ]);
  closeInlinePanel();
  location.href = d.id ? '?s=' + d.id : location.href;
}
async function doSaveSecSettings() {
  var title = document.getElementById('ss-title').value.trim(), slug = document.getElementById('ss-slug').value.trim();
  if (!title || !slug) { showToast('请填写', 'err'); return; }
  var r = await fetch('/api/admin/sections/${activeSection?.id || 0}', {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({titleZh:title,titleEn:title,slug})});
  if (r.ok) { closeInlinePanel(); location.reload(); } else showToast('保存失败', 'err');
}
async function doDelSection() {
  if (!confirm('删除该章节及其所有内容？不可撤销。')) return;
  await fetch('/api/admin/sections/${activeSection?.id || 0}', {method:'DELETE'});
  location.href = '/admin/plugins/${plugin.id}/editor';
}

// ── Content serialisation ─────────────────────────────────────────────────────
// NOTE: Inside this TS template literal, use \\n to produce literal \n in JS output.
function blocksToText(blocks) {
  if (!blocks || !blocks.length) return '';
  return blocks.map(function(b) {
    var c = {}; try { c = JSON.parse(b.contentJson || '{}'); } catch(e) {}
    if (b.type === 'html') return '===html===\n' + (c.html || '');
    if (b.type === 'code') return '===code:' + (c.language || 'cpp') + '===\n' + (c.code || '');
    if (b.type === 'text') return '===text===\nzh: ' + (c.textZh||'') + '\nen: ' + (c.textEn||'');
    if (b.type === 'callout') return '===callout===\nzh: ' + (c.textZh||'') + '\nen: ' + (c.textEn||'');
    if (b.type === 'list') { var tag = c.ordered ? 'list:ordered' : 'list'; var lines = (c.items||[]).map(function(item){return typeof item==='string'?'- zh: '+item+' | en: ':'- zh: '+(item.zh||'')+' | en: '+(item.en||'');}); return '==='+tag+'===\n'+lines.join('\n'); }
    if (b.type === 'card') return '===card===\ntitle-zh: '+(c.titleZh||'')+'\ntitle-en: '+(c.titleEn||'')+'\nzh: '+(c.textZh||'')+'\nen: '+(c.textEn||'');
    if (b.type === 'code-tags') return '===code-tags===\n'+(c.tags||[]).join('\n');
    if (b.type === 'image') return c.key ? '===image===\nkey: '+(c.key||'')+'\nalt: '+(c.alt||'') : '===image===\nsrc: '+(c.src||'')+'\nalt: '+(c.alt||'');
    if (b.type === 'video') return c.key ? '===video===\nkey: '+(c.key||'')+'\nsrc: '+(c.src||'') : '===video===\nsrc: '+(c.src||'');
    return '==='+b.type+'===\n'+b.contentJson;
  }).join('\n\n');
}
function textToBlocks(t) {
  var bl = [], cur = null;
  t.split('\n').forEach(function(ln) {
    var m = ln.match(/^===([\w][\w-]*)(?::([^\s=]*))?===\s*$/);
    if (m) { if (cur) bl.push(_makeBlock(cur)); cur = {type:m[1],param:m[2]||'',lines:[]}; }
    else if (cur) cur.lines.push(ln);
  });
  if (cur) bl.push(_makeBlock(cur));
  bl.forEach(function(b, i) { b.sortOrder = i; });
  return bl;
}
function _makeBlock(cur) {
  var type=cur.type,param=cur.param,content=cur.lines.join('\n').trim(),cj;
  if(type==='html')cj=JSON.stringify({html:content});
  else if(type==='code')cj=JSON.stringify({language:param||'cpp',code:content});
  else if(type==='text'||type==='callout')cj=JSON.stringify({textZh:_kv(content,'zh'),textEn:_kv(content,'en')});
  else if(type==='list'){var items=content.split('\n').filter(function(l){return/^-\s/.test(l);}).map(function(l){var inner=l.slice(l.indexOf('-')+1).trim();var zm=inner.match(/zh:\s*([^|]+)/),em=inner.match(/en:\s*(.*)/);return{zh:(zm?zm[1]:'').trim(),en:(em?em[1]:'').trim()};});cj=JSON.stringify({ordered:param==='ordered',items:items});}
  else if(type==='card')cj=JSON.stringify({titleZh:_kv(content,'title-zh'),titleEn:_kv(content,'title-en'),textZh:_kv(content,'zh'),textEn:_kv(content,'en')});
  else if(type==='code-tags')cj=JSON.stringify({tags:content.split('\n').map(function(s){return s.trim();}).filter(Boolean)});
  else if(type==='image'){var imgKey=_kv(content,'key'),imgSrc=_kv(content,'src'),imgAlt=_kv(content,'alt');cj=JSON.stringify(imgKey?{key:imgKey,alt:imgAlt}:{src:imgSrc,alt:imgAlt});}
  else if(type==='video'){var vKey=_kv(content,'key'),vSrc=_kv(content,'src');cj=JSON.stringify(vKey?{key:vKey,src:vSrc}:{src:vSrc});}
  else if(type==='cards'){try{cj=JSON.stringify({cards:JSON.parse(content)});}catch(e){cj='{"cards":[]}';}}
  else cj=JSON.stringify({html:content});
  return {type:type,contentJson:cj,sortOrder:0};
}
function _kv(text, key) {
  var m = text.match(new RegExp('^' + key.replace('-','\\-') + ':\\s*(.*)','m'));
  return m ? m[1].trim() : '';
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type) {
  var t = document.getElementById('toast'); t.textContent = msg;
  t.className = 'toast toast-' + (type||'ok') + ' show';
  clearTimeout(t._tmr); t._tmr = setTimeout(function() { t.className = 'toast'; }, 2400);
}

function applyEditorLang(lang) {
  document.querySelectorAll('.si-lbl[data-zh]').forEach(function(el) {
    el.textContent = lang === 'en' ? (el.dataset.en||el.dataset.zh) : (el.dataset.zh||el.dataset.en||el.textContent);
  });
  applyStaticI18n();
  setTabLabel(ACTIVE_ED_TAB || 'html');
}
function switchEditorLang(lang) {
  EDITOR_LANG = lang; fetch('/api/set-lang?lang=' + lang); applyEditorLang(lang);
  if (ACTIVE_ED_TAB === 'trans') {
    renderTransLocaleSelects();
    renderTransTable();
  }
  if (ACTIVE_ED_TAB === 'media') filterMedia((document.getElementById('media-filter')||{}).value||'');
}
(function() {
  applyEditorLang(EDITOR_LANG);
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
  setLang(EDITOR_LANG);
  ddBtn.addEventListener('click', function(e) { e.stopPropagation(); ddMenu.classList.toggle('open'); });
  document.addEventListener('click', function() { ddMenu.classList.remove('open'); });
  ddMenu.querySelectorAll('li').forEach(function(li) {
    li.addEventListener('click', function() {
      switchEditorLang(li.dataset.lang); setLang(li.dataset.lang); ddMenu.classList.remove('open');
    });
  });
})();
</script>
</body></html>`;
}

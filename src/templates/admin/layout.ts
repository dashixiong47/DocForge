// Monaco CDN
export const MONACO = 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.47.0/min/vs';
export const MONACO_BASE = 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.47.0/min/';
import { ADMIN_I18N, LOCALES, LOCALE_MAP } from '../../services/i18n';
import { DOC_THEME_CSS } from '../error_pages';

export { DOC_THEME_CSS };

// CSS flag-icons span — cross-platform SVG flags (no emoji font dependency)
export function flagSpan(code: string, cls = ''): string {
  const country = LOCALE_MAP[code]?.country || code;
  return `<span class="fi fi-${country}${cls ? ' ' + cls : ''}"></span>`;
}

// Custom dropdown item list for all LOCALES (admin topbar)
export function localeMenuItems(): string {
  return LOCALES.map(l =>
    `<li data-code="${l.code}" data-country="${l.country}">${flagSpan(l.code)} ${l.name} <small>(${l.code})</small></li>`
  ).join('');
}

// Plain <option> list — for native <select> (HTML in options not allowed, use emoji fallback)
export function localeOptions(selectedCode: string): string {
  return LOCALES.map(l =>
    `<option value="${l.code}"${l.code === selectedCode ? ' selected' : ''}>${l.name} (${l.code})</option>`
  ).join('');
}

export type SysI18n = Record<string, { zh: string; en: string }>;

// Request-scoped state — set by admin middleware before rendering
export let _sysI18n: SysI18n = {};
export let _sysLocales: string[] = ['zh', 'en'];
export function setSysI18n(i18n: SysI18n): void { _sysI18n = i18n; }
export function setSysLocales(locales: string[]): void { _sysLocales = locales.length ? locales : ['zh', 'en']; }

export function adminLayout(opts: { title: string; body: string; active?: string; head?: string; sysI18n?: SysI18n }): string {
  const a = opts.active || '';
  return `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.title} - 管理后台</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css">
${opts.head || ''}
<style>
:root{--bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#e6edf3;--muted:#8b949e;--accent:#58a6ff;--danger:#f85149;--ok:#3fb950;--warn:#d2991d;--radius:8px;--font:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;--mono:"Cascadia Code","Consolas",monospace}
*{box-sizing:border-box}body{margin:0;font-family:var(--font);font-size:14px;color:var(--text);background:var(--bg);line-height:1.6}
::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px}
select{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%238b949e'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:32px}
select option{background:var(--surface);color:var(--text)}
select:focus,input:focus,textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px rgba(88,166,255,.12)}
a{color:var(--accent);text-decoration:none}
.admin-layout{display:flex;min-height:100vh}
.side-nav{width:200px;background:var(--surface);border-right:1px solid var(--border);padding:16px 0;position:fixed;top:44px;left:0;bottom:0;overflow-y:auto;display:flex;flex-direction:column}
.side-nav .logo{padding:0 16px 14px;font-size:15px;font-weight:800;color:var(--accent);border-bottom:1px solid var(--border);margin-bottom:6px}
.side-nav a{display:block;padding:7px 16px;color:var(--muted);font-size:13px;transition:.12s;border-left:2px solid transparent}
.side-nav a:hover,.side-nav a.active{color:var(--text);background:rgba(88,166,255,.06);border-left-color:var(--accent)}
.side-nav .nav-bottom{margin-top:auto;padding-top:8px;border-top:1px solid var(--border)}
.main-content{margin-left:200px;flex:1;padding:68px 28px 24px;max-width:calc(100vw - 200px)}
.page-title{font-size:20px;margin:0 0 18px;font-weight:700;display:flex;align-items:center;gap:10px}
.card{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);padding:18px;margin-bottom:14px}
.card h3{margin:0 0 12px;font-size:15px}
.form-group{margin-bottom:11px}
.form-group label{display:block;margin-bottom:3px;color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px}
.form-group textarea{min-height:80px;resize:vertical;font-family:var(--mono);font-size:12px}
.form-row{display:flex;gap:10px}.form-row>.form-group{flex:1;min-width:0}
.btn{padding:7px 14px;border:1px solid var(--border);border-radius:var(--radius);font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}.btn-primary:hover{opacity:.85}
.btn-danger{background:var(--danger);color:#fff;border-color:var(--danger)}.btn-danger:hover{opacity:.85}
.btn-ok{background:var(--ok);color:#fff;border-color:var(--ok)}.btn-ok:hover{opacity:.85}
.btn-outline{background:transparent;color:var(--muted)}.btn-outline:hover{border-color:var(--accent);color:var(--accent)}
.btn-sm{padding:4px 10px;font-size:12px}
.btn-group{display:flex;gap:7px;flex-wrap:wrap}
.drag-handle{cursor:grab;color:var(--muted);opacity:.3;flex-shrink:0;padding:2px 4px;user-select:none;font-size:16px;line-height:1;display:flex;align-items:center}
.drag-handle:hover{opacity:.7}
.doc-card[draggable]{transition:opacity .15s}
.doc-card.dragging{opacity:.35}
.doc-card.drag-over{border-color:var(--accent)!important;background:rgba(88,166,255,.05)}
.doc-head{display:flex;align-items:flex-start;gap:10px}
.doc-meta{flex:1;min-width:0}
.doc-title{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px}
.doc-title strong{font-size:14px}
.doc-slug{font-size:11px;color:var(--muted);font-family:var(--mono)}
.doc-ver{font-size:11px;color:var(--muted)}
.doc-status{font-size:11px;font-weight:700;padding:1px 8px;border-radius:10px}
.doc-status.published{background:rgba(63,185,80,.12);color:var(--ok);border:1px solid rgba(63,185,80,.25)}
.doc-status.draft{background:rgba(139,148,158,.1);color:var(--muted);border:1px solid rgba(139,148,158,.2)}
.doc-desc{font-size:12px;color:var(--muted);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.doc-actions{display:flex;align-items:center;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--border)}
.doc-status-lbl{font-size:12px;color:var(--muted)}
.toggle{position:relative;width:34px;height:19px;flex-shrink:0}
.toggle input{opacity:0;width:0;height:0}
.toggle-slider{position:absolute;inset:0;background:#30363d;border-radius:20px;cursor:pointer;transition:.2s}
.toggle-slider::before{content:'';position:absolute;width:13px;height:13px;left:3px;bottom:3px;background:#6e7681;border-radius:50%;transition:.2s}
.toggle input:checked+.toggle-slider{background:var(--ok)}
.toggle input:checked+.toggle-slider::before{transform:translateX(15px);background:#fff}
table{width:100%;border-collapse:collapse}
th,td{text-align:left;padding:8px 12px;border-bottom:1px solid var(--border)}
th{color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;background:rgba(0,0,0,.15)}
td{font-size:13px}tr:hover td{background:rgba(88,166,255,.03)}
.stat-card{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);padding:16px}
.stat-card .stat-num{font-size:30px;font-weight:800;color:var(--accent)}
.stat-card .stat-label{color:var(--muted);font-size:12px;margin-top:2px}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px}
.alert{padding:10px 14px;border-radius:var(--radius);margin-bottom:12px;font-size:13px}
.alert-danger{background:#2d1216;border:1px solid #5a1e27;color:var(--danger)}
.alert-ok{background:#122d1f;border:1px solid #1a3d2a;color:var(--ok)}
.empty-state{text-align:center;padding:36px;color:var(--muted)}
.block-item{border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:8px;background:var(--bg)}
.block-header{display:flex;justify-content:space-between;align-items:center;gap:8px}
.block-type-badge{font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;background:rgba(88,166,255,.1);padding:2px 7px;border-radius:4px;border:1px solid rgba(88,166,255,.2);flex-shrink:0}
.block-preview{color:var(--muted);font-size:12px;font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
#t-table .t-cell-edit{background:var(--bg);border:1px solid var(--border);width:100%;color:var(--text);font:inherit;font-size:13px;padding:6px 8px;border-radius:4px}
#t-table .t-cell-edit:focus{border-color:var(--accent);outline:none;box-shadow:0 0 0 2px rgba(88,166,255,.12)}
.t-missing{color:var(--warn);border-color:rgba(210,153,29,.3)!important}
kbd{font-size:11px;background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:2px 5px;color:var(--muted);font-family:var(--mono)}
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:2000;align-items:center;justify-content:center;display:none}
.modal-ov.open{display:flex}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;width:400px;max-width:calc(100vw - 32px)}
.modal h3{margin:0;font-size:16px;font-weight:700}
.modal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.modal-close{background:none;border:none;color:var(--muted);cursor:pointer;font-size:20px;line-height:1;padding:2px 6px;border-radius:4px;transition:.1s}
.modal-close:hover{color:var(--text);background:rgba(255,255,255,.07)}
.modal-footer{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
.tag-chip{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:12px;font-size:11px;background:rgba(88,166,255,.15);color:var(--accent);border:1px solid rgba(88,166,255,.25)}
.tag-chip .tag-rm{cursor:pointer;opacity:.5;font-weight:700;line-height:1}.tag-chip .tag-rm:hover{opacity:1;color:var(--danger)}
.tag-input-wrap{display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:4px 8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);min-height:32px;cursor:text}
.tag-input-wrap input{border:none!important;background:transparent!important;color:var(--text);font:inherit;font-size:12px;outline:none;flex:1;min-width:80px;padding:2px 0;box-shadow:none!important}
.icon-field{display:flex;align-items:center;gap:10px}
.icon-slot{width:84px;height:84px;border:1px solid var(--border);border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center;overflow:hidden;font-weight:800;color:var(--accent);cursor:pointer;transition:.14s;position:relative;flex-shrink:0}
.icon-slot:hover{border-color:var(--accent);background:rgba(88,166,255,.06);box-shadow:0 0 0 2px rgba(88,166,255,.1)}
.icon-slot img{width:100%;height:100%;object-fit:cover;display:block}
.icon-slot span{font-size:16px;line-height:1;text-align:center;padding:4px}
.icon-slot.empty::before{content:'+';font-size:24px;font-weight:800;color:var(--accent)}
.settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin:8px 0 12px}
.setting-tile{border:1px solid var(--border);border-radius:10px;background:var(--bg);padding:12px;display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:74px}
.setting-tile-main{min-width:0;flex:1}
.setting-tile-title{font-size:12px;font-weight:800;color:var(--text);margin-bottom:3px}
.setting-tile-desc{font-size:12px;color:var(--muted);line-height:1.45}
.setting-tile-control{flex-shrink:0;display:flex;align-items:center;justify-content:flex-end}
.setting-tile input[type=number]{width:96px;padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text);font:inherit;font-size:13px}
.media-picker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(144px,1fr));gap:10px;max-height:380px;overflow-y:auto;margin-top:12px;padding:2px}
.media-picker-item{height:124px;border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;transition:.12s;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--muted)}
.media-picker-item:hover,.media-picker-item.selected{border-color:var(--accent);background:rgba(88,166,255,.06);color:var(--text)}
.media-picker-item.upload{border-style:dashed}
.media-picker-item.drag{border-color:var(--ok);background:rgba(63,185,80,.08)}
.media-picker-item img{width:100%;height:94px;object-fit:cover;display:block;background:#0d1117}
.media-picker-item .pi-name{width:100%;font-size:11px;padding:5px 7px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center}
.media-picker-preview{width:100%;max-height:200px;object-fit:contain;margin-top:8px;border-radius:6px;background:var(--bg)}
.pager{display:flex;gap:4px;align-items:center;justify-content:center;margin-top:10px;font-size:12px;color:var(--muted)}
.pager button{padding:3px 10px;border:1px solid var(--border);border-radius:4px;background:transparent;color:var(--text);cursor:pointer;font-size:12px}
.pager button:hover{border-color:var(--accent)}.pager button:disabled{opacity:.3;cursor:default}
@media(max-width:768px){.side-nav{width:100%;position:static;top:44px;border-right:0}.main-content{margin-left:0;padding-top:68px}}
.admin-topbar{position:fixed;top:0;left:0;right:0;height:44px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:flex-end;padding:0 18px;z-index:300;gap:10px}
.admin-topbar-brand{font-size:14px;font-weight:800;color:var(--accent);flex:1}
.admin-lang-sel{padding:5px 26px 5px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:12px;cursor:pointer;min-width:88px;-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%238b949e'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 7px center}
.admin-lang-sel:focus{outline:none;border-color:var(--accent)}
.lp{position:relative;display:inline-block}
.lp-btn{display:flex;align-items:center;gap:6px;padding:5px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);cursor:pointer;font:inherit;font-size:12px;white-space:nowrap}
.lp-btn:hover{border-color:var(--accent)}.lp-btn svg{opacity:.5}
.lp-menu{position:absolute;right:0;top:calc(100% + 4px);min-width:190px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);z-index:9999;list-style:none;margin:0;padding:4px 0;box-shadow:0 8px 24px rgba(0,0,0,.5);display:none;max-height:380px;overflow-y:auto}
.lp-menu.open{display:block}
.lp-menu li{display:flex;align-items:center;gap:8px;padding:7px 14px;cursor:pointer;font-size:13px;color:var(--text)}
.lp-menu li:hover{background:rgba(88,166,255,.08);color:var(--accent)}
.lp-menu li.active{color:var(--accent);font-weight:600}
.lp-menu li small{margin-left:auto;color:var(--muted);font-size:11px}
.fi{line-height:1}
/* ── User panel ── */
.usr-wrap{position:relative}
.usr-info{display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;border-radius:8px;margin:4px 8px 8px;border:1px solid transparent;transition:.12s}
.usr-info:hover{background:rgba(88,166,255,.07);border-color:var(--border)}
.usr-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#58a6ff,#3a7bd5);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;user-select:none}
.usr-meta{flex:1;min-width:0}
.usr-name{font-size:13px;font-weight:600;color:var(--text);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.usr-role{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-top:1px}
.usr-pop{position:absolute;bottom:calc(100% + 4px);left:8px;right:8px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:4px 0;box-shadow:0 -6px 24px rgba(0,0,0,.45);opacity:0;pointer-events:none;transform:translateY(6px);transition:opacity .15s,transform .15s;z-index:500}
.usr-pop.open{opacity:1;pointer-events:auto;transform:translateY(0)}
.usr-pop a{display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:13px;color:var(--text);text-decoration:none;transition:.1s}
.usr-pop a:hover{background:rgba(88,166,255,.08);color:var(--accent);text-decoration:none}
.usr-pop a.u-danger{color:var(--danger)}
.usr-pop a.u-danger:hover{background:rgba(248,81,73,.07)}
.usr-sep{border:0;border-top:1px solid var(--border);margin:4px 0}
</style>
</head><body>
<header class="admin-topbar">
  <div class="admin-topbar-brand" data-i18n="nav.logo">管理后台</div>
  <div class="lp" id="lp">
    <button class="lp-btn" id="lp-btn" type="button">
      ${flagSpan('zh', 'lp-flag')} <span id="lp-name">中文</span>
      <svg width="10" height="10" viewBox="0 0 12 12"><path d="M6 8L1 3h10z" fill="currentColor"/></svg>
    </button>
    <ul class="lp-menu" id="lp-menu">
      ${LOCALES.filter(l => _sysLocales.includes(l.code)).map(l =>
        `<li data-code="${l.code}" data-country="${l.country}">${flagSpan(l.code)} ${l.name} <small>(${l.code})</small></li>`
      ).join('')}
    </ul>
  </div>
</header>
<div class="admin-layout">
<nav class="side-nav">
  <a href="/admin" class="${a === 'dashboard' ? 'active' : ''}" data-i18n="nav.dashboard">📊 控制台</a>
  <a href="/admin/plugins" class="${a === 'plugins' ? 'active' : ''}" data-i18n="nav.docs">📁 文档管理</a>
  <a href="/admin/translations" class="${a === 'translations' ? 'active' : ''}" data-i18n="nav.translations">🌐 翻译管理</a>
  <a href="/admin/media" class="${a === 'media' ? 'active' : ''}" data-i18n="nav.media">📷 媒体文件</a>
  <a href="/admin/extensions" class="${a === 'extensions' ? 'active' : ''}" data-i18n="nav.extensions">🧩 插件管理</a>
  <a href="/admin/settings" class="${a === 'settings' ? 'active' : ''}" data-i18n="nav.settings">⚙️ 系统设置</a>
  <div class="nav-bottom">
    <div class="usr-wrap">
      <div class="usr-info">
        <div class="usr-av" id="usr-av">A</div>
        <div class="usr-meta">
          <div class="usr-name" id="usr-name">admin</div>
          <div class="usr-role" data-i18n="settings.roleAdmin">管理员</div>
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="flex-shrink:0;opacity:.4"><polyline points="18 15 12 9 6 15"/></svg>
      </div>
      <div class="usr-pop">
        <a href="/admin/settings/account" data-i18n="settings.account">🔑 账户设置</a>
        <hr class="usr-sep">
        <a href="/admin/logout" class="u-danger" data-i18n="nav.logout">🚪 退出登录</a>
      </div>
    </div>
  </div>
</nav>
<main class="main-content">
${opts.body}
</main>
</div>
<script>
function switchLang(lang){fetch('/api/set-lang?lang='+lang).then(function(){location.reload();});}
// Load username for sidebar user panel
fetch('/api/admin/credentials').then(function(r){return r.json();}).then(function(d){
  var n=d.username||'A';
  var nm=document.getElementById('usr-name'),av=document.getElementById('usr-av');
  if(nm)nm.textContent=n;
  if(av)av.textContent=n.charAt(0).toUpperCase();
}).catch(function(){});
// User popover — JS hover with delay so mouse can travel into the popup
(function(){
  var wrap=document.querySelector('.usr-wrap');
  var pop=wrap&&wrap.querySelector('.usr-pop');
  if(!wrap||!pop)return;
  var t=null;
  function show(){clearTimeout(t);pop.classList.add('open');}
  function hide(){t=setTimeout(function(){pop.classList.remove('open');},150);}
  wrap.addEventListener('mouseenter',show);
  wrap.addEventListener('mouseleave',hide);
  pop.addEventListener('mouseenter',show);
  pop.addEventListener('mouseleave',hide);
})();
function imgErr(el){el.style.display='none';var n=el.nextElementSibling;if(n)n.style.display='flex';}
function openModal(id){document.getElementById(id).classList.add('open');var inp=document.querySelector('#'+id+' input:not([type=hidden])');if(inp)setTimeout(function(){inp.focus();},30);}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-ov').forEach(function(ov){ov.addEventListener('click',function(e){if(e.target===ov)ov.classList.remove('open');});});
document.addEventListener('keydown',function(e){if(e.key==='Escape')document.querySelectorAll('.modal-ov.open').forEach(function(m){m.classList.remove('open');});});

// Client-side admin i18n + lang picker
(function(){
var d=document,cookieLang=(d.cookie.match(/(?:^|;\\s*)lang=([^;]+)/)||[])[1];
var lang=cookieLang||(String(navigator.language||navigator.userLanguage||'').toLowerCase().indexOf('zh')===0?'zh':'en');
if(!cookieLang)fetch('/api/set-lang?lang='+lang).catch(function(){});
var base=${JSON.stringify(ADMIN_I18N)};
var sys=${JSON.stringify(_sysI18n)};
var i18n=Object.assign({},base);
for(var k in sys){i18n[k]=Object.assign({},i18n[k]||{},sys[k]);};
var LOCS=${JSON.stringify(LOCALES.map(l=>({code:l.code,name:l.name,country:l.country})))};
function t(k){var e=i18n[k];return e?e[lang]||e.zh:k;}
function applyAdminI18n(){
  d.querySelectorAll('[data-i18n]').forEach(function(el){el.textContent=t(el.dataset.i18n);});
  d.querySelectorAll('[data-i18n-title]').forEach(function(el){el.title=t(el.dataset.i18nTitle);});
  d.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){el.placeholder=t(el.dataset.i18nPlaceholder);});
}
window.t=t;
window.applyAdminI18n=applyAdminI18n;
applyAdminI18n();
// Init lang picker
var menu=d.getElementById('lp-menu'),btn=d.getElementById('lp-btn');
if(menu&&btn){
  var cur=LOCS.find(function(l){return l.code===lang;})||LOCS[0];
  d.querySelector('#lp .lp-flag').className='fi fi-'+cur.country+' lp-flag';
  d.getElementById('lp-name').textContent=cur.name;
  menu.querySelectorAll('li').forEach(function(li){li.classList.toggle('active',li.dataset.code===lang);});
  btn.addEventListener('click',function(e){e.stopPropagation();menu.classList.toggle('open');});
  d.addEventListener('click',function(){menu.classList.remove('open');});
  menu.querySelectorAll('li').forEach(function(li){
    li.addEventListener('click',function(){switchLang(li.dataset.code);});
  });
}
})();
</script>
</body></html>`;
}

export function esc(s: string): string {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function blockPreview(type: string, contentJson: string): string {
  try {
    const c = JSON.parse(contentJson||'{}') as Record<string,unknown>;
    switch(type) {
      case 'html': return String(c.html||'').replace(/<[^>]+>/g,'').substring(0,120);
      case 'code': return `[${c.language||'?'}] ${String(c.code||'').substring(0,80)}`;
      case 'image': return `📷 ${c.src||''}`;
      default: return JSON.stringify(c).substring(0,100);
    }
  } catch { return contentJson.substring(0,120); }
}

export function monacoEditorHTML(id: string, readOnly: boolean, content: string, language: string): string {
  const ro = readOnly ? 'true' : 'false';
  return `<div id="${id}" style="height:100%;border:1px solid var(--border);border-radius:var(--radius)"></div>
<script>
require.config({paths:{vs:'${MONACO}'}});
require(['vs/editor/editor.main'],function(){
  monaco.editor.defineTheme('docforge-dark',{base:'vs-dark',inherit:true,rules:[],colors:{'editor.background':'#0d1117','editor.foreground':'#e6edf3','editor.lineHighlightBackground':'#161b22','editor.selectionBackground':'#264f78','editor.inactiveSelectionBackground':'#1c3b5a'}});
  var ed=monaco.editor.create(document.getElementById('${id}'),{value:${JSON.stringify(content)},language:'${language}',theme:'docforge-dark',readOnly:${ro},fontSize:13,fontFamily:'"Cascadia Code","Consolas","Courier New",monospace',tabSize:2,minimap:{enabled:false},scrollBeyondLastLine:false,wordWrap:'on',automaticLayout:true});
  window['_m_${id}']=ed;
});
<\/script>`;
}

export function blocksToEditorText(blocks: any[]): string {
  if(blocks.length===0) return '';
  return blocks.map((b:any)=>{
    try{
      const c=JSON.parse(b.contentJson||'{}') as Record<string,any>;
      switch(b.type){
        case 'html': return `===html===\n${c.html||''}`;
        case 'code': return `===code:${c.language||'cpp'}===\n${c.code||''}`;
        case 'text': return `===text===\nzh: ${c.textZh||''}\nen: ${c.textEn||''}`;
        case 'callout': return `===callout===\nzh: ${c.textZh||''}\nen: ${c.textEn||''}`;
        case 'list':{
          const tag=c.ordered?'list:ordered':'list';
          const lines=((c.items||[]) as Array<{zh?:string;en?:string}|string>).map(item=>typeof item==='string'?`- zh: ${item} | en: `:`- zh: ${item.zh||''} | en: ${item.en||''}`).join('\n');
          return `===${tag}===\n${lines}`;
        }
        case 'card': return `===card===\ntitle-zh: ${c.titleZh||''}\ntitle-en: ${c.titleEn||''}\nzh: ${c.textZh||''}\nen: ${c.textEn||''}`;
        case 'code-tags': return `===code-tags===\n${((c.tags||[]) as string[]).join('\n')}`;
        case 'image': return c.key
          ? `===image===\nkey: ${c.key}\nalt: ${c.alt||''}`
          : `===image===\nsrc: ${c.src||''}\nalt: ${c.alt||''}`;
        case 'video': return c.key
          ? `===video===\nkey: ${c.key}\nsrc: ${c.src||''}`
          : `===video===\nsrc: ${c.src||''}`;
        case 'cards': return `===cards===\n${JSON.stringify(c.cards||[],null,2)}`;
        default: return `===${b.type}===\n${b.contentJson||''}`;
      }
    }catch{
      return `===${b.type}===\n${b.contentJson||''}`;
    }
  }).join('\n\n');
}

import type { Extension } from '../../services/extensions';
import { adminLayout } from '../admin/layout';
import { ADMIN_I18N } from '../../services/i18n';

const ACE = 'https://cdn.bootcdn.net/ajax/libs/ace/1.32.6';

function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const TYPE_LABEL: Record<string, { zh: string; en: string }> = {
  theme:  { zh: '主题', en: 'Theme'  },
  widget: { zh: '组件', en: 'Widget' },
  system: { zh: '系统', en: 'System' },
  // legacy compat
  renderer: { zh: '组件', en: 'Widget' },
  general:  { zh: '系统', en: 'System' },
};
const TYPE_COLOR: Record<string, string> = {
  theme:  '#3fb950',
  widget: '#58a6ff',
  system: '#d2991d',
  renderer: '#58a6ff',
  general:  '#d2991d',
};

function iconHtml(icon: string, size = 26): string {
  if (/^https?:\/\//.test(icon)) {
    return `<img src="${esc(icon)}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:4px" onerror="this.style.display='none'">`;
  }
  return `<span style="font-size:${size}px;line-height:1">${esc(icon || '🧩')}</span>`;
}

function extI18n(ext: Extension, key: string, lang: string, fallback: string): string {
  const entry = ext.i18nStrings[key];
  if (!entry) return fallback;
  return entry[lang] || entry.zh || entry.en || Object.values(entry)[0] || fallback;
}

// ─── Extensions list page (inside admin layout) ───────────────────────────────
export function extensionsList(exts: Extension[]): string {
  const allTags = [...new Set(exts.flatMap(e => e.tags))].sort();

  const BLANK_TEMPLATES = {
    theme: {
      slug:'my-theme', name:'My Theme', type:'theme', icon:'🎨', version:'1.0.0', tags:['ui'],
      description:'自定义文档配色与排版',
      css:':root {\n  --c-accent: #e91e8c;\n  --c-bg: #0a0f1a;\n  --c-surface: #111827;\n}',
    },
    widget: {
      slug:'my-widget', name:'My Widget', type:'widget', icon:'🧩', version:'1.0.0', tags:['ui'],
      description:'自定义 HTML 组件',
      blockTypes:['my-block'],
      css:'.my-block { padding: 16px; border-radius: 8px; background: var(--c-surface); }',
      js:`DocForge.register({
  id: "my-widget",

  // 自定义 HTML 标签渲染 — <my-tag attr="val"> → HTML
  renderTags: {
    "my-tag": function(el, lang, t) {
      var label = el.getAttribute("label") || "Hello";
      return '<div class="my-block">' + label + '</div>';
    }
  },

  // 自定义内容块渲染 (ext-block)
  renderBlock: {
    "my-block": function(data, lang) {
      return '<div class="my-block">' + (data.text || '') + '</div>';
    }
  },

  onLoad: function() {
    console.log("[DocForge] my-widget loaded");
  }
});`,
    },
    system: {
      slug:'my-system', name:'My System', type:'system', icon:'⚙️', version:'1.0.0', tags:['system'],
      description:'全局系统钩子',
      js:`DocForge.register({
  id: "my-system",

  onLoad: function() {
    // 全局初始化，在每个文档页面加载后运行
    console.log("[DocForge] my-system loaded");

    // 示例：监听导航事件、注入全局 UI、接入 Analytics 等
  }
});`,
    },
  };

  const head = `<style>
.page-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px;flex-wrap:wrap}
.page-hd-left h2{margin:0 0 4px;font-size:20px;font-weight:700}
.page-hd-left p{margin:0;font-size:13px;color:var(--muted)}
.page-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.icon-btn{width:32px;height:32px;padding:0;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:var(--radius);background:transparent;color:var(--muted);cursor:pointer;font:inherit;transition:.12s}
.icon-btn:hover{border-color:var(--accent);color:var(--accent);background:rgba(88,166,255,.06)}
.filter-bar{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px;align-items:center}
.filter-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.tag-filter{padding:3px 10px;border:1px solid var(--border);border-radius:20px;background:transparent;color:var(--muted);font:inherit;font-size:11px;font-weight:600;cursor:pointer;transition:.12s}
.tag-filter:hover,.tag-filter.active{border-color:var(--accent);color:var(--accent);background:rgba(88,166,255,.12)}
.ext-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.ext-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px;display:flex;flex-direction:column;gap:10px;transition:.15s}
.ext-card:hover{border-color:#484f58}
.ext-card.disabled{opacity:.5}
.ext-head{display:flex;align-items:flex-start;gap:12px}
.ext-head-main{flex:1;min-width:0}
.ext-head-actions{display:flex;gap:4px;margin-left:auto}
.ext-icon{width:44px;height:44px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(88,166,255,.07);border-radius:8px;overflow:hidden}
.ext-title{font-size:14px;font-weight:700;line-height:1.3}
.ext-meta{font-size:11px;color:var(--muted);margin-top:2px}
.ext-badge{display:inline-block;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;margin-left:5px;vertical-align:middle}
.ext-desc{font-size:13px;color:var(--muted);line-height:1.55;flex:1}
.chips{display:flex;flex-wrap:wrap;gap:4px}
.chip{font-size:11px;padding:2px 7px;border-radius:4px}
.chip-block{background:rgba(88,166,255,.1);color:var(--accent);border:1px solid rgba(88,166,255,.2);font-family:monospace}
.chip-tag{background:rgba(63,185,80,.1);color:var(--ok);border:1px solid rgba(63,185,80,.2)}
.ext-actions{display:flex;gap:6px;align-items:center;border-top:1px solid var(--border);padding-top:10px;margin-top:auto}
.toggle{position:relative;width:36px;height:20px;flex-shrink:0}
.toggle input{opacity:0;width:0;height:0}
.toggle-slider{position:absolute;inset:0;background:#30363d;border-radius:20px;cursor:pointer;transition:.2s}
.toggle-slider::before{content:'';position:absolute;width:14px;height:14px;left:3px;bottom:3px;background:#8b949e;border-radius:50%;transition:.2s}
.toggle input:checked+.toggle-slider{background:var(--ok)}
.toggle input:checked+.toggle-slider::before{transform:translateX(16px);background:#fff}
.empty-state2{text-align:center;padding:60px 24px;color:var(--muted)}
.empty-state2 .empty-icon{font-size:40px;margin-bottom:12px}
.empty-state2 h3{font-size:17px;margin:0 0 6px;color:var(--text)}
/* Install modal extras (base .modal-ov/.modal already in adminLayout) */
.install-modal-box{width:min(840px,100%);max-height:88vh;background:var(--surface);border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.6)}
.install-modal-hd{display:flex;align-items:center;padding:14px 18px;border-bottom:1px solid var(--border);flex-shrink:0;gap:10px}
.install-modal-hd h3{margin:0;font-size:15px;font-weight:700;flex:1}
.modal-scroll{flex:1;overflow-y:auto;padding:18px}
.sec-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 8px}
.tpl-row{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}
.tpl-btn{padding:7px 12px;border:1px solid var(--border);border-radius:var(--radius);background:transparent;color:var(--text);cursor:pointer;font:inherit;font-size:12px;font-weight:600;transition:.12s;display:flex;align-items:center;gap:6px}
.tpl-btn:hover{border-color:var(--accent);background:rgba(88,166,255,.05);color:var(--accent)}
.upload-zone{border:2px dashed var(--border);border-radius:var(--radius);padding:14px 18px;text-align:center;cursor:pointer;transition:.15s;color:var(--muted);margin-bottom:14px;font-size:13px}
.upload-zone:hover,.upload-zone.drag{border-color:var(--accent);background:rgba(88,166,255,.04);color:var(--accent)}
.install-preview{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:10px;font-size:13px;display:none}
.install-err{color:var(--danger);font-size:13px;margin-bottom:10px;display:none}
.modal-row{display:flex;gap:8px;padding-top:4px}
.install-tab{padding:5px 14px;border:none;border-radius:calc(var(--radius) - 2px);background:transparent;color:var(--muted);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:.12s;white-space:nowrap}
.install-tab:hover{color:var(--text)}
.install-tab.active{background:var(--surface);color:var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.3)}
</style>`;

  const body = `
<div class="page-hd">
  <div class="page-hd-left">
    <h2 data-i18n="ext.title">🧩 插件管理
      <span style="font-size:13px;font-weight:400;color:var(--muted);border:1px solid var(--border);border-radius:20px;padding:2px 10px;margin-left:6px" id="ext-count">${exts.length}<span data-i18n="ext.count"> 个</span></span>
    </h2>
    <p data-i18n="ext.sub">插件可扩展文档平台的主题、组件和系统功能，禁用后恢复默认效果</p>
  </div>
  <div class="page-actions">
    <button class="icon-btn" onclick="checkExtUpdates()" data-i18n-title="ext.checkUpdates" title="检查更新">↻</button>
    <button class="btn btn-primary" onclick="openModal('install-modal')" data-i18n="ext.install">+ 安装插件</button>
  </div>
</div>

${allTags.length > 0 ? `
<div class="filter-bar">
  <span class="filter-lbl" data-i18n="ext.tagLabel">Tag</span>
  <button class="tag-filter active" data-tag="" data-i18n="ext.filterAll">全部</button>
  ${allTags.map(t => `<button class="tag-filter" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}
</div>` : ''}

${exts.length === 0 ? `
<div class="empty-state2">
  <div class="empty-icon">🧩</div>
  <h3 data-i18n="ext.empty">暂无插件</h3>
  <p data-i18n="ext.emptyHint">点击"安装插件"开始安装</p>
  <button class="btn btn-primary" style="margin-top:10px" onclick="openModal('install-modal')" data-i18n="ext.install">安装插件</button>
</div>` : `
<div class="ext-grid" id="ext-grid">
  ${exts.map(ext => {
    const lang = 'zh';
    const displayName = extI18n(ext, 'meta.name', lang, ext.name);
    const displayDesc = extI18n(ext, 'meta.description', lang, ext.description);
    const displayAuthor = extI18n(ext, 'meta.author', lang, ext.author);
    const displayVersion = extI18n(ext, 'meta.version', lang, ext.version);
    const displaySlug = extI18n(ext, 'meta.slug', lang, ext.slug);
    const displayTags = (extI18n(ext, 'meta.tags', lang, ext.tags.join(',')) || '').split(',').map(t => t.trim()).filter(Boolean);
    const displayBlocks = (extI18n(ext, 'meta.blockTypes', lang, ext.blockTypes.join(',')) || '').split(',').map(t => t.trim()).filter(Boolean);
    const color = TYPE_COLOR[ext.extType] || '#8b949e';
    const typeKey = `ext.type${ext.extType.charAt(0).toUpperCase()}${ext.extType.slice(1)}` as string;
    const labelZh = TYPE_LABEL[ext.extType]?.zh || ext.extType;
    return `<div class="ext-card${ext.enabled ? '' : ' disabled'}" data-ext-id="${ext.id}" data-tags="${esc(JSON.stringify(ext.tags))}">
      <div class="ext-head">
        <div class="ext-icon">${iconHtml(ext.icon, 26)}</div>
        <div class="ext-head-main">
          <div class="ext-title" data-ext-i18n="${ext.id}:meta.name" data-fallback="${esc(ext.name)}">${esc(displayName)}
            <span class="ext-badge" data-i18n="${esc(typeKey)}" style="background:${color}22;color:${color};border:1px solid ${color}44">${esc(labelZh)}</span>
          </div>
          <div class="ext-meta">v<span data-ext-i18n="${ext.id}:meta.version" data-fallback="${esc(ext.version)}">${esc(displayVersion)}</span>${ext.author ? ' · <span data-ext-i18n="' + ext.id + ':meta.author" data-fallback="' + esc(ext.author) + '">' + esc(displayAuthor) + '</span>' : ''} · <code style="font-size:10px" data-ext-i18n="${ext.id}:meta.slug" data-fallback="${esc(ext.slug)}">${esc(displaySlug)}</code></div>
        </div>
        <div class="ext-head-actions">
          <button class="icon-btn" onclick="shareExt(${ext.id},'${esc(ext.slug)}')" data-i18n-title="ext.share" title="分享">↗</button>
        </div>
      </div>
      ${ext.description ? `<div class="ext-desc" data-ext-i18n="${ext.id}:meta.description" data-fallback="${esc(ext.description)}">${esc(displayDesc)}</div>` : ''}
      ${displayBlocks.length || displayTags.length ? `<div class="chips" data-ext-chips="${ext.id}">
        ${displayBlocks.map(t => `<span class="chip chip-block">${esc(t)}</span>`).join('')}
        ${displayTags.map(t => `<span class="chip chip-tag">#${esc(t)}</span>`).join('')}
      </div>` : ''}
      <div class="ext-update" id="ext-update-${ext.id}" style="display:none;font-size:12px;color:var(--warn);border:1px solid rgba(210,153,29,.25);background:rgba(210,153,29,.08);border-radius:6px;padding:7px 9px"></div>
      <div class="ext-actions">
        <label class="toggle">
          <input type="checkbox" ${ext.enabled ? 'checked' : ''} onchange="toggleExt(${ext.id},this)">
          <span class="toggle-slider"></span>
        </label>
        <span style="font-size:12px;color:var(--muted);flex:1" data-i18n="${ext.enabled ? 'ext.enabled' : 'ext.disabled'}">${ext.enabled ? '已启用' : '已禁用'}</span>
        <a href="/admin/extensions/${ext.id}" class="btn" data-i18n="ext.edit">编辑</a>
        <button class="btn btn-danger" onclick="deleteExt(${ext.id},'${esc(ext.name)}')" data-i18n="ext.delete">删除</button>
      </div>
    </div>`;
  }).join('')}
</div>`}

<!-- ── Install Modal ── -->
<div class="modal-ov" id="install-modal">
  <div class="install-modal-box">
    <div class="install-modal-hd">
      <h3 data-i18n="ext.modalTitle">📦 安装插件</h3>
      <button class="modal-close" onclick="closeModal('install-modal')">✕</button>
    </div>
    <div class="modal-scroll">
      <!-- Quick start templates -->
      <p class="sec-lbl" data-i18n="ext.quickStart">快速开始</p>
      <div class="tpl-row">
        <button class="tpl-btn" onclick="loadTpl('theme')" data-i18n="ext.tplTheme">🎨 主题插件</button>
        <button class="tpl-btn" onclick="loadTpl('widget')" data-i18n="ext.tplWidget">🧩 组件插件</button>
        <button class="tpl-btn" onclick="loadTpl('system')" data-i18n="ext.tplSystem">⚙️ 系统插件</button>
      </div>

      <!-- Upload / URL tab switcher -->
      <div style="display:flex;gap:2px;margin-bottom:12px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:3px;width:fit-content">
        <button id="tab-btn-upload" class="install-tab active" onclick="switchInstallTab('upload')" data-i18n="ext.uploadTab">📁 上传文件</button>
        <button id="tab-btn-url"    class="install-tab"        onclick="switchInstallTab('url')"    data-i18n="ext.urlTab">🔗 从网址</button>
      </div>

      <!-- Upload panel -->
      <div id="install-panel-upload">
        <div class="upload-zone" id="upload-zone"
          onclick="document.getElementById('file-input').click()"
          ondragover="event.preventDefault();this.classList.add('drag')"
          ondragleave="this.classList.remove('drag')"
          ondrop="handleDrop(event)"
          data-i18n="ext.uploadHint">拖拽或点击上传 .json 文件</div>
        <input type="file" id="file-input" accept=".json,application/json" style="display:none">
      </div>

      <!-- URL panel -->
      <div id="install-panel-url" style="display:none">
        <div style="display:flex;gap:6px;margin-bottom:4px">
          <input id="url-input" type="url"
            style="flex:1;padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px;outline:none;transition:.12s"
            data-i18n-placeholder="ext.urlPlaceholder" placeholder="输入 Manifest JSON 的网址"
            onkeydown="if(event.key==='Enter')loadFromUrl()"
            onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
          <button class="btn" onclick="loadFromUrl()" style="flex-shrink:0" data-i18n="ext.loadFromUrl">从网址加载</button>
        </div>
      </div>

      <!-- Preview card: shown after successful parse -->
      <div id="install-preview" class="install-preview"></div>
      <div id="install-err" class="install-err"></div>
      <div class="modal-row" id="install-actions" style="display:none">
        <button class="btn btn-primary" onclick="doInstall()" data-i18n="ext.installBtn">📦 安装</button>
      </div>
    </div>
  </div>
</div>

<script>
// ── Card actions ──
async function toggleExt(id,cb){
  var card=cb.closest('.ext-card'),lbl=card.querySelector('.ext-actions span');
  var r=await fetch('/api/admin/extensions/'+id+'/toggle',{method:'PUT'});
  var d=await r.json();
  if(d.ok){
    card.classList.toggle('disabled',!d.enabled);
    lbl.dataset.i18n=d.enabled?'ext.enabled':'ext.disabled';
    lbl.textContent=d.enabled?t('ext.enabled'):t('ext.disabled');
    cb.checked=!!d.enabled;
  }else{cb.checked=!cb.checked;alert(t('ext.toggleFail'));}
}
async function deleteExt(id,name){
  if(!confirm(t('ext.confirmDelete')+'「'+name+'」？'))return;
  var r=await fetch('/api/admin/extensions/'+id,{method:'DELETE'});
  if((await r.json()).ok)location.reload();else alert(t('ext.deleteFail'));
}
// ── Tag filter ──
(function(){
  var btns=document.querySelectorAll('.tag-filter');
  var cards=document.querySelectorAll('.ext-card');
  var countEl=document.getElementById('ext-count');
  btns.forEach(function(btn){
    btn.addEventListener('click',function(){
      btns.forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      var tag=btn.dataset.tag;
      var vis=0;
      cards.forEach(function(card){
        var tags=[];try{tags=JSON.parse(card.dataset.tags||'[]');}catch(e){}
        var show=!tag||tags.includes(tag);
        card.style.display=show?'':'none';
        if(show)vis++;
      });
      if(countEl)countEl.firstChild.textContent=vis;
    });
  });
})();
// ── Install tab switcher ──
function switchInstallTab(tab){
  document.getElementById('install-panel-upload').style.display=tab==='upload'?'':'none';
  document.getElementById('install-panel-url').style.display=tab==='url'?'':'none';
  document.getElementById('tab-btn-upload').classList.toggle('active',tab==='upload');
  document.getElementById('tab-btn-url').classList.toggle('active',tab==='url');
  if(tab==='url')setTimeout(function(){document.getElementById('url-input').focus();},60);
}
// ── Install modal ──
var TEMPLATES=${JSON.stringify(BLANK_TEMPLATES, null, 0)};
var _manifest=null; // parsed manifest ready to install
var TC={theme:'#3fb950',renderer:'#58a6ff',widget:'#d2991d',general:'#8b949e'};

function loadTpl(key){
  openModal('install-modal');
  loadManifest(JSON.stringify(TEMPLATES[key]||{}));
}
document.getElementById('file-input').addEventListener('change',function(e){
  var f=e.target.files[0];if(!f)return;readFile(f);this.value='';
});
function handleDrop(e){
  e.preventDefault();document.getElementById('upload-zone').classList.remove('drag');
  var f=e.dataTransfer.files[0];if(f)readFile(f);
}
function readFile(f){
  var r=new FileReader();
  r.onload=function(ev){loadManifest(ev.target.result);};
  r.readAsText(f,'utf-8');
}
async function loadFromUrl(){
  var url=document.getElementById('url-input').value.trim();
  if(!url)return;
  hideInstallErr();
  try{
    var btn=document.querySelector('#url-input+button');
    if(btn)btn.disabled=true;
    var r=await fetch('/api/admin/extensions/fetch-manifest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url})});
    var d=await r.json();
    if(d.json)loadManifest(d.json,d.sourceUrl||url);
    else showInstallErr(t('ext.urlFetchFail')+': '+(d.error||''));
  }catch(e){showInstallErr(t('ext.networkErr')+': '+e.message);}
  finally{var btn2=document.querySelector('#url-input+button');if(btn2)btn2.disabled=false;}
}
function loadManifest(jsonText, sourceUrl){
  hideInstallErr();
  _manifest=null;
  document.getElementById('install-preview').style.display='none';
  document.getElementById('install-actions').style.display='none';
  try{
    var d=JSON.parse(jsonText);
    if(!d.slug){showInstallErr(t('ext.noSlug'));return;}
    if(!d.name){showInstallErr(t('ext.noName'));return;}
    if(!/^[a-z0-9-]+$/.test(d.slug)){showInstallErr(t('ext.badSlug'));return;}
    _manifest=d;
    if(sourceUrl)_manifest.__sourceUrl=sourceUrl;
    var type=d.type||'general';
    var color=TC[type]||'#8b949e';
    var tags=(d.tags||[]).map(function(tag){return'<span class="chip chip-tag">#'+escHtml(tag)+'</span>';}).join('');
    var bts=(d.blockTypes||[]).map(function(bt){return'<span class="chip chip-block">'+escHtml(bt)+'</span>';}).join('');
    var prev=document.getElementById('install-preview');
    prev.innerHTML=
      '<div class="ext-head">'
      +'<div class="ext-icon">'+(d.icon||'🧩')+'</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div class="ext-title">'+escHtml(d.name)
      +'<span class="ext-badge" style="background:'+color+'22;color:'+color+';border:1px solid '+color+'44">'+escHtml(type)+'</span>'
      +'</div>'
      +'<div class="ext-meta">v'+escHtml(d.version||'1.0.0')+(d.author?' · '+escHtml(d.author):'')
      +'  <code style="font-size:10px">'+escHtml(d.slug)+'</code></div>'
      +'</div></div>'
      +(d.description?'<div class="ext-desc" style="margin-top:6px">'+escHtml(d.description)+'</div>':'')
      +(tags||bts?'<div class="chips" style="margin-top:6px">'+tags+bts+'</div>':'');
    prev.style.display='block';
    document.getElementById('install-actions').style.display='flex';
  }catch(e){showInstallErr('JSON: '+e.message);}
}
function hideInstallErr(){var e=document.getElementById('install-err');e.style.display='none';}
function showInstallErr(msg){var e=document.getElementById('install-err');e.textContent=msg;e.style.display='block';}
async function doInstall(){
  if(!_manifest){showInstallErr(t('ext.noSlug'));return;}
  try{
    var r=await fetch('/api/admin/extensions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(_manifest)});
    var d=await r.json();
    if(d.ok){location.href='/admin/extensions/'+d.id;}
    else showInstallErr(t('ext.installFail')+': '+(d.error||''));
  }catch(e){showInstallErr(t('ext.networkErr')+': '+e.message);}
}
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
var _installUrl=new URLSearchParams(location.search).get('install');
if(_installUrl){
  openModal('install-modal');
  switchInstallTab('url');
  document.getElementById('url-input').value=_installUrl;
  loadFromUrl();
}
// t() helper — uses adminLayout's i18n object built at runtime
// t() helper — reads from the same ADMIN_I18N embedded by adminLayout
var _I18N=${JSON.stringify(ADMIN_I18N)};
var _EXT_I18N=${JSON.stringify(Object.fromEntries(exts.map(e => [e.id, e.i18nStrings])))};
function curLang(){return (document.cookie.match(/(?:^|;\\s*)lang=([^;]+)/)||[])[1]||((navigator.language||'').toLowerCase().indexOf('zh')===0?'zh':'en');}
function t(key){var lang=curLang();var e=_I18N[key];return e?e[lang]||e.zh:key;}
function extT(id,key,fallback){var lang=curLang();var e=(_EXT_I18N[id]||{})[key];return e?(e[lang]||e.zh||e.en||fallback):fallback;}
function applyExtCardsI18n(){
  document.querySelectorAll('[data-ext-i18n]').forEach(function(el){
    var p=el.dataset.extI18n.split(':');
    el.textContent=extT(p[0],p[1],el.dataset.fallback||el.textContent);
  });
}
applyExtCardsI18n();
async function shareExt(id,slug){
  var url=new URL('/api/extensions/'+slug+'/manifest.json', location.origin).href;
  var install=new URL('/admin/extensions', location.origin).href + '?install=' + encodeURIComponent(url);
  var text=install;
  try{await navigator.clipboard.writeText(text);alert(t('ext.shareCopied')+'\\n'+text);}
  catch(e){prompt(t('ext.shareLink'),text);}
}
async function checkExtUpdates(){
  var r=await fetch('/api/admin/extensions/check-updates',{method:'POST'});
  var d=await r.json();
  if(!d.ok){alert(t('ext.updateCheckFailed'));return;}
  var found=0;
  Object.keys(d.updates||{}).forEach(function(id){
    var u=d.updates[id], box=document.getElementById('ext-update-'+id);
    if(!box)return;
    if(u.hasUpdate){
      found++;
      box.style.display='';
      box.innerHTML=t('ext.updateAvailable').replace('%s',u.latestVersion||'')+' <button class="btn btn-sm" onclick="updateExt('+id+')" style="margin-left:8px">'+t('ext.updateNow')+'</button>';
    }else if(u.error){
      box.style.display='';
      box.textContent=t('ext.updateCheckFailed')+': '+u.error;
    }
  });
  if(!found)alert(t('ext.noUpdates'));
}
async function updateExt(id){
  if(!confirm(t('ext.confirmUpdate')))return;
  var r=await fetch('/api/admin/extensions/'+id+'/update-from-url',{method:'POST'});
  var d=await r.json();
  if(d.ok)location.reload();else alert(t('ext.updateFailed')+': '+(d.error||''));
}
</script>`;

  return adminLayout({ title: '插件管理', active: 'extensions', head, body });
}

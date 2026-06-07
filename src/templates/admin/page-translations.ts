import { adminLayout, esc } from './layout';
import { ADMIN_I18N, LOCALES } from '../../services/i18n';
import { AI_TRANSLATE_CONTROLS, AI_TRANSLATE_SCRIPT } from './ai-translation';

export const translationsList = (
  plugins: any[],
  page: number,
  total: number,
  pageSize: number,
  transCounts: Record<number, number> = {},
  extsWithI18n: any[] = [],
  tab: 'docs' | 'ext' = 'docs',
) => adminLayout({
  title: '翻译管理',
  active: 'translations',
  body: `
<h1 class="page-title" data-i18n="nav.translations">🌐 翻译管理</h1>

<div class="card" style="margin-bottom:12px">
  <div style="display:flex;align-items:center;gap:14px;padding:4px 0">
    <div style="width:38px;height:38px;border-radius:8px;background:rgba(88,166,255,.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🔧</div>
    <div style="flex:1">
      <div style="font-weight:700;font-size:14px" data-i18n="trans.systemTitle">系统翻译</div>
      <div style="font-size:12px;color:var(--muted);margin-top:2px" data-i18n="trans.systemDesc">后台界面、文档页面全部 UI 字符串</div>
    </div>
    <a href="/admin/translations/system" class="btn btn-outline btn-sm" data-i18n="trans.enter">进入翻译 →</a>
  </div>
</div>

<!-- Tab switcher -->
<div style="display:flex;gap:4px;margin-bottom:14px;border-bottom:1px solid var(--border);padding-bottom:0">
  <a href="/admin/translations?tab=docs"
    class="btn btn-sm" style="border-radius:var(--radius) var(--radius) 0 0;border-bottom:none;${tab==='docs'?'background:var(--surface);color:var(--accent);border-bottom:2px solid var(--accent);':'color:var(--muted);background:transparent;border-color:transparent'}"
    data-i18n="trans.tabDocs">文档</a>
  <a href="/admin/translations?tab=ext"
    class="btn btn-sm" style="border-radius:var(--radius) var(--radius) 0 0;border-bottom:none;${tab==='ext'?'background:var(--surface);color:var(--accent);border-bottom:2px solid var(--accent);':'color:var(--muted);background:transparent;border-color:transparent'}"
    data-i18n="trans.tabExt">插件</a>
</div>

${tab === 'docs' ? `
<div class="card">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
    <h3 style="margin:0" data-i18n="trans.docTrans">文档翻译</h3>
    <span style="font-size:12px;color:var(--muted)">${total} <span data-i18n="trans.project">项目</span></span>
  </div>
  <table>
    <thead><tr>
      <th data-i18n="trans.project">项目</th>
      <th style="width:100px;text-align:center" data-i18n="trans.keyCount">Key 数</th>
      <th style="width:110px"></th>
    </tr></thead>
    <tbody>
      ${plugins.length === 0 ? `<tr><td colspan="3"><div class="empty-state"><p data-i18n="docs.empty">暂无文档</p></div></td></tr>` : ''}
      ${plugins.map((p: any) => {
        const cnt = transCounts[p.id] || 0;
        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;border-radius:6px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">
                ${p.iconUrl ? `<img src="${esc(p.iconUrl)}" style="width:100%;height:100%;object-fit:cover" alt="">` : `<span style="font-size:14px;color:var(--accent)">●</span>`}
              </div>
              <div>
                <div style="font-weight:600;font-size:14px">${esc(p.name)}</div>
                <div style="font-size:11px;color:var(--muted);font-family:var(--mono)">${esc(p.slug)} · v${esc(p.version)}</div>
              </div>
            </div>
          </td>
          <td style="text-align:center">
            <span style="font-size:13px;font-weight:600;color:${cnt > 0 ? 'var(--ok)' : 'var(--muted)'}">${cnt}</span>
          </td>
          <td>
            <a href="/admin/plugins/${p.id}/translations" class="btn btn-outline btn-sm" style="width:100%;justify-content:center" data-i18n="trans.enter">进入翻译 →</a>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  ${total > pageSize ? `
  <div class="pager" style="margin-top:14px">
    <button ${page <= 1 ? 'disabled' : ''} onclick="location.href='/admin/translations?tab=docs&page=${page - 1}'" data-i18n="nav.prevPage">‹ 上一页</button>
    <span>${page} / ${Math.ceil(total / pageSize)}</span>
    <button ${page >= Math.ceil(total / pageSize) ? 'disabled' : ''} onclick="location.href='/admin/translations?tab=docs&page=${page + 1}'" data-i18n="nav.nextPage">下一页 ›</button>
  </div>` : ''}
</div>` : `
<div class="card">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
    <h3 style="margin:0" data-i18n="trans.extTrans">插件翻译</h3>
    <span style="font-size:12px;color:var(--muted)">${extsWithI18n.length} <span data-i18n="trans.project">项目</span></span>
  </div>
  <table>
    <thead><tr>
      <th data-i18n="trans.project">项目</th>
      <th style="width:100px;text-align:center" data-i18n="trans.keyCount">Key 数</th>
      <th style="width:110px"></th>
    </tr></thead>
    <tbody>
      ${extsWithI18n.length === 0 ? `<tr><td colspan="3"><div class="empty-state"><p data-i18n="ext.empty">暂无插件</p></div></td></tr>` : ''}
      ${extsWithI18n.map((e: any) => {
        const keyCount = Object.keys(e.i18nStrings || {}).length;
        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;border-radius:6px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">
                ${esc(e.icon || '🧩')}
              </div>
              <div>
                <div style="font-weight:600;font-size:14px">${esc(e.name)}</div>
                <div style="font-size:11px;color:var(--muted);font-family:var(--mono)">${esc(e.slug)} · v${esc(e.version)}</div>
              </div>
            </div>
          </td>
          <td style="text-align:center">
            <span style="font-size:13px;font-weight:600;color:${keyCount > 0 ? 'var(--ok)' : 'var(--muted)'}">${keyCount}</span>
          </td>
          <td>
            <a href="/admin/extensions/${e.id}/translations" class="btn btn-outline btn-sm" style="width:100%;justify-content:center" data-i18n="trans.enter">进入翻译 →</a>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>`}`,
});

export const systemTranslations = (rawRows: any[], systemId: number) => adminLayout({
  title: '系统翻译',
  active: 'translations',
  head: `<style>
.t-bar-input{padding:5px 8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px}
.t-bar-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px rgba(88,166,255,.12)}
.t-bar-sel{padding:5px 28px 5px 8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:12px;-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%238b949e'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center}
.t-bar-sel:focus{outline:none;border-color:var(--accent)}
</style>`,
  body: `
<h1 class="page-title">🔧 <span data-i18n="trans.systemTitle">系统翻译</span></h1>
<div class="btn-group" style="margin-bottom:14px">
  <a href="/admin/translations" class="btn btn-outline btn-sm" data-i18n="trans.backDoc">← 翻译列表</a>
</div>
<div class="card">
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
    <input id="t-filter" placeholder="搜索 key…" class="t-bar-input" style="flex:1;min-width:140px;max-width:280px" onkeyup="renderTable()">
    <span class="fi fi-cn" id="t-src-flag" style="font-size:18px"></span>
    <select id="t-src" onchange="updateFlag('t-src-flag',this.value);renderTable()" class="t-bar-sel"></select>
    <span style="color:var(--muted)">→</span>
    <span class="fi fi-us" id="t-dst-flag" style="font-size:18px"></span>
    <select id="t-dst" onchange="updateFlag('t-dst-flag',this.value);renderTable()" class="t-bar-sel"></select>
    <button class="btn btn-outline btn-sm" onclick="openAddLocale()" data-i18n-title="trans.addLangTitle" title="添加翻译语言" style="gap:4px">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span data-i18n="trans.addLang">语言</span>
    </button>
    <button class="btn btn-outline btn-sm" onclick="removeLocale()" title="移除当前目标语言" style="gap:4px;color:var(--danger);border-color:rgba(248,81,73,.3)">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
    </button>
    ${AI_TRANSLATE_CONTROLS}
    <div style="flex:1"></div>
    <button class="btn btn-primary btn-sm" onclick="addRow()" data-i18n="trans.addKey">添加 Key</button>
    <button class="btn btn-ok btn-sm" id="t-save-all" data-i18n="trans.batchSaveBtn">批量保存</button>
  </div>
  <div style="max-height:calc(100vh - 260px);overflow-y:auto">
    <table id="t-table"><thead><tr>
      <th style="width:35%" data-i18n="trans.key">Key</th>
      <th style="width:30%" data-i18n="trans.source">原文</th>
      <th style="width:30%" data-i18n="trans.translation">翻译</th>
      <th style="width:5%"></th>
    </tr></thead><tbody></tbody></table>
  </div>
</div>

<div class="modal-ov" id="add-locale-modal">
  <div class="modal" style="width:480px;max-width:96vw">
    <div class="modal-hd">
      <h3 data-i18n="trans.addLangTitle">添加翻译语言</h3>
      <button class="modal-close" onclick="closeModal('add-locale-modal')">✕</button>
    </div>
    <input id="locale-search" type="text" data-i18n-placeholder="trans.langSearchPlaceholder" placeholder="搜索语言名称或代码…" autocomplete="off"
      style="width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px;box-sizing:border-box;margin-bottom:8px"
      oninput="renderLocaleGrid(this.value.trim().toLowerCase())">
    <div id="locale-grid" style="display:grid;grid-template-columns:1fr;gap:6px;max-height:340px;overflow-y:auto;padding-right:2px"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('add-locale-modal')" data-i18n="docs.cancel">取消</button>
    </div>
  </div>
</div>

<script>
var ALL_ROWS = ${JSON.stringify(rawRows)};
var PLUGIN_ID = ${systemId};
var LOCALES_DEF = ${JSON.stringify(LOCALES.map(l => ({ code: l.code, name: l.name, country: l.country })))};
var PAGE_I18N = ${JSON.stringify(ADMIN_I18N)};
var PAGE_LANG = (document.cookie.match(/(?:^|;\\s*)lang=([^;]+)/)||[])[1] || ((navigator.language||'').toLowerCase().indexOf('zh')===0?'zh':'en');
function tt(key){var e=PAGE_I18N[key];return e?(e[PAGE_LANG]||e.zh||e.en||key):key;}
var allKeys = [...new Set(ALL_ROWS.map(function(r){return r.key;}))];
var activeLocales = [...new Set(ALL_ROWS.map(function(r){return r.locale;}))];
if(!activeLocales.length) activeLocales=['zh'];

function updateFlag(spanId,code){var loc=LOCALES_DEF.find(function(l){return l.code===code;});var span=document.getElementById(spanId);if(span)span.className='fi fi-'+(loc?loc.country:code);}

(function(){
  var knownCodes=LOCALES_DEF.map(function(l){return l.code;});
  activeLocales.forEach(function(code){if(knownCodes.indexOf(code)===-1)LOCALES_DEF.push({code:code,name:code,country:code});});
  var opts=activeLocales.map(function(code){
    var l=LOCALES_DEF.find(function(x){return x.code===code;})||{code:code,name:code,country:code};
    return'<option value="'+l.code+'">'+l.name+' ('+l.code+')</option>';
  }).join('');
  document.getElementById('t-src').innerHTML=opts;
  document.getElementById('t-dst').innerHTML=opts;
  var src=activeLocales[0]||'zh';
  var dst=activeLocales.length>1?activeLocales[1]:activeLocales[0];
  document.getElementById('t-src').value=src;
  document.getElementById('t-dst').value=dst;
  updateFlag('t-src-flag',src);
  updateFlag('t-dst-flag',dst);
})();

function getVal(key,locale){var r=ALL_ROWS.find(function(r2){return r2.key===key&&r2.locale===locale;});return r?r.value:'';}
function renderTable(){
  var src=document.getElementById('t-src').value,dst=document.getElementById('t-dst').value;
  var f=document.getElementById('t-filter').value.toLowerCase();
  var rows=allKeys.filter(function(k){return!f||k.toLowerCase().indexOf(f)!==-1;});
  document.querySelector('#t-table tbody').innerHTML=rows.map(function(k){
    var sv=getVal(k,src),dv=getVal(k,dst);
    return'<tr data-key="'+k+'"><td><code style="font-size:12px">'+k+'</code></td>'
      +'<td><input class="t-cell-edit" value="'+sv.replace(/"/g,'&quot;')+'" data-locale="'+src+'" data-key="'+k+'"></td>'
      +'<td><input class="t-cell-edit'+(dv.trim()?'':' t-missing')+'" value="'+dv.replace(/"/g,'&quot;')+'" data-locale="'+dst+'" data-key="'+k+'"></td>'
      +'<td><button class="btn btn-danger btn-sm" onclick="delRow(\\''+k+'\\')">'+tt('trans.delete')+'</button></td></tr>';
  }).join('');
}
function addRow(){var k=prompt(tt('trans.promptKey'));if(!k)return;if(allKeys.indexOf(k)===-1)allKeys.push(k);renderTable();}
async function delRow(key){
  if(!confirm(tt('trans.confirmDelete')+key+' ?'))return;
  await fetch('/api/admin/translations',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:${systemId},key:key})});
  ALL_ROWS=ALL_ROWS.filter(function(r){return r.key!==key;});
  allKeys=allKeys.filter(function(k){return k!==key;});
  renderTable();
}
document.getElementById('t-save-all').addEventListener('click',async function(){
  var entries=[];
  document.querySelectorAll('#t-table tbody tr').forEach(function(r){
    var key=r.dataset.key;
    r.querySelectorAll('input').forEach(function(inp){entries.push({key:key,locale:inp.dataset.locale,value:inp.value});});
  });
  await fetch('/api/admin/translations',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:${systemId},entries:entries})});
  alert(tt('trans.saved'));location.reload();
});

async function removeLocale(){
  var dst=document.getElementById('t-dst').value;
  if(!dst)return;
  if(activeLocales.length<=1){alert(tt('trans.keepOne'));return;}
  if(!confirm(tt('trans.confirmRemoveLang').replace('%s',dst)))return;
  var r=await fetch('/api/admin/translations/locale',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:PLUGIN_ID,locale:dst})});
  var d=await r.json();
  if(d.ok)location.reload();
  else alert(tt('trans.removeFailed')+': '+(d.error||'unknown'));
}
var _availLocales=[];
function openAddLocale(){
  _availLocales=LOCALES_DEF.filter(function(l){return activeLocales.indexOf(l.code)===-1;});
  _availLocales.sort(function(a,b){var an=a.name.toLowerCase(),bn=b.name.toLowerCase();return an<bn?-1:an>bn?1:0;});
  var s=document.getElementById('locale-search');if(s)s.value='';
  renderLocaleGrid('');
  openModal('add-locale-modal');
  if(s)setTimeout(function(){s.focus();},60);
}
function renderLocaleGrid(q){
  var grid=document.getElementById('locale-grid');
  var list=q?_availLocales.filter(function(l){return l.name.toLowerCase().indexOf(q)!==-1||l.code.toLowerCase().indexOf(q)!==-1;}):_availLocales;
  if(!list.length){
    grid.innerHTML='<p style="color:var(--muted);font-size:13px;padding:8px 0">'+(q?tt('trans.noMatch'):tt('trans.noLangs'))+'</p>';
    return;
  }
  grid.innerHTML=list.map(function(l){
    var btn='<button class="btn btn-outline" data-add-locale="'+l.code+'" style="display:flex;align-items:center;gap:8px;justify-content:flex-start;width:100%;padding:10px 12px">';
    btn+='<span class="fi fi-'+l.country+'" style="font-size:18px;flex-shrink:0"></span>';
    btn+='<span style="font-size:13px;flex:1;text-align:left">'+l.name+'</span>';
    btn+='<span style="font-size:11px;color:var(--muted);margin-left:auto">('+l.code+')</span>';
    btn+='</button>';
    return btn;
  }).join('');
}
document.getElementById('locale-grid').addEventListener('click',function(e){
  var btn=e.target.closest('[data-add-locale]');
  if(!btn)return;
  var code=btn.getAttribute('data-add-locale');
  closeModal('add-locale-modal');
  btn.disabled=true;
  fetch('/api/admin/translations/add-locale',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:PLUGIN_ID,locale:code})})
    .then(function(r){return r.json();})
    .then(function(d){if(d.ok){location.reload();}else{alert(tt('trans.addFailed')+': '+(d.error||'unknown'));}});
});

${AI_TRANSLATE_SCRIPT}
renderTable();
</script>`,
});

export const pluginTranslations = (plugin: any, rawRows: any[], allSections: any[] = [], activeSection: any = null) => adminLayout({
  title:`${plugin.name}${activeSection ? ' · ' + (activeSection.titleZh || activeSection.slug) : ''} - 翻译`,active:'translations',
  head:`<style>
.t-bar-input{padding:5px 8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px}
.t-bar-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px rgba(88,166,255,.12)}
.t-bar-sel{padding:5px 28px 5px 8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:12px;-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%238b949e'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center}
.t-bar-sel:focus{outline:none;border-color:var(--accent)}
</style>`,
  body:`<h1 class="page-title">
  ${esc(plugin.name)}
  ${activeSection ? `<span style="color:var(--muted);font-weight:400;font-size:16px"> / ${esc(activeSection.titleZh || activeSection.titleEn || activeSection.slug)}</span>` : ''}
  <span style="color:var(--muted);font-weight:400;font-size:16px"> — <span data-i18n="editor.translations">🌐 翻译</span></span>
</h1>
<div class="btn-group" style="margin-bottom:14px">
  <a href="/admin/translations" class="btn btn-outline btn-sm" data-i18n="trans.backDoc">← 翻译列表</a>
  ${activeSection ? `<a href="/admin/plugins/${plugin.id}/translations" class="btn btn-outline btn-sm" data-i18n="trans.allKeys">全部</a>` : ''}
  <a href="/admin/plugins/${plugin.id}/editor" class="btn btn-outline btn-sm" data-i18n="docs.editor">✏️ 编辑器</a>
</div>
${allSections.length > 1 ? `
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
  <a href="/admin/plugins/${plugin.id}/translations" class="btn btn-sm ${!activeSection ? 'btn-primary' : 'btn-outline'}" data-i18n="trans.allKeys">全部</a>
  ${allSections.map((s: any) => `<a href="/admin/plugins/${plugin.id}/translations?section=${esc(s.slug)}" class="btn btn-sm ${activeSection?.slug === s.slug ? 'btn-primary' : 'btn-outline'}" title="${esc(s.titleEn || s.slug)}">${esc(s.titleZh || s.titleEn || s.slug)}</a>`).join('')}
</div>` : ''}
<div class="card">
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
    <input id="t-filter" data-i18n-placeholder="trans.searchKey" placeholder="搜索 key…" class="t-bar-input" style="flex:1;min-width:140px;max-width:280px" onkeyup="renderTable()">
    <span class="fi fi-cn" id="t-src-flag" style="font-size:18px"></span>
    <select id="t-src" onchange="updateFlag('t-src-flag',this.value);renderTable()" class="t-bar-sel"></select>
    <span style="color:var(--muted)">→</span>
    <span class="fi fi-us" id="t-dst-flag" style="font-size:18px"></span>
    <select id="t-dst" onchange="updateFlag('t-dst-flag',this.value);renderTable()" class="t-bar-sel"></select>
    <button class="btn btn-outline btn-sm" onclick="openAddLocale()" data-i18n-title="trans.addLangTitle" title="添加翻译语言" style="gap:4px">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span data-i18n="trans.addLang">语言</span>
    </button>
    <button class="btn btn-outline btn-sm" onclick="removeLocale()" title="移除当前目标语言" style="gap:4px;color:var(--danger);border-color:rgba(248,81,73,.3)">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
    </button>
    ${AI_TRANSLATE_CONTROLS}
    <div style="flex:1"></div>
    <button class="btn btn-primary btn-sm" onclick="addRow()" data-i18n="trans.add">添加 Key</button>
    <button class="btn btn-ok btn-sm" id="t-save-all" data-i18n="trans.batchSave">批量保存</button>
  </div>
  <div style="max-height:calc(100vh - 260px);overflow-y:auto">
    <table id="t-table"><thead><tr><th style="width:35%" data-i18n="trans.key">Key</th><th style="width:30%" data-i18n="trans.source">原文</th><th style="width:30%" data-i18n="trans.translation">翻译</th><th style="width:5%"></th></tr></thead><tbody></tbody></table>
  </div>
</div>

<!-- Add Language Modal -->
<div class="modal-ov" id="add-locale-modal">
  <div class="modal" style="width:480px;max-width:96vw">
    <div class="modal-hd">
      <h3 data-i18n="trans.addLangTitle">添加翻译语言</h3>
      <button class="modal-close" onclick="closeModal('add-locale-modal')">✕</button>
    </div>
    <input id="locale-search" type="text" data-i18n-placeholder="trans.langSearchPlaceholder" placeholder="搜索语言名称或代码…" autocomplete="off"
      style="width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px;box-sizing:border-box;margin-bottom:8px"
      oninput="renderLocaleGrid(this.value.trim().toLowerCase())">
    <div id="locale-grid" style="display:grid;grid-template-columns:1fr;gap:6px;max-height:340px;overflow-y:auto;padding-right:2px"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('add-locale-modal')" data-i18n="docs.cancel">取消</button>
    </div>
  </div>
</div>

<script>
var ALL_ROWS = ${JSON.stringify(rawRows)};
var PLUGIN_ID = ${plugin.id};
var LOCALES_DEF = ${JSON.stringify(LOCALES.map(l => ({ code: l.code, name: l.name, country: l.country })))};
var PAGE_I18N = ${JSON.stringify(ADMIN_I18N)};
var PAGE_LANG = (document.cookie.match(/(?:^|;\\s*)lang=([^;]+)/)||[])[1] || ((navigator.language||'').toLowerCase().indexOf('zh')===0?'zh':'en');
function tt(key){var e=PAGE_I18N[key];return e?(e[PAGE_LANG]||e.zh||e.en||key):key;}
var allKeys = [...new Set(ALL_ROWS.map(function(r){return r.key;}))];

// Locales that have at least one non-empty value
var activeLocales = [...new Set(ALL_ROWS.map(function(r){return r.locale;}))];
// Fallback: ensure at least zh if nothing active
if(!activeLocales.length) activeLocales=['zh'];

function updateFlag(spanId, code){
  var loc=LOCALES_DEF.find(function(l){return l.code===code;});
  var span=document.getElementById(spanId);
  if(span) span.className='fi fi-'+(loc?loc.country:code);
}

// Init selects with ONLY activeLocales
(function(){
  // Add any active locales not in LOCALES_DEF (custom/unknown)
  var knownCodes=LOCALES_DEF.map(function(l){return l.code;});
  activeLocales.forEach(function(code){
    if(knownCodes.indexOf(code)===-1) LOCALES_DEF.push({code:code,name:code,country:code});
  });
  var opts=activeLocales.map(function(code){
    var l=LOCALES_DEF.find(function(x){return x.code===code;})||{code:code,name:code,country:code};
    return '<option value="'+l.code+'">'+l.name+' ('+l.code+')</option>';
  }).join('');
  document.getElementById('t-src').innerHTML=opts;
  document.getElementById('t-dst').innerHTML=opts;
  // Default: src=first locale, dst=second (if exists), else same as src
  var src=activeLocales[0]||'zh';
  var dst=activeLocales.length>1?activeLocales[1]:activeLocales[0];
  document.getElementById('t-src').value=src;
  document.getElementById('t-dst').value=dst;
  updateFlag('t-src-flag',src);
  updateFlag('t-dst-flag',dst);
})();

async function removeLocale(){
  var dst=document.getElementById('t-dst').value;
  if(!dst)return;
  if(activeLocales.length<=1){alert(tt('trans.keepOne'));return;}
  if(!confirm(tt('trans.confirmRemoveLang').replace('%s',dst)))return;
  var r=await fetch('/api/admin/translations/locale',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:PLUGIN_ID,locale:dst})});
  var d=await r.json();
  if(d.ok)location.reload();
  else alert(tt('trans.removeFailed')+': '+(d.error||'unknown'));
}
var _availLocales=[];
function openAddLocale(){
  _availLocales=LOCALES_DEF.filter(function(l){return activeLocales.indexOf(l.code)===-1;});
  _availLocales.sort(function(a,b){var an=a.name.toLowerCase(),bn=b.name.toLowerCase();return an<bn?-1:an>bn?1:0;});
  var s=document.getElementById('locale-search');if(s)s.value='';
  renderLocaleGrid('');
  openModal('add-locale-modal');
  if(s)setTimeout(function(){s.focus();},60);
}
function renderLocaleGrid(q){
  var grid=document.getElementById('locale-grid');
  var list=q?_availLocales.filter(function(l){return l.name.toLowerCase().indexOf(q)!==-1||l.code.toLowerCase().indexOf(q)!==-1;}):_availLocales;
  if(!list.length){
    grid.innerHTML='<p style="color:var(--muted);font-size:13px;padding:8px 0">'+(q?tt('trans.noMatch'):tt('trans.noLangs'))+'</p>';
    return;
  }
  grid.innerHTML=list.map(function(l){
    var btn='<button class="btn btn-outline" data-add-locale="'+l.code+'" style="display:flex;align-items:center;gap:8px;justify-content:flex-start;width:100%;padding:10px 12px">';
    btn+='<span class="fi fi-'+l.country+'" style="font-size:18px;flex-shrink:0"></span>';
    btn+='<span style="font-size:13px;flex:1;text-align:left">'+l.name+'</span>';
    btn+='<span style="font-size:11px;color:var(--muted);margin-left:auto">('+l.code+')</span>';
    btn+='</button>';
    return btn;
  }).join('');
}
document.getElementById('locale-grid').addEventListener('click',function(e){
  var btn=e.target.closest('[data-add-locale]');
  if(!btn)return;
  var code=btn.getAttribute('data-add-locale');
  closeModal('add-locale-modal');
  btn.disabled=true;
  fetch('/api/admin/translations/add-locale',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:PLUGIN_ID,locale:code})})
    .then(function(r){return r.json();})
    .then(function(d){if(d.ok){location.reload();}else{alert(tt('trans.addFailed')+': '+(d.error||'unknown'));}});
});

function getVal(key,locale){var r=ALL_ROWS.find(function(r2){return r2.key===key&&r2.locale===locale;});return r?r.value:'';}
function renderTable(){
  var src=document.getElementById('t-src').value,dst=document.getElementById('t-dst').value;
  var f=document.getElementById('t-filter').value.toLowerCase();
  var tbody=document.querySelector('#t-table tbody');
  var rows=allKeys.filter(function(k){return!f||k.toLowerCase().indexOf(f)!==-1;});
  tbody.innerHTML=rows.map(function(k){
    var sv=getVal(k,src),dv=getVal(k,dst);
    return'<tr data-key="'+k+'"><td><code style="font-size:12px">'+k+'</code></td>'+
      '<td><input class="t-cell-edit" value="'+sv.replace(/"/g,'&quot;')+'" data-locale="'+src+'" data-key="'+k+'"></td>'+
      '<td><input class="t-cell-edit'+(dv.trim()?'':' t-missing')+'" value="'+dv.replace(/"/g,'&quot;')+'" data-locale="'+dst+'" data-key="'+k+'"></td>'+
      '<td><button class="btn btn-danger btn-sm" onclick="delRow(\\''+k+'\\')">'+tt('trans.delete')+'</button></td></tr>';
  }).join('');
}
function addRow(){var k=prompt(tt('trans.promptKey'));if(!k)return;if(allKeys.indexOf(k)===-1)allKeys.push(k);renderTable();}
async function delRow(key){if(!confirm(tt('trans.confirmDelete')+key+' ?'))return;
  await fetch('/api/admin/translations',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:${plugin.id},key:key})});
  ALL_ROWS=ALL_ROWS.filter(function(r){return r.key!==key;});
  allKeys=allKeys.filter(function(k){return k!==key;});
  renderTable();
}
document.getElementById('t-save-all').addEventListener('click',async function(){
  var rows=document.querySelectorAll('#t-table tbody tr');
  var entries=[];
  rows.forEach(function(r){var key=r.dataset.key;r.querySelectorAll('input').forEach(function(inp){entries.push({key:key,locale:inp.dataset.locale,value:inp.value});});});
  await fetch('/api/admin/translations',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:${plugin.id},entries:entries})});
  alert(tt('trans.saved'));location.reload();
});
${AI_TRANSLATE_SCRIPT}
renderTable();
</script>`,
});

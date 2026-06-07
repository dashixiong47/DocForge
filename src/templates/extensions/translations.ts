import type { Extension } from '../../services/extensions';
import { adminLayout, esc } from '../admin/layout';
import { ADMIN_I18N, LOCALES } from '../../services/i18n';
import { AI_TRANSLATE_CONTROLS, AI_TRANSLATE_SCRIPT } from '../admin/ai-translation';

/** Flat row as used in the editor UI */
export interface I18nRow { key: string; locale: string; value: string; }

export function extensionTranslations(ext: Extension, rows: I18nRow[]): string {
  return adminLayout({
    title: `${ext.name} — i18n`,
    active: 'translations',
    head: `<style>
.t-bar-input{padding:5px 8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px}
.t-bar-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px rgba(88,166,255,.12)}
.t-bar-sel{padding:5px 28px 5px 8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:12px;-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%238b949e'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center}
.t-bar-sel:focus{outline:none;border-color:var(--accent)}
</style>`,
    body: `
<h1 class="page-title">
  ${esc(ext.name)}
  <span style="color:var(--muted);font-weight:400;font-size:16px"> — 🌐 i18n</span>
</h1>
<div class="btn-group" style="margin-bottom:14px">
  <a href="/admin/translations?tab=ext" class="btn btn-outline btn-sm" data-i18n="trans.backDoc">← 翻译列表</a>
  <a href="/admin/extensions/${ext.id}" class="btn btn-outline btn-sm" data-i18n="ext.backList">← 插件编辑器</a>
</div>
<div class="card">
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
    <input id="t-filter" data-i18n-placeholder="trans.searchKey" placeholder="搜索 key…"
      class="t-bar-input" style="flex:1;min-width:140px;max-width:280px" onkeyup="renderTable()">
    <span class="fi fi-cn" id="t-src-flag" style="font-size:18px"></span>
    <select id="t-src" onchange="updateFlag('t-src-flag',this.value);renderTable()" class="t-bar-sel"></select>
    <span style="color:var(--muted)">→</span>
    <span class="fi fi-us" id="t-dst-flag" style="font-size:18px"></span>
    <select id="t-dst" onchange="updateFlag('t-dst-flag',this.value);renderTable()" class="t-bar-sel"></select>
    <button class="btn btn-outline btn-sm" onclick="openAddLocale()" style="gap:4px">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span data-i18n="trans.addLang">语言</span>
    </button>
    <button class="btn btn-outline btn-sm" onclick="removeLocale()" title="移除当前目标语言"
      style="gap:4px;color:var(--danger);border-color:rgba(248,81,73,.3)">
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

<!-- Add Language Modal -->
<div class="modal-ov" id="add-locale-modal">
  <div class="modal" style="width:480px;max-width:96vw">
    <div class="modal-hd">
      <h3 data-i18n="trans.addLangTitle">添加翻译语言</h3>
      <button class="modal-close" onclick="closeModal('add-locale-modal')">✕</button>
    </div>
    <input id="locale-search" type="text" data-i18n-placeholder="trans.langSearchPlaceholder"
      placeholder="搜索语言名称或代码…" autocomplete="off"
      style="width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px;box-sizing:border-box;margin-bottom:8px"
      oninput="renderLocaleGrid(this.value.trim().toLowerCase())">
    <div id="locale-grid" style="display:grid;grid-template-columns:1fr;gap:6px;max-height:340px;overflow-y:auto;padding-right:2px"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('add-locale-modal')" data-i18n="docs.cancel">取消</button>
    </div>
  </div>
</div>

<script>
var EXT_ID = ${ext.id};
var ALL_ROWS = ${JSON.stringify(rows)};
var LOCALES_DEF = ${JSON.stringify(LOCALES.map(l => ({ code: l.code, name: l.name, country: l.country })))};
var PAGE_I18N = ${JSON.stringify(ADMIN_I18N)};
var PAGE_LANG = (document.cookie.match(/(?:^|;\\s*)lang=([^;]+)/)||[])[1] || ((navigator.language||'').toLowerCase().indexOf('zh')===0?'zh':'en');
function tt(key){var e=PAGE_I18N[key];return e?(e[PAGE_LANG]||e.zh||e.en||key):key;}
var allKeys = [...new Set(ALL_ROWS.map(function(r){return r.key;}))];
var activeLocales = [...new Set(ALL_ROWS.map(function(r){return r.locale;}))];
if(!activeLocales.length) activeLocales=['zh','en'];

function updateFlag(spanId,code){
  var loc=LOCALES_DEF.find(function(l){return l.code===code;});
  var span=document.getElementById(spanId);
  if(span) span.className='fi fi-'+(loc?loc.country:code);
}

(function(){
  var knownCodes=LOCALES_DEF.map(function(l){return l.code;});
  activeLocales.forEach(function(code){if(knownCodes.indexOf(code)===-1)LOCALES_DEF.push({code:code,name:code,country:code});});
  var opts=activeLocales.map(function(code){
    var l=LOCALES_DEF.find(function(x){return x.code===code;})||{code:code,name:code,country:code};
    return '<option value="'+l.code+'">'+l.name+' ('+l.code+')</option>';
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

function getVal(key,locale){
  var r=ALL_ROWS.find(function(r2){return r2.key===key&&r2.locale===locale;});
  return r?r.value:'';
}
function renderTable(){
  var src=document.getElementById('t-src').value,dst=document.getElementById('t-dst').value;
  var f=document.getElementById('t-filter').value.toLowerCase();
  var rows=allKeys.filter(function(k){return!f||k.toLowerCase().indexOf(f)!==-1;});
  document.querySelector('#t-table tbody').innerHTML=rows.map(function(k){
    var sv=getVal(k,src),dv=getVal(k,dst);
    return'<tr data-key="'+k+'">'
      +'<td><code style="font-size:11px">'+k+'</code></td>'
      +'<td><input class="t-cell-edit" value="'+sv.replace(/"/g,'&quot;')+'" data-locale="'+src+'" data-key="'+k+'"></td>'
      +'<td><input class="t-cell-edit'+(dv.trim()?'':' t-missing')+'" value="'+dv.replace(/"/g,'&quot;')+'" data-locale="'+dst+'" data-key="'+k+'"></td>'
      +'<td><button class="btn btn-danger btn-sm" onclick="delRow(this)">删除</button></td></tr>';
  }).join('');
}
function addRow(){
  var k=prompt('输入翻译 key:');
  if(!k)return;
  if(allKeys.indexOf(k)===-1)allKeys.push(k);
  renderTable();
}
function delRow(btn){
  var key=btn.closest('tr').dataset.key;
  if(!confirm('删除 key: '+key+' ?'))return;
  ALL_ROWS=ALL_ROWS.filter(function(r){return r.key!==key;});
  allKeys=allKeys.filter(function(k){return k!==key;});
  renderTable();
}
async function removeLocale(){
  var dst=document.getElementById('t-dst').value;
  if(!dst)return;
  if(activeLocales.length<=1){alert('至少保留一个语言');return;}
  if(!confirm('确认移除「'+dst+'」语言的所有翻译？此操作不可撤销。'))return;
  ALL_ROWS=ALL_ROWS.filter(function(r){return r.locale!==dst;});
  activeLocales=activeLocales.filter(function(l){return l!==dst;});
  // Rebuild selects
  var opts=activeLocales.map(function(code){
    var l=LOCALES_DEF.find(function(x){return x.code===code;})||{code:code,name:code,country:code};
    return '<option value="'+l.code+'">'+l.name+' ('+l.code+')</option>';
  }).join('');
  document.getElementById('t-src').innerHTML=opts;
  document.getElementById('t-dst').innerHTML=opts;
  document.getElementById('t-src').value=activeLocales[0]||'zh';
  document.getElementById('t-dst').value=activeLocales.length>1?activeLocales[1]:activeLocales[0];
  updateFlag('t-src-flag',document.getElementById('t-src').value);
  updateFlag('t-dst-flag',document.getElementById('t-dst').value);
  renderTable();
}
var _availLocales=[];
function openAddLocale(){
  _availLocales=LOCALES_DEF.filter(function(l){return activeLocales.indexOf(l.code)===-1;});
  _availLocales.sort(function(a,b){return a.name.toLowerCase()<b.name.toLowerCase()?-1:1;});
  var s=document.getElementById('locale-search');if(s)s.value='';
  renderLocaleGrid('');
  openModal('add-locale-modal');
  if(s)setTimeout(function(){s.focus();},60);
}
function renderLocaleGrid(q){
  var grid=document.getElementById('locale-grid');
  var list=q?_availLocales.filter(function(l){return l.name.toLowerCase().indexOf(q)!==-1||l.code.toLowerCase().indexOf(q)!==-1;}):_availLocales;
  if(!list.length){
    grid.innerHTML='<p style="color:var(--muted);font-size:13px;padding:8px 0">'+(q?'无匹配语言':'已添加所有支持的语言')+'</p>';
    return;
  }
  grid.innerHTML=list.map(function(l){
    return '<button class="btn btn-outline" data-add-locale="'+l.code+'" style="display:flex;align-items:center;gap:8px;justify-content:flex-start;width:100%;padding:10px 12px">'
      +'<span class="fi fi-'+l.country+'" style="font-size:18px;flex-shrink:0"></span>'
      +'<span style="font-size:13px;flex:1;text-align:left">'+l.name+'</span>'
      +'<span style="font-size:11px;color:var(--muted);margin-left:auto">('+l.code+')</span>'
      +'</button>';
  }).join('');
}
document.getElementById('locale-grid').addEventListener('click',function(e){
  var btn=e.target.closest('[data-add-locale]');
  if(!btn)return;
  var code=btn.getAttribute('data-add-locale');
  closeModal('add-locale-modal');
  if(activeLocales.indexOf(code)===-1){
    activeLocales.push(code);
    LOCALES_DEF.find(function(l){return l.code===code;});
    var opts=activeLocales.map(function(c){
      var l=LOCALES_DEF.find(function(x){return x.code===c;})||{code:c,name:c,country:c};
      return '<option value="'+l.code+'">'+l.name+' ('+l.code+')</option>';
    }).join('');
    document.getElementById('t-src').innerHTML=opts;
    document.getElementById('t-dst').innerHTML=opts;
    document.getElementById('t-dst').value=code;
    updateFlag('t-dst-flag',code);
    renderTable();
  }
});

document.getElementById('t-save-all').addEventListener('click',async function(){
  // Collect current edited values from table
  var edited={};
  document.querySelectorAll('#t-table tbody tr').forEach(function(row){
    var key=row.dataset.key;
    row.querySelectorAll('input').forEach(function(inp){
      var loc=inp.dataset.locale;
      if(!edited[key]) edited[key]={};
      edited[key][loc]=inp.value;
    });
  });
  // Merge edits into ALL_ROWS
  for(var k in edited){
    for(var loc in edited[k]){
      var existing=ALL_ROWS.find(function(r){return r.key===k&&r.locale===loc;});
      if(existing) existing.value=edited[k][loc];
      else ALL_ROWS.push({key:k,locale:loc,value:edited[k][loc]});
    }
  }
  // Build i18n object from ALL_ROWS
  var i18n={};
  ALL_ROWS.forEach(function(r){
    if(!i18n[r.key]) i18n[r.key]={};
    i18n[r.key][r.locale]=r.value;
  });
  var resp=await fetch('/api/admin/extensions/'+EXT_ID+'/i18n',{
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({i18n:i18n})
  });
  var d=await resp.json();
  if(d.ok){alert('已保存');location.reload();}
  else alert('保存失败: '+(d.error||''));
});

${AI_TRANSLATE_SCRIPT}
renderTable();
</script>`,
  });
}

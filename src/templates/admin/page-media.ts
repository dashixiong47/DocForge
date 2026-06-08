import { ADMIN_I18N } from '../../services/i18n';
import { adminLayout, esc } from './layout';

export const media = (initPlugin = '', allPlugins: any[] = []) => adminLayout({
  title:'媒体',active:'media',
  head:`<style>
.media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:14px}
.media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-top:14px}
.media-card{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);overflow:hidden;transition:.15s;display:flex;flex-direction:column}
.media-card:hover{border-color:var(--accent)}
.media-card.is-stub{border-style:dashed;border-color:rgba(210,153,29,.6)}
.media-thumb{width:100%;height:140px;background:var(--bg);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;flex-shrink:0}
.media-thumb img{width:100%;height:100%;object-fit:cover}
.thumb-icon{font-size:36px;opacity:.35}
.thumb-type{position:absolute;top:6px;right:6px;font-size:10px;font-weight:700;background:rgba(0,0,0,.7);color:var(--muted);padding:2px 6px;border-radius:3px;text-transform:uppercase}
.stub-zone{width:100%;height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer;color:var(--warn);transition:.15s;background:rgba(210,153,29,.04);border-bottom:1px dashed rgba(210,153,29,.3)}
.stub-zone:hover{background:rgba(210,153,29,.1);color:var(--ok)}
.stub-zone svg{opacity:.7}
.stub-key{font-size:11px;font-family:var(--mono);color:var(--muted);padding:0 12px;text-align:center;overflow:hidden;text-overflow:ellipsis;width:100%;white-space:nowrap}
.media-info{padding:9px 12px;flex:1}
.media-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-meta{font-size:11px;color:var(--muted);margin-top:3px}
.media-key{font-size:11px;color:var(--ok);margin-top:2px;font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-actions{display:flex;gap:4px;padding:0 10px 10px;flex-wrap:wrap;margin-top:auto}
.btn-icon{padding:5px;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center}
.media-upload-panel{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);padding:12px;margin-bottom:14px;display:grid;grid-template-columns:minmax(280px,420px) 1fr;gap:12px;align-items:stretch}
.upload-fields{display:grid;grid-template-columns:1fr;gap:8px}
.upload-field-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.upload-field label{display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin:0 0 4px}
.upload-field input,.upload-field select{width:100%;padding:7px 9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:12px;outline:none}
.upload-field input:focus,.upload-field select:focus{border-color:var(--accent)}
.upload-drop{min-height:86px;border:1px dashed var(--border);border-radius:var(--radius);background:rgba(88,166,255,.03);display:flex;align-items:center;justify-content:center;gap:12px;color:var(--muted);cursor:pointer;transition:.15s;padding:14px 18px;text-align:left}
.upload-drop:hover,.upload-drop.dragover{border-color:var(--accent);background:rgba(88,166,255,.08);color:var(--text)}
.upload-drop-ic{width:34px;height:34px;border-radius:8px;display:grid;place-items:center;background:rgba(88,166,255,.12);font-size:18px;line-height:1;color:var(--accent);flex-shrink:0}
.upload-drop-main{font-size:13px;font-weight:700;color:var(--text)}
.upload-drop-sub{font-size:11px;color:var(--muted)}
.upload-status-inline{min-height:18px;font-size:12px;color:var(--muted)}
@media(max-width:860px){.media-upload-panel{grid-template-columns:1fr}.upload-field-row{grid-template-columns:1fr}}
</style>`,
  body:`<h1 class="page-title" data-i18n="media.title">📷 媒体文件</h1>

<div class="media-upload-panel">
  <div class="upload-fields">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <h3 style="margin:0;font-size:14px" data-i18n="media.upload">上传文件</h3>
      <span style="font-size:11px;color:var(--ok)" data-i18n="media.autoUploadHint">选中即自动上传</span>
    </div>
    <div class="upload-field-row">
      <div class="upload-field"><label data-i18n="docs.name">文档</label><select id="up-plugin">${allPlugins.map((p:any)=>`<option value="${esc(p.slug)}"${p.slug===initPlugin?' selected':''}>${esc(p.name)}</option>`).join('')}</select></div>
      <div class="upload-field"><label><span data-i18n="media.placeholderKey">占位符 Key</span> <span style="font-weight:400;color:var(--muted)" data-i18n="media.optional">(可选)</span></label><input id="up-pk" placeholder="hero-screenshot"></div>
    </div>
    <div id="upload-status" class="upload-status-inline"></div>
  </div>
  <div class="upload-drop" id="upload-drop" tabindex="0" role="button">
    <div class="upload-drop-ic">⬆</div>
    <div>
      <div class="upload-drop-main" data-i18n="media.dropUpload">拖拽文件到此处，或点击上传</div>
      <div class="upload-drop-sub" data-i18n="media.uploadAccept">支持图片、视频、GIF、WebP</div>
    </div>
  </div>
  <input type="file" id="up-file" style="display:none" multiple accept="image/*,video/*,.gif,.webp">
</div>

<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
  <select id="filter-plugin" style="min-width:160px;padding:6px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px"><option value="" data-i18n="media.allDocs">全部文档</option>${allPlugins.map((p:any)=>`<option value="${esc(p.slug)}"${p.slug===initPlugin?' selected':''}>${esc(p.name)}</option>`).join('')}</select>
  <input id="filter-search" data-i18n-placeholder="media.searchPlaceholder" placeholder="搜索文件名或 Key…" style="flex:1;min-width:140px;padding:6px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px" oninput="loadMedia(1)">
  <button class="btn btn-outline btn-sm" onclick="loadMedia(1)" data-i18n="media.refreshBtn">🔄 刷新</button>
  <span id="media-count" style="font-size:12px;color:var(--muted)"></span>
</div>

<div id="media-list"><div class="empty-state"><p data-i18n="media.loading">加载中…</p></div></div>
<div class="pager" id="media-pager" style="margin-top:14px"></div>
<input type="file" id="stub-file-input" style="display:none">

<script>
var currentPage=1,PAGE_SIZE=20,currentSlug=${JSON.stringify(initPlugin)},stubKey='',stubPlugin='';
var allPlugins=${JSON.stringify(allPlugins.map((p:any)=>({slug:p.slug,name:p.name})))};
var PAGE_I18N=${JSON.stringify(ADMIN_I18N)};
var PAGE_LANG=(document.cookie.match(/(?:^|;\\s*)lang=([^;]+)/)||[])[1]||((navigator.language||'').toLowerCase().indexOf('zh')===0?'zh':'en');
function tt(key){var e=PAGE_I18N[key];return e?(e[PAGE_LANG]||e.zh||e.en||key):key;}
function tr(key){return window.t?window.t(key):tt(key);}

document.getElementById('filter-plugin').addEventListener('change',function(){
  currentSlug=this.value;
  var up=document.getElementById('up-plugin');
  if(this.value&&up)up.value=this.value;
  loadMedia(1);
});
document.getElementById('up-plugin').addEventListener('change',function(){
  document.getElementById('filter-plugin').value=this.value;
  currentSlug=this.value;loadMedia(1);
});

async function uploadPickedFiles(files){
  if(!files||!files.length)return;
  var slug=document.getElementById('up-plugin').value;
  if(!slug){showUpSt(tr('media.selectFirst'),'err');return;}
  var pk=document.getElementById('up-pk').value.trim();
  for(var i=0;i<files.length;i++){
    await doUpload(files[i],slug,i===0?pk:'');
  }
  document.getElementById('up-pk').value='';
}

document.getElementById('up-file').addEventListener('change',async function(){
  await uploadPickedFiles(this.files);
  this.value='';
});

(function(){
  var drop=document.getElementById('upload-drop');
  var input=document.getElementById('up-file');
  if(!drop||!input)return;
  function openPicker(){input.click();}
  drop.addEventListener('click',openPicker);
  drop.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openPicker();}});
  drop.addEventListener('dragover',function(e){e.preventDefault();drop.classList.add('dragover');});
  drop.addEventListener('dragleave',function(){drop.classList.remove('dragover');});
  drop.addEventListener('drop',async function(e){
    e.preventDefault();
    drop.classList.remove('dragover');
    await uploadPickedFiles(e.dataTransfer.files);
  });
})();

document.getElementById('stub-file-input').addEventListener('change',async function(){
  if(!this.files||!this.files.length)return;
  var slug=stubPlugin||document.getElementById('up-plugin').value||(allPlugins[0]&&allPlugins[0].slug)||'';
  if(!slug){this.value='';return;}
  await doUpload(this.files[0],slug,stubKey);
  this.value='';stubKey='';stubPlugin='';
});

// Delegated click handler for media grid — avoids inline onclick escaping issues
document.getElementById('media-list').addEventListener('click',function(e){
  var el=e.target.closest('[data-action]');
  if(!el)return;
  var action=el.dataset.action,id=Number(el.dataset.id),key=el.dataset.key||'',val=el.dataset.val||'',url=el.dataset.url||'';
  if(action==='stub-upload')openStubUpload(key);
  else if(action==='set-key')setKey(id,key);
  else if(action==='copy')cpStr(val,el);
  else if(action==='preview')window.open(url,'_blank');
  else if(action==='del')delMedia(id);
});

async function doUpload(file,slug,pk){
  showUpSt(tr('media.uploading')+' '+file.name,'warn');
  var fd=new FormData();
  fd.append('file',file);
  if(pk)fd.append('placeholder_key',pk);
  try{
    var res=await fetch('/media/upload/'+slug,{method:'PUT',body:fd});
    var d=await res.json();
    if(d.ok){
      if(pk&&d.id&&!d.stub_replaced){
        await fetch('/api/admin/media/'+d.id+'/placeholder-key',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeholderKey:pk})});
      }
      showUpSt('✓ '+tr('media.uploaded')+' '+d.url+(pk?' · key: '+pk:''),'ok');
      loadMedia(currentPage);
    }else showUpSt((PAGE_LANG==='zh'?'上传失败':'Upload failed')+': '+(d.error||'unknown'),'err');
  }catch(e){showUpSt(tr('editor.networkError')+': '+e.message,'err');}
}

function showUpSt(msg,type){
  var el=document.getElementById('upload-status');
  var color=type==='ok'?'var(--ok)':type==='err'?'var(--danger)':type==='warn'?'var(--warn)':'var(--muted)';
  el.style.color=color;
  el.textContent=msg;
  if(type==='ok')setTimeout(function(){el.textContent='';el.style.color='var(--muted)';},3000);
}

function isStub(m){return m.d2Key&&m.d2Key.startsWith('__ref__');}
function isImg(m){return /^image\\//.test(m.mimeType)&&!isStub(m);}
function isVid(m){return /^video\\//.test(m.mimeType)&&!isStub(m);}

async function loadMedia(page){
  var listEl=document.getElementById('media-list');
  if(listEl)listEl.innerHTML='<div class="empty-state"><p>'+tr('media.loading')+'</p></div>';
  try{
    if(page)currentPage=page;
    var searchEl=document.getElementById('filter-search');
    var search=searchEl?searchEl.value.trim().toLowerCase():'';
    var url='/api/admin/media?page='+currentPage+'&limit='+PAGE_SIZE+(currentSlug?'&pluginSlug='+encodeURIComponent(currentSlug):'');
    var res=await fetch(url);
    if(!res.ok)throw new Error('HTTP '+res.status);
    var d=await res.json();
    var items=(d.items||[]);
    if(search)items=items.filter(function(m){return m.filename.toLowerCase().indexOf(search)!==-1||(m.placeholderKey||'').toLowerCase().indexOf(search)!==-1;});
    var cntEl=document.getElementById('media-count');
    if(cntEl)cntEl.textContent=tr('media.totalPrefix')+' '+(d.total||0)+' '+tr('media.totalSuffix');
    renderGrid(items);renderPager(d.total||0);
  }catch(e){
    console.error('[loadMedia]',e);
    var list=document.getElementById('media-list');
    if(list)list.innerHTML='<div class="alert alert-danger">'+tr('editor.loadFailed')+': '+e.message+'</div>';
  }
}

function e2(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

var ICON_UPLOAD='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
var ICON_TRASH='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
var ICON_EYE='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
var ICON_KEY='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/></svg>';
var ICON_COPY='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

function renderGrid(items){
  var list=document.getElementById('media-list');
  if(!items.length){list.innerHTML='<div class="empty-state"><p data-i18n="media.empty">'+tr('media.empty')+'</p></div>';return;}
  var html='<div class="media-grid">';
  items.forEach(function(m){
    var stub=isStub(m),img=isImg(m),vid=isVid(m);
    var pkey=e2(m.placeholderKey||'');
    var d2k=e2(m.d2Key||'');
    var mediaToken=vid?'{{video:'+pkey+'}}':'{{img:'+pkey+'}}';
    var mediaElement=vid?'<video src="'+mediaToken+'" controls></video>':'<img src="'+mediaToken+'" alt="" loading="lazy" />';
    html+='<div class="media-card'+(stub?' is-stub':'')+'">';

    // Thumbnail / stub zone
    if(stub){
      html+='<div class="stub-zone" data-action="stub-upload" data-key="'+pkey+'" title="'+tr('media.uploadFileTitle')+'">'
        +ICON_UPLOAD
        +'<span style="font-size:12px;font-weight:600;margin-top:2px">'+tr('media.clickUpload')+'</span>'
        +'<span class="stub-key">'+mediaToken+'</span>'
        +'</div>';
    }else if(img){
      html+='<div class="media-thumb"><img src="/media/'+d2k+'" loading="lazy" onerror="imgErr(this)"><span class="thumb-icon" style="display:none">📷</span><span class="thumb-type">IMG</span></div>';
    }else if(vid){
      html+='<div class="media-thumb"><span class="thumb-icon">🎬</span><span class="thumb-type">VID</span></div>';
    }else{
      html+='<div class="media-thumb"><span class="thumb-icon">📄</span><span class="thumb-type">'+(m.mimeType.split('/')[0]||'file').toUpperCase()+'</span></div>';
    }

    // Info
    html+='<div class="media-info">';
    html+='<div class="media-name" title="'+e2(m.filename)+'">'+e2(m.filename)+'</div>';
    if(!stub)html+='<div class="media-meta">'+((m.sizeBytes||0)/1024).toFixed(1)+' KB · '+e2(m.mimeType)+'</div>';
    if(m.placeholderKey)html+='<div class="media-key" title="'+mediaElement.replace(/"/g,'&quot;')+'">'+mediaToken+'</div>';
    html+='</div>';

    // Actions
    html+='<div class="media-actions">';
    if(stub){
      html+='<button class="btn btn-primary btn-sm" data-action="stub-upload" data-key="'+pkey+'" title="'+tr('media.uploadFileTitle')+'">'+ICON_UPLOAD+' '+tr('editor.upload').replace(/^⬆\\s*/,'')+'</button>';
      html+='<button class="btn btn-outline btn-sm btn-icon" data-action="copy" data-val="'+mediaElement.replace(/"/g,'&quot;')+'" title="'+tr('media.copyMediaElement')+'">'+ICON_COPY+'</button>';
    }else{
      html+='<button class="btn btn-outline btn-sm btn-icon" data-action="set-key" data-id="'+m.id+'" data-key="'+pkey+'" title="'+tr('media.setKey')+'">'+ICON_KEY+'</button>';
      html+='<button class="btn btn-outline btn-sm btn-icon" data-action="copy" data-val="/media/'+d2k+'" title="'+tr('media.copyUrl')+'">'+ICON_COPY+'</button>';
      if(m.placeholderKey)html+='<button class="btn btn-outline btn-sm btn-icon" data-action="copy" data-val="'+mediaElement.replace(/"/g,'&quot;')+'" title="'+tr('media.copyMediaElement')+'"><code style="font-size:9px">'+(vid?'vid':'img')+'</code></button>';
      html+='<button class="btn btn-outline btn-sm btn-icon" data-action="preview" data-url="/media/'+d2k+'" title="'+tr('media.preview')+'">'+ICON_EYE+'</button>';
    }
    html+='<button class="btn btn-danger btn-sm btn-icon" data-action="del" data-id="'+m.id+'" title="'+tr('docs.delete')+'">'+ICON_TRASH+'</button>';
    html+='</div></div>';
  });
  list.innerHTML=html+'</div>';
}

function renderPager(total){
  var tp=Math.ceil(total/PAGE_SIZE)||1,pg=document.getElementById('media-pager');
  if(tp<=1){pg.innerHTML='';return;}
  pg.innerHTML='<button '+(currentPage<=1?'disabled':'')+' onclick="loadMedia('+(currentPage-1)+')">‹</button>'
    +'<span>'+tr('media.pagePrefix')+' '+currentPage+' / '+tp+' '+tr('media.pageSuffix')+'</span>'
    +'<button '+(currentPage>=tp?'disabled':'')+' onclick="loadMedia('+(currentPage+1)+')">›</button>';
}

function cpStr(text,btn){navigator.clipboard.writeText(text);var o=btn.textContent;btn.textContent='✓';setTimeout(function(){btn.textContent=o;},1400);}

function openStubUpload(key){
  stubKey=key;
  stubPlugin=document.getElementById('up-plugin').value||(allPlugins[0]&&allPlugins[0].slug)||'';
  document.getElementById('up-pk').value=key;
  document.getElementById('stub-file-input').click();
}

async function setKey(id,current){
  var k=prompt(tr('media.setKeyPrompt'),current);
  if(k===null)return;
  await fetch('/api/admin/media/'+id+'/placeholder-key',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeholderKey:k.trim()||null})});
  loadMedia(currentPage);
}

function delMedia(id){
  if(!confirm(tr('media.confirmDelete')))return;
  fetch('/api/admin/media/'+id,{method:'DELETE'}).then(function(){loadMedia(currentPage);});
}

loadMedia(1);
</script>`,
});

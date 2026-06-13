import { adminLayout, esc } from './layout';

function docListIcon(p: any): string {
  const fallback = esc(String(p.name || p.slug || '?').trim().slice(0, 1).toUpperCase() || '?');
  if (!p.iconUrl) return `<div class="doc-list-icon"><span>${fallback}</span></div>`;
  return `<div class="doc-list-icon"><img src="${esc(p.iconUrl)}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none">${fallback}</span></div>`;
}

export const plugins = (all: any[], settings: Record<string,string> = {}) => adminLayout({
  title:'文档管理',active:'plugins',
  body:`<h1 class="page-title" data-i18n="docs.title">📁 文档管理</h1>
<div class="card">
  <h3 data-i18n="docs.create">新建文档</h3>
  <form id="pf-add" style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">
    <div class="form-group" style="flex:1;min-width:140px;margin:0"><label data-i18n="docs.slug">标识 (slug)</label><input id="add-slug" required placeholder="my-project"></div>
    <div class="form-group" style="flex:2;min-width:180px;margin:0"><label data-i18n="docs.name">名称</label><input id="add-name" required placeholder="My Project"></div>
    <button type="submit" class="btn btn-primary btn-sm" style="margin-bottom:1px" data-i18n="docs.createBtn">创建</button>
  </form>
</div>
<div id="plugin-list">
  ${all.length===0?'<div class="empty-state"><p data-i18n="docs.empty">暂无文档</p></div>':''}
  ${all.map((p:any)=>`<div class="card doc-card" data-id="${p.id}" draggable="true">
    <div class="doc-head">
      <span class="drag-handle" data-i18n-title="docs.dragSort" title="拖动排序">⠿</span>
      ${docListIcon(p)}
      <div class="doc-meta">
        <div class="doc-title">
          <strong>${esc(p.name)}</strong>
          <span class="doc-slug">/${esc(p.slug)}</span>
          <span class="doc-ver" id="doc-ver-${p.id}">v${esc(p.version)}</span>
          <span class="doc-status ${p.enabled?'published':'draft'}" id="doc-badge-${p.id}" data-i18n="${p.enabled?'docs.enabled':'docs.disabled'}">${p.enabled?'已启用':'已禁用'}</span>
          <span class="doc-status ${p.listed?'published':'draft'}" id="doc-listed-badge-${p.id}" data-i18n="${p.listed?'docs.listed':'docs.unlisted'}">${p.listed?'首页展示':'不进首页'}</span>
        </div>
        ${p.description?`<p class="doc-desc">${esc(String(p.description).substring(0,100))}</p>`:''}
      </div>
      <button class="btn btn-outline btn-sm" onclick="toggleEditP(${p.id})" data-i18n-title="docs.editInfo" title="编辑信息" style="flex-shrink:0;padding:3px 8px;color:var(--muted)">⚙</button>
    </div>
    <div class="doc-actions">
      <label class="toggle" data-i18n-title="${p.enabled?'docs.disableDoc':'docs.enableDoc'}" title="${p.enabled?'点击禁用访问':'点击启用访问'}">
        <input type="checkbox" ${p.enabled?'checked':''} onchange="togglePlugin(${p.id},this)">
        <span class="toggle-slider"></span>
      </label>
      <span class="doc-status-lbl" id="doc-lbl-${p.id}" data-i18n="${p.enabled?'docs.enabled':'docs.disabled'}">${p.enabled?'已启用':'已禁用'}</span>
      <label class="toggle" data-i18n-title="${p.listed?'docs.hideFromHome':'docs.showOnHome'}" title="${p.listed?'从首页隐藏':'在首页展示'}">
        <input type="checkbox" ${p.listed?'checked':''} onchange="toggleListed(${p.id},this)">
        <span class="toggle-slider"></span>
      </label>
      <span class="doc-status-lbl" id="doc-listed-lbl-${p.id}" data-i18n="${p.listed?'docs.listed':'docs.unlisted'}">${p.listed?'首页展示':'不进首页'}</span>
      <span style="width:1px;background:var(--border);align-self:stretch;margin:0 4px"></span>
      <label class="toggle" title="${settings['plugin_static_'+p.slug]!=='0'?'静态生成已开启，点击关闭':'静态生成已关闭，点击开启'}">
        <input type="checkbox" id="static-toggle-${p.id}" ${settings['plugin_static_'+p.slug]!=='0'?'checked':''} onchange="toggleStaticGen('${esc(p.slug)}',this)">
        <span class="toggle-slider"></span>
      </label>
      <span class="doc-status-lbl" id="static-lbl-${p.id}">${settings['plugin_static_'+p.slug]!=='0'?'静态生成':'实时渲染'}</span>
      <div style="margin-left:auto;display:flex;gap:6px">
        <a href="/admin/plugins/${p.id}/editor" id="editor-link-${p.id}" class="btn btn-primary btn-sm" data-i18n="docs.editor">✏️ 编辑器</a>
        <a href="/${esc(p.slug)}" target="_blank" class="btn btn-outline btn-sm" style="${p.enabled?'':'opacity:.4;pointer-events:none'}" data-i18n-title="${p.enabled?'docs.viewPublic':'docs.previewAfterPublish'}" title="${p.enabled?'查看公开页面':'发布后可预览'}">↗ <span data-i18n="docs.preview">预览</span></a>
        <button class="btn btn-danger btn-sm" onclick="delP(${p.id})" data-i18n="docs.delete">删除</button>
      </div>
    </div>
    <div class="doc-edit" id="edit-form-${p.id}" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
      <div class="form-row"><div class="form-group"><label data-i18n="docs.slug">标识 (slug)</label><input id="eslug-${p.id}" value="${esc(p.slug)}"></div><div class="form-group"><label data-i18n="docs.name">名称</label><input id="ename-${p.id}" value="${esc(p.name)}"></div><div class="form-group"><label data-i18n="docs.version">当前版本</label><div id="ver-display-${p.id}" style="padding:5px 0;font-size:13px;color:var(--muted)">v${esc(p.version)}</div></div></div>
      <div class="form-group" style="margin-top:4px"><button class="btn btn-outline btn-sm" type="button" onclick="openVerModal(${p.id})">📦 版本管理</button></div>
      <div class="form-group"><label data-i18n="docs.desc">描述</label><textarea id="edesc-${p.id}" rows="2" style="min-height:46px">${esc(p.description||'')}</textarea></div>
      <div class="form-group"><label data-i18n="docs.icon">图标</label><input id="eicon-${p.id}" value="${esc(p.iconUrl||'')}" type="hidden"><div class="icon-field"><div class="icon-slot ${p.iconUrl?'':'empty'}" id="icon-preview-${p.id}" onclick="openMediaPicker('${esc(p.slug)}','eicon-${p.id}','icon-preview-${p.id}')" data-i18n-title="${p.iconUrl?'docs.changeIcon':'docs.selectIcon'}" title="${p.iconUrl?'更换图标':'选择图标'}">${p.iconUrl?`<img src="${esc(p.iconUrl)}" alt="" onerror="renderIconSlot('icon-preview-${p.id}','')">`:''}</div></div></div>
      <div class="settings-grid">
        <div class="setting-tile">
          <div class="setting-tile-main"><div class="setting-tile-title" data-i18n="docs.sort">排序</div><div class="setting-tile-desc" data-i18n="docs.sortHint">数值越小越靠前</div></div>
          <div class="setting-tile-control"><input id="esort-${p.id}" type="number" value="${p.sortOrder||0}"></div>
        </div>
        <div class="setting-tile">
          <div class="setting-tile-main"><div class="setting-tile-title" data-i18n="docs.homeVisible">首页展示</div><div class="setting-tile-desc" data-i18n="docs.listedHint">启用后显示在首页列表</div></div>
          <div class="setting-tile-control"><label class="toggle" data-i18n-title="${p.listed?'docs.hideFromHome':'docs.showOnHome'}" title="${p.listed?'从首页隐藏':'在首页展示'}"><input id="elisted-${p.id}" type="checkbox" ${p.listed?'checked':''}><span class="toggle-slider"></span></label></div>
        </div>
      </div>
      <div class="form-group"><label data-i18n="docs.tags">标签</label><div class="tag-input-wrap" id="tag-wrap-${p.id}" onclick="this.querySelector('input').focus()"></div></div>
      <div class="btn-group" style="margin-top:8px;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="saveEditP(${p.id})" data-i18n="docs.save">保存</button><button class="btn btn-outline btn-sm" onclick="toggleEditP(${p.id})" data-i18n="docs.cancel">取消</button></div>
    </div>
  </div>`).join('')}
</div>

<!-- Version management modal -->
<div class="modal-ov" id="m-vermgr">
  <div class="modal" onclick="event.stopPropagation()" style="width:480px;max-width:calc(100vw - 32px)">
    <div class="modal-hd"><h3>版本管理</h3><button class="modal-close" onclick="closeModal('m-vermgr')">✕</button></div>
    <div id="vm-list" style="padding:12px 16px;min-height:60px"></div>
    <div style="padding:10px 16px;border-top:1px solid var(--border);display:flex;gap:8px;align-items:center">
      <input id="vm-new-ver" placeholder="新版本号 (如 2.0)" style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text);font:inherit;font-size:13px" onkeydown="if(event.key==='Enter')doAddVersion()">
      <button class="btn btn-ok btn-sm" onclick="doAddVersion()">+ 新增版本</button>
    </div>
  </div>
</div>

<!-- Media picker modal -->
<div class="modal-ov" id="m-pickmedia" style="z-index:3000">
  <div class="modal" onclick="event.stopPropagation()" style="width:680px;max-width:calc(100vw - 32px)">
    <div class="modal-hd">
      <h3 data-i18n="docs.selectIcon">选择图标</h3>
    <button class="modal-close" onclick="closeModal('m-pickmedia')" title="关闭">✕</button>
    </div>
    <div style="margin-bottom:10px;display:flex;gap:8px;align-items:center"><span style="font-size:12px;color:var(--muted)" data-i18n="docs.documentLabel">文档:</span><input id="mp-slug" readonly style="flex:1;padding:5px 8px;border:1px solid var(--border);border-radius:5px;background:var(--bg);color:var(--text);font-size:12px"><input id="mp-search" data-i18n-placeholder="docs.searchMedia" placeholder="搜索文件名..." style="flex:1;padding:5px 8px;border:1px solid var(--border);border-radius:5px;background:var(--bg);color:var(--text);font-size:12px" oninput="loadMediaPicker()"></div>
    <div class="form-group" style="margin-bottom:10px"><label data-i18n="docs.orUrl">或直接输入 URL</label><input id="mp-url" placeholder="https://... 或 /media/..." style="padding:6px 8px;font-size:12px" oninput="mpUrlChanged()"></div>
    <input id="mp-file-input" type="file" accept="image/*" multiple style="display:none">
    <img id="mp-preview" class="media-picker-preview" style="display:none" alt="">
    <div id="mp-grid" class="media-picker-grid"><div style="text-align:center;color:var(--muted);padding:20px;grid-column:1/-1" data-i18n="docs.loading">加载中…</div></div>
    <div class="pager" id="mp-pager"></div>
    <div id="mp-selected" style="margin-top:8px;font-size:12px;color:var(--ok);display:none"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('m-pickmedia')" data-i18n="docs.cancel">取消</button>
      <button class="btn btn-primary" id="mp-confirm" onclick="confirmMediaPick()" data-i18n="docs.confirm">确认</button>
    </div>
  </div>
</div>

<script>
async function toggleStaticGen(slug,cb){var enabled=cb.checked;var key='plugin_static_'+slug;var body={};body[key]=enabled?'1':'0';var r=await fetch('/api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok){cb.checked=!cb.checked;alert('保存失败');return;}var id=cb.closest('[data-id]')&&cb.closest('[data-id]').dataset.id;if(id){var lbl=document.getElementById('static-lbl-'+id);if(lbl)lbl.textContent=enabled?'静态生成':'实时渲染';cb.parentElement.title=enabled?'静态生成已开启，点击关闭':'静态生成已关闭，点击开启';}}
var editingId=null;
async function toggleEditP(id){var n=document.getElementById('edit-form-'+id);var o=n.style.display!=='none';if(editingId&&editingId!==id)document.getElementById('edit-form-'+editingId).style.display='none';if(o){n.style.display='none';editingId=null;}else{n.style.display='';editingId=id;loadTagsFor(id);loadLatestVerFor(id);}}
async function loadLatestVerFor(id){try{var r=await fetch('/api/admin/plugins/'+id+'/siblings');var siblings=await r.json();if(!Array.isArray(siblings)||siblings.length===0)return;var newest=siblings[siblings.length-1];var dv=document.getElementById('doc-ver-'+id);if(dv)dv.textContent='v'+newest.version;var vd=document.getElementById('ver-display-'+id);if(vd)vd.textContent='v'+newest.version;var el=document.getElementById('editor-link-'+id);if(el)el.href='/admin/plugins/'+newest.id+'/editor';}catch(e){}}

  var tagData={};${all.map((p:any)=>`tagData[${p.id}]=${p.badgeTags||'[]'};`).join('')}
function renderTags(id){var w=document.getElementById('tag-wrap-'+id);var t=tagData[id]||[];w.innerHTML=t.map(function(t,i){return'<span class="tag-chip">'+t+'<span class="tag-rm" onclick="event.stopPropagation();removeTag('+id+','+i+')">×</span></span>';}).join('')+'<input data-i18n-placeholder="docs.tagPlaceholder" placeholder="'+(window.t?window.t('docs.tagPlaceholder'):'输入标签后回车')+'" onkeydown="addTag(event,'+id+')">';if(window.applyAdminI18n)window.applyAdminI18n();}
function loadTagsFor(id){renderTags(id);}
function addTag(e,id){if(e.key==='Enter'){e.preventDefault();var v=e.target.value.trim();if(v){tagData[id].push(v);renderTags(id);}}}
function removeTag(id,i){tagData[id].splice(i,1);renderTags(id);}

var vmTargetId=null;
async function openVerModal(id){vmTargetId=id;await loadVmList(id);openModal('m-vermgr');}
async function loadVmList(id){
  var list=document.getElementById('vm-list');
  list.innerHTML='<div style="color:var(--muted);font-size:13px">加载中…</div>';
  var r=await fetch('/api/admin/plugins/'+id+'/siblings');
  var siblings=await r.json();
  if(!Array.isArray(siblings)||siblings.length===0){list.innerHTML='<div style="color:var(--muted);font-size:13px;padding:8px 0">暂无版本分支，点击"新增版本"创建。</div>';return;}
  siblings=siblings.slice().reverse();
  list.innerHTML=siblings.map(function(s){
    return '<div id="vm-row-'+s.id+'" style="display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--border)">'+
      '<div style="flex:1;min-width:0">'+
        '<div id="vm-display-'+s.id+'" style="display:flex;align-items:center;gap:6px">'+
          '<span id="vm-ver-text-'+s.id+'" style="font-weight:600;font-size:13px">v'+esc2(s.version)+'</span>'+
          '<button class="btn btn-sm" style="font-size:13px;padding:1px 5px;line-height:1.2;border:none;background:transparent;cursor:pointer;color:var(--muted)" title="编辑版本号" onclick="startVerEdit('+s.id+')">✏️</button>'+
        '</div>'+
        '<div id="vm-edit-'+s.id+'" style="display:none;align-items:center;gap:4px">'+
          '<input id="vm-inp-'+s.id+'" value="'+esc2(s.version)+'" style="width:90px;padding:3px 6px;border:1px solid var(--border);border-radius:5px;background:var(--bg);color:var(--text);font:inherit;font-size:13px;font-weight:600" onkeydown="if(event.keyCode===13)commitVerEdit('+s.id+');else if(event.keyCode===27)cancelVerEdit('+s.id+')">'+
          '<button class="btn btn-sm btn-primary" style="padding:2px 7px;font-size:12px" onclick="commitVerEdit('+s.id+')">✓</button>'+
          '<button class="btn btn-sm btn-outline" style="padding:2px 7px;font-size:12px" onclick="cancelVerEdit('+s.id+')">✕</button>'+
        '</div>'+
        '<div style="font-size:11px;color:var(--muted);margin-top:1px">'+esc2(s.slug)+'</div>'+
      '</div>'+
      '<a href="/admin/plugins/'+s.id+'/editor" class="btn btn-sm btn-outline" style="font-size:11px;white-space:nowrap">编辑</a>'+
      '<label class="toggle" title="'+(s.enabled?'点击禁用':'点击启用')+'"><input type="checkbox"'+(s.enabled?' checked':'')+' onchange="toggleVmSibling('+s.id+',this)"><span class="toggle-slider"></span></label>'+
    '</div>';
  }).join('');
}
function esc2(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function startVerEdit(id){document.getElementById('vm-display-'+id).style.display='none';var ed=document.getElementById('vm-edit-'+id);ed.style.display='flex';document.getElementById('vm-inp-'+id).focus();}
function cancelVerEdit(id){document.getElementById('vm-edit-'+id).style.display='none';document.getElementById('vm-display-'+id).style.display='flex';}
async function commitVerEdit(id){var ver=(document.getElementById('vm-inp-'+id).value||'').trim();if(!ver)return;var r=await fetch('/api/admin/plugins/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:ver})});if(r.ok){document.getElementById('vm-ver-text-'+id).textContent='v'+ver;cancelVerEdit(id);var row=document.getElementById('vm-row-'+id);row.style.background='rgba(63,185,80,0.1)';setTimeout(function(){row.style.background='';},1200);}else{alert('保存失败');}}
async function toggleVmSibling(id,cb){var r=await fetch('/api/admin/plugins/'+id+'/toggle',{method:'PUT'});var d=await r.json();if(d.ok){cb.parentElement.title=d.enabled?'点击禁用':'点击启用';}else{cb.checked=!cb.checked;alert('操作失败');}}
async function doAddVersion(){var ver=document.getElementById('vm-new-ver').value.trim();if(!ver)return;var r=await fetch('/api/admin/plugins/'+vmTargetId+'/fork-version',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:ver})});if(r.ok){document.getElementById('vm-new-ver').value='';await loadVmList(vmTargetId);}else{alert('创建失败');}}

var mpTargetId=null,mpPreviewId=null,mpSelected=null,mpPage=1,mpSlug='';
function openMediaPicker(slug,targetId,previewId){mpTargetId=targetId;mpPreviewId=previewId;mpSlug=slug;mpSelected=null;mpPage=1;document.getElementById('mp-slug').value=slug;document.getElementById('mp-search').value='';document.getElementById('mp-url').value=document.getElementById(targetId).value||'';document.getElementById('mp-preview').style.display='none';document.getElementById('mp-selected').style.display='none';openModal('m-pickmedia');loadMediaPicker();}
function mpUrlChanged(){var u=document.getElementById('mp-url').value.trim();var p=document.getElementById('mp-preview');if(u&&/\.(png|jpg|jpeg|gif|svg|webp|ico)(\\?.*)?$/i.test(u)){p.src=u;p.style.display='';}else{p.style.display='none';}}
async function loadMediaPicker(){var s=document.getElementById('mp-search').value.trim().toLowerCase();var r=await fetch('/api/admin/media?pluginSlug='+mpSlug+'&page='+mpPage+'&limit=24');var d=await r.json();var g=document.getElementById('mp-grid');var items=d.items||[];if(s)items=items.filter(function(m){return m.filename.toLowerCase().indexOf(s)!==-1;});var upload='<div class="media-picker-item upload" id="mp-upload-card"><div style="font-size:26px;color:var(--accent)">+</div><div class="pi-name" data-i18n="media.dropUpload">拖拽文件到此处，或点击上传</div></div>';var list=items.map(function(m){var i=/^image\\//.test(m.mimeType);return'<div class="media-picker-item'+(mpSelected&&mpSelected.id===m.id?' selected':'')+'" onclick="selectMediaItem('+m.id+',\\''+m.d2Key+'\\',\\''+(m.mimeType||'')+'\\')">'+(i?'<img src="/media/'+m.d2Key+'" loading="lazy" onerror="imgErr(this)">':'<div style="height:84px;display:flex;align-items:center;justify-content:center;font-size:28px">'+(/^video\\//.test(m.mimeType)?'🎬':'📄')+'</div>')+'<div class="pi-name">'+m.filename+'</div></div>';}).join('');g.innerHTML=upload+(list||'<div style="text-align:center;color:var(--muted);padding:20px;grid-column:span 3">无媒体文件</div>');bindMediaUpload();if(window.applyAdminI18n)window.applyAdminI18n();var t=d.total||0,tp=Math.ceil(t/24);var pg=document.getElementById('mp-pager');pg.innerHTML=tp>1?'<button '+(mpPage<=1?'disabled':'')+' onclick="mpPage--;loadMediaPicker()">‹</button><span>'+mpPage+' / '+tp+'</span><button '+(mpPage>=tp?'disabled':'')+' onclick="mpPage++;loadMediaPicker()">›</button>':'';}
function selectMediaItem(id,d2k,mt){mpSelected={id:id,d2key:d2k,mimeType:mt};document.getElementById('mp-url').value='/media/'+d2k;document.getElementById('mp-selected').style.display='';document.getElementById('mp-selected').textContent='已选: /media/'+d2k;var p=document.getElementById('mp-preview');if(/^image\\//.test(mt)){p.src='/media/'+d2k;p.style.display='';}else{p.style.display='none';}loadMediaPicker();}
function renderIconSlot(id,url){var p=document.getElementById(id);if(!p)return;p.classList.toggle('empty',!url);p.innerHTML=url?'<img src="'+String(url).replace(/"/g,'&quot;')+'" alt="" onerror="renderIconSlot(\\''+id+'\\',\\'\\')">':'';}
function confirmMediaPick(){var url=document.getElementById('mp-url').value.trim();if(!url)return;if(!mpTargetId)return;document.getElementById(mpTargetId).value=url;if(mpPreviewId)renderIconSlot(mpPreviewId,url);closeModal('m-pickmedia');}
function bindMediaUpload(){var card=document.getElementById('mp-upload-card'),input=document.getElementById('mp-file-input');if(!card||!input)return;card.onclick=function(){input.click();};card.ondragover=function(e){e.preventDefault();card.classList.add('drag');};card.ondragleave=function(){card.classList.remove('drag');};card.ondrop=function(e){e.preventDefault();card.classList.remove('drag');uploadMediaFiles(e.dataTransfer.files);};input.onchange=function(){uploadMediaFiles(input.files);input.value='';};}
async function uploadMediaFiles(files){if(!files||!files.length)return;var st=document.getElementById('mp-selected');st.style.display='';for(var i=0;i<files.length;i++){var fd=new FormData();fd.append('file',files[i]);st.textContent=(window.t?window.t('media.uploading'):'上传中')+' '+files[i].name;var r=await fetch('/media/upload/'+encodeURIComponent(mpSlug),{method:'PUT',body:fd});var d=await r.json();if(d.ok&&d.url){document.getElementById('mp-url').value=d.url;st.textContent='已选: '+d.url;mpSelected=null;mpUrlChanged();}else{st.textContent=d.error||'upload failed';}}await loadMediaPicker();}

async function saveEditP(id){var d={slug:document.getElementById('eslug-'+id).value,name:document.getElementById('ename-'+id).value,description:document.getElementById('edesc-'+id).value,iconUrl:document.getElementById('eicon-'+id).value,sortOrder:Number(document.getElementById('esort-'+id).value),listed:document.getElementById('elisted-'+id).checked,badgeTags:JSON.stringify(tagData[id]||[])};await fetch('/api/admin/plugins/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});location.reload();}
async function delP(id){if(!confirm(window.t?window.t('docs.confirmDelete'):'删除该文档及所有内容？'))return;await fetch('/api/admin/plugins/'+id,{method:'DELETE'});location.reload();}
async function togglePlugin(id,cb){
  var r=await fetch('/api/admin/plugins/'+id+'/toggle',{method:'PUT'});
  var d=await r.json();
  if(d.ok){
    var pub=!!d.enabled;
    var badge=document.getElementById('doc-badge-'+id);
    var lbl=document.getElementById('doc-lbl-'+id);
    var card=cb.closest('.doc-card');
    var prev=card.querySelector('a[target="_blank"]');
    if(badge){badge.dataset.i18n=pub?'docs.enabled':'docs.disabled';badge.textContent=window.t?window.t(badge.dataset.i18n):(pub?'已启用':'已禁用');badge.className='doc-status '+(pub?'published':'draft');}
    if(lbl){lbl.dataset.i18n=pub?'docs.enabled':'docs.disabled';lbl.textContent=window.t?window.t(lbl.dataset.i18n):(pub?'已启用':'已禁用');}
    var toggle=cb.closest('.toggle');if(toggle){toggle.dataset.i18nTitle=pub?'docs.disableDoc':'docs.enableDoc';toggle.title=window.t?window.t(toggle.dataset.i18nTitle):(pub?'点击禁用访问':'点击启用访问');}
    if(prev){prev.dataset.i18nTitle=pub?'docs.viewPublic':'docs.previewAfterPublish';prev.title=window.t?window.t(prev.dataset.i18nTitle):(pub?'查看公开页面':'发布后可预览');}
    if(prev){prev.style.opacity=pub?'':'0.4';prev.style.pointerEvents=pub?'':'none';}
    cb.checked=pub;
  }else{cb.checked=!cb.checked;alert(window.t?window.t('docs.operationFailed'):'操作失败');}
}
async function toggleListed(id,cb){
  var r=await fetch('/api/admin/plugins/'+id+'/listed-toggle',{method:'PUT'});
  var d=await r.json();
  if(d.ok){
    var listed=!!d.listed;
    var badge=document.getElementById('doc-listed-badge-'+id);
    var lbl=document.getElementById('doc-listed-lbl-'+id);
    var edit=document.getElementById('elisted-'+id);
    if(badge){badge.dataset.i18n=listed?'docs.listed':'docs.unlisted';badge.textContent=window.t?window.t(badge.dataset.i18n):(listed?'首页展示':'不进首页');badge.className='doc-status '+(listed?'published':'draft');}
    if(lbl){lbl.dataset.i18n=listed?'docs.listed':'docs.unlisted';lbl.textContent=window.t?window.t(lbl.dataset.i18n):(listed?'首页展示':'不进首页');}
    var toggle=cb.closest('.toggle');if(toggle){toggle.dataset.i18nTitle=listed?'docs.hideFromHome':'docs.showOnHome';toggle.title=window.t?window.t(toggle.dataset.i18nTitle):(listed?'从首页隐藏':'在首页展示');}
    if(edit)edit.checked=listed;
    cb.checked=listed;
  }else{cb.checked=!cb.checked;alert(window.t?window.t('docs.operationFailed'):'操作失败');}
}
document.getElementById('pf-add').addEventListener('submit',async e=>{e.preventDefault();var s=document.getElementById('add-slug').value.trim(),n=document.getElementById('add-name').value.trim();if(!s||!n)return;await fetch('/api/admin/plugins',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:s,name:n})});location.reload();});

// ── Drag-and-drop sort ──
(function(){
  var list=document.getElementById('plugin-list');
  var src=null,fromHandle=false;
  // Track mousedown on handle so dragstart can verify origin
  list.addEventListener('mousedown',function(e){
    fromHandle=!!e.target.closest('.drag-handle');
  });
  document.addEventListener('mouseup',function(){fromHandle=false;});
  list.querySelectorAll('.doc-card').forEach(function(card){
    card.addEventListener('dragstart',function(e){
      if(!fromHandle){e.preventDefault();return;}
      src=card;card.classList.add('dragging');
      e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','');
    });
    card.addEventListener('dragend',function(){
      card.classList.remove('dragging');
      list.querySelectorAll('.doc-card').forEach(function(c){c.classList.remove('drag-over');});
      src=null;fromHandle=false;
    });
    card.addEventListener('dragover',function(e){
      if(!src)return;
      e.preventDefault();e.dataTransfer.dropEffect='move';
      if(card!==src)card.classList.add('drag-over');
    });
    card.addEventListener('dragleave',function(){card.classList.remove('drag-over');});
    card.addEventListener('drop',function(e){
      e.preventDefault();card.classList.remove('drag-over');
      if(!src||src===card)return;
      var cards=Array.from(list.querySelectorAll('.doc-card'));
      var si=cards.indexOf(src),di=cards.indexOf(card);
      if(si<di)list.insertBefore(src,card.nextSibling);else list.insertBefore(src,card);
      Array.from(list.querySelectorAll('.doc-card')).forEach(function(c,i){
        var inp=document.getElementById('esort-'+c.dataset.id);
        if(inp)inp.value=String(i);
        fetch('/api/admin/plugins/'+c.dataset.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({sortOrder:i})});
      });
    });
  });
})();

// ── Init: update each card's version display with latest sibling ──
(function(){var ids=[${all.map((p:any)=>p.id).join(',')}];ids.forEach(function(id){loadLatestVerFor(id);});})();
</script>`,
});

import { adminLayout, esc, DOC_THEME_CSS } from './layout';

export const settings = (s: Record<string,string>) => adminLayout({
  title:'系统设置',active:'settings',
  head:`<script src="https://cdn.bootcdn.net/ajax/libs/ace/1.32.6/ace.min.js"></script>
<style>
#css-editor-wrap{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-top:4px}
#css-editor{height:480px;font-size:13px}
.ace_editor{font-family:"Cascadia Code","Consolas",monospace!important}
.css-save-bar{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--surface);border-top:1px solid var(--border)}
.css-save-bar span{font-size:12px;color:var(--muted)}
.site-icon-slot{width:44px;height:44px;border:1px solid var(--border);border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;overflow:hidden;font-weight:800;color:var(--accent);cursor:pointer;transition:.14s;position:relative}
.site-icon-slot:hover{border-color:var(--accent);background:rgba(88,166,255,.06);box-shadow:0 0 0 2px rgba(88,166,255,.1)}
.site-icon-slot img{width:100%;height:100%;object-fit:cover}
.site-icon-slot span{font-size:15px;line-height:1}
.site-icon-slot.empty::before{content:'+';font-size:20px;font-weight:800;color:var(--accent)}
.site-icon-field{display:flex;align-items:center;gap:9px}
.site-icon-current{font-size:12px;color:var(--muted);font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:220px}
.icon-picker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:10px;max-height:340px;overflow:auto;padding:2px}
.icon-pick-card{height:110px;border:1px solid var(--border);border-radius:8px;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;cursor:pointer;transition:.14s;color:var(--muted);overflow:hidden}
.icon-pick-card:hover,.icon-pick-card.selected{border-color:var(--accent);background:rgba(88,166,255,.06);color:var(--text)}
.icon-pick-card.upload{border-style:dashed}
.icon-pick-card.drag{border-color:var(--ok);background:rgba(63,185,80,.08)}
.icon-pick-card img{width:100%;height:78px;object-fit:cover;background:#0d1117}
.icon-pick-name{max-width:100%;padding:0 8px;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>`,
  body:`<h1 class="page-title" data-i18n="settings.title">⚙️ 系统设置</h1>
<div class="card"><h3 data-i18n="settings.site">站点设置</h3><form id="sf2"><div class="form-row"><div class="form-group"><label data-i18n="settings.siteTitle">站点标题</label><input name="site_title" value="${esc(s.site_title||'DocForge')}" placeholder="DocForge"/></div><div class="form-group"><label data-i18n="settings.subtitle">副标题</label><input name="site_subtitle" value="${esc(s.site_subtitle||'Open documentation platform for projects and plugins.')}" placeholder="Open documentation platform for projects and plugins."/></div></div><div class="form-row"><div class="form-group"><label data-i18n="settings.logoText">顶部 Logo 文字</label><input name="header_logo_text" value="${esc(s.header_logo_text||'DocForge')}" placeholder="DocForge"/></div><div class="form-group"><label data-i18n="settings.siteIcon">站点图标</label><input name="site_icon" id="site-icon-input" type="hidden" value="${esc(s.site_icon||'DF')}"/><div class="site-icon-field"><div class="site-icon-slot" id="site-icon-preview" onclick="openIconPicker()" title="选择图标"></div><div class="site-icon-current" id="site-icon-current"></div></div><div style="font-size:11px;color:var(--muted);margin-top:6px" data-i18n="settings.siteIconHint">点击占位图标更换，支持上传图片、媒体 URL、Emoji 或短文本</div></div><div class="form-group"><label data-i18n="settings.themeColor">主题色</label><input name="header_accent_color" type="color" value="${esc(s.header_accent_color||'#58a6ff')}" style="height:36px;width:80px"/></div></div><div class="form-group"><label data-i18n="settings.footer">页脚文字</label><input name="footer_text" value="${esc(s.footer_text||'')}"/></div><div class="form-group"><label data-i18n="settings.ga">Google Analytics ID</label><input name="ga_tracking_id" value="${esc(s.ga_tracking_id||'')}" placeholder="G-XXXXXXXXXX"/></div><button type="submit" class="btn btn-primary btn-sm" data-i18n="settings.save" style="margin-top:4px">保存</button></form></div>

<div class="modal-ov" id="icon-picker-modal" style="z-index:3000">
  <div class="modal" onclick="event.stopPropagation()" style="width:680px;max-width:calc(100vw - 32px)">
    <div class="modal-hd"><h3 data-i18n="settings.selectIcon">选择图标</h3><button class="modal-close" onclick="closeModal('icon-picker-modal')" title="关闭">✕</button></div>
    <div style="display:flex;gap:8px;margin-bottom:10px"><input id="icon-url-input" placeholder="DF / 🧭 / https://... / /media/..." style="flex:1" oninput="selectSiteIcon(this.value)"><input id="icon-search" data-i18n-placeholder="docs.searchMedia" placeholder="搜索文件名..." style="flex:1" oninput="loadIconMedia()"></div>
    <input id="icon-file-input" type="file" accept="image/*" multiple style="display:none">
    <div id="icon-grid" class="icon-picker-grid"></div>
    <div id="icon-picker-status" style="min-height:18px;margin-top:8px;font-size:12px;color:var(--muted)"></div>
    <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('icon-picker-modal')" data-i18n="docs.cancel">取消</button><button class="btn btn-primary" onclick="confirmSiteIcon()" data-i18n="docs.confirm">确认</button></div>
  </div>
</div>

<div class="card">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <h3 data-i18n="settings.customCss" style="margin:0">全局 CSS</h3>
    <span style="font-size:11px;color:var(--muted)" data-i18n="settings.customCssHint">修改后点击保存，立即应用到所有前台页面</span>
  </div>
  <div id="css-editor-wrap">
    <div id="css-editor"></div>
    <div class="css-save-bar">
      <span id="css-dirty"></span>
      <button class="btn btn-primary btn-sm" onclick="saveCSS()"><span data-i18n="editor.save">💾 保存</span> <kbd style="font-size:10px;background:rgba(0,0,0,.2);border-color:rgba(255,255,255,.2);color:#fff">Ctrl+S</kbd></button>
    </div>
  </div>
</div>

<script>
function renderSiteIcon(v){
  var box=document.getElementById('site-icon-preview');
  var label=document.getElementById('site-icon-current');
  v=String(v||'').trim()||'DF';
  box.classList.remove('empty');
  if(label)label.textContent=v;
  if(/^https?:\\/\\//i.test(v)||/^\\//.test(v)){
    box.innerHTML='<img src="'+v.replace(/"/g,'&quot;')+'" onerror="this.parentNode.innerHTML=\\'<span>DF</span>\\'">';
  }else{
    box.innerHTML=v?'<span>'+escHtml(v.slice(0,4))+'</span>':'';
    if(!v)box.classList.add('empty');
  }
}
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
var _pickedIcon=document.getElementById('site-icon-input').value||'DF';
function openIconPicker(){_pickedIcon=document.getElementById('site-icon-input').value||'DF';document.getElementById('icon-url-input').value=_pickedIcon;openModal('icon-picker-modal');loadIconMedia();}
function selectSiteIcon(v){_pickedIcon=String(v||'').trim();renderIconGridSelection();}
function confirmSiteIcon(){var v=_pickedIcon||document.getElementById('icon-url-input').value.trim()||'DF';document.getElementById('site-icon-input').value=v;renderSiteIcon(v);closeModal('icon-picker-modal');}
async function loadIconMedia(){
  var q=(document.getElementById('icon-search').value||'').toLowerCase();
  var g=document.getElementById('icon-grid');
  var uploadCard='<div class="icon-pick-card upload" id="icon-upload-card"><div style="font-size:26px;color:var(--accent)">+</div><div class="icon-pick-name" data-i18n="media.dropUpload">拖拽文件到此处，或点击上传</div></div>';
  try{
    var r=await fetch('/api/admin/media?pluginSlug=docforge&page=1&limit=48');
    var d=await r.json();
    var items=(d.items||[]).filter(function(m){return /^image\\//.test(m.mimeType||'')&&(!q||m.filename.toLowerCase().indexOf(q)!==-1);});
    g.innerHTML=uploadCard+items.map(function(m){var url='/media/'+m.d2Key;return '<div class="icon-pick-card" data-url="'+escHtml(url)+'" onclick="selectIconCard(\\''+escHtml(url)+'\\')"><img src="'+escHtml(url)+'" loading="lazy"><div class="icon-pick-name">'+escHtml(m.filename)+'</div></div>';}).join('');
    bindIconUpload();
    renderIconGridSelection();
    if(window.applyAdminI18n)window.applyAdminI18n();
  }catch(e){g.innerHTML=uploadCard;bindIconUpload();document.getElementById('icon-picker-status').textContent=e.message||String(e);}
}
function renderIconGridSelection(){document.querySelectorAll('.icon-pick-card[data-url]').forEach(function(c){c.classList.toggle('selected',c.dataset.url===_pickedIcon);});document.getElementById('icon-url-input').value=_pickedIcon||'';}
function selectIconCard(url){_pickedIcon=url;renderIconGridSelection();}
function bindIconUpload(){
  var card=document.getElementById('icon-upload-card'),input=document.getElementById('icon-file-input');
  if(!card||!input)return;
  card.onclick=function(){input.click();};
  card.ondragover=function(e){e.preventDefault();card.classList.add('drag');};
  card.ondragleave=function(){card.classList.remove('drag');};
  card.ondrop=function(e){e.preventDefault();card.classList.remove('drag');uploadIconFiles(e.dataTransfer.files);};
  input.onchange=function(){uploadIconFiles(input.files);input.value='';};
}
async function uploadIconFiles(files){
  if(!files||!files.length)return;
  var st=document.getElementById('icon-picker-status');
  for(var i=0;i<files.length;i++){
    var fd=new FormData();fd.append('file',files[i]);
    st.textContent=(window.t?window.t('media.uploading'):'上传中')+' '+files[i].name;
    var r=await fetch('/media/upload/docforge',{method:'PUT',body:fd});
    var d=await r.json();
    if(d.ok&&d.url){_pickedIcon=d.url;st.textContent='✓ '+d.url;}else{st.textContent=d.error||'upload failed';}
  }
  await loadIconMedia();
}
renderSiteIcon(document.getElementById('site-icon-input').value);
var _ACE_BASE='https://cdn.bootcdn.net/ajax/libs/ace/1.32.6';
ace.config.set('basePath',_ACE_BASE);
var cssEditor=ace.edit('css-editor');
cssEditor.setTheme('ace/theme/one_dark');
cssEditor.session.setMode('ace/mode/css');
cssEditor.setOptions({fontSize:'13px',fontFamily:'"Cascadia Code","Consolas","Courier New",monospace',tabSize:2,useSoftTabs:true,showPrintMargin:false,wrap:false,scrollPastEnd:0.1,enableBasicAutocompletion:true,enableSnippets:true,enableLiveAutocompletion:true});
var _cssSaved=${JSON.stringify(s.custom_css || DOC_THEME_CSS)};
cssEditor.setValue(_cssSaved,-1);
cssEditor.session.on('change',function(){
  var dirty=cssEditor.getValue()!==_cssSaved;
  document.getElementById('css-dirty').textContent=dirty?(window.t?window.t('settings.unsaved'):'● 未保存'):'';
});
cssEditor.commands.addCommand({name:'saveCSS',bindKey:{win:'Ctrl-S',mac:'Command-S'},exec:saveCSS});
async function saveCSS(){
  var css=cssEditor.getValue();
  try{
    var r=await fetch('/api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({custom_css:css})});
    if(r.ok){_cssSaved=css;document.getElementById('css-dirty').textContent='';alert(window.t?window.t('settings.saved'):'已保存');}
    else alert(window.t?window.t('editor.saveFailed'):'保存失败');
  }catch(e){alert(window.t?window.t('editor.networkError'):'网络错误');}
}
document.getElementById('sf2').addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));await fetch('/api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});alert(window.t?window.t('settings.saved'):'已保存');});
</script>`,
});

export const accountSettings = () => adminLayout({
  title:'账户设置',active:'settings',
  body:`<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
  <a href="/admin/settings" class="btn btn-outline btn-sm">← <span data-i18n="settings.title">系统设置</span></a>
  <h1 class="page-title" style="margin:0" data-i18n="settings.account">🔑 账户设置</h1>
</div>
<div class="card" style="max-width:500px">
  <h3 data-i18n="settings.admin">管理员账户</h3>
  <p style="color:var(--muted);font-size:13px;margin-top:6px"><span data-i18n="settings.currentUser">当前用户:</span> <strong id="curr-user">-</strong></p>
  <form id="cf2" style="margin-top:14px">
    <input type="hidden" id="cu"/>
    <div class="form-row">
      <div class="form-group"><label data-i18n="settings.newPwd">新密码</label><input id="cp" type="password" minlength="6"/></div>
      <div class="form-group"><label data-i18n="settings.confirmPwd">确认密码</label><input id="cc" type="password" minlength="6"/></div>
    </div>
    <button type="submit" class="btn btn-primary" data-i18n="settings.update">更新</button>
  </form>
</div>
<script>
fetch('/api/admin/credentials').then(r=>r.json()).then(d=>{
  document.getElementById('curr-user').textContent=d.username||'(env)';
  if(d.username)document.getElementById('cu').value=d.username;
});
document.getElementById('cf2').addEventListener('submit',async e=>{
  e.preventDefault();
  var u=document.getElementById('cu').value.trim(),p=document.getElementById('cp').value,c=document.getElementById('cc').value;
  if(p!==c){alert(window.t?window.t('settings.pwdMismatch'):'密码不一致');return;}
  if(p.length<6){alert(window.t?window.t('settings.pwdShort'):'密码≥6位');return;}
  var res=await fetch('/api/admin/credentials',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
  var d=await res.json();
  if(d.ok){alert(window.t?window.t('settings.updated'):'已更新，请重新登录');location.href='/admin/logout';}
  else alert((window.t?window.t('settings.error'):'错误:')+d.error);
});
</script>`,
});

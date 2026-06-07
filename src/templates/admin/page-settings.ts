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
</style>`,
  body:`<h1 class="page-title" data-i18n="settings.title">⚙️ 系统设置</h1>
<div class="card"><h3 data-i18n="settings.site">站点设置</h3><form id="sf2"><div class="form-row"><div class="form-group"><label data-i18n="settings.siteTitle">站点标题</label><input name="site_title" value="${esc(s.site_title||'')}"/></div><div class="form-group"><label data-i18n="settings.subtitle">副标题</label><input name="site_subtitle" value="${esc(s.site_subtitle||'')}"/></div></div><div class="form-row"><div class="form-group"><label data-i18n="settings.logoText">顶部 Logo 文字</label><input name="header_logo_text" value="${esc(s.header_logo_text||'')}"/></div><div class="form-group"><label data-i18n="settings.themeColor">主题色</label><input name="header_accent_color" type="color" value="${esc(s.header_accent_color||'#58a6ff')}" style="height:36px;width:80px"/></div></div><div class="form-group"><label data-i18n="settings.footer">页脚文字</label><input name="footer_text" value="${esc(s.footer_text||'')}"/></div><div class="form-group"><label data-i18n="settings.ga">Google Analytics ID</label><input name="ga_tracking_id" value="${esc(s.ga_tracking_id||'')}" placeholder="G-XXXXXXXXXX"/></div><button type="submit" class="btn btn-primary btn-sm" data-i18n="settings.save" style="margin-top:4px">保存</button></form></div>

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

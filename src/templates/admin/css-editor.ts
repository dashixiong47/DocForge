// Standalone CSS editor page
const ACE_CSS = 'https://cdn.bootcdn.net/ajax/libs/ace/1.32.6';

export function cssEditor(customCss: string): string {
  return `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>全局 CSS 编辑器</title>
<script src="${ACE_CSS}/ace.min.js"></script>
<style>
:root{--bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#e6edf3;--muted:#8b949e;--accent:#58a6ff;--danger:#f85149;--ok:#3fb950;--radius:8px;--font:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;--mono:"Cascadia Code","Consolas",monospace}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);font-size:14px;color:var(--text);background:var(--bg);height:100vh;display:flex;flex-direction:column;overflow:hidden}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px}
.topbar{height:44px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 14px;gap:10px;flex-shrink:0;z-index:10}
.t-right{margin-left:auto;display:flex;align-items:center;gap:6px}
#ace-wrap{flex:1;overflow:hidden;position:relative}
#ace-editor{position:absolute;inset:0}
.btn{padding:5px 12px;border:1px solid var(--border);border-radius:var(--radius);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;text-decoration:none;background:transparent;color:var(--text)}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}.btn-primary:hover{opacity:.85;color:#fff}
kbd{font-size:11px;background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:2px 5px;color:var(--muted);font-family:var(--mono)}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;opacity:0;pointer-events:none;transition:opacity .2s;z-index:9999;white-space:nowrap}
.toast.show{opacity:1}
.toast-ok{background:#122d1f;border:1px solid #1a3d2a;color:var(--ok)}
.toast-err{background:#2d1216;border:1px solid #5a1e27;color:var(--danger)}
.file-tag{font-size:12px;font-family:var(--mono);color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:2px 8px}
</style>
</head><body>
<div class="topbar">
  <a href="/admin/settings" class="btn" style="color:var(--muted)">← 系统设置</a>
  <span class="file-tag">global.css</span>
  <div class="t-right">
    <span id="status" style="font-size:12px;color:var(--muted)"></span>
    <button class="btn btn-primary" id="save-btn" onclick="saveCSS()">💾 保存 <kbd>Ctrl+S</kbd></button>
  </div>
</div>
<div id="ace-wrap">
  <div id="ace-editor"></div>
</div>
<div class="toast" id="toast"></div>
<script>
ace.config.set('basePath','${ACE_CSS}');
var editor=ace.edit('ace-editor');
editor.setTheme('ace/theme/one_dark');
editor.session.setMode('ace/mode/css');
editor.setOptions({
  fontSize:'13px',fontFamily:'"Cascadia Code","Consolas","Courier New",monospace',
  tabSize:2,useSoftTabs:true,showPrintMargin:false,
  wrap:false,scrollPastEnd:0.3,
  enableBasicAutocompletion:true,enableSnippets:true,enableLiveAutocompletion:true,
  showLineNumbers:true,showGutter:true,highlightActiveLine:true
});
editor.setValue(${JSON.stringify(customCss)},-1);
editor.focus();
editor.commands.addCommand({name:'save',bindKey:{win:'Ctrl-S',mac:'Command-S'},exec:saveCSS});
// Dirty tracking
var saved=editor.getValue();
editor.session.on('change',function(){
  var dirty=editor.getValue()!==saved;
  document.getElementById('status').textContent=dirty?'● 未保存':'';
});

async function saveCSS(){
  var css=editor.getValue();
  var btn=document.getElementById('save-btn'),st=document.getElementById('status');
  btn.disabled=true;
  try{
    var r=await fetch('/api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({custom_css:css})});
    if(r.ok){saved=css;st.textContent='';showToast('✓ 已保存','ok');}
    else showToast('保存失败','err');
  }catch(e){showToast('网络错误','err');}
  btn.disabled=false;
}
function showToast(msg,type){var t=document.getElementById('toast');t.textContent=msg;t.className='toast toast-'+(type||'ok')+' show';clearTimeout(t._tmr);t._tmr=setTimeout(function(){t.className='toast';},2400);}
window.addEventListener('beforeunload',function(e){if(editor.getValue()!==saved){e.preventDefault();e.returnValue='';}});
</script>
</body></html>`;
}

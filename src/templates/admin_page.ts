// Monaco CDN
const MONACO = 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.47.0/min/vs';
const MONACO_BASE = 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.47.0/min/';

function adminLayout(opts: { title: string; body: string; active?: string; head?: string }): string {
  const a = opts.active || '';
  return `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.title} - 管理后台</title>
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
.side-nav{width:200px;background:var(--surface);border-right:1px solid var(--border);padding:16px 0;position:fixed;top:0;left:0;bottom:0;overflow-y:auto;display:flex;flex-direction:column}
.side-nav .logo{padding:0 16px 14px;font-size:15px;font-weight:800;color:var(--accent);border-bottom:1px solid var(--border);margin-bottom:6px}
.side-nav a{display:block;padding:7px 16px;color:var(--muted);font-size:13px;transition:.12s;border-left:2px solid transparent}
.side-nav a:hover,.side-nav a.active{color:var(--text);background:rgba(88,166,255,.06);border-left-color:var(--accent)}
.side-nav .nav-bottom{margin-top:auto;padding-top:8px;border-top:1px solid var(--border)}
.main-content{margin-left:200px;flex:1;padding:24px 28px;max-width:calc(100vw - 200px)}
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
.modal h3{margin:0 0 18px;font-size:16px;font-weight:700}
.tag-chip{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:12px;font-size:11px;background:rgba(88,166,255,.15);color:var(--accent);border:1px solid rgba(88,166,255,.25)}
.tag-chip .tag-rm{cursor:pointer;opacity:.5;font-weight:700;line-height:1}.tag-chip .tag-rm:hover{opacity:1;color:var(--danger)}
.tag-input-wrap{display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:4px 8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);min-height:32px;cursor:text}
.tag-input-wrap input{border:none!important;background:transparent!important;color:var(--text);font:inherit;font-size:12px;outline:none;flex:1;min-width:80px;padding:2px 0;box-shadow:none!important}
.media-picker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;max-height:380px;overflow-y:auto;margin-top:12px}
.media-picker-item{border:2px solid var(--border);border-radius:6px;overflow:hidden;cursor:pointer;transition:.12s;background:var(--bg)}
.media-picker-item:hover,.media-picker-item.selected{border-color:var(--accent)}
.media-picker-item img{width:100%;height:80px;object-fit:cover;display:block}
.media-picker-item .pi-name{font-size:10px;padding:4px 6px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-picker-preview{width:100%;max-height:200px;object-fit:contain;margin-top:8px;border-radius:6px;background:var(--bg)}
.pager{display:flex;gap:4px;align-items:center;justify-content:center;margin-top:10px;font-size:12px;color:var(--muted)}
.pager button{padding:3px 10px;border:1px solid var(--border);border-radius:4px;background:transparent;color:var(--text);cursor:pointer;font-size:12px}
.pager button:hover{border-color:var(--accent)}.pager button:disabled{opacity:.3;cursor:default}
@media(max-width:768px){.side-nav{width:100%;position:static;border-right:0}.main-content{margin-left:0}}
</style>
</head><body>
<div class="admin-layout">
<nav class="side-nav">
  <div class="logo">管理后台</div>
  <a href="/admin" class="${a === 'dashboard' ? 'active' : ''}">📊 控制台</a>
  <a href="/admin/plugins" class="${a === 'plugins' ? 'active' : ''}">📁 文档管理</a>
  <a href="/admin/media" class="${a === 'media' ? 'active' : ''}">🖼 媒体文件</a>
  <a href="/admin/settings" class="${a === 'settings' ? 'active' : ''}">⚙️ 系统设置</a>
  <div class="nav-bottom">
    <a href="/" target="_blank">🌐 查看网站</a>
    <a href="/admin/logout" style="color:var(--danger)">🚪 退出登录</a>
  </div>
</nav>
<main class="main-content">
${opts.body}
</main>
</div>
<script>
function openModal(id){document.getElementById(id).classList.add('open');var inp=document.querySelector('#'+id+' input:not([type=hidden])');if(inp)setTimeout(function(){inp.focus();},30);}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-ov').forEach(function(ov){ov.addEventListener('click',function(e){if(e.target===ov)ov.classList.remove('open');});});
document.addEventListener('keydown',function(e){if(e.key==='Escape')document.querySelectorAll('.modal-ov.open').forEach(function(m){m.classList.remove('open');});});
</script>
</body></html>`;
}

function esc(s: string): string {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function blockPreview(type: string, contentJson: string): string {
  try {
    const c = JSON.parse(contentJson||'{}') as Record<string,unknown>;
    switch(type) {
      case 'html': return String(c.html||'').replace(/<[^>]+>/g,'').substring(0,120);
      case 'code': return `[${c.language||'?'}] ${String(c.code||'').substring(0,80)}`;
      case 'image': return `🖼 ${c.src||''}`;
      default: return JSON.stringify(c).substring(0,100);
    }
  } catch { return contentJson.substring(0,120); }
}

function monacoEditorHTML(id: string, readOnly: boolean, content: string, language: string): string {
  const ro = readOnly ? 'true' : 'false';
  return `<div id="${id}" style="height:100%;border:1px solid var(--border);border-radius:var(--radius)"></div>
<script>
require.config({paths:{vs:'${MONACO}'}});
require(['vs/editor/editor.main'],function(){
  monaco.editor.defineTheme('ue-dark',{base:'vs-dark',inherit:true,rules:[],colors:{'editor.background':'#0d1117','editor.foreground':'#e6edf3','editor.lineHighlightBackground':'#161b22','editor.selectionBackground':'#264f78','editor.inactiveSelectionBackground':'#1c3b5a'}});
  var ed=monaco.editor.create(document.getElementById('${id}'),{value:${JSON.stringify(content)},language:'${language}',theme:'ue-dark',readOnly:${ro},fontSize:13,fontFamily:'"Cascadia Code","Consolas","Courier New",monospace',tabSize:2,minimap:{enabled:false},scrollBeyondLastLine:false,wordWrap:'on',automaticLayout:true});
  window['_m_${id}']=ed;
});
<\/script>`;
}

function blocksToEditorText(blocks: any[]): string {
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

// ══════════════════════════════════════════════════════════════════
// PLUGIN EDITOR — full-screen standalone editor page
// ══════════════════════════════════════════════════════════════════
export function pluginEditor(plugin: any, allPlugins: any[], allSections: any[], activeSection: any|null, blocks: any[], editorTheme?: string): string {
  const roots: any[]=[];
  const childMap=new Map<number,any[]>();
  for(const s of allSections){
    if(!s.parentId) roots.push(s);
    else{if(!childMap.has(s.parentId)) childMap.set(s.parentId,[]); childMap.get(s.parentId)!.push(s);}
  }
  const activeSectionId=activeSection?.id??-1;

  const treeHtml=roots.map((s:any)=>{
    const active=s.id===activeSectionId;
    let h=`<div class="si-row">`;
    h+=`<a href="?s=${s.id}" class="si${active?' active':''}">`;
    h+=`<span class="si-ic">${active?'▶':'▷'}</span>`;
    h+=`<span class="si-lbl">${esc(s.titleZh||s.slug)}</span>`;
    h+=`</a>`;
    h+=`<button class="si-add" onclick="openAddSub(${s.id},event)" title="添加子章节">+</button>`;
    h+=`</div>`;
    for(const child of (childMap.get(s.id)||[])){
      const ca=child.id===activeSectionId;
      h+=`<a href="?s=${child.id}" class="si child${ca?' active':''}">`;
      h+=`<span class="si-ic">${ca?'▸':'·'}</span>`;
      h+=`<span class="si-lbl">${esc(child.titleZh||child.slug)}</span>`;
      h+=`</a>`;
    }
    return h;
  }).join('');

  const initialText=blocksToEditorText(blocks);
  const ACE='https://cdn.bootcdn.net/ajax/libs/ace/1.32.6';

  return `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(plugin.name)} — 编辑器</title>
<link rel="preconnect" href="https://cdn.bootcdn.net">
<script src="${ACE}/ace.min.js"></script>
<script src="${ACE}/ext-language_tools.min.js"></script>
<script src="${ACE}/ext-searchbox.min.js"></script>
<script src="${ACE}/ext-beautify.min.js"></script>
<script src="${ACE}/theme-${esc(editorTheme||'one_dark')}.min.js"></script>
<style>
:root{--bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#e6edf3;--muted:#8b949e;--accent:#58a6ff;--danger:#f85149;--ok:#3fb950;--warn:#d2991d;--radius:8px;--font:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;--mono:"Cascadia Code","Consolas",monospace}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);font-size:14px;color:var(--text);background:var(--bg);line-height:1.6;height:100vh;overflow:hidden;display:flex;flex-direction:column}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px}
a{color:var(--accent);text-decoration:none}input:focus,textarea:focus{outline:none;border-color:var(--accent)!important}
#ace-editor{width:100%;height:100%}
.ace_editor{font-family:var(--mono)!important;font-size:13px!important}
.topbar{height:44px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 14px;gap:10px;flex-shrink:0;z-index:100}
.t-right{margin-left:auto;display:flex;align-items:center;gap:6px}
.ide-body{flex:1;display:flex;overflow:hidden}
.ide-sb{width:220px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;flex-shrink:0}
.sb-hd{padding:9px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.sb-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.sb-tree{flex:1;overflow-y:auto;padding:3px 0}
.si-row{display:flex;align-items:center}
.si{display:flex;align-items:center;gap:6px;padding:5px 10px;color:var(--muted);font-size:13px;text-decoration:none;transition:.1s;border-left:2px solid transparent;flex:1;min-width:0}
.si:hover{color:var(--text);background:rgba(88,166,255,.05)}
.si.active{color:var(--text);background:rgba(88,166,255,.09);border-left-color:var(--accent)}
.si.child{padding-left:24px;font-size:12px}
.si-ic{font-size:9px;color:var(--accent);flex-shrink:0}
.si-lbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.si-add{border:none;background:transparent;color:var(--muted);cursor:pointer;padding:2px 7px;font-size:14px;line-height:1;border-radius:4px;transition:.1s;flex-shrink:0;opacity:.35}
.si-row:hover .si-add{opacity:1}
.si-add:hover{color:var(--ok);background:rgba(63,185,80,.12)}
.sb-ft{border-top:1px solid var(--border);padding:7px 12px;font-size:11px;color:var(--muted);flex-shrink:0;display:flex;justify-content:space-between;align-items:center}
.ide-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.ed-bar{height:44px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 12px;gap:8px;flex-shrink:0}
#sec-name-wrap{position:relative;display:inline-flex;align-items:center;min-height:28px}
#sec-name{font-weight:700;font-size:14px;cursor:text;padding:3px 6px;border-radius:5px;border:1px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px;visibility:visible}
#sec-name:hover{border-color:var(--border);background:rgba(255,255,255,.04)}
#sec-name-input{font-weight:700;font-size:14px;padding:3px 6px;border:1px solid var(--accent);border-radius:5px;background:var(--bg);color:var(--text);font-family:var(--font);width:280px;position:absolute;left:0;top:0;visibility:hidden;pointer-events:none}
#sec-name-input:focus{outline:none;box-shadow:0 0 0 2px rgba(88,166,255,.2)}
.sec-slug{font-size:12px;color:var(--accent);font-family:var(--mono);flex-shrink:0}
.ed-wrap{flex:1;overflow:hidden;position:relative}
.btn{padding:5px 12px;border:1px solid var(--border);border-radius:var(--radius);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;text-decoration:none;background:transparent;color:var(--text)}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}.btn-primary:hover{opacity:.85;color:#fff}
.btn-danger{background:var(--danger);color:#fff;border-color:var(--danger)}.btn-danger:hover{opacity:.85;color:#fff}
.btn-ok{background:var(--ok);color:#fff;border-color:var(--ok)}.btn-ok:hover{opacity:.85;color:#fff}
.btn-sm{padding:3px 9px;font-size:12px}
.btn-group{display:flex;gap:6px;align-items:center}
kbd{font-size:11px;background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:2px 5px;color:var(--muted);font-family:var(--mono)}
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:2000;align-items:center;justify-content:center;backdrop-filter:blur(2px);display:none}
.modal-ov.open{display:flex}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;width:400px;max-width:calc(100vw - 32px)}
.modal h3{margin:0 0 18px;font-size:16px;font-weight:700}
.mfg{margin-bottom:12px}
.mfg label{display:block;margin-bottom:4px;color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.mfg input,.mfg textarea,.mfg select{width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px}
.mfg textarea{min-height:80px;resize:vertical;font-family:var(--mono);font-size:12px}
.mfg-row{display:flex;gap:10px}.mfg-row>.mfg{flex:1}
.modal-footer{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;opacity:0;pointer-events:none;transition:opacity .2s;z-index:9999;white-space:nowrap}
.toast.show{opacity:1}
.toast-ok{background:#122d1f;border:1px solid #1a3d2a;color:var(--ok)}
.toast-err{background:#2d1216;border:1px solid #5a1e27;color:var(--danger)}
.spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.sel-theme{background:var(--surface);border:1px solid var(--border);border-radius:5px;color:var(--text);font-size:11px;padding:3px 6px;cursor:pointer;font-family:var(--font);min-width:130px}
.sel-theme:focus{outline:none;border-color:var(--accent)}
.sel-theme option{background:var(--surface);color:var(--text)}
</style>
</head><body>

<div class="topbar">
  <span style="font-weight:700;color:var(--accent)">📁 ${esc(plugin.name)}</span>
  <div class="t-right">
    <a href="/admin/plugins" class="btn btn-sm" title="返回文档列表" style="color:var(--muted)">← 文档列表</a>
    <select class="sel-theme" id="sel-theme" title="编辑器主题"></select>
    <a href="/admin/plugins/${plugin.id}/translations" class="btn btn-sm">🌐 翻译</a>
    <a href="/admin/media?plugin=${esc(plugin.slug)}" class="btn btn-sm">🖼 媒体</a>
    <a href="/${esc(plugin.slug)}" target="_blank" class="btn btn-sm">👁 预览</a>
    </div>
  </div>
</div>

<div class="ide-body">
  <aside class="ide-sb">
    <div class="sb-hd" style="flex-direction:column;align-items:stretch;gap:6px;padding:9px 10px">
      <div style="display:flex;gap:5px;align-items:center">
        <select class="sel-theme" id="sel-doc" style="flex:1;font-size:12px;padding:5px 8px;min-width:0">
          ${allPlugins.map((p:any)=>`<option value="${p.id}" ${p.id===plugin.id?'selected':''}>${esc(p.name)}</option>`).join('')}
        </select>
        <button class="btn btn-sm btn-ok" onclick="openModal('m-newdoc')" title="新建文档" style="flex-shrink:0;padding:5px 8px">+</button>
      </div>
    </div>
    <div class="sb-hd">
      <span class="sb-lbl">章节</span>
      <button class="btn btn-sm btn-ok" onclick="openModal('m-addsec')" title="添加顶级章节">+</button>
    </div>
    <div class="sb-tree">
      ${allSections.length===0
        ?`<div style="padding:24px 12px;text-align:center;color:var(--muted);font-size:12px">暂无章节<br>点击 + 创建</div>`
        :treeHtml}
    </div>
    <div class="sb-ft">
      <span>${allSections.length} 个章节</span>
      ${activeSection?`<button class="btn btn-sm" onclick="openModal('m-secset')" title="章节设置" style="color:var(--muted)">⚙</button>`:''}
    </div>
  </aside>

  <main class="ide-main">
    <div class="ed-bar">
      <span id="sec-name-wrap" style="${activeSection?'':'display:none'}">
        <span id="sec-name" onclick="startRename()" title="点击重命名">${esc(activeSection?.titleZh||activeSection?.slug||'')}</span>
        <input id="sec-name-input" value="${esc(activeSection?.titleZh||activeSection?.slug||'')}"
          onblur="finishRename()" onkeydown="renameKey(event)" autocomplete="off">
      </span>
      <span class="sec-slug" style="${activeSection?'':'display:none'}">#${esc(activeSection?.slug||'')}</span>
      <span id="ed-hint" style="${activeSection?'display:none':'color:var(--muted)'}">← 选择或创建章节</span>
      <div class="btn-group" style="margin-left:auto">
        <button class="btn btn-sm" id="secset-btn" onclick="openModal('m-secset')" title="章节设置" style="${activeSection?'':'display:none'}">⚙</button>
        <button class="btn btn-sm" id="fmt-btn" onclick="formatDoc()" title="格式化 Ctrl+Shift+F" style="${activeSection?'':'display:none'}">⇥ 格式化</button>
        <button class="btn btn-primary btn-sm" id="save-btn" onclick="saveContent()" style="${activeSection?'':'display:none'}">💾 保存 <kbd>Ctrl+S</kbd></button>
      </div>
    </div>
    <div class="ed-wrap" style="position:relative">
      <div id="ace-editor"></div>
      <div id="ed-placeholder" style="position:absolute;inset:0;display:${activeSection?'none':'flex'};align-items:center;justify-content:center;background:var(--bg);color:var(--muted);font-size:14px;pointer-events:none">← 从左侧选择章节开始编辑</div>
      <div id="ed-loading" style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(13,17,23,.85);z-index:100;flex-direction:column;gap:12px"><div class="spinner"></div><span style="color:var(--muted);font-size:13px">加载中…</span></div>
    </div>
  </main>
</div>

<!-- Modals -->
<div class="modal-ov" id="m-newdoc"><div class="modal" onclick="event.stopPropagation()"><h3>新建文档</h3><div class="mfg"><label>文档标识 (slug)</label><input id="nd-slug" placeholder="my-project" autocomplete="off"></div><div class="mfg"><label>名称</label><input id="nd-name" placeholder="My Project" autocomplete="off"></div><div class="modal-footer"><button class="btn" onclick="closeModal('m-newdoc')">取消</button><button class="btn btn-primary" onclick="doCreateDoc()">创建</button></div></div></div>
<div class="modal-ov" id="m-addsec"><div class="modal" onclick="event.stopPropagation()"><h3>添加章节</h3><div class="mfg"><label>名称（中文）</label><input id="as-title" placeholder="如：安装说明" autocomplete="off"></div><div class="mfg"><label>Slug（URL锚点）</label><input id="as-slug" placeholder="installation" autocomplete="off"></div><div class="modal-footer"><button class="btn" onclick="closeModal('m-addsec')">取消</button><button class="btn btn-primary" onclick="doAddSection(null)">创建</button></div></div></div>
<div class="modal-ov" id="m-addsub"><div class="modal" onclick="event.stopPropagation()"><h3>添加子章节</h3><input type="hidden" id="sub-parent-id"><div class="mfg"><label>名称（中文）</label><input id="sub-title" placeholder="子章节名称" autocomplete="off"></div><div class="mfg"><label>Slug（URL锚点）</label><input id="sub-slug" placeholder="subsection-slug" autocomplete="off"></div><div class="modal-footer"><button class="btn" onclick="closeModal('m-addsub')">取消</button><button class="btn btn-primary" onclick="doAddSection(+document.getElementById('sub-parent-id').value)">创建</button></div></div></div>
<div class="modal-ov" id="m-secset"><div class="modal" onclick="event.stopPropagation()"><h3>章节设置</h3><div class="mfg-row"><div class="mfg"><label>名称（中文）</label><input id="ss-title" value="${esc(activeSection?.titleZh||activeSection?.slug||'')}"></div><div class="mfg"><label>Slug</label><input id="ss-slug" value="${esc(activeSection?.slug||'')}"></div></div><div class="modal-footer"><button class="btn btn-danger" onclick="doDelSection()" style="margin-right:auto">删除章节</button><button class="btn" onclick="closeModal('m-secset')">取消</button><button class="btn btn-primary" onclick="doSaveSecSettings()">保存</button></div></div></div>

<div class="toast" id="toast"></div>

<script>
var SECTION_ID=${activeSection?activeSection.id:'null'};
var SECTION_SLUG='${esc(activeSection?.slug||'')}';
var PLUGIN_ID=${plugin.id};
var INITIAL_TEXT=${JSON.stringify(initialText)};
var ALL_SECTIONS_COUNT=${allSections.length};

var selDoc=document.getElementById('sel-doc');
if(selDoc)selDoc.addEventListener('change',function(){location.href='/admin/plugins/'+this.value+'/editor';});

ace.config.set('basePath','${ACE}');
ace.require('ace/ext/language_tools');
var beautify=null;
try{beautify=ace.require('ace/ext/beautify');}catch(e){console.warn('Ace beautify not available:',e);}

var ACE_THEMES=['one_dark','monokai','github_dark','nord_dark','dracula','tomorrow_night_blue','tomorrow_night','tomorrow_night_bright','tomorrow_night_eighties','tomorrow','solarized_dark','solarized_light','gruvbox_dark_hard','gruvbox_light_hard','gruvbox','ambiance','chaos','chrome','clouds','clouds_midnight','cobalt','crimson_editor','dawn','dreamweaver','eclipse','github','gob','idle_fingers','iplastic','katzenmilch','kr_theme','kuroir','merbivore','merbivore_soft','mono_industrial','pastel_on_dark','sqlserver','terminal','textmate','twilight','vibrant_ink','xcode'];
var ACTIVE_THEME='${esc(editorTheme||'')}'||'one_dark';
var ACE_BASE='${ACE}',themeLoaded={};themeLoaded[ACTIVE_THEME]=true;
function loadThemeCss(t,cb){if(themeLoaded[t]){cb();return;}var s=document.createElement('script');s.src=ACE_BASE+'/theme-'+t+'.min.js';s.onload=function(){themeLoaded[t]=true;cb();};s.onerror=function(){showToast('主题加载失败: '+t,'err');};document.head.appendChild(s);}
function switchTheme(t){loadThemeCss(t,function(){editor.setTheme('ace/theme/'+t);localStorage.setItem('ace-theme',t);ACTIVE_THEME=t;fetch('/api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({editor_theme:t})}).catch(function(){});});}
(function(){var sel=document.getElementById('sel-theme');ACE_THEMES.forEach(function(t){var o=document.createElement('option');o.value=t;o.textContent=t.replace(/_/g,' ');if(t===ACTIVE_THEME)o.selected=true;sel.appendChild(o);});sel.addEventListener('change',function(){switchTheme(this.value);});})();

var editor=ace.edit('ace-editor');
editor.setTheme('ace/theme/'+ACTIVE_THEME);
editor.session.setMode('ace/mode/html');
editor.setOptions({enableBasicAutocompletion:true,enableSnippets:true,enableLiveAutocompletion:true,fontSize:'13px',fontFamily:'"Cascadia Code","Consolas","Courier New",monospace',tabSize:2,useSoftTabs:true,showPrintMargin:false,wrap:true,scrollPastEnd:0.3,displayIndentGuides:true,showLineNumbers:true,showGutter:true,highlightActiveLine:true,highlightSelectedWord:true,mergeUndoDeltas:'always'});
if(SECTION_ID){editor.setValue(INITIAL_TEXT,-1);editor.focus();}else{editor.setReadOnly(true);}

editor.commands.addCommand({name:'save',bindKey:{win:'Ctrl-S',mac:'Command-S'},exec:saveContent});
editor.commands.addCommand({name:'format',bindKey:{win:'Ctrl-Shift-F',mac:'Command-Shift-F'},exec:function(ed){if(beautify&&typeof beautify.beautify==='function')beautify.beautify(ed.session);else showToast('格式化模块未加载','err');}});
editor.commands.addCommand({name:'insertTKey',bindKey:{win:'Ctrl-Shift-T',mac:'Command-Shift-T'},exec:function(ed){var p=ed.getCursorPosition();ed.insert('{{t:}}');ed.moveCursorTo(p.row,p.column+4);}});

function blocksToText(blocks){if(!blocks||!blocks.length)return'';return blocks.map(function(b){var c={};try{c=JSON.parse(b.contentJson||'{}');}catch(e){}if(b.type==='html')return'===html===\\n'+(c.html||'');if(b.type==='code')return'===code:'+(c.language||'cpp')+'===\\n'+(c.code||'');if(b.type==='text')return'===text===\\nzh: '+(c.textZh||'')+'\\nen: '+(c.textEn||'');if(b.type==='callout')return'===callout===\\nzh: '+(c.textZh||'')+'\\nen: '+(c.textEn||'');if(b.type==='list'){var tag=c.ordered?'list:ordered':'list';var lines=(c.items||[]).map(function(item){return typeof item==='string'?'- zh: '+item+' | en: ':'- zh: '+(item.zh||'')+' | en: '+(item.en||'');});return'==='+tag+'===\\n'+lines.join('\\n');}if(b.type==='card')return'===card===\\ntitle-zh: '+(c.titleZh||'')+'\\ntitle-en: '+(c.titleEn||'')+'\\nzh: '+(c.textZh||'')+'\\nen: '+(c.textEn||'');if(b.type==='code-tags')return'===code-tags===\\n'+(c.tags||[]).join('\\n');if(b.type==='image')return c.key?'===image===\\nkey: '+(c.key||'')+'\\nalt: '+(c.alt||''):'===image===\\nsrc: '+(c.src||'')+'\\nalt: '+(c.alt||'');if(b.type==='video')return c.key?'===video===\\nkey: '+(c.key||'')+'\\nsrc: '+(c.src||''):'===video===\\nsrc: '+(c.src||'');return'==='+b.type+'===\\n'+b.contentJson;}).join('\\n\\n');}

document.querySelectorAll('.sb-tree .si[href]').forEach(function(l){l.addEventListener('click',function(e){e.preventDefault();var m=l.getAttribute('href').match(/[?&]s=(\\d+)/);if(m)_loadSection(Number(m[1]),l);});});

async function _loadSection(sid,clk){var ld=document.getElementById('ed-loading');if(ld)ld.style.display='flex';try{var r=await fetch('/api/admin/sections/'+sid+'/blocks');if(!r.ok)throw new Error('HTTP '+r.status);var d=await r.json(),sec=d.section,blks=d.blocks;SECTION_ID=sec.id;SECTION_SLUG=sec.slug;history.pushState({s:sid},'','?s='+sid);document.querySelectorAll('.sb-tree .si').forEach(function(si){si.classList.remove('active');});if(clk)clk.classList.add('active');var w=document.getElementById('sec-name-wrap'),nm=document.getElementById('sec-name'),inp=document.getElementById('sec-name-input'),slg=document.querySelector('.sec-slug'),h=document.getElementById('ed-hint');if(w)w.style.display='';if(nm)nm.textContent=sec.titleZh||sec.slug;if(inp)inp.value=sec.titleZh||sec.slug;if(slg){slg.textContent='#'+sec.slug;slg.style.display='';}if(h)h.style.display='none';['secset-btn','fmt-btn','save-btn'].forEach(function(id){var el=document.getElementById(id);if(el)el.style.display='';});var ssT=document.getElementById('ss-title'),ssS=document.getElementById('ss-slug');if(ssT)ssT.value=sec.titleZh||'';if(ssS)ssS.value=sec.slug||'';var ph=document.getElementById('ed-placeholder');if(ph)ph.style.display='none';editor.setReadOnly(false);editor.setValue(blocksToText(blks),-1);editor.focus();}catch(e){showToast('加载失败: '+e.message,'err');}if(ld)ld.style.display='none';}

function formatDoc(){if(editor&&beautify&&typeof beautify.beautify==='function')beautify.beautify(editor.session);else showToast('格式化模块未加载','err');}

window.addEventListener('popstate',function(e){if(e.state&&e.state.s){var l=document.querySelector('.sb-tree .si[href="?s='+e.state.s+'"]');_loadSection(e.state.s,l);}});

function textToBlocks(t){var bl=[],cur=null;t.split('\\n').forEach(function(ln){var m=ln.match(/^===([\\w][\\w-]*)(?::([^\\s=]*))?===\\s*$/);if(m){if(cur)bl.push(_makeBlock(cur));cur={type:m[1],param:m[2]||'',lines:[]};}else if(cur){cur.lines.push(ln);}});if(cur)bl.push(_makeBlock(cur));bl.forEach(function(b,i){b.sortOrder=i;});return bl;}
function _makeBlock(cur){var type=cur.type,param=cur.param,content=cur.lines.join('\\n').trim(),cj;if(type==='html')cj=JSON.stringify({html:content});else if(type==='code')cj=JSON.stringify({language:param||'cpp',code:content});else if(type==='text'||type==='callout')cj=JSON.stringify({textZh:_kv(content,'zh'),textEn:_kv(content,'en')});else if(type==='list'){var items=content.split('\\n').filter(function(l){return/^-\\s/.test(l);}).map(function(l){var inner=l.slice(l.indexOf('-')+1).trim();var zm=inner.match(/zh:\\s*([^|]+)/),em=inner.match(/en:\\s*(.*)/);return{zh:(zm?zm[1]:'').trim(),en:(em?em[1]:'').trim()};});cj=JSON.stringify({ordered:param==='ordered',items:items});}else if(type==='card')cj=JSON.stringify({titleZh:_kv(content,'title-zh'),titleEn:_kv(content,'title-en'),textZh:_kv(content,'zh'),textEn:_kv(content,'en')});else if(type==='code-tags')cj=JSON.stringify({tags:content.split('\\n').map(function(s){return s.trim();}).filter(Boolean)});else if(type==='image'){var imgKey=_kv(content,'key'),imgSrc=_kv(content,'src'),imgAlt=_kv(content,'alt');cj=JSON.stringify(imgKey?{key:imgKey,alt:imgAlt}:{src:imgSrc,alt:imgAlt});}else if(type==='video'){var vKey=_kv(content,'key'),vSrc=_kv(content,'src');cj=JSON.stringify(vKey?{key:vKey,src:vSrc}:{src:vSrc});}else if(type==='cards'){try{cj=JSON.stringify({cards:JSON.parse(content)});}catch(e){cj='{"cards":[]}';}}else cj=JSON.stringify({html:content});return{type:type,contentJson:cj,sortOrder:0};}
function _kv(text,key){var m=text.match(new RegExp('^'+key.replace('-','\\\\-')+':\\\\s*(.*)','m'));return m?m[1].trim():'';}

async function saveContent(){if(!SECTION_ID||typeof editor==='undefined')return;var bl=textToBlocks(editor.getValue()),btn=document.getElementById('save-btn');if(btn){btn.disabled=true;btn.textContent='保存中…';}try{var r=await fetch('/api/admin/sections/'+SECTION_ID+'/blocks-bulk',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({blocks:bl})});if(r.ok){var d=await r.json();showToast('\\u2713 已保存 '+d.count+' 个内容块','ok');}else showToast('保存失败','err');}catch(e){showToast('网络错误','err');}finally{if(btn){btn.disabled=false;btn.textContent='💾 保存 ';btn.insertAdjacentHTML('beforeend','<kbd>Ctrl+S</kbd>');}}}

function startRename(){var nm=document.getElementById('sec-name'),inp=document.getElementById('sec-name-input');inp.value=nm.textContent;nm.style.visibility='hidden';inp.style.visibility='visible';inp.style.pointerEvents='auto';requestAnimationFrame(function(){inp.focus();inp.select();});}
function renameKey(e){if(e.key==='Enter'){e.preventDefault();document.getElementById('sec-name-input').blur();}if(e.key==='Escape'){cancelRename();}}
function cancelRename(){var nm=document.getElementById('sec-name'),inp=document.getElementById('sec-name-input');inp.style.visibility='hidden';inp.style.pointerEvents='none';nm.style.visibility='visible';}
async function finishRename(){var nm=document.getElementById('sec-name'),inp=document.getElementById('sec-name-input');inp.style.visibility='hidden';inp.style.pointerEvents='none';nm.style.visibility='visible';var nt=inp.value.trim();if(!nt||nt===nm.textContent)return;var r=await fetch('/api/admin/sections/'+SECTION_ID,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({titleZh:nt,titleEn:nt})});if(r.ok){nm.textContent=nt;var lbl=document.querySelector('.si.active .si-lbl');if(lbl)lbl.textContent=nt;await fetch('/api/admin/translations',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:PLUGIN_ID,key:'sec.'+SECTION_SLUG+'.title',locale:'zh',value:nt})});showToast('\\u2713 已重命名','ok');}else showToast('重命名失败','err');}

function openModal(id){document.getElementById(id).classList.add('open');var inp=document.querySelector('#'+id+' input:not([type=hidden])');if(inp)setTimeout(function(){inp.focus();},30);}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-ov').forEach(function(ov){ov.addEventListener('click',function(e){if(e.target===ov)ov.classList.remove('open');});});
document.addEventListener('keydown',function(e){if(e.key==='Escape')document.querySelectorAll('.modal-ov.open').forEach(function(m){m.classList.remove('open');});});

(function(){function w(a,b){document.getElementById(a).addEventListener('input',function(){var s=document.getElementById(b);if(!s.dataset.manual)s.value=this.value.toLowerCase().replace(/\\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'');});document.getElementById(b).addEventListener('input',function(){this.dataset.manual='1';});}w('as-title','as-slug');w('sub-title','sub-slug');})();

function openAddSub(pid,e){e.stopPropagation();document.getElementById('sub-parent-id').value=pid;document.getElementById('sub-title').value='';document.getElementById('sub-slug').value='';delete document.getElementById('sub-slug').dataset.manual;openModal('m-addsub');}

async function doCreateDoc(){var slug=document.getElementById('nd-slug').value.trim(),name=document.getElementById('nd-name').value.trim();if(!slug||!name){showToast('请填写标识和名称','err');return;}var r=await fetch('/api/admin/plugins',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:slug,name:name})});if(r.ok){var d=await r.json();closeModal('m-newdoc');location.href='/admin/plugins/'+d.id+'/editor';}else showToast('创建失败','err');}

async function doAddSection(pid){var isRoot=pid===null,prefix=isRoot?'as':'sub',title=document.getElementById(prefix+'-title').value.trim(),slug=document.getElementById(prefix+'-slug').value.trim();if(!title||!slug){showToast('请填写名称和 slug','err');return;}var body={pluginId:PLUGIN_ID,titleZh:title,titleEn:title,slug:slug,sortOrder:ALL_SECTIONS_COUNT};if(pid)body.parentId=pid;var r=await fetch('/api/admin/sections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok){showToast('创建失败','err');return;}var d=await r.json();await Promise.all([fetch('/api/admin/translations',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:PLUGIN_ID,key:'sec.'+slug+'.title',locale:'zh',value:title})}),fetch('/api/admin/translations',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:PLUGIN_ID,key:'sec.'+slug+'.title',locale:'en',value:''})})]);closeModal(isRoot?'m-addsec':'m-addsub');location.href=d.id?'?s='+d.id:location.href;}

async function doSaveSecSettings(){var title=document.getElementById('ss-title').value.trim(),slug=document.getElementById('ss-slug').value.trim();if(!title||!slug){showToast('请填写','err');return;}var r=await fetch('/api/admin/sections/${activeSection?.id||0}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({titleZh:title,titleEn:title,slug:slug})});if(r.ok){closeModal('m-secset');location.reload();}else showToast('保存失败','err');}
async function doDelSection(){if(!confirm('删除该章节及其所有内容？不可撤销。'))return;await fetch('/api/admin/sections/${activeSection?.id||0}',{method:'DELETE'});location.href='/admin/plugins/${plugin.id}/editor';}

function showToast(msg,type){var t=document.getElementById('toast');t.textContent=msg;t.className='toast toast-'+(type||'ok')+' show';clearTimeout(t._tmr);t._tmr=setTimeout(function(){t.className='toast';},2400);}
</script>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════════
// ADMIN PAGE TEMPLATES
// ══════════════════════════════════════════════════════════════════
export const adminPage = {

login: (error?: string) => `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>登录 - 管理后台</title>
<style>
:root{--bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#e6edf3;--muted:#8b949e;--accent:#58a6ff;--danger:#f85149;--radius:8px;--font:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif}
*{box-sizing:border-box}body{margin:0;font-family:var(--font);background:var(--bg);color:var(--text);display:flex;align-items:center;justify-content:center;min-height:100vh}
.box{width:360px;max-width:92vw;border:1px solid var(--border);border-radius:12px;background:var(--surface);padding:32px}
h1{text-align:center;font-size:20px;margin:0 0 24px;font-weight:700}h1 span{color:var(--accent)}
.fg{margin-bottom:14px}.fg label{display:block;margin-bottom:3px;color:var(--muted);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.fg input{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:14px}
.fg input:focus{outline:none;border-color:var(--accent)}
.btn{width:100%;padding:10px;border-radius:var(--radius);font:inherit;font-size:14px;font-weight:700;cursor:pointer;border:0;background:var(--accent);color:#fff;margin-top:4px}
.btn:hover{opacity:.85}.err{background:#2d1216;border:1px solid #5a1e27;color:var(--danger);padding:10px;border-radius:var(--radius);margin-bottom:14px;font-size:13px;text-align:center}
</style></head><body>
<div class="box"><h1>🔌 插件<span>文档</span>系统</h1>${error?`<div class="err">${esc(error)}</div>`:''}
<form method="post" action="/admin/login">
<div class="fg"><label>用户名</label><input type="text" name="username" required autocomplete="username"/></div>
<div class="fg"><label>密码</label><input type="password" name="password" required autocomplete="current-password"/></div>
<button type="submit" class="btn">登 录</button>
</form></div></body></html>`,

notFound: (msg: string) => adminLayout({title:'未找到',body:`<div class="alert alert-danger">${esc(msg)}</div><a href="/admin" class="btn btn-outline">返回首页</a>`}),

dashboard: ({ settings }: { settings: Record<string,string> }) => adminLayout({
  title:'控制台',active:'dashboard',
  body:`<h1 class="page-title">📊 控制台</h1>
<div class="stats-grid">
<div class="stat-card"><div class="stat-num" id="s-plugins">-</div><div class="stat-label">文档</div></div>
<div class="stat-card"><div class="stat-num" id="s-sections">-</div><div class="stat-label">章节</div></div>
<div class="stat-card"><div class="stat-num" id="s-media">-</div><div class="stat-label">媒体</div></div>
</div>
<div class="card"><h3>快速操作</h3><div class="btn-group"><a href="/admin/plugins" class="btn btn-primary">管理文档</a><a href="/admin/media" class="btn btn-outline">上传媒体</a><a href="/admin/settings" class="btn btn-outline">系统设置</a><a href="/" target="_blank" class="btn btn-outline">查看网站</a></div></div>
${settings.site_title?`<div class="card"><h3>当前站点</h3><p style="color:var(--muted);margin:0">${esc(settings.site_title)}</p></div>`:''}
<script>fetch('/api/admin/stats').then(r=>r.json()).then(d=>{document.getElementById('s-plugins').textContent=d.plugins;document.getElementById('s-sections').textContent=d.sections;document.getElementById('s-media').textContent=d.media;});</script>`,
}),

plugins: (all: any[]) => adminLayout({
  title:'文档管理',active:'plugins',
  body:`<h1 class="page-title">📁 文档管理</h1>
<div class="card">
  <h3>新建文档</h3>
  <form id="pf-add" style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">
    <div class="form-group" style="flex:1;min-width:140px;margin:0"><label>标识 (slug)</label><input id="add-slug" required placeholder="my-project"></div>
    <div class="form-group" style="flex:2;min-width:180px;margin:0"><label>名称</label><input id="add-name" required placeholder="My Project"></div>
    <button type="submit" class="btn btn-primary btn-sm" style="margin-bottom:1px">创建</button>
  </form>
</div>
<div id="plugin-list">
  ${all.length===0?'<div class="empty-state"><p>暂无文档</p></div>':''}
  ${all.map((p:any)=>`<div class="card doc-card">
    <div style="display:flex;align-items:center;gap:12px">
      <div style="flex:1;min-width:0"><strong>${esc(p.name)}</strong><code style="font-size:11px;margin-left:8px;color:var(--muted)">/${esc(p.slug)}</code><span style="color:var(--muted);font-size:12px;margin-left:8px">v${esc(p.version)}</span>${p.description?`<p style="margin:3px 0 0;color:var(--muted);font-size:12px">${esc(String(p.description).substring(0,80))}</p>`:''}</div>
      <div class="btn-group" style="flex-shrink:0">
        <a href="/admin/plugins/${p.id}/editor" class="btn btn-primary btn-sm">✏️ 编辑器</a>
        <a href="/admin/plugins/${p.id}/translations" class="btn btn-outline btn-sm">翻译</a>
        <a href="/admin/media?plugin=${esc(p.slug)}" class="btn btn-outline btn-sm">🖼 媒体</a>
        <a href="/${esc(p.slug)}" target="_blank" class="btn btn-outline btn-sm">预览</a>
        <button class="btn btn-outline btn-sm" onclick="toggleEditP(${p.id})">编辑</button>
        <button class="btn btn-danger btn-sm" onclick="delP(${p.id})">删除</button>
      </div>
    </div>
    <div class="doc-edit" id="edit-form-${p.id}" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
      <div class="form-row"><div class="form-group"><label>标识 (slug)</label><input id="eslug-${p.id}" value="${esc(p.slug)}"></div><div class="form-group"><label>名称</label><input id="ename-${p.id}" value="${esc(p.name)}"></div><div class="form-group"><label>版本</label><input id="ever-${p.id}" value="${esc(p.version)}" style="max-width:120px"></div></div>
      <div class="form-group"><label>描述</label><textarea id="edesc-${p.id}" rows="2" style="min-height:46px">${esc(p.description||'')}</textarea></div>
      <div class="form-row"><div class="form-group" style="flex:1"><label>图标</label><div style="display:flex;gap:6px;align-items:center">${p.iconUrl?`<img src="${esc(p.iconUrl)}" style="width:40px;height:40px;border-radius:4px;object-fit:cover;border:1px solid var(--border)" onerror="this.style.display='none'" id="icon-preview-${p.id}">`:''}<input id="eicon-${p.id}" value="${esc(p.iconUrl||'')}" type="hidden"><button type="button" class="btn btn-outline btn-sm" onclick="openMediaPicker('${esc(p.slug)}','eicon-${p.id}','icon-preview-${p.id}')" style="flex-shrink:0">${p.iconUrl?'更换图标':'选择图标'}</button></div></div><div class="form-group" style="flex:1"><label>排序</label><input id="esort-${p.id}" type="number" value="${p.sortOrder||0}" style="max-width:100px"></div></div>
      <div class="form-group"><label>标签</label><div class="tag-input-wrap" id="tag-wrap-${p.id}" onclick="this.querySelector('input').focus()"></div></div>
      <div class="btn-group" style="margin-top:8px;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="saveEditP(${p.id})">保存</button><button class="btn btn-outline btn-sm" onclick="toggleEditP(${p.id})">取消</button></div>
    </div>
  </div>`).join('')}
</div>

<!-- Media picker modal -->
<div class="modal-ov" id="m-pickmedia" style="z-index:3000"><div class="modal" onclick="event.stopPropagation()" style="width:680px;max-width:calc(100vw - 32px)"><h3>选择图标</h3>
<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center"><span style="font-size:12px;color:var(--muted)">文档:</span><input id="mp-slug" readonly style="flex:1;padding:5px 8px;border:1px solid var(--border);border-radius:5px;background:var(--bg);color:var(--text);font-size:12px"><input id="mp-search" placeholder="搜索文件名..." style="flex:1;padding:5px 8px;border:1px solid var(--border);border-radius:5px;background:var(--bg);color:var(--text);font-size:12px" oninput="loadMediaPicker()"></div>
<div class="form-group" style="margin-bottom:10px"><label>或直接输入 URL</label><input id="mp-url" placeholder="https://... 或 /media/..." style="padding:6px 8px;font-size:12px" oninput="mpUrlChanged()"></div>
<img id="mp-preview" class="media-picker-preview" style="display:none" alt="">
<div id="mp-grid" class="media-picker-grid"><div style="text-align:center;color:var(--muted);padding:20px;grid-column:1/-1">加载中…</div></div>
<div class="pager" id="mp-pager"></div>
<div id="mp-selected" style="margin-top:8px;font-size:12px;color:var(--ok);display:none"></div>
<div class="modal-footer"><button class="btn" onclick="closeModal('m-pickmedia')">取消</button><button class="btn btn-primary" id="mp-confirm" onclick="confirmMediaPick()">确认</button></div>
</div></div>

<script>
var editingId=null;
function toggleEditP(id){var n=document.getElementById('edit-form-'+id);var o=n.style.display!=='none';if(editingId&&editingId!==id)document.getElementById('edit-form-'+editingId).style.display='none';if(o){n.style.display='none';editingId=null;}else{n.style.display='';editingId=id;loadTagsFor(id);}}

  var tagData={};${all.map((p:any)=>`tagData[${p.id}]=${p.badgeTags||'[]'};`).join('')}
function renderTags(id){var w=document.getElementById('tag-wrap-'+id);var t=tagData[id]||[];w.innerHTML=t.map(function(t,i){return'<span class="tag-chip">'+t+'<span class="tag-rm" onclick="event.stopPropagation();removeTag('+id+','+i+')">×</span></span>';}).join('')+'<input placeholder="输入标签后回车" onkeydown="addTag(event,'+id+')">';}
function loadTagsFor(id){renderTags(id);}
function addTag(e,id){if(e.key==='Enter'){e.preventDefault();var v=e.target.value.trim();if(v){tagData[id].push(v);renderTags(id);}}}
function removeTag(id,i){tagData[id].splice(i,1);renderTags(id);}

var mpTargetId=null,mpPreviewId=null,mpSelected=null,mpPage=1,mpSlug='';
function openMediaPicker(slug,targetId,previewId){mpTargetId=targetId;mpPreviewId=previewId;mpSlug=slug;mpSelected=null;mpPage=1;document.getElementById('mp-slug').value=slug;document.getElementById('mp-search').value='';document.getElementById('mp-url').value=document.getElementById(targetId).value||'';document.getElementById('mp-preview').style.display='none';document.getElementById('mp-selected').style.display='none';openModal('m-pickmedia');loadMediaPicker();}
function mpUrlChanged(){var u=document.getElementById('mp-url').value.trim();var p=document.getElementById('mp-preview');if(u&&/\.(png|jpg|jpeg|gif|svg|webp|ico)(\\?.*)?$/i.test(u)){p.src=u;p.style.display='';}else{p.style.display='none';}}
async function loadMediaPicker(){var s=document.getElementById('mp-search').value.trim().toLowerCase();var r=await fetch('/api/admin/media?pluginSlug='+mpSlug+'&page='+mpPage+'&limit=24');var d=await r.json();var g=document.getElementById('mp-grid');var items=d.items||[];if(s)items=items.filter(function(m){return m.filename.toLowerCase().indexOf(s)!==-1;});if(!items.length){g.innerHTML='<div style="text-align:center;color:var(--muted);padding:20px;grid-column:1/-1">无媒体文件</div>';}else{g.innerHTML=items.map(function(m){var i=/^image\\//.test(m.mimeType);return'<div class="media-picker-item'+(mpSelected&&mpSelected.id===m.id?' selected':'')+'" onclick="selectMediaItem('+m.id+',\\''+m.d2Key+'\\',\\''+(m.mimeType||'')+'\\')">'+(i?'<img src="/media/'+m.d2Key+'" loading="lazy" onerror="this.src=\\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><text y=%2225%22 font-size=%2220%22>🖼</text></svg>\\'">':'<div style="height:80px;display:flex;align-items:center;justify-content:center;font-size:28px">'+(/^video\\//.test(m.mimeType)?'🎬':'📄')+'</div>')+'<div class="pi-name">'+m.filename+'</div></div>';}).join('');}var t=d.total||0,tp=Math.ceil(t/24);var pg=document.getElementById('mp-pager');pg.innerHTML=tp>1?'<button '+(mpPage<=1?'disabled':'')+' onclick="mpPage--;loadMediaPicker()">‹</button><span>'+mpPage+' / '+tp+'</span><button '+(mpPage>=tp?'disabled':'')+' onclick="mpPage++;loadMediaPicker()">›</button>':'';}
function selectMediaItem(id,d2k,mt){mpSelected={id:id,d2key:d2k,mimeType:mt};document.getElementById('mp-url').value='/media/'+d2k;document.getElementById('mp-selected').style.display='';document.getElementById('mp-selected').textContent='已选: /media/'+d2k;var p=document.getElementById('mp-preview');if(/^image\\//.test(mt)){p.src='/media/'+d2k;p.style.display='';}else{p.style.display='none';}loadMediaPicker();}
function confirmMediaPick(){var url=document.getElementById('mp-url').value.trim();if(!url)return;if(!mpTargetId)return;document.getElementById(mpTargetId).value=url;if(mpPreviewId){var p=document.getElementById(mpPreviewId);if(!p){p=document.createElement('img');p.id=mpPreviewId;p.style.cssText='width:40px;height:40px;border-radius:4px;object-fit:cover;border:1px solid var(--border)';p.onerror=function(){this.style.display='none';};document.getElementById(mpTargetId).parentElement.insertBefore(p,document.getElementById(mpTargetId).nextSibling);}p.src=url;p.style.display='';}closeModal('m-pickmedia');}

async function saveEditP(id){var d={slug:document.getElementById('eslug-'+id).value,name:document.getElementById('ename-'+id).value,version:document.getElementById('ever-'+id).value,description:document.getElementById('edesc-'+id).value,iconUrl:document.getElementById('eicon-'+id).value,sortOrder:Number(document.getElementById('esort-'+id).value),badgeTags:JSON.stringify(tagData[id]||[])};await fetch('/api/admin/plugins/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});location.reload();}
async function delP(id){if(!confirm('删除该文档及所有内容？'))return;await fetch('/api/admin/plugins/'+id,{method:'DELETE'});location.reload();}
document.getElementById('pf-add').addEventListener('submit',async e=>{e.preventDefault();var s=document.getElementById('add-slug').value.trim(),n=document.getElementById('add-name').value.trim();if(!s||!n)return;await fetch('/api/admin/plugins',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:s,name:n})});location.reload();});
</script>`,
}),

sections: (plugin: any, secList: any[]) => adminLayout({
  title:`${plugin.name} - 章节`,active:'plugins',
  body:`<h1 class="page-title">${esc(plugin.name)} — 章节管理</h1>
<a href="/admin/plugins/${plugin.id}/editor" class="btn btn-outline">← 返回编辑器</a>
<div class="card" style="margin-top:12px"><h3 id="sf-title">新建章节</h3>
<form id="sf"><input type="hidden" id="sf-id"/><div class="form-row"><div class="form-group"><label>名称（中文）</label><input id="sf-title-val" required/></div><div class="form-group"><label>Slug</label><input id="sf-slug" required/></div><div class="form-group"><label>排序</label><input id="sf-sort" type="number" value="0"/></div></div>
<div class="btn-group"><button type="submit" class="btn btn-primary" id="sf-btn">创建章节</button><button type="button" class="btn btn-outline" id="sf-cancel" style="display:none" onclick="resetSF()">取消</button></div></form></div>
<div id="section-list">${secList.length===0?'<div class="empty-state"><p>暂无章节</p></div>':''}${secList.map((s:any)=>`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><strong>${esc(s.titleZh||s.slug)}</strong><code style="font-size:11px;margin-left:8px;color:var(--muted)">#${esc(s.slug)}</code></div><div class="btn-group"><button class="btn btn-outline btn-sm" onclick='editS(${JSON.stringify(s)})'>编辑</button><button class="btn btn-danger btn-sm" onclick="delS(${s.id})">删除</button></div></div></div>`).join('')}</div>
<script>function resetSF(){document.getElementById('sf-id').value='';document.getElementById('sf-btn').textContent='创建章节';document.getElementById('sf-cancel').style.display='none';document.getElementById('sf-title').textContent='新建章节';document.getElementById('sf').reset();}
function editS(s){document.getElementById('sf-id').value=s.id;document.getElementById('sf-title-val').value=s.titleZh||s.slug;document.getElementById('sf-slug').value=s.slug;document.getElementById('sf-sort').value=s.sortOrder;document.getElementById('sf-btn').textContent='保存修改';document.getElementById('sf-cancel').style.display='';document.getElementById('sf-title').textContent='编辑章节';window.scrollTo(0,0);}
async function delS(id){if(!confirm('删除该章节？'))return;await fetch('/api/admin/sections/'+id,{method:'DELETE'});location.reload();}
document.getElementById('sf').addEventListener('submit',async e=>{e.preventDefault();const id=document.getElementById('sf-id').value;const d={pluginId:${plugin.id},titleZh:document.getElementById('sf-title-val').value,titleEn:document.getElementById('sf-title-val').value,slug:document.getElementById('sf-slug').value,sortOrder:Number(document.getElementById('sf-sort').value)};await fetch(id?'/api/admin/sections/'+id:'/api/admin/sections',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});location.reload();});
</script>`,
}),

editSection: (section: any, blocks: any[]) => adminLayout({
  title:section.titleZh||section.slug,active:'plugins',
  head:`<link rel="preconnect" href="https://cdn.bootcdn.net"><script src="${MONACO_BASE}loader.js"></script>`,
  body:`<h1 class="page-title">${esc(section.titleZh||section.slug)} <code style="font-size:14px;font-weight:400;color:var(--muted)">#${esc(section.slug)}</code></h1>
<div class="btn-group" style="margin-bottom:14px"><a href="/admin/plugins/${section.pluginId}/editor" class="btn btn-outline btn-sm">← 返回编辑器</a></div>
<div id="block-list">${blocks.length===0?'<div class="empty-state"><p>暂无内容块</p></div>':blocks.map((b:any)=>`<div class="block-item"><div class="block-header"><span class="block-type-badge">${b.type}</span><span class="block-preview">${esc(blockPreview(b.type,b.contentJson))}</span><div class="btn-group"><button class="btn btn-outline btn-sm" onclick="editBlock(${b.id})">编辑</button><button class="btn btn-danger btn-sm" onclick="delB(${b.id})">删除</button></div></div></div>`).join('')}</div>
<div class="card"><h3 id="eb-title">添加内容块</h3><form id="eb-form"><input type="hidden" id="eb-id"/><div class="form-group"><label>类型</label><select id="eb-type" onchange="switchType(this.value)"><option value="html">HTML</option><option value="code">Code</option><option value="text">Text (i18n)</option><option value="callout">Callout (i18n)</option></select></div>
<div id="eb-html"><div class="form-group"><label>内容</label>${monacoEditorHTML('eb-editor',false,'','html')}</div></div>
<div id="eb-code" style="display:none"><div class="form-row"><div class="form-group"><label>语言</label><input id="eb-lang" value="cpp"/></div></div><div class="form-group"><label>代码</label>${monacoEditorHTML('eb-code-editor',false,'','cpp')}</div></div>
<div id="eb-text" style="display:none"><div class="form-row"><div class="form-group"><label>中文</label><textarea id="eb-text-zh" rows="3"></textarea></div><div class="form-group"><label>English</label><textarea id="eb-text-en" rows="3"></textarea></div></div></div>
<div class="btn-group" style="margin-top:8px"><button type="submit" class="btn btn-primary" id="eb-btn">创建</button><button type="button" class="btn btn-outline" id="eb-cancel" style="display:none" onclick="cancelEdit()">取消</button></div></form></div>
<script>require.config({paths:{vs:'${MONACO}'}});require(['vs/editor/editor.main'],function(){var he,ce;function _moveEditor(t){var s=t==='edit'?document.getElementById('eb-editor'):document.getElementById('eb-code-editor');if(s&&window['_m_'+s.id]){window['_m_'+s.id].layout();}}function editBlock(id){var b=${JSON.stringify(blocks)}.find(function(x){return x.id===id;});if(!b)return;document.getElementById('eb-id').value=b.id;document.getElementById('eb-type').value=b.type;document.getElementById('eb-btn').textContent='保存修改';document.getElementById('eb-cancel').style.display='';document.getElementById('eb-title').textContent='编辑内容块';switchType(b.type);_populate(b);}
function startAdd(){cancelEdit();document.getElementById('eb-title').textContent='添加内容块';}
function cancelEdit(){document.getElementById('eb-id').value='';document.getElementById('eb-form').reset();document.getElementById('eb-btn').textContent='创建';document.getElementById('eb-cancel').style.display='none';document.getElementById('eb-title').textContent='添加内容块';switchType('html');}
function _populate(b){var c={};try{c=JSON.parse(b.contentJson||'{}');}catch(e){}switch(b.type){case'html':if(window['_m_eb-editor'])window['_m_eb-editor'].setValue(c.html||'');break;case'code':document.getElementById('eb-lang').value=c.language||'cpp';if(window['_m_eb-code-editor'])window['_m_eb-code-editor'].setValue(c.code||'');break;case'text':case'callout':document.getElementById('eb-text-zh').value=c.textZh||'';document.getElementById('eb-text-en').value=c.textEn||'';break;}}
function switchType(t){['eb-html','eb-code','eb-text'].forEach(function(id){document.getElementById(id).style.display='none';});if(t==='html')document.getElementById('eb-html').style.display='';if(t==='code')document.getElementById('eb-code').style.display='';if(t==='text'||t==='callout')document.getElementById('eb-text').style.display='';setTimeout(function(){_moveEditor('edit');},100);}
async function delB(id){if(!confirm('删除该内容块？'))return;await fetch('/api/admin/blocks/'+id,{method:'DELETE'});location.reload();}
function getContent(){var t=document.getElementById('eb-type').value;if(t==='html'&&window['_m_eb-editor'])return window['_m_eb-editor'].getValue();if(t==='code'&&window['_m_eb-code-editor'])return window['_m_eb-code-editor'].getValue();return'';}
document.getElementById('eb-form').addEventListener('submit',async function(e){e.preventDefault();var id=document.getElementById('eb-id').value;var t=document.getElementById('eb-type').value;var data={sectionId:${section.id},type:t,sortOrder:${blocks.length}};if(t==='html')data.contentJson=JSON.stringify({html:getContent()});else if(t==='code')data.contentJson=JSON.stringify({language:document.getElementById('eb-lang').value,code:getContent()});else if(t==='text'||t==='callout')data.contentJson=JSON.stringify({textZh:document.getElementById('eb-text-zh').value,textEn:document.getElementById('eb-text-en').value});await fetch(id?'/api/admin/blocks/'+id:'/api/admin/blocks',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});location.reload();});
});</script>`,
}),

  pluginTranslations: (plugin: any, rawRows: any[]) => adminLayout({
  title:`${plugin.name} - 翻译`,active:'plugins',
  head:`<style>
.t-bar-input{padding:5px 8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px}
.t-bar-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px rgba(88,166,255,.12)}
.t-bar-sel{padding:5px 28px 5px 8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:12px;-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%238b949e'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center}
.t-bar-sel:focus{outline:none;border-color:var(--accent)}
</style>`,
  body:`<h1 class="page-title">${esc(plugin.name)} — 🌐 翻译管理</h1>
<div class="btn-group" style="margin-bottom:14px">
  <a href="/admin/plugins" class="btn btn-outline btn-sm">← 返回文档列表</a>
  <a href="/admin/plugins/${plugin.id}/editor" class="btn btn-outline btn-sm">✏️ 编辑器</a>
</div>
<div class="card">
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
    <input id="t-filter" placeholder="搜索 key…" class="t-bar-input" style="flex:1;min-width:140px;max-width:280px" onkeyup="renderTable()">
    <select id="t-src" onchange="renderTable()" class="t-bar-sel">
      <option value="zh">原文: 中文 (zh)</option>
      <option value="en">原文: English (en)</option>
    </select>
    <span style="color:var(--muted)">→</span>
    <select id="t-dst" onchange="renderTable()" class="t-bar-sel">
      <option value="zh">翻译: 中文 (zh)</option>
      <option value="en" selected>翻译: English (en)</option>
    </select>
    <div style="flex:1"></div>
    <button class="btn btn-primary btn-sm" onclick="addRow()">添加</button>
    <button class="btn btn-ok btn-sm" id="t-save-all">批量保存</button>
  </div>
  <div style="max-height:calc(100vh - 260px);overflow-y:auto">
    <table id="t-table"><thead><tr><th style="width:35%">Key</th><th style="width:30%">原文</th><th style="width:30%">翻译</th><th style="width:5%"></th></tr></thead><tbody></tbody></table>
  </div>
</div>
<script>
var ALL_ROWS = ${JSON.stringify(rawRows)};
var allKeys = [...new Set(ALL_ROWS.map(function(r){return r.key;}))];
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
      '<td><button class="btn btn-danger btn-sm" onclick="delRow(\\''+k+'\\')">删除</button></td></tr>';
  }).join('');
}
function addRow(){var k=prompt('输入翻译 key:');if(!k)return;if(allKeys.indexOf(k)===-1)allKeys.push(k);renderTable();}
async function delRow(key){if(!confirm('删除 key: '+key+' ?'))return;
  await fetch('/api/admin/translations',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:${plugin.id},key:key})});
  ALL_ROWS=ALL_ROWS.filter(function(r){return r.key!==key;});
  allKeys=allKeys.filter(function(k){return k!==key;});
  renderTable();
}
document.getElementById('t-save-all').addEventListener('click',async function(){
  var rows=document.querySelectorAll('#t-table tbody tr');
  var data=[];
  rows.forEach(function(r){var key=r.dataset.key;r.querySelectorAll('input').forEach(function(inp){data.push({key:key,locale:inp.dataset.locale,value:inp.value});});});
  await fetch('/api/admin/translations',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pluginId:${plugin.id},entries:data})});
  alert('已保存');location.reload();
});
renderTable();
</script>`,
}),

settings: (settings: Record<string,string>) => adminLayout({
  title:'系统设置',active:'settings',
  body:`<h1 class="page-title">⚙️ 系统设置</h1>
<div class="card"><h3>管理员账户</h3><p style="color:var(--muted);font-size:13px">当前用户: <strong id="curr-user">-</strong></p>
<form id="cf2" style="margin-top:10px"><input type="hidden" id="cu"/><div class="form-row"><div class="form-group"><label>新密码</label><input id="cp" type="password" minlength="6"/></div><div class="form-group"><label>确认密码</label><input id="cc" type="password" minlength="6"/></div></div><button type="submit" class="btn btn-primary">更新</button></form></div>
<div class="card"><h3>站点设置</h3><form id="sf2"><div class="form-row"><div class="form-group"><label>站点标题</label><input name="site_title" value="${esc(settings.site_title||'')}"/></div><div class="form-group"><label>副标题</label><input name="site_subtitle" value="${esc(settings.site_subtitle||'')}"/></div></div><div class="form-row"><div class="form-group"><label>顶部 Logo 文字</label><input name="header_logo_text" value="${esc(settings.header_logo_text||'')}"/></div><div class="form-group"><label>主题色</label><input name="header_accent_color" type="color" value="${esc(settings.header_accent_color||'#58a6ff')}" style="height:36px;width:80px"/></div></div><div class="form-group"><label>页脚文字</label><input name="footer_text" value="${esc(settings.footer_text||'')}"/></div><div class="form-group"><label>Google Analytics ID</label><input name="ga_tracking_id" value="${esc(settings.ga_tracking_id||'')}" placeholder="G-XXXXXXXXXX"/></div><div class="form-group"><label>自定义 CSS</label><textarea name="custom_css" rows="5">${esc(settings.custom_css||'')}</textarea></div><button type="submit" class="btn btn-primary">保存</button></form></div>
<script>fetch('/api/admin/credentials').then(r=>r.json()).then(d=>{document.getElementById('curr-user').textContent=d.username||'(env)';if(d.username)document.getElementById('cu').value=d.username;});
document.getElementById('cf2').addEventListener('submit',async e=>{e.preventDefault();const u=document.getElementById('cu').value.trim(),p=document.getElementById('cp').value,c=document.getElementById('cc').value;if(p!==c){alert('密码不一致');return;}if(p.length<6){alert('密码≥6位');return;}const res=await fetch('/api/admin/credentials',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});const d=await res.json();if(d.ok){alert('已更新，请重新登录');location.href='/admin/logout';}else alert('错误:'+d.error);});
document.getElementById('sf2').addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));await fetch('/api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});alert('已保存');});
</script>`,
}),

media: (initPlugin = '', allPlugins: any[] = []) => adminLayout({
  title:'媒体',active:'media',
  head:`<style>
.media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:14px}
.media-card{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);overflow:hidden;transition:.15s}
.media-card:hover{border-color:var(--accent)}
.media-card.is-stub{border-style:dashed;border-color:var(--warn);opacity:.85}
.media-thumb{width:100%;height:130px;background:var(--bg);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.media-thumb img{width:100%;height:100%;object-fit:cover}
.thumb-icon{font-size:36px;opacity:.35}
.thumb-type{position:absolute;top:6px;right:6px;font-size:10px;font-weight:700;background:rgba(0,0,0,.7);color:var(--muted);padding:2px 6px;border-radius:3px;text-transform:uppercase}
.stub-zone{width:100%;height:130px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;color:var(--warn);font-size:12px;transition:.15s;background:rgba(210,153,29,.05)}
.stub-zone:hover{background:rgba(210,153,29,.12);color:var(--ok)}
.media-info{padding:9px 12px}
.media-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-meta{font-size:11px;color:var(--muted);margin-top:3px}
.media-key{font-size:11px;color:var(--ok);margin-top:2px;font-family:var(--mono)}
.media-actions{display:flex;gap:4px;padding:0 10px 10px;flex-wrap:wrap}
</style>`,
  body:`<h1 class="page-title">🖼 媒体文件</h1>

<div class="card" style="margin-bottom:14px">
  <h3>上传文件</h3>
  <div class="form-row" style="flex-wrap:wrap;gap:8px;align-items:flex-end">
    <div class="form-group" style="min-width:160px;margin:0"><label>文档</label><select id="up-plugin" style="width:100%">${allPlugins.map((p:any)=>`<option value="${esc(p.slug)}"${p.slug===initPlugin?' selected':''}>${esc(p.name)}</option>`).join('')}</select></div>
    <div class="form-group" style="flex:1;min-width:140px;margin:0"><label>占位符 Key <span style="font-weight:400;color:var(--muted)">(可选)</span></label><input id="up-pk" placeholder="如 hero-screenshot"></div>
    <div class="form-group" style="flex:1;min-width:180px;margin:0"><label>文件 <span style="font-size:10px;color:var(--ok)">选中即自动上传</span></label><input type="file" id="up-file" style="padding:5px"></div>
  </div>
  <div id="upload-status" style="margin-top:8px"></div>
</div>

<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
  <select id="filter-plugin" style="min-width:160px;padding:6px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px"><option value="">全部文档</option>${allPlugins.map((p:any)=>`<option value="${esc(p.slug)}"${p.slug===initPlugin?' selected':''}>${esc(p.name)}</option>`).join('')}</select>
  <input id="filter-search" placeholder="搜索文件名或 Key…" style="flex:1;min-width:140px;padding:6px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px" oninput="loadMedia(1)">
  <button class="btn btn-outline btn-sm" onclick="loadMedia(1)">🔄 刷新</button>
  <span id="media-count" style="font-size:12px;color:var(--muted)"></span>
</div>

<div id="media-list"><div class="empty-state"><p>加载中…</p></div></div>
<div class="pager" id="media-pager" style="margin-top:14px"></div>
<input type="file" id="stub-file-input" style="display:none">

<script>
var currentPage=1,PAGE_SIZE=20,currentSlug=${JSON.stringify(initPlugin)},stubKey='',stubPlugin='';
var allPlugins=${JSON.stringify(allPlugins.map((p:any)=>({slug:p.slug,name:p.name})))};

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

document.getElementById('up-file').addEventListener('change',async function(){
  if(!this.files||!this.files.length)return;
  var slug=document.getElementById('up-plugin').value;
  if(!slug){showUpSt('请先选择文档','err');this.value='';return;}
  var pk=document.getElementById('up-pk').value.trim();
  await doUpload(this.files[0],slug,pk);
  this.value='';document.getElementById('up-pk').value='';
});

document.getElementById('stub-file-input').addEventListener('change',async function(){
  if(!this.files||!this.files.length)return;
  var slug=stubPlugin||document.getElementById('up-plugin').value||(allPlugins[0]&&allPlugins[0].slug)||'';
  if(!slug){this.value='';return;}
  await doUpload(this.files[0],slug,stubKey);
  this.value='';stubKey='';stubPlugin='';
});

async function doUpload(file,slug,pk){
  showUpSt('上传中… '+file.name,'warn');
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
      showUpSt('✓ 已上传: '+d.url+(pk?' · key: '+pk:''),'ok');
      loadMedia(currentPage);
    }else showUpSt('上传失败: '+(d.error||'未知'),'err');
  }catch(e){showUpSt('网络错误: '+e.message,'err');}
}

function showUpSt(msg,type){
  var el=document.getElementById('upload-status');
  var cls=type==='ok'?'alert-ok':type==='err'?'alert-danger':'';
  el.innerHTML='<div class="alert '+cls+'" style="margin:0;padding:8px 12px">'+msg+'</div>';
  if(type==='ok')setTimeout(function(){el.innerHTML='';},3000);
}

function isStub(m){return m.d2Key&&m.d2Key.startsWith('__ref__');}
function isImg(m){return /^image\\//.test(m.mimeType)&&!isStub(m);}
function isVid(m){return /^video\\//.test(m.mimeType)&&!isStub(m);}

async function loadMedia(page){
  if(page)currentPage=page;
  var search=document.getElementById('filter-search').value.trim().toLowerCase();
  var url='/api/admin/media?page='+currentPage+'&limit='+PAGE_SIZE+(currentSlug?'&pluginSlug='+encodeURIComponent(currentSlug):'');
  document.getElementById('media-list').innerHTML='<div class="empty-state"><p>加载中…</p></div>';
  try{
    var res=await fetch(url);var d=await res.json();
    var items=d.items||[];
    if(search)items=items.filter(function(m){return m.filename.toLowerCase().indexOf(search)!==-1||(m.placeholderKey||'').toLowerCase().indexOf(search)!==-1;});
    document.getElementById('media-count').textContent='共 '+(d.total||0)+' 个';
    renderGrid(items);renderPager(d.total||0);
  }catch(e){document.getElementById('media-list').innerHTML='<div class="alert alert-danger">加载失败</div>';}
}

function e2(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

function renderGrid(items){
  var list=document.getElementById('media-list');
  if(!items.length){list.innerHTML='<div class="empty-state"><p>暂无媒体文件</p></div>';return;}
  var html='<div class="media-grid">';
  items.forEach(function(m){
    var stub=isStub(m),img=isImg(m),vid=isVid(m);
    html+='<div class="media-card'+(stub?' is-stub':'')+'">';
    if(stub){
      html+='<div class="stub-zone" onclick="openStubUpload(\''+e2(m.placeholderKey||'')+'\')">📤<span>待上传</span><span style="font-size:10px">点击上传文件</span></div>';
    }else if(img){
      html+='<div class="media-thumb"><img src="/media/'+e2(m.d2Key)+'" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'\'"><span class="thumb-icon" style="display:none">🖼</span><span class="thumb-type">image</span></div>';
    }else if(vid){
      html+='<div class="media-thumb"><span class="thumb-icon">🎬</span><span class="thumb-type">video</span></div>';
    }else{
      html+='<div class="media-thumb"><span class="thumb-icon">📄</span><span class="thumb-type">'+(m.mimeType.split('/')[0]||'')+'</span></div>';
    }
    html+='<div class="media-info"><div class="media-name" title="'+e2(m.filename)+'">'+e2(m.filename)+'</div>';
    if(!stub)html+='<div class="media-meta">'+((m.sizeBytes||0)/1024).toFixed(1)+'KB · '+e2(m.mimeType)+'</div>';
    if(m.placeholderKey)html+='<div class="media-key">📎 '+e2(m.placeholderKey)+'</div>';
    html+='</div><div class="media-actions">';
    if(stub){
      html+='<button class="btn btn-primary btn-sm" onclick="openStubUpload(\''+e2(m.placeholderKey||'')+'\')">📤 上传</button>';
      html+='<button class="btn btn-outline btn-sm" onclick="cpStr(\'{{img:'+e2(m.placeholderKey||'')+'}}\',this)">📋 Key</button>';
    }else{
      html+='<button class="btn btn-outline btn-sm" onclick="setKey('+m.id+',\''+e2(m.placeholderKey||'')+'\')">🔑 Key</button>';
      html+='<button class="btn btn-outline btn-sm" onclick="cpStr(\'/media/'+e2(m.d2Key)+'\',this)">🔗 URL</button>';
      if(m.placeholderKey)html+='<button class="btn btn-outline btn-sm" onclick="cpStr(\'{{img:'+e2(m.placeholderKey)+'}}\',this)">📋</button>';
      html+='<button class="btn btn-outline btn-sm" onclick="window.open(\'/media/'+e2(m.d2Key)+'\',\'_blank\')">👁</button>';
    }
    html+='<button class="btn btn-danger btn-sm" onclick="delMedia('+m.id+')">删</button>';
    html+='</div></div>';
  });
  list.innerHTML=html+'</div>';
}

function renderPager(total){
  var tp=Math.ceil(total/PAGE_SIZE)||1,pg=document.getElementById('media-pager');
  if(tp<=1){pg.innerHTML='';return;}
  pg.innerHTML='<button '+(currentPage<=1?'disabled':'')+' onclick="loadMedia('+(currentPage-1)+')">‹</button>'
    +'<span>第 '+currentPage+' / '+tp+' 页</span>'
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
  var k=prompt('设置占位符 Key（留空清除）:',current);
  if(k===null)return;
  await fetch('/api/admin/media/'+id+'/placeholder-key',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeholderKey:k.trim()||null})});
  loadMedia(currentPage);
}

function delMedia(id){
  if(!confirm('删除该文件？'))return;
  fetch('/api/admin/media/'+id,{method:'DELETE'}).then(function(){loadMedia(currentPage);});
}

loadMedia(1);
</script>`,
}),

  pluginEditor,
};
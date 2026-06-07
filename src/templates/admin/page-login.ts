import { ADMIN_I18N } from '../../services/i18n';
import { adminLayout, esc } from './layout';

export const login = (error?: string) => `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title data-i18n="login.title">登录 - 管理后台</title>
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
<div class="box"><h1 data-i18n-html="login.heading">🔌 插件<span>文档</span>系统</h1>${error?`<div class="err" data-i18n="login.error">${esc(error)}</div>`:''}
<form method="post" action="/admin/login">
<div class="fg"><label data-i18n="login.username">用户名</label><input type="text" name="username" required autocomplete="username"/></div>
<div class="fg"><label data-i18n="login.password">密码</label><input type="password" name="password" required autocomplete="current-password"/></div>
<button type="submit" class="btn" data-i18n="login.submit">登 录</button>
</form></div>
<script>
(function(){
var i18n=${JSON.stringify(ADMIN_I18N)};
var cookieLang=(document.cookie.match(/(?:^|;\\s*)lang=([^;]+)/)||[])[1];
var lang=cookieLang||(String(navigator.language||navigator.userLanguage||'').toLowerCase().indexOf('zh')===0?'zh':'en');
if(!cookieLang)fetch('/api/set-lang?lang='+lang).catch(function(){});
function t(k){var e=i18n[k];return e?(e[lang]||e.zh||e.en||k):k;}
document.querySelectorAll('[data-i18n]').forEach(function(el){el.textContent=t(el.dataset.i18n);});
document.querySelectorAll('[data-i18n-html]').forEach(function(el){el.innerHTML=t(el.dataset.i18nHtml);});
document.title=t('login.title');
})();
</script></body></html>`;

export const notFound = (msg: string) => adminLayout({title:'未找到',body:`<div class="alert alert-danger">${esc(msg)}</div><a href="/admin" class="btn btn-outline">返回首页</a>`});

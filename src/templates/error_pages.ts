export function notFoundPage(slug: string): string {
  return baseLayout({
    title: 'Not Found',
    body: `<div style="text-align:center;padding:80px 24px">
      <h1 style="font-size:72px;color:#30363d;margin:0">404</h1>
      <p style="color:#8b949e;font-size:18px">Plugin "${slug}" not found</p>
      <a href="/" style="color:#58a6ff">Back to Home</a>
    </div>`,
  });
}

function baseLayout(opts: { title: string; body: string }): string {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.title}</title>
${docThemeCSS()}
</head><body>${opts.body}</body></html>`;
}

export function docThemeCSS(): string {
  return `<style>
:root{
  --c-bg:#0d1117;--c-surface:#161b22;--c-border:#30363d;
  --c-text:#e6edf3;--c-muted:#8b949e;--c-accent:#58a6ff;--c-accent2:#d2991d;
  --c-code-bg:#1c2128;--c-callout-bg:#121d2f;--c-callout-border:#1f3a5f;
  --radius:10px;
  --shadow-sm:0 1px 2px rgba(0,0,0,.3);
  --shadow:0 1px 3px rgba(0,0,0,.4),0 1px 2px rgba(0,0,0,.3);
  --font:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;
  --mono:"Cascadia Code","Consolas","SF Mono",monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:var(--font);font-size:15px;line-height:1.7;color:var(--c-text);background:var(--c-bg)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:var(--c-bg)}
::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:#484f58}
select,select option{background:var(--c-surface);color:var(--c-text)}
a{color:var(--c-accent);text-decoration:none}a:hover{text-decoration:underline}
code{font-family:var(--mono);font-size:.9em;padding:.15em .4em;border-radius:5px;background:var(--c-code-bg);color:#c9d1d9;word-break:break-word}
pre{margin:0 0 14px;border-radius:var(--radius);border:1px solid var(--c-border);background:var(--c-surface);overflow-x:auto;box-shadow:var(--shadow-sm)}
pre code{padding:16px 20px;display:block;background:0 0;font-size:13px;line-height:1.65;white-space:pre-wrap}
h1,h2,h3,h4{margin:0;font-weight:700;letter-spacing:-.01em}
h1{font-size:clamp(30px,3.5vw,42px);line-height:1.15}
h2{font-size:22px;margin-bottom:10px}
h3{font-size:17px;margin-bottom:6px}
p{margin:0 0 12px;color:var(--c-muted)}p:last-child{margin-bottom:0}
ul,ol{margin:0 0 12px;padding-left:20px;color:var(--c-muted)}li+li{margin-top:4px}strong{color:var(--c-text)}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:14px}
th,td{text-align:left;padding:8px 12px;border:1px solid var(--c-border)}
th{background:var(--c-code-bg);color:var(--c-text);font-weight:700}td{color:var(--c-muted)}
hr{border:0;border-top:1px solid var(--c-border);margin:24px 0}

/* ── Topbar ── */
.topbar{position:sticky;top:0;z-index:100;background:rgba(13,17,23,.92);backdrop-filter:blur(14px);border-bottom:1px solid var(--c-border);padding:0}
.topbar-inner{max-width:1480px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;height:56px}
.topbar-title{font-weight:800;font-size:17px;color:var(--c-text)}
.topbar-title span{color:var(--c-accent)}
.topbar-actions{display:flex;gap:6px;align-items:center}
.lang-sel{padding:5px 28px 5px 10px;border:1px solid var(--c-border);border-radius:6px;background:var(--c-surface);color:var(--c-text);font:inherit;font-size:12px;cursor:pointer;min-width:90px;-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%238b949e'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;transition:.15s}
.lang-sel:focus{outline:none;border-color:var(--c-accent)}
.lang-sel:hover{border-color:var(--c-accent);color:var(--c-accent)}
.lang-sel option{background:var(--c-surface);color:var(--c-text)}

/* ── Hero ── */
.hero{text-align:center;padding:48px 24px 32px}
.hero h1{margin-bottom:8px}
.hero .subtitle{color:var(--c-muted);font-size:17px;max-width:640px;margin:0 auto 18px}
.badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:20px}
.badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:600;background:#1a2b4c;color:#a5c8ff;border:1px solid #1f3a5f}
.badge.warn{background:#2d1f12;color:#d2991d;border-color:#5a3e1a}
.badge.ok{background:#122d1f;color:#3fb950;border-color:#1a3d2a}

/* ── Layout ── */
.page{max-width:1480px;margin:0 auto;padding:0 24px}
.layout{display:grid;grid-template-columns:248px minmax(0,1fr);gap:40px;align-items:start;padding-bottom:80px}

/* ── Sidebar / TOC ── */
.sidebar{position:sticky;top:68px;max-height:calc(100vh - 84px);overflow-y:auto;padding-right:2px}
.sidebar::-webkit-scrollbar{width:4px}
.sidebar::-webkit-scrollbar-thumb{background:#30363d;border-radius:2px}

.toc{display:flex;flex-direction:column;gap:0;padding-bottom:16px}

/* Category header — non-clickable group label */
.toc-category{
  display:flex;align-items:center;gap:6px;
  padding:14px 10px 5px;
  font-size:10.5px;font-weight:800;
  color:var(--c-muted);
  text-transform:uppercase;letter-spacing:.08em;
  user-select:none;
}
.toc-category::before{content:'';display:block;width:3px;height:10px;background:var(--c-border);border-radius:2px;flex-shrink:0}

/* Clickable section link */
.toc-link{
  display:flex;align-items:center;
  padding:6px 10px 6px 14px;
  border-radius:6px;
  color:var(--c-muted);
  font-size:13px;line-height:1.4;
  transition:color .12s,background .12s;
  border-left:2px solid transparent;
  text-decoration:none;
  position:relative;
}
.toc-link:hover{color:var(--c-text);background:rgba(88,166,255,.07);text-decoration:none}
.toc-link.active{
  color:var(--c-accent);
  background:rgba(88,166,255,.08);
  border-left-color:var(--c-accent);
  font-weight:600;
}

/* Child link (under a standalone section's sub-items) */
.toc-child-link{
  padding-left:24px;
  font-size:12px;
}

/* ── Content ── */
.content{display:grid;gap:24px;min-width:0}
.section{
  border:1px solid var(--c-border);border-radius:var(--radius);
  background:var(--c-surface);padding:28px;
  box-shadow:var(--shadow-sm);
  scroll-margin-top:72px;
}
.section h2{
  padding-bottom:10px;border-bottom:1px solid var(--c-border);margin-bottom:18px;
  font-size:20px;
}
.subsection{
  border:1px solid rgba(48,54,61,.8);border-radius:8px;
  background:rgba(13,17,23,.6);
  padding:20px 22px;margin-top:14px;
  scroll-margin-top:80px;
}
.subsection h3{
  color:var(--c-accent);font-size:15px;
  border-left:3px solid var(--c-accent);padding-left:10px;
  margin-bottom:12px;
}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-top:12px}
.card{border:1px solid var(--c-border);border-radius:8px;background:var(--c-surface);padding:16px;box-shadow:var(--shadow-sm)}
.card h4{color:var(--c-text);font-size:15px;margin-bottom:6px}
.card p{font-size:14px}
.callout{border:1px solid var(--c-callout-border);border-radius:var(--radius);background:var(--c-callout-bg);padding:14px 18px;margin-top:14px;color:#a5c8ff;line-height:1.7;font-size:14px}
.code-tags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.code-tags code{display:inline-block;white-space:nowrap}

/* ── API cards ── */
.api-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:12px}
.api-card{border:1px solid var(--c-border);border-radius:var(--radius);background:var(--c-surface);padding:20px;box-shadow:var(--shadow-sm);display:grid;gap:12px}
.api-headline{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.api-title strong{font-size:16px}
.api-meta{display:grid;grid-template-columns:90px 1fr;gap:4px 10px;color:var(--c-muted);font-size:13px;line-height:1.6}
.api-meta b{color:var(--c-text)}
.copy-btn{border:1px solid var(--c-border);background:var(--c-surface);color:var(--c-accent);padding:5px 12px;border-radius:6px;font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:.15s;white-space:nowrap;flex-shrink:0}
.copy-btn:hover{background:var(--c-accent);color:#fff;border-color:var(--c-accent)}
.copy-row{margin-top:2px}.copy-state{color:var(--c-accent);font-size:13px;font-weight:600}

/* ── Gallery ── */
.img-gallery{margin:12px 0}
.gallery-ph{border:2px dashed var(--c-border);border-radius:var(--radius);padding:32px 20px;text-align:center;color:var(--c-muted)}
.gallery-single img,.gallery-slide img{width:100%;border-radius:8px;cursor:pointer}
.gallery-carousel{position:relative;overflow:hidden;border-radius:8px}
.gallery-track{display:flex;transition:transform .3s}
.gallery-slide{flex:0 0 100%}
.gallery-btn{position:absolute;top:50%;transform:translateY(-50%);border:0;background:rgba(0,0,0,.5);color:#fff;font-size:24px;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2}
.gallery-btn.prev{left:8px}.gallery-btn.gnext{right:8px}
.gallery-dots{display:flex;gap:6px;justify-content:center;margin-top:8px}
.gallery-dot{width:7px;height:7px;border-radius:50%;border:1px solid var(--c-border);background:var(--c-surface);cursor:pointer;padding:0}
.gallery-dot.active{background:var(--c-accent);border-color:var(--c-accent)}
.row-img{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}.row-img .img-gallery{flex:1 1 280px}

/* ── Language ── */
.lang-zh [data-lang=en],.lang-en [data-lang=zh]{display:none}

/* ── Image placeholder ── */
.img-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1.5px dashed var(--c-border);border-radius:var(--radius);padding:32px 20px;margin:12px 0;color:var(--c-muted);font-size:13px;background:rgba(22,27,34,.4);text-align:center}
.img-ph svg{opacity:.35;flex-shrink:0}

/* ── Responsive ── */
@media(max-width:960px){
  .layout{grid-template-columns:1fr}
  .sidebar{display:none}
}
</style>`;
}

// Raw CSS (no <style> tags) — used as default value for settings.custom_css
export const DOC_THEME_CSS: string = docThemeCSS().replace(/^<style>/, '').replace(/<\/style>$/, '');

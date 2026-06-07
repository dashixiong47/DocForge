import { adminLayout, esc } from './layout';

export const dashboard = ({ settings }: { settings: Record<string,string> }) => adminLayout({
  title:'仪表盘',active:'dashboard',
  head:`<style>
.dash-grid{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-top:14px}
.dash-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px}
.dash-card h3{margin:0 0 12px;font-size:14px}
.chart-bars{height:180px;display:flex;align-items:flex-end;gap:8px;border-bottom:1px solid var(--border);padding-top:8px}
.bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0}
.bar{width:100%;max-width:34px;min-height:3px;border-radius:5px 5px 0 0;background:linear-gradient(180deg,var(--accent),rgba(88,166,255,.32))}
.bar-lbl{font-size:10px;color:var(--muted);white-space:nowrap}
.rank-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(48,54,61,.5);font-size:12px}
.rank-row:last-child{border-bottom:none}
.rank-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)}
.rank-val{font-weight:700;color:var(--accent)}
.ip-table{width:100%;border-collapse:collapse;font-size:12px}
.ip-table td{padding:6px 4px;border-bottom:1px solid rgba(48,54,61,.5);color:var(--muted)}
.ip-table td:first-child{color:var(--text);font-family:var(--mono)}
@media(max-width:980px){.dash-grid{grid-template-columns:1fr}}
</style>`,
  body:`<h1 class="page-title" data-i18n="dash.title">📊 仪表盘</h1>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-num" id="s-views">-</div><div class="stat-label" data-i18n="dash.views7d">7 日浏览</div></div>
  <div class="stat-card"><div class="stat-num" id="s-visitors">-</div><div class="stat-label" data-i18n="dash.visitors7d">7 日访客 IP</div></div>
  <div class="stat-card"><div class="stat-num" id="s-plugins">-</div><div class="stat-label" data-i18n="dash.docs">文档</div></div>
  <div class="stat-card"><div class="stat-num" id="s-media">-</div><div class="stat-label" data-i18n="dash.media">媒体</div></div>
</div>
<div class="dash-grid">
  <div class="dash-card">
    <h3 data-i18n="dash.trafficTrend">访问趋势</h3>
    <div class="chart-bars" id="traffic-chart"></div>
  </div>
  <div class="dash-card">
    <h3 data-i18n="dash.topDocs">热门文档</h3>
    <div id="top-docs"></div>
  </div>
  <div class="dash-card">
    <h3 data-i18n="dash.countryVisits">地区访问</h3>
    <div id="country-list"></div>
  </div>
  <div class="dash-card">
    <h3 data-i18n="dash.recentIps">最近 IP</h3>
    <table class="ip-table"><tbody id="recent-ips"></tbody></table>
  </div>
</div>
<div class="card" style="margin-top:14px"><h3 data-i18n="dash.quick">快速操作</h3><div class="btn-group"><a href="/admin/plugins" class="btn btn-primary" data-i18n="dash.manageDocs">管理文档</a><a href="/admin/media" class="btn btn-outline" data-i18n="dash.uploadMedia">上传媒体</a><a href="/admin/settings" class="btn btn-outline" data-i18n="dash.sysSettings">系统设置</a><a href="/" target="_blank" class="btn btn-outline" data-i18n="dash.viewSite">查看网站</a></div></div>
${settings.site_title?`<div class="card" style="margin-top:14px"><h3 data-i18n="dash.currentSite">当前站点</h3><p style="color:var(--muted);margin:0">${esc(settings.site_title)}</p></div>`:''}
<script>
function emptyMsg(){return '<div style="color:var(--muted);font-size:12px;padding:8px 0">No data</div>';}
function renderRank(id,items,nameKey){
  var el=document.getElementById(id);
  if(!items||!items.length){el.innerHTML=emptyMsg();return;}
  el.innerHTML=items.map(function(x){return '<div class="rank-row"><span class="rank-name">'+(x[nameKey]||'Unknown')+'</span><span class="rank-val">'+x.views+'</span></div>';}).join('');
}
fetch('/api/admin/stats').then(r=>r.json()).then(function(d){
  document.getElementById('s-plugins').textContent=d.plugins;
  document.getElementById('s-media').textContent=d.media;
  document.getElementById('s-views').textContent=d.analytics.views7d;
  document.getElementById('s-visitors').textContent=d.analytics.visitors7d;
  var max=Math.max(1,...d.analytics.series.map(function(x){return x.views;}));
  document.getElementById('traffic-chart').innerHTML=d.analytics.series.map(function(x){
    var h=Math.max(3,Math.round(x.views/max*160));
    return '<div class="bar-wrap" title="'+x.date+': '+x.views+'"><div class="bar" style="height:'+h+'px"></div><div class="bar-lbl">'+x.date.slice(5)+'</div></div>';
  }).join('');
  renderRank('top-docs',d.analytics.topDocs,'slug');
  renderRank('country-list',d.analytics.countries,'country');
  var ips=d.analytics.recentIps||[];
  document.getElementById('recent-ips').innerHTML=ips.length?ips.map(function(x){
    return '<tr><td>'+x.ip+'</td><td>'+x.country+'</td><td>'+x.doc+'</td><td>'+new Date(x.at).toLocaleString()+'</td></tr>';
  }).join(''):'<tr><td>'+emptyMsg()+'</td></tr>';
});
</script>`,
});

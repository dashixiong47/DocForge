import { adminLayout } from './layout';

export const dashboard = () => adminLayout({
  title:'仪表盘',active:'dashboard',
  head:`<style>
.dash-grid{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-top:14px}
.dash-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px}
.dash-card h3{margin:0 0 12px;font-size:14px}
.chart-bars{height:180px;display:flex;align-items:flex-end;gap:8px;border-bottom:1px solid var(--border);padding-top:8px;position:relative;overflow:visible}
.bar-wrap{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;min-width:0;position:relative;cursor:default;border-radius:6px}
.bar-wrap:hover,.bar-wrap:focus-visible{background:rgba(88,166,255,.06);outline:none}
.bar{width:100%;max-width:34px;min-height:3px;border-radius:5px 5px 0 0;background:linear-gradient(180deg,var(--accent),rgba(88,166,255,.32));transition:filter .15s,box-shadow .15s}
.bar-wrap:hover .bar,.bar-wrap:focus-visible .bar{filter:brightness(1.16);box-shadow:0 0 0 1px rgba(88,166,255,.3),0 8px 18px rgba(88,166,255,.16)}
.bar-lbl{font-size:10px;color:var(--muted);white-space:nowrap}
.bar-tip{position:absolute;left:50%;top:-8px;transform:translate(-50%,-100%) translateY(4px);opacity:0;pointer-events:none;z-index:20;min-width:96px;padding:7px 9px;border:1px solid var(--border);border-radius:8px;background:rgba(13,17,23,.96);box-shadow:0 10px 28px rgba(0,0,0,.38);text-align:center;transition:opacity .12s,transform .12s}
.bar-tip strong{display:block;color:var(--text);font-size:16px;line-height:1}
.bar-tip span{display:block;margin-top:3px;color:var(--muted);font-size:11px}
.bar-tip:after{content:"";position:absolute;left:50%;bottom:-5px;width:9px;height:9px;background:rgba(13,17,23,.96);border-right:1px solid var(--border);border-bottom:1px solid var(--border);transform:translateX(-50%) rotate(45deg)}
.bar-wrap:hover .bar-tip,.bar-wrap:focus-visible .bar-tip{opacity:1;transform:translate(-50%,-100%) translateY(0)}
.rank-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(48,54,61,.5);font-size:12px}
.rank-row:last-child{border-bottom:none}
.rank-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)}
.rank-val{font-weight:700;color:var(--accent)}
.ip-table{width:100%;border-collapse:collapse;font-size:12px}
.ip-table td{padding:6px 4px;border-bottom:1px solid rgba(48,54,61,.5);color:var(--muted)}
.ip-table td:first-child{color:var(--text);font-family:var(--mono)}
.share-panel{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
.share-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
.share-mini-card{border:1px solid rgba(48,54,61,.65);border-radius:8px;padding:10px;background:rgba(13,17,23,.3)}
.share-mini-card strong{display:block;font-size:24px;color:var(--text)}
.share-mini-card span{font-size:11px;color:var(--muted)}
.state-pill{font-size:11px;font-weight:700;border-radius:999px;padding:2px 8px}
.state-pill.on{color:var(--ok);background:rgba(63,185,80,.1);border:1px solid rgba(63,185,80,.25)}
.state-pill.off{color:var(--muted);background:rgba(139,148,158,.08);border:1px solid rgba(139,148,158,.2)}
@media(max-width:980px){.dash-grid{grid-template-columns:1fr}}
@media(max-width:980px){.share-panel{grid-template-columns:1fr}.share-summary{grid-template-columns:1fr}}
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
<div class="dash-card" style="margin-top:14px">
  <h3 data-i18n="dash.pluginShares">插件分享生态</h3>
  <div class="share-summary">
    <div class="share-mini-card"><strong id="s-exts">-</strong><span data-i18n="nav.extensions">插件管理</span></div>
    <div class="share-mini-card"><strong id="s-installs7d">-</strong><span data-i18n="dash.installs7d">7 日安装回传</span></div>
    <div class="share-mini-card"><strong id="s-installs-total">-</strong><span data-i18n="dash.totalInstalls">累计安装回传</span></div>
  </div>
  <div class="share-panel">
    <div>
      <h3 data-i18n="dash.topSharedPlugins">热门分享插件</h3>
      <div id="top-shared"></div>
    </div>
    <div>
      <h3 data-i18n="dash.notifyStatus">回传状态</h3>
      <div id="share-states"></div>
    </div>
    <div style="grid-column:1/-1">
      <h3 data-i18n="dash.recentInstalls">最近安装回传</h3>
      <table class="ip-table"><tbody id="recent-installs"></tbody></table>
    </div>
  </div>
</div>
<script>
function emptyMsg(){return '<div style="color:var(--muted);font-size:12px;padding:8px 0">No data</div>';}
function renderRank(id,items,nameKey){
  var el=document.getElementById(id);
  if(!items||!items.length){el.innerHTML=emptyMsg();return;}
  el.innerHTML=items.map(function(x){return '<div class="rank-row"><span class="rank-name">'+(x[nameKey]||'Unknown')+'</span><span class="rank-val">'+x.views+'</span></div>';}).join('');
}
function renderInstallRank(id,items){
  var el=document.getElementById(id);
  if(!items||!items.length){el.innerHTML=emptyMsg();return;}
  el.innerHTML=items.map(function(x){return '<div class="rank-row"><span class="rank-name">'+(x.slug||'Unknown')+'</span><span class="rank-val">'+x.installs+'</span></div>';}).join('');
}
fetch('/api/admin/stats').then(r=>r.json()).then(function(d){
  document.getElementById('s-plugins').textContent=d.plugins;
  document.getElementById('s-media').textContent=d.media;
  document.getElementById('s-exts').textContent=d.extensions||0;
  document.getElementById('s-views').textContent=d.analytics.views7d;
  document.getElementById('s-visitors').textContent=d.analytics.visitors7d;
  document.getElementById('s-installs7d').textContent=(d.shares&&d.shares.installs7d)||0;
  document.getElementById('s-installs-total').textContent=(d.shares&&d.shares.installsTotal)||0;
  var max=Math.max(1,...d.analytics.series.map(function(x){return x.views;}));
  document.getElementById('traffic-chart').innerHTML=d.analytics.series.map(function(x){
    var h=Math.max(3,Math.round(x.views/max*160));
    return '<div class="bar-wrap" tabindex="0" aria-label="'+x.date+': '+x.views+'"><div class="bar-tip"><strong>'+x.views+'</strong><span>'+x.date+'</span></div><div class="bar" style="height:'+h+'px"></div><div class="bar-lbl">'+x.date.slice(5)+'</div></div>';
  }).join('');
  renderRank('top-docs',d.analytics.topDocs,'slug');
  renderRank('country-list',d.analytics.countries,'country');
  var ips=d.analytics.recentIps||[];
  document.getElementById('recent-ips').innerHTML=ips.length?ips.map(function(x){
    return '<tr><td>'+x.ip+'</td><td>'+x.country+'</td><td>'+x.doc+'</td><td>'+new Date(x.at).toLocaleString()+'</td></tr>';
  }).join(''):'<tr><td>'+emptyMsg()+'</td></tr>';
  renderInstallRank('top-shared',(d.shares&&d.shares.topShared)||[]);
  var states=(d.shares&&d.shares.states)||[];
  document.getElementById('share-states').innerHTML=states.length?states.map(function(x){
    var on=!!x.shareNotify;
    return '<div class="rank-row"><span class="rank-name">'+x.name+' <code style="font-size:10px;color:var(--muted)">/'+x.slug+'</code></span><span class="state-pill '+(on?'on':'off')+'" data-i18n="'+(on?'dash.notifyOn':'dash.notifyOff')+'">'+(on?'开启':'关闭')+'</span></div>';
  }).join(''):emptyMsg();
  var installs=(d.shares&&d.shares.recentInstalls)||[];
  document.getElementById('recent-installs').innerHTML=installs.length?installs.map(function(x){
    return '<tr><td>'+x.slug+'</td><td>'+x.origin+'</td><td>'+x.country+'</td><td>'+new Date(x.at).toLocaleString()+'</td></tr>';
  }).join(''):'<tr><td>'+emptyMsg()+'</td></tr>';
  if(window.applyAdminI18n)window.applyAdminI18n();
});
</script>`,
});

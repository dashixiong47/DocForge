import { adminLayout } from './layout';

export const dashboard = () => adminLayout({
  title: '仪表盘',
  active: 'dashboard',
  head: `<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<style>
body{overflow:hidden}
.main-content{height:100vh;overflow:hidden;padding:58px 24px 14px}
.docdash{height:100%;min-height:0;display:grid;grid-template-rows:96px minmax(0,1fr);gap:10px}
.docdash-hero{position:relative;overflow:hidden;border:1px solid rgba(88,166,255,.28);border-radius:18px;background:
  radial-gradient(circle at 8% 0,rgba(88,166,255,.23),transparent 28%),
  radial-gradient(circle at 76% 4%,rgba(63,185,80,.15),transparent 28%),
  linear-gradient(135deg,#142238 0%,#101820 44%,#0d1117 100%);padding:14px 18px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;box-shadow:0 18px 50px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.03)}
.docdash-hero:before{content:"";position:absolute;left:0;top:16px;bottom:16px;width:4px;background:linear-gradient(180deg,#58a6ff,#3fb950);border-radius:999px}
.docdash-hero:after{content:"";position:absolute;right:-80px;bottom:-120px;width:380px;height:220px;background:linear-gradient(90deg,rgba(88,166,255,.13),rgba(63,185,80,.09));filter:blur(34px);transform:rotate(-12deg)}
.docdash-kicker{position:relative;color:#79c0ff;font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
.docdash-hero h1{position:relative;margin:4px 0 5px;font-size:26px;line-height:1.05;letter-spacing:-.02em}
.docdash-hero p{position:relative;margin:0;color:#a8b6c8;max-width:820px;line-height:1.45;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.docdash-metrics{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,128px);gap:10px;align-self:center}
.dash-metric{border:1px solid rgba(88,166,255,.2);border-radius:13px;background:rgba(13,17,23,.62);padding:10px 12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.dash-metric strong{display:block;font-size:22px;line-height:1;color:#fff}
.dash-metric span{display:block;margin-top:6px;color:#9fb4cc;font-size:11px;font-weight:750}
.docdash-layout{min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:10px}
.docdash-main{min-height:0;display:grid;grid-template-rows:minmax(0,1fr) 200px;gap:10px}
.docdash-side{min-height:0;display:grid;grid-template-rows:1fr 1fr;gap:10px}
.dash-panel{min-height:0;overflow:hidden;border:1px solid rgba(96,120,150,.32);border-radius:16px;background:linear-gradient(180deg,rgba(22,27,34,.96),rgba(13,17,23,.98));box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}
.dash-panel-hd{height:50px;border-bottom:1px solid rgba(96,120,150,.22);padding:9px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.dash-panel-hd h3{margin:0;font-size:15px}.dash-panel-hd p{margin:2px 0 0;color:var(--muted);font-size:12px}
.dash-pill{border:1px solid rgba(88,166,255,.22);background:rgba(88,166,255,.08);color:#9ed0ff;border-radius:999px;padding:3px 9px;font-size:11px;font-weight:800;white-space:nowrap}
.dash-map-card{display:grid;grid-template-columns:minmax(0,1fr) 250px;min-height:0;height:calc(100% - 50px)}
.dash-map-wrap{min-height:0;padding:12px 16px 16px}
.dash-chart{width:100%;height:100%;min-height:0}
.dash-map-side{border-left:1px solid rgba(96,120,150,.22);padding:12px;min-height:0;display:grid;grid-template-rows:1fr 1fr;gap:10px}
.dash-list{min-height:0;overflow:auto;display:grid;align-content:start;gap:8px}
.dash-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:8px 10px;border:1px solid rgba(96,120,150,.2);border-radius:11px;background:rgba(13,19,30,.68);font-size:12px}
.dash-row strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dash-row span{color:#79c0ff;font-weight:800}
.dash-row small{display:block;color:var(--muted);font-size:11px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dash-bottom-grid{height:100%;min-height:0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.dash-mini{padding:11px 12px;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:8px}
.dash-mini h3{margin:0;font-size:13px}.dash-mini p{display:block;margin:2px 0 0;color:var(--muted);font-size:11px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dash-mini .dash-list{gap:6px}
.dash-mini .dash-row{padding:6px 9px}
.dash-device{height:calc(100% - 50px);padding:12px 14px 14px}
.dash-table{width:100%;border-collapse:collapse;font-size:12px}.dash-table td{padding:8px 4px;border-bottom:1px solid rgba(96,120,150,.18);color:var(--muted);vertical-align:top}.dash-table td:first-child{color:var(--text);font-family:var(--mono);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dash-empty{color:var(--muted);font-size:12px;padding:10px;border:1px dashed rgba(96,120,150,.24);border-radius:10px;background:rgba(13,17,23,.36)}
.loading-sheen{position:relative;color:transparent!important;background:linear-gradient(90deg,#1c2635,#263449,#1c2635);background-size:220% 100%;border-radius:6px;animation:sheen 1.2s linear infinite}
@keyframes sheen{to{background-position:-220% 0}}
@media(max-width:1320px){body{overflow:auto}.main-content{height:auto;overflow:visible}.docdash{height:auto;grid-template-rows:auto auto}.docdash-layout{grid-template-columns:1fr}.docdash-side{grid-template-columns:1fr 1fr;grid-template-rows:300px}.docdash-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:960px){.docdash-hero{grid-template-columns:1fr}.docdash-map-card{grid-template-columns:1fr}.dash-map-side{border-left:0;border-top:1px solid rgba(96,120,150,.22);grid-template-columns:1fr 1fr;grid-template-rows:auto}.dash-bottom-grid,.docdash-side{grid-template-columns:1fr;grid-template-rows:auto}.docdash-main{grid-template-rows:auto auto}.dash-chart{height:320px}.docdash{height:auto}.docdash-layout,.docdash-main,.docdash-side{min-height:auto}}
@media(max-width:640px){.docdash-metrics,.dash-map-side,.dash-bottom-grid{grid-template-columns:1fr}.docdash-hero h1{font-size:24px}.docdash-hero{padding:18px 16px}.docdash-main{grid-template-rows:auto}.dash-map-card{height:auto}}
</style>`,
  body: `<div class="docdash">
  <section class="docdash-hero">
    <div>
      <div class="docdash-kicker" data-i18n="dash.kicker">DOCFORGE OPERATIONS</div>
      <h1 data-i18n="dash.heroTitle">文档站点运行总览</h1>
      <p data-i18n="dash.heroDesc">查看访问趋势、全球来源、热门文档、媒体资产和插件分享回传。</p>
    </div>
    <div class="docdash-metrics">
      <div class="dash-metric"><strong id="m-views7" class="loading-sheen">0</strong><span data-i18n="dash.views7d">7 日浏览</span></div>
      <div class="dash-metric"><strong id="m-visitors7" class="loading-sheen">0</strong><span data-i18n="dash.visitors7d">7 日访客</span></div>
      <div class="dash-metric"><strong id="m-views30" class="loading-sheen">0</strong><span data-i18n="dash.views30d">30 日浏览</span></div>
      <div class="dash-metric"><strong id="m-countries" class="loading-sheen">0</strong><span data-i18n="dash.countries">访问国家</span></div>
    </div>
  </section>

  <section class="docdash-layout">
    <main class="docdash-main">
      <div class="dash-panel">
        <div class="dash-panel-hd">
          <div><h3 data-i18n="dash.worldMap">全球访问地图</h3><p data-i18n="dash.worldDesc">世界地图数据由项目资产提供，可通过 Cloudflare CDN 缓存。</p></div>
          <span class="dash-pill"><span id="m-visitors30">0</span> <span data-i18n="dash.visitors30d">30 日访客</span></span>
        </div>
        <div class="dash-map-card">
          <div class="dash-map-wrap"><div id="world-map" class="dash-chart"></div></div>
          <aside class="dash-map-side">
            <div><h3 style="margin:0 0 8px;font-size:13px" data-i18n="dash.countryVisits">地区访问</h3><div class="dash-list" id="country-list"></div></div>
            <div><h3 style="margin:0 0 8px;font-size:13px" data-i18n="dash.topDocs">热门文档</h3><div class="dash-list" id="top-docs"></div></div>
          </aside>
        </div>
      </div>

      <div class="dash-bottom-grid">
        <div class="dash-panel dash-mini">
          <div><h3 data-i18n="dash.docsHealth">内容资产</h3><p data-i18n="dash.docsHealthDesc">文档、章节和媒体总量。</p></div>
          <div class="dash-list">
            <div class="dash-row"><strong data-i18n="dash.docs">文档</strong><span id="m-docs">0</span></div>
            <div class="dash-row"><strong data-i18n="dash.sections">章节</strong><span id="m-sections">0</span></div>
            <div class="dash-row"><strong data-i18n="dash.media">媒体</strong><span id="m-media">0</span></div>
          </div>
        </div>
        <div class="dash-panel dash-mini">
          <div><h3 data-i18n="dash.pluginShares">插件分享</h3><p data-i18n="dash.pluginDesc">插件安装回传和分享状态。</p></div>
          <div class="dash-list">
            <div class="dash-row"><strong data-i18n="dash.installs7d">7 日安装</strong><span id="m-installs7">0</span></div>
            <div class="dash-row"><strong data-i18n="dash.totalInstalls">累计安装</strong><span id="m-installsTotal">0</span></div>
            <div class="dash-row"><strong data-i18n="nav.extensions">插件</strong><span id="m-exts">0</span></div>
          </div>
        </div>
        <div class="dash-panel dash-mini">
          <div><h3 data-i18n="dash.topSharedPlugins">热门分享插件</h3><p data-i18n="dash.topSharedDesc">最近安装回传最多的插件。</p></div>
          <div class="dash-list" id="top-shared"></div>
        </div>
      </div>
    </main>

    <aside class="docdash-side">
      <div class="dash-panel">
        <div class="dash-panel-hd">
          <div><h3 data-i18n="dash.trafficTrend">访问趋势</h3><p data-i18n="dash.trafficDesc">最近 7 天浏览量。</p></div>
          <span class="dash-pill"><span id="m-series-count">0</span> <span data-i18n="dash.days">天</span></span>
        </div>
        <div class="dash-device"><div id="traffic-chart" class="dash-chart"></div></div>
      </div>
      <div class="dash-panel">
        <div class="dash-panel-hd">
          <div><h3 data-i18n="dash.deviceSplit">设备分布</h3><p data-i18n="dash.deviceDesc">桌面、移动和 Bot 访问占比。</p></div>
        </div>
        <div class="dash-device"><div id="device-chart" class="dash-chart"></div></div>
      </div>
    </aside>
  </section>
</div>
<script>
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function setText(id,v){var el=document.getElementById(id);if(el){el.textContent=String(v==null?0:v);el.classList.remove('loading-sheen');}}
function emptyRow(){return '<div class="dash-empty">0</div>';}
function renderRank(id,items,nameKey,valueKey){
  var el=document.getElementById(id);if(!el)return;
  items=items||[];
  el.innerHTML=items.length?items.map(function(x){return '<div class="dash-row"><strong title="'+esc(x[nameKey]||'Unknown')+'">'+esc(x[nameKey]||'Unknown')+'</strong><span>'+Number(x[valueKey]||0)+'</span></div>';}).join(''):emptyRow();
}
function renderDocs(items){
  var el=document.getElementById('top-docs');if(!el)return;
  items=items||[];
  el.innerHTML=items.length?items.map(function(x){return '<div class="dash-row"><strong title="'+esc(x.title||x.slug||'Unknown')+'">'+esc(x.title||x.slug||'Unknown')+'<small>'+esc(x.slug||'')+'</small></strong><span>'+Number(x.views||0)+'</span></div>';}).join(''):emptyRow();
}
function renderRecentInstalls(items){
  var el=document.getElementById('top-shared');if(!el)return;
  el.innerHTML=(items||[]).length?items.map(function(x){return '<div class="dash-row"><strong>'+esc(x.slug||'unknown')+'<small>'+esc(x.origin||'')+'</small></strong><span>'+esc(x.country||'--')+'</span></div>';}).join(''):emptyRow();
}
var countryNames={US:'United States of America',CA:'Canada',CN:'China',HK:'Hong Kong',TW:'Taiwan',JP:'Japan',KR:'South Korea',SG:'Singapore',GB:'United Kingdom',DE:'Germany',FR:'France',ES:'Spain',IT:'Italy',RU:'Russia',BR:'Brazil',IN:'India',AU:'Australia',NL:'Netherlands',SE:'Sweden',NO:'Norway',FI:'Finland'};
function countryName(code){code=String(code||'').toUpperCase();return countryNames[code]||code||'Unknown';}
function chartTheme(){
  return {text:'#c9d1d9',muted:'#8b949e',grid:'rgba(96,120,150,.18)',blue:'#58a6ff',green:'#3fb950',yellow:'#d29922',red:'#f85149',surface:'#0d1117'};
}
function renderTraffic(series){
  var el=document.getElementById('traffic-chart');if(!el||!window.echarts)return;
  var t=chartTheme(), chart=echarts.init(el);
  var dates=(series||[]).map(function(x){return String(x.date||'').slice(5);});
  var views=(series||[]).map(function(x){return Number(x.views||0);});
  chart.setOption({
    backgroundColor:'transparent',
    tooltip:{trigger:'axis',backgroundColor:'#161b22',borderColor:'#30363d',textStyle:{color:t.text}},
    grid:{left:38,right:24,top:30,bottom:34,containLabel:true},
    xAxis:{type:'category',data:dates,axisLine:{lineStyle:{color:t.grid}},axisTick:{show:false},axisLabel:{color:t.muted}},
    yAxis:{type:'value',minInterval:1,splitLine:{lineStyle:{color:t.grid}},axisLabel:{color:t.muted}},
    series:[{name:'views',type:'line',smooth:true,symbol:'circle',symbolSize:7,data:views,lineStyle:{width:3,color:t.blue},itemStyle:{color:t.green,borderColor:'#e6edf3',borderWidth:1},areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(88,166,255,.24)'},{offset:1,color:'rgba(88,166,255,0)'}])}}]
  });
  addEventListener('resize',function(){chart.resize();});
}
function renderDevices(items){
  var el=document.getElementById('device-chart');if(!el||!window.echarts)return;
  var t=chartTheme(), chart=echarts.init(el);
  var data=(items||[]).map(function(x){return {name:x.device,value:Number(x.views||0)};});
  if(!data.length)data=[{name:'Desktop',value:0},{name:'Mobile',value:0},{name:'Bot',value:0}];
  chart.setOption({
    backgroundColor:'transparent',
    tooltip:{trigger:'item',backgroundColor:'#161b22',borderColor:'#30363d',textStyle:{color:t.text}},
    legend:{bottom:0,textStyle:{color:t.muted}},
    series:[{type:'pie',radius:['42%','64%'],center:['50%','45%'],avoidLabelOverlap:true,label:{show:false},labelLine:{show:false},data:data,itemStyle:{borderColor:'#0d1117',borderWidth:2},color:[t.blue,t.green,t.yellow]}]
  });
  addEventListener('resize',function(){chart.resize();});
}
function bindMapControls(chart,el){
  if(!chart||!el)return;
  el.addEventListener('contextmenu',function(e){e.preventDefault();});
  var down=false,lastX=0,lastY=0;
  el.addEventListener('mousedown',function(e){
    if(e.button!==2)return;
    e.preventDefault();down=true;lastX=e.clientX;lastY=e.clientY;el.style.cursor='grabbing';
  });
  document.addEventListener('mousemove',function(e){
    if(!down)return;
    e.preventDefault();
    var dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
    chart.dispatchAction({type:'geoRoam',componentType:'geo',dx:dx,dy:dy});
  });
  document.addEventListener('mouseup',function(e){
    if(e.button===2&&down){down=false;el.style.cursor='';}
  });
  document.addEventListener('keydown',function(e){
    if((e.key||'').toLowerCase()==='f'&&!/input|textarea|select/i.test((document.activeElement&&document.activeElement.tagName)||'')){
      chart.dispatchAction({type:'restore'});
    }
  });
}
function renderWorld(countries){
  var el=document.getElementById('world-map');if(!el||!window.echarts)return;
  var t=chartTheme(), chart=echarts.init(el);
  bindMapControls(chart,el);
  fetch('/assets/maps/world.json').then(function(r){return r.json();}).then(function(world){
    echarts.registerMap('docforge-world',world);
    var data=(countries||[]).filter(function(x){return x.country&&x.country!=='Unknown';}).map(function(x){return {name:countryName(x.country), code:x.country, value:Number(x.views||0)};});
    var max=Math.max(1,...data.map(function(x){return x.value;}));
    chart.setOption({
      backgroundColor:'transparent',
      tooltip:{trigger:'item',backgroundColor:'#161b22',borderColor:'#30363d',textStyle:{color:t.text},formatter:function(p){return (p.data&&p.data.code?p.data.code:p.name)+'<br/>'+Number(p.value||0)+' views';}},
      visualMap:{show:false,min:0,max:max,inRange:{color:['#102034','#1f6feb','#3fb950']}},
      toolbox:{show:false,feature:{restore:{}}},
      geo:{map:'docforge-world',roam:true,zoom:1.05,left:20,right:20,top:18,bottom:18,itemStyle:{areaColor:'#132238',borderColor:'rgba(121,192,255,.28)',borderWidth:.65},emphasis:{itemStyle:{areaColor:'#1f6feb'},label:{color:'#fff'}}},
      series:[{type:'map',map:'docforge-world',geoIndex:0,data:data},{type:'effectScatter',coordinateSystem:'geo',symbolSize:function(v){return Math.max(7,Math.min(18,Number(v[2]||0)*3+7));},rippleEffect:{brushType:'stroke'},itemStyle:{color:t.green,shadowBlur:14,shadowColor:'rgba(63,185,80,.8)'},data:data.map(function(x){var c=x.code;var coord={US:[-98,38],CA:[-106,56],CN:[104,35],HK:[114,22],JP:[138,37],GB:[-2,54],DE:[10,51],FR:[2,46],SG:[104,1],AU:[133,-25],BR:[-51,-10],IN:[78,22],KR:[128,36]}[c];return coord?{name:x.name,value:[coord[0],coord[1],x.value]}:null;}).filter(Boolean)}]
    });
  }).catch(function(){
    el.innerHTML='<div class="dash-empty">Map asset unavailable</div>';
  });
  addEventListener('resize',function(){chart.resize();});
}
fetch('/api/admin/stats').then(function(r){return r.json();}).then(function(d){
  setText('m-views7',d.analytics&&d.analytics.views7d);
  setText('m-visitors7',d.analytics&&d.analytics.visitors7d);
  setText('m-views30',d.analytics&&d.analytics.views30d);
  setText('m-visitors30',d.analytics&&d.analytics.visitors30d);
  setText('m-countries',d.analytics&&d.analytics.countries30d);
  setText('m-docs',d.plugins);
  setText('m-sections',d.sections);
  setText('m-media',d.media);
  setText('m-exts',d.extensions);
  setText('m-installs7',d.shares&&d.shares.installs7d);
  setText('m-installsTotal',d.shares&&d.shares.installsTotal);
  setText('m-series-count',((d.analytics&&d.analytics.series)||[]).length);
  renderRank('country-list',(d.analytics&&d.analytics.countries)||[],'country','views');
  renderDocs((d.analytics&&d.analytics.topDocs)||[]);
  renderRecentInstalls((d.shares&&d.shares.recentInstalls)||[]);
  renderWorld((d.analytics&&d.analytics.countries)||[]);
  renderTraffic((d.analytics&&d.analytics.series)||[]);
  renderDevices((d.analytics&&d.analytics.devices)||[]);
  if(window.applyAdminI18n)window.applyAdminI18n();
}).catch(function(){
  document.querySelectorAll('.loading-sheen').forEach(function(el){el.classList.remove('loading-sheen');el.textContent='0';});
  renderWorld([]);renderTraffic([]);renderDevices([]);
});
</script>`,
});

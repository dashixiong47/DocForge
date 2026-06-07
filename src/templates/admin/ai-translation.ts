export const AI_TRANSLATE_CONTROLS = `
<div class="ai-trans-ctrl" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
  <button class="btn btn-sm btn-primary" id="ai-trans-btn" onclick="aiTranslateMissing()" data-i18n="trans.aiTranslate">AI 翻译</button>
  <button class="btn btn-sm" onclick="aiOpenConfig()" data-i18n-title="trans.aiSettings" title="AI 翻译设置">⚙</button>
</div>
<div class="modal-ov" id="ai-config-modal">
  <div class="modal" style="width:440px;max-width:96vw">
    <div class="modal-hd">
      <h3 data-i18n="trans.aiSettings">AI 翻译设置</h3>
      <button class="modal-close" onclick="aiCloseConfig()">✕</button>
    </div>
    <div style="display:grid;gap:12px">
      <label style="display:grid;gap:5px;font-size:12px;color:var(--muted)">
        <span data-i18n="trans.aiKey">API Key</span>
        <input id="ai-api-key" type="password" autocomplete="off" placeholder="sk-..."
          style="padding:8px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px;outline:none">
      </label>
      <label style="display:grid;gap:5px;font-size:12px;color:var(--muted)">
        <span data-i18n="trans.aiModel">模型</span>
        <select id="ai-model"
          style="padding:8px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px;outline:none">
          <option value="deepseek-v4-flash">DeepSeek V4 Flash</option>
          <option value="deepseek-chat">DeepSeek Chat</option>
          <option value="gpt-4.1-mini">OpenAI GPT-4.1 mini</option>
          <option value="gpt-4.1">OpenAI GPT-4.1</option>
        </select>
      </label>
      <label style="display:grid;gap:5px;font-size:12px;color:var(--muted)">
        <span data-i18n="trans.aiBatch">批量行数</span>
        <input id="ai-batch-size" type="number" min="1" max="100" value="20"
          style="padding:8px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;font-size:13px;outline:none">
      </label>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="aiCloseConfig()" data-i18n="docs.cancel">取消</button>
      <button class="btn btn-primary" onclick="aiSaveConfigAndClose()" data-i18n="trans.aiSaveSettings">保存设置</button>
    </div>
  </div>
</div>`;

export const AI_TRANSLATE_SCRIPT = `
function aiTransText(key){
  if (typeof tt === 'function') return tt(key);
  if (typeof window !== 'undefined' && typeof window.t === 'function') return window.t(key);
  if (typeof t === 'function') return t(key);
  var fallback = {
    'trans.aiRunning':'AI 翻译中...',
    'trans.aiNoRows':'没有需要翻译的空行',
    'trans.aiDone':'AI 已填充 %s 行，请检查后保存',
    'trans.aiFailed':'AI 翻译失败'
  };
  return fallback[key] || key;
}
function aiNotify(message,type){
  if (typeof showToast === 'function') showToast(message,type === 'err' ? 'err' : 'ok');
  else alert(message);
}
function aiTransProvider(model){
  return /^(gpt|o[0-9]|chatgpt)/i.test(model || '') ? 'OpenAI' : 'DeepSeek';
}
function aiTransSettings(){
  try { return JSON.parse(localStorage.getItem('docforge_ai_translate') || '{}') || {}; } catch(e) { return {}; }
}
function aiOpenConfig(){
  aiInitControls();
  var modal=document.getElementById('ai-config-modal');
  if(modal) modal.classList.add('open');
}
function aiCloseConfig(){
  var modal=document.getElementById('ai-config-modal');
  if(modal) modal.classList.remove('open');
}
function aiSaveConfigAndClose(){
  aiSaveControls();
  aiCloseConfig();
}
function aiInitControls(){
  var s=aiTransSettings();
  var key=document.getElementById('ai-api-key');
  var model=document.getElementById('ai-model');
  var batch=document.getElementById('ai-batch-size');
  if(key && s.apiKey) key.value=s.apiKey;
  if(model && s.model) model.value=s.model;
  if(batch && s.batchSize) batch.value=s.batchSize;
}
function aiSaveControls(){
  var key=document.getElementById('ai-api-key');
  var model=document.getElementById('ai-model');
  var batch=document.getElementById('ai-batch-size');
  localStorage.setItem('docforge_ai_translate', JSON.stringify({
    apiKey:key?key.value:'',
    model:model?(model.value||'deepseek-v4-flash'):'deepseek-v4-flash',
    batchSize:batch?(Number(batch.value)||20):20
  }));
}
function aiSetCachedTransValue(key,locale,value){
  function setGrouped(arr){
    if(!Array.isArray(arr)) return false;
    var row=arr.find(function(r){return r.key===key;});
    if(!row){ row={key:key}; arr.push(row); }
    row[locale]=value;
    return true;
  }
  if (typeof _transAllRows !== 'undefined' && setGrouped(_transAllRows)) return;
  if (typeof ALL_ROWS !== 'undefined' && Array.isArray(ALL_ROWS)) {
    if (!ALL_ROWS.length || Object.prototype.hasOwnProperty.call(ALL_ROWS[0],'locale')) {
      var flat=ALL_ROWS.find(function(r){return r.key===key&&r.locale===locale;});
      if(flat) flat.value=value;
      else ALL_ROWS.push({key:key,locale:locale,value:value});
    } else {
      setGrouped(ALL_ROWS);
    }
  }
}
function aiInputForLocale(row,locale){
  var inputs=[].slice.call(row.querySelectorAll('input[data-locale]'));
  return inputs.find(function(inp){return inp.dataset.locale===locale;});
}
async function aiTranslateMissing(){
  var srcSel=document.getElementById('t-src')||document.getElementById('trans-src');
  var dstSel=document.getElementById('t-dst')||document.getElementById('trans-dst');
  if(!srcSel||!dstSel) return;
  var src=srcSel.value,dst=dstSel.value;
  var batchEl=document.getElementById('ai-batch-size');
  var limit=Math.max(1,Math.min(100,Number(batchEl?batchEl.value:20)||20));
  var rows=[].slice.call(document.querySelectorAll('#t-table tbody tr[data-key], #trans-tbody tr[data-key]'));
  var jobs=[];
  rows.forEach(function(row){
    if(jobs.length>=limit) return;
    var srcInput=aiInputForLocale(row,src);
    var dstInput=aiInputForLocale(row,dst);
    if(!srcInput||!dstInput) return;
    var source=(srcInput.value||'').trim();
    var target=(dstInput.value||'').trim();
    if(source&&!target) jobs.push({key:row.dataset.key,text:source,input:dstInput});
  });
  if(!jobs.length){ aiNotify(aiTransText('trans.aiNoRows'),'err'); return; }
  aiSaveControls();
  var btn=document.getElementById('ai-trans-btn');
  var old=btn?btn.textContent:'';
  if(btn){btn.disabled=true;btn.textContent=aiTransText('trans.aiRunning');}
  try{
    var modelEl=document.getElementById('ai-model');
    var keyEl=document.getElementById('ai-api-key');
    var model=modelEl?(modelEl.value||'deepseek-v4-flash'):'deepseek-v4-flash';
    var r=await fetch('/api/admin/translations/ai',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        apiKey:keyEl?keyEl.value:'',
        provider:aiTransProvider(model),
        model:model,
        sourceLocale:src,
        targetLocale:dst,
        texts:jobs.map(function(j){return j.text;})
      })
    });
    var d=await r.json();
    if(!r.ok||!d.ok) throw new Error(d.error||'AI error');
    d.translations.forEach(function(value,i){
      var job=jobs[i];
      job.input.value=value;
      job.input.classList.remove('t-missing');
      job.input.style.borderColor='var(--warn)';
      aiSetCachedTransValue(job.key,dst,value);
    });
    aiNotify(aiTransText('trans.aiDone').replace('%s',String(d.translations.length)),'ok');
  }catch(e){
    aiNotify(aiTransText('trans.aiFailed')+': '+(e&&e.message?e.message:e),'err');
  }finally{
    if(btn){btn.disabled=false;btn.textContent=old||aiTransText('trans.aiTranslate');}
  }
}
document.addEventListener('DOMContentLoaded', aiInitControls);
`;

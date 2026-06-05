import { chromium } from 'playwright';
const br = await chromium.launch({ headless: true, args: ['--disable-web-security', '--no-sandbox'] });
const ctx = await br.newContext({
  // Block CDN resources to avoid font/asset loading hangs
  serviceWorkers: 'block',
});

// Block slow CDN requests
await ctx.route('**/cdn.bootcdn.net/**', route => {
  // Allow loader.js but mock workers/fonts
  if (route.request().url().includes('loader.js') || route.request().url().includes('editor.main')) {
    route.continue();
  } else {
    route.abort();
  }
});

const page = await ctx.newPage();
await page.setViewportSize({ width: 1400, height: 900 });
// Shorter screenshot timeout
page.setDefaultTimeout(10000);

// Login
await page.goto('http://127.0.0.1:8787/admin/login', { waitUntil: 'domcontentloaded' });
await page.fill('input[name="username"]', 'admin');
await page.fill('input[name="password"]', 'admin123');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin**', { timeout: 8000 });

// Open edit section
await page.goto('http://127.0.0.1:8787/admin/sections/83/edit', {
  waitUntil: 'domcontentloaded', timeout: 10000
});
await page.waitForTimeout(300);

// Capture page structure without waiting for screenshots
const pageInfo = await page.evaluate(() => ({
  blockCount: document.querySelectorAll('.block-item').length,
  addBtnText: document.getElementById('add-btn')?.textContent?.trim(),
  editorPanelDisplay: document.getElementById('editor-panel')?.style.display,
  hasInlineSlots: document.querySelectorAll('[id^="bei-"]').length,
  firstBlockHtml: document.querySelector('.block-item .block-header')?.innerHTML?.slice(0,200),
}));
console.log('PAGE STRUCTURE:', JSON.stringify(pageInfo, null, 2));

// Click 编辑
const editBtns = await page.locator('button[id^="ebtn-"]').count();
console.log('Edit buttons found:', editBtns);
if (editBtns > 0) {
  await page.locator('button[id^="ebtn-"]').first().click();
  await page.waitForTimeout(300);
  
  const afterClick = await page.evaluate(() => {
    const slots = document.querySelectorAll('[id^="bei-"]');
    let visibleSlot = null;
    slots.forEach(s => { if (s.style.display !== 'none') visibleSlot = s.id; });
    return {
      activeSlot: window._activeSlot,
      visibleSlot,
      panelInActiveSlot: visibleSlot ? document.getElementById(visibleSlot)?.contains(document.getElementById('editor-panel')) : false,
      taValue: document.getElementById('html-textarea')?.value?.length,
      editBtnText: document.querySelector('button[id^="ebtn-"]')?.textContent,
    };
  });
  console.log('AFTER EDIT CLICK:', JSON.stringify(afterClick, null, 2));
}

// Click add
await page.locator('#add-btn').click();
await page.waitForTimeout(200);
const addState = await page.evaluate(() => ({
  addSlotDisplay: document.getElementById('add-slot')?.style.display,
  panelInAddSlot: document.getElementById('add-slot')?.contains(document.getElementById('editor-panel')),
  addBtnText: document.getElementById('add-btn')?.textContent?.trim(),
}));
console.log('ADD STATE:', JSON.stringify(addState, null, 2));

// Take screenshot without waiting for fonts
try {
  await page.screenshot({ path: 'f:/github/Document/ss-inline.png', timeout: 5000 });
  console.log('Screenshot saved');
} catch(e) { console.log('Screenshot failed (font timeout):', e.message.slice(0,60)); }

await br.close();

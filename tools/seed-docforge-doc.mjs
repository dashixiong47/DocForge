#!/usr/bin/env node
/**
 * Seed the DocForge project's own documentation.
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8787';
const USERNAME = process.env.ADMIN_USERNAME || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let cookieJar = '';

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieJar ? { Cookie: cookieJar } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const sc = res.headers.get('set-cookie');
  if (sc) {
    const m = sc.match(/admin_token=([^;]+)/);
    if (m) cookieJar = `admin_token=${m[1]}`;
  }
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

async function login() {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(USERNAME)}&password=${encodeURIComponent(PASSWORD)}`,
    redirect: 'manual',
  });
  const sc = res.headers.get('set-cookie');
  const m = sc?.match(/admin_token=([^;]+)/);
  if (!m) throw new Error('Login failed');
  cookieJar = `admin_token=${m[1]}`;
}

function html(content) {
  return { type: 'html', contentJson: JSON.stringify({ html: content }), sortOrder: 0 };
}

const sections = [
  {
    slug: 'overview',
    titleZh: '概览',
    titleEn: 'Overview',
    body: `<p>{{t:docforge.overview.p.0}}</p>
<div class="grid2" style="margin-top:16px">
  <div class="card"><h4>{{t:docforge.overview.h.0}}</h4><p>{{t:docforge.overview.p.1}}</p></div>
  <div class="card"><h4>{{t:docforge.overview.h.1}}</h4><p>{{t:docforge.overview.p.2}}</p></div>
  <div class="card"><h4>{{t:docforge.overview.h.2}}</h4><p>{{t:docforge.overview.p.3}}</p></div>
  <div class="card"><h4>{{t:docforge.overview.h.3}}</h4><p>{{t:docforge.overview.p.4}}</p></div>
</div>`,
  },
  {
    slug: 'architecture',
    titleZh: '架构',
    titleEn: 'Architecture',
    body: `<p>{{t:docforge.architecture.p.0}}</p>
<p>{{t:docforge.architecture.p.1}}</p>
<pre><code class="language-text">src/
  routes/       HTTP routes for admin, public docs, APIs, media
  templates/    Server-rendered admin and public pages
  services/     auth, settings, i18n, official plugin runtime
  db/           Drizzle schema and D1 bindings
Plugins/        official publishable plugin manifests
PrivatePlugins/ local/private manifests ignored by git
migrations/     D1 schema migrations</code></pre>`,
  },
  {
    slug: 'content-model',
    titleZh: '内容模型',
    titleEn: 'Content Model',
    body: `<p>{{t:docforge.content.p.0}}</p>
<ul>
  <li>{{t:docforge.content.li.0}}</li>
  <li>{{t:docforge.content.li.1}}</li>
  <li>{{t:docforge.content.li.2}}</li>
  <li>{{t:docforge.content.li.3}}</li>
</ul>
<table>
  <tr><th>{{t:docforge.content.table.h.0}}</th><th>{{t:docforge.content.table.h.1}}</th></tr>
  <tr><td>plugins</td><td>{{t:docforge.content.table.r.0}}</td></tr>
  <tr><td>sections</td><td>{{t:docforge.content.table.r.1}}</td></tr>
  <tr><td>content_blocks</td><td>{{t:docforge.content.table.r.2}}</td></tr>
  <tr><td>translations</td><td>{{t:docforge.content.table.r.3}}</td></tr>
  <tr><td>extensions</td><td>{{t:docforge.content.table.r.4}}</td></tr>
</table>`,
  },
  {
    slug: 'admin-workflow',
    titleZh: '后台工作流',
    titleEn: 'Admin Workflow',
    body: `<p>{{t:docforge.admin.p.0}}</p>
<ol>
  <li>{{t:docforge.admin.li.0}}</li>
  <li>{{t:docforge.admin.li.1}}</li>
  <li>{{t:docforge.admin.li.2}}</li>
  <li>{{t:docforge.admin.li.3}}</li>
  <li>{{t:docforge.admin.li.4}}</li>
</ol>
<div class="callout">{{t:docforge.admin.p.1}}</div>`,
  },
  {
    slug: 'plugins',
    titleZh: '插件系统',
    titleEn: 'Plugin System',
    body: `<p>{{t:docforge.plugins.p.0}}</p>
<pre><code class="language-json">{
  "slug": "page-search",
  "name": "Page Search",
  "type": "system",
  "css": "...",
  "js": "...",
  "i18n": {
    "meta.name": { "zh": "页面搜索", "en": "Page Search" }
  }
}</code></pre>
<p>{{t:docforge.plugins.p.1}}</p>
<table>
  <tr><th>{{t:docforge.plugins.table.h.0}}</th><th>{{t:docforge.plugins.table.h.1}}</th></tr>
  <tr><td>css / js</td><td>{{t:docforge.plugins.table.r.0}}</td></tr>
  <tr><td>htmlTemplates</td><td>{{t:docforge.plugins.table.r.1}}</td></tr>
  <tr><td>renderTags</td><td>{{t:docforge.plugins.table.r.2}}</td></tr>
  <tr><td>renderBlock</td><td>{{t:docforge.plugins.table.r.3}}</td></tr>
  <tr><td>i18n</td><td>{{t:docforge.plugins.table.r.4}}</td></tr>
</table>`,
  },
  {
    slug: 'private-plugins',
    titleZh: '私有插件',
    titleEn: 'Private Plugins',
    body: `<p>{{t:docforge.private.p.0}}</p>
<pre><code class="language-text">Plugins/         official plugins committed with the project
PrivatePlugins/  local/private plugins ignored by git</code></pre>
<p>{{t:docforge.private.p.1}}</p>`,
  },
  {
    slug: 'deployment',
    titleZh: '部署与环境变量',
    titleEn: 'Deployment',
    body: `<p>{{t:docforge.deploy.p.0}}</p>
<pre><code class="language-bash">npm run secrets:push
npm run db:migrate:remote
npm run deploy</code></pre>
<p>{{t:docforge.deploy.p.1}}</p>
<pre><code class="language-bash">npm run db:init
npm run dev
npm run typecheck</code></pre>
<p>{{t:docforge.deploy.p.2}}</p>`,
  },
  {
    slug: 'visibility',
    titleZh: '文档可见性',
    titleEn: 'Document Visibility',
    body: `<p>{{t:docforge.visibility.p.0}}</p>
<table>
  <tr><th>{{t:docforge.visibility.table.h.0}}</th><th>{{t:docforge.visibility.table.h.1}}</th><th>{{t:docforge.visibility.table.h.2}}</th></tr>
  <tr><td>{{t:docforge.visibility.table.r.0a}}</td><td>{{t:docforge.visibility.table.r.0b}}</td><td>{{t:docforge.visibility.table.r.0c}}</td></tr>
  <tr><td>{{t:docforge.visibility.table.r.1a}}</td><td>{{t:docforge.visibility.table.r.1b}}</td><td>{{t:docforge.visibility.table.r.1c}}</td></tr>
  <tr><td>{{t:docforge.visibility.table.r.2a}}</td><td>{{t:docforge.visibility.table.r.2b}}</td><td>{{t:docforge.visibility.table.r.2c}}</td></tr>
</table>
<div class="callout">{{t:docforge.visibility.p.1}}</div>`,
  },
];

const translations = {
  'docforge.overview.p.0': {
    zh: 'DocForge 是一个运行在 Cloudflare Workers 上的轻量文档系统，用 D1 保存文档结构、翻译、媒体索引和插件配置，用 R2 保存媒体文件。',
    en: 'DocForge is a lightweight documentation system on Cloudflare Workers, using D1 for content, translations, media indexes, and plugin configuration, and R2 for media files.',
  },
  'docforge.overview.h.0': { zh: '文档即数据', en: 'Docs as Data' },
  'docforge.overview.p.1': { zh: '文档、章节、内容块、翻译和媒体都在 D1 中管理，后台编辑后立即生效。', en: 'Documents, sections, blocks, translations, and media are managed in D1 and apply immediately after editing.' },
  'docforge.overview.h.1': { zh: '多语言优先', en: 'Localization First' },
  'docforge.overview.p.2': { zh: '内容使用 {{t:key}} 管理，插件也有独立 i18n，前台按当前语言渲染。', en: 'Content uses {{t:key}}, plugins have independent i18n, and public pages render by current language.' },
  'docforge.overview.h.2': { zh: '插件化前台', en: 'Plugin Runtime' },
  'docforge.overview.p.3': { zh: '官方插件放在 Plugins/，私有插件放在 PrivatePlugins/，可扩展 CSS、JS、HTML 模板和自定义标签。', en: 'Official plugins live in Plugins/, private plugins in PrivatePlugins/, extending CSS, JS, HTML templates, and custom tags.' },
  'docforge.overview.h.3': { zh: '适合开源部署', en: 'Open-Source Friendly' },
  'docforge.overview.p.4': { zh: 'README 说明标准部署流程，本地私有配置和私有插件默认不进入 git。', en: 'README documents standard deployment, while local secrets and private plugins stay out of git by default.' },
  'docforge.architecture.p.0': { zh: '项目保持简单的 Worker 架构：Hono 路由处理请求，模板函数输出 HTML，Drizzle schema 描述 D1 表结构。', en: 'The project keeps a simple Worker architecture: Hono routes handle requests, template functions emit HTML, and Drizzle schema describes D1 tables.' },
  'docforge.architecture.p.1': { zh: '前台文档和后台管理共用同一套内容模型，但入口分开：公开路由只读取启用文档，后台路由负责内容编辑、媒体、翻译、插件同步和统计。', en: 'Public docs and the admin console share the same content model but use separate entry points: public routes read enabled documents, while admin routes manage content, media, translations, plugin sync, and analytics.' },
  'docforge.content.p.0': { zh: 'DocForge 的核心内容由四层组成：文档、章节、内容块和翻译。', en: 'DocForge content is built from four layers: documents, sections, content blocks, and translations.' },
  'docforge.content.li.0': { zh: '文档对应一个 slug，例如 /webuix 或 /docforge。', en: 'A document maps to a slug, such as /webuix or /docforge.' },
  'docforge.content.li.1': { zh: '章节支持顶级分组和子章节，前台会生成目录。', en: 'Sections support top-level groups and child sections, producing the public table of contents.' },
  'docforge.content.li.2': { zh: '内容块支持 HTML、代码、文本、卡片、列表、图片、视频和插件自定义类型。', en: 'Blocks support HTML, code, text, cards, lists, images, videos, and plugin-defined types.' },
  'docforge.content.li.3': { zh: '翻译表按 pluginId、key、locale 存储，前台自动按语言替换。', en: 'Translations are stored by pluginId, key, and locale, and replaced on public pages automatically.' },
  'docforge.content.table.h.0': { zh: '表', en: 'Table' },
  'docforge.content.table.h.1': { zh: '用途', en: 'Purpose' },
  'docforge.content.table.r.0': { zh: '文档元信息、访问开关、首页展示开关、图标、标签和章节级 CSS/JS。', en: 'Document metadata, access switch, home listing switch, icon, tags, and document-level CSS/JS.' },
  'docforge.content.table.r.1': { zh: '章节树、标题、slug、排序和父子关系。', en: 'Section tree, titles, slugs, sorting, and parent-child relationships.' },
  'docforge.content.table.r.2': { zh: '章节中的具体内容块，包含 HTML、代码、媒体和插件块。', en: 'Concrete blocks inside sections, including HTML, code, media, and plugin blocks.' },
  'docforge.content.table.r.3': { zh: '文档翻译、系统翻译和插件运行时翻译。', en: 'Document translations, system strings, and plugin runtime i18n.' },
  'docforge.content.table.r.4': { zh: '官方插件和私有插件同步后的运行配置。', en: 'Runtime configuration synced from official and private plugin manifests.' },
  'docforge.admin.p.0': { zh: '后台围绕“文档 -> 章节 -> 内容块 -> 翻译/媒体”的流程设计，适合持续维护项目文档。', en: 'The admin console follows a document -> section -> block -> translation/media workflow for continuously maintained project documentation.' },
  'docforge.admin.li.0': { zh: '在文档管理中创建或编辑文档元信息。', en: 'Create or edit document metadata in document management.' },
  'docforge.admin.li.1': { zh: '使用章节编辑器维护目录、分组和子章节。', en: 'Use the section editor to maintain the table of contents, groups, and child sections.' },
  'docforge.admin.li.2': { zh: '在编辑器中写 HTML/CSS/JS、代码块、媒体块或插件块。', en: 'Write HTML/CSS/JS, code blocks, media blocks, or plugin blocks in the editor.' },
  'docforge.admin.li.3': { zh: '翻译页扫描 {{t:key}} 并维护中英文内容。', en: 'The translation page scans {{t:key}} references and maintains Chinese and English copy.' },
  'docforge.admin.li.4': { zh: '发布前用预览页检查目录、样式、媒体和插件运行效果。', en: 'Before publishing, use preview pages to verify the TOC, styles, media, and plugin behavior.' },
  'docforge.admin.p.1': { zh: '章节 CSS/JS 是文档级增强能力，适合控制当前文档的展示和交互；通用能力应沉淀为插件。', en: 'Section CSS/JS is a document-level enhancement for presentation and interaction; reusable behavior should be promoted into a plugin.' },
  'docforge.plugins.p.0': { zh: '插件 manifest 可以提供 HTML 模板、CSS、JS、标签 schema、配置和 i18n。官方插件通过 npm run plugins:sync 同步到 D1。', en: 'Plugin manifests can provide HTML templates, CSS, JS, tag schemas, config, and i18n. Official plugins sync to D1 through npm run plugins:sync.' },
  'docforge.plugins.p.1': { zh: '媒体查看器和页面搜索现在作为官方内置插件维护在 Plugins/ 中，后续项目自带插件也可以按同样方式加入。', en: 'Media Viewer and Page Search are now official built-in plugins under Plugins/, and future project-provided plugins can follow the same pattern.' },
  'docforge.plugins.table.h.0': { zh: '能力', en: 'Capability' },
  'docforge.plugins.table.h.1': { zh: '说明', en: 'Description' },
  'docforge.plugins.table.r.0': { zh: '给前台文档注入样式和交互脚本。', en: 'Inject styles and interaction scripts into public documents.' },
  'docforge.plugins.table.r.1': { zh: '声明原始 HTML 模板，让自定义标签保留可读结构。', en: 'Declare raw HTML templates so custom tags keep readable source structure.' },
  'docforge.plugins.table.r.2': { zh: '把自定义标签渲染成最终 DOM，适合 Element 风格封装。', en: 'Render custom tags into final DOM, suitable for Element-style component wrappers.' },
  'docforge.plugins.table.r.3': { zh: '处理编辑器中的插件内容块。', en: 'Render custom plugin blocks from the editor.' },
  'docforge.plugins.table.r.4': { zh: '插件自己的中英文运行时文本。', en: 'Chinese and English runtime strings owned by the plugin.' },
  'docforge.private.p.0': { zh: '开源仓库只提交官方插件和项目自带插件。私有、不准备开源的插件放在 PrivatePlugins/，本地可同步使用，但默认不进入 git。', en: 'The open-source repository commits official and project-provided plugins only. Private plugins that should not be open-sourced live in PrivatePlugins/, can be synced locally, and are ignored by git by default.' },
  'docforge.private.p.1': { zh: '这样可以保持公开仓库干净，同时保留本地商业插件或实验插件的开发空间。', en: 'This keeps the public repository clean while preserving local space for commercial or experimental plugins.' },
  'docforge.deploy.p.0': { zh: '部署前先同步 secrets，再迁移远端 D1，最后部署 Worker。', en: 'Before deployment, push secrets, migrate remote D1, then deploy the Worker.' },
  'docforge.deploy.p.1': { zh: '.dev.vars、.env、.env.local、.wrangler/ 和 PrivatePlugins/ 默认不上传 git。', en: '.dev.vars, .env, .env.local, .wrangler/, and PrivatePlugins/ are ignored by git by default.' },
  'docforge.deploy.p.2': { zh: '本地开发先初始化 D1，再启动 dev server。提交前至少运行类型检查，涉及数据库结构时同步新增 migrations 文件。', en: 'For local development, initialize D1 before starting the dev server. Before committing, run typecheck at minimum and add migrations whenever the database schema changes.' },
  'docforge.visibility.p.0': { zh: '文档有两个独立开关：启用访问控制 /slug 是否可打开；首页展示控制是否进入根路径文档列表。', en: 'Documents have two independent switches: enabled controls whether /slug is accessible; home listing controls whether it appears on the root page.' },
  'docforge.visibility.p.1': { zh: '这样可以让文档可直接访问，但不出现在 http://127.0.0.1:8787/ 首页列表。', en: 'This allows a document to remain directly accessible without appearing on http://127.0.0.1:8787/.' },
  'docforge.visibility.table.h.0': { zh: '状态', en: 'State' },
  'docforge.visibility.table.h.1': { zh: '可直接访问', en: 'Direct Access' },
  'docforge.visibility.table.h.2': { zh: '首页列表', en: 'Home List' },
  'docforge.visibility.table.r.0a': { zh: '禁用', en: 'Disabled' },
  'docforge.visibility.table.r.0b': { zh: '否', en: 'No' },
  'docforge.visibility.table.r.0c': { zh: '否', en: 'No' },
  'docforge.visibility.table.r.1a': { zh: '启用，不进首页', en: 'Enabled, hidden from home' },
  'docforge.visibility.table.r.1b': { zh: '是', en: 'Yes' },
  'docforge.visibility.table.r.1c': { zh: '否', en: 'No' },
  'docforge.visibility.table.r.2a': { zh: '启用，首页展示', en: 'Enabled and listed' },
  'docforge.visibility.table.r.2b': { zh: '是', en: 'Yes' },
  'docforge.visibility.table.r.2c': { zh: '是', en: 'Yes' },
};

async function main() {
  await login();
  const all = await request('GET', '/api/admin/plugins');
  if (!all.ok) throw new Error('Failed to load plugins');
  let doc = all.data.find(p => p.slug === 'docforge');
  if (!doc) {
    const created = await request('POST', '/api/admin/plugins', {
      slug: 'docforge',
      name: 'DocForge',
      version: '1.0.0',
      compatibility: 'Cloudflare Workers',
      description: 'Open-source documentation CMS for plugin and project docs.',
      badgeTags: JSON.stringify(['Workers', 'D1', 'R2', 'Plugins']),
      sortOrder: -100,
      enabled: true,
      listed: true,
    });
    if (!created.ok) throw new Error(`Create failed: ${JSON.stringify(created.data)}`);
    doc = created.data;
  } else {
    await request('PUT', `/api/admin/plugins/${doc.id}`, {
      name: 'DocForge',
      version: '1.0.0',
      compatibility: 'Cloudflare Workers',
      description: 'Open-source documentation CMS for plugin and project docs.',
      badgeTags: JSON.stringify(['Workers', 'D1', 'R2', 'Plugins']),
      sortOrder: -100,
      enabled: true,
      listed: true,
    });
  }

  const existingSections = await request('GET', `/api/admin/plugins/${doc.id}/sections`);
  const bySlug = new Map((existingSections.data || []).map(s => [s.slug, s]));
  for (let i = 0; i < sections.length; i++) {
    const secDef = sections[i];
    let sec = bySlug.get(secDef.slug);
    if (!sec) {
      const created = await request('POST', '/api/admin/sections', {
        pluginId: doc.id,
        titleZh: secDef.titleZh,
        titleEn: secDef.titleEn,
        slug: secDef.slug,
        sortOrder: i,
      });
      if (!created.ok) throw new Error(`Create section ${secDef.slug} failed`);
      sec = created.data;
    } else {
      await request('PUT', `/api/admin/sections/${sec.id}`, {
        titleZh: secDef.titleZh,
        titleEn: secDef.titleEn,
        slug: secDef.slug,
        sortOrder: i,
      });
    }
    await request('PUT', `/api/admin/sections/${sec.id}/blocks-bulk`, { blocks: [html(secDef.body)] });
  }

  for (const [key, locales] of Object.entries(translations)) {
    for (const [locale, value] of Object.entries(locales)) {
      await request('PUT', '/api/admin/translations', { pluginId: doc.id, key, locale, value });
    }
  }
  console.log(`Seeded DocForge documentation: ${BASE_URL}/docforge`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

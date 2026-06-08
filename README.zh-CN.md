<div align="center">

# ⚒️ DocForge

**面向插件、项目和产品文档的开源文档 CMS。**  
后台编辑、i18n、媒体、插件、统计和 Cloudflare 原生部署，一套小型 Worker 应用搞定。

[English](./README.md)

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![D1](https://img.shields.io/badge/D1-SQLite-2F81F7?style=for-the-badge)
![R2](https://img.shields.io/badge/R2-Media-22C55E?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-Router-E36002?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge)

</div>

---

## ✨ 为什么是 DocForge？

| 能力 | 说明 |
| --- | --- |
| 🧩 **插件文档** | 按 slug 管理多份文档，支持图标、版本、兼容性、标签、可见性、自定义 CSS/JS。 |
| 🌍 **多语言优先** | 文档内容、站点 UI、插件运行时文案共用同一套翻译流程。 |
| 🖼️ **媒体原生** | 可以直接写 `<img src="{{img:key}}">` / `<video src="{{video:key}}">`，也能装更强的媒体组件。 |
| 🧱 **插件运行时** | 插件可提供可选 HTML 模板、自定义标签、CSS、JS、配置和可复用文档组件。 |
| ☁️ **Cloudflare 原生** | Workers 运行，D1 存内容，R2 存媒体，不需要维护独立服务器。 |
| 📊 **内置统计** | 访问事件写入 D1，用于轻量仪表盘统计和插件生态反馈。 |

---

## 🚀 快速部署

第一次部署前先创建 Cloudflare 资源，并把真实 D1 `database_id` 写入 `wrangler.toml`：

```bash
npx wrangler d1 create docforge-db
npx wrangler r2 bucket create docforge-media
```

创建本地部署变量：

```powershell
Copy-Item .dev.vars.example .dev.vars
```

编辑 `.dev.vars`，至少改掉 `ADMIN_PASSWORD` 和 `JWT_SECRET`，然后部署：

```bash
npm install
npm run deploy:local
```

`deploy:local` 会执行标准生产流程：

```bash
npm run secrets:push
npm run db:migrate:remote
wrangler deploy
```

---

## 🧑‍💻 本地开发

```powershell
Copy-Item .dev.vars.example .dev.vars
```

```bash
npm install
npm run db:init
npm run dev
```

访问 `http://127.0.0.1:8787/admin`。

仓库默认账号是 `admin` / `admin123`。本地请在 `.dev.vars` 修改自己的账号密码；该文件不会上传 git。

---

## 🔐 变量与 Secrets

DocForge 把可提交配置和私有值分开：

| 文件 / 位置 | Git 状态 | 用途 |
| --- | --- | --- |
| `wrangler.toml` | ✅ 提交 | 安全默认值、绑定和资源名称。 |
| `.dev.vars.example` | ✅ 提交 | 本地变量模板。 |
| `.dev.vars` | 🚫 忽略 | 本地账号密码，以及要推送到 Cloudflare Secrets 的私有值。 |
| Cloudflare Secrets | 仓库外 | 部署时读取的私有变量。 |

`wrangler.toml` 里的安全默认值：

```toml
[vars]
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
JWT_SECRET = "change-me-in-production"
SITE_TITLE = "DocForge"
SITE_DOMAIN = ""
```

私有值写在 `.dev.vars`：

```ini
ADMIN_USERNAME=my-admin
ADMIN_PASSWORD=my-strong-password
JWT_SECRET=my-random-jwt-secret
SITE_TITLE=DocForge
SITE_DOMAIN=https://example.com
AI_TRANSLATE_API_KEY=sk-...
```

更新线上 Secrets：

```bash
# 只在第一次需要：
cp .dev.vars.example .dev.vars

# 本地改完 .dev.vars 后推送：
npm run secrets:push
```

代码、迁移、绑定或非 secret Worker 配置变化时，再执行 `npm run deploy`。

默认不会上传 git 的本地文件和目录：

```text
.dev.vars
.env
.env.local
.wrangler/
PrivatePlugins/
scripts/
```

---

## 🏗️ 项目架构

```text
Browser / Admin
      │
      ▼
Cloudflare Worker  ── Hono routes: admin, docs, api, media
      │
      ├── D1  ─────── docs, sections, blocks, translations, plugins, settings, analytics
      ├── R2  ─────── uploaded media assets
      └── SSR ─────── TypeScript templates for public docs and admin pages
```

| 层 | 职责 |
| --- | --- |
| ⚡ **Worker** | Hono 应用入口，负责后台页面、前台文档、API 和媒体访问。 |
| 🗃️ **D1** | 保存文档、章节、内容块、翻译、插件、设置、管理员和访问统计。 |
| 🖼️ **R2** | 保存上传的图片、视频、GIF、WebP 等媒体文件。 |
| 🧾 **SSR Templates** | 前台和后台页面由 TypeScript 模板渲染。 |
| 🧩 **Plugin Runtime** | 插件可注入 HTML 模板、CSS、JS、自定义标签和自定义渲染器。 |
| 🌍 **i18n System** | 系统 UI、文档内容和插件文案都存储在翻译表。 |

---

## 🖼️ 媒体用法

`{{img:key}}` 和 `{{video:key}}` 是 URL token。需要完全控制属性和样式时，直接写普通 HTML：

```html
<img src="{{img:hero-screenshot}}" alt="" loading="lazy" />
<video src="{{video:demo-clip}}" controls></video>
```

需要更强展示能力时，安装媒体插件：

```html
<media-image key="hero-screenshot" fit="cover" caption="Main UI" lightbox="true"></media-image>
<media-gallery keys="shot-1 shot-2 shot-3" mode="scroll" ratio="16/9"></media-gallery>
<media-video key="demo-clip" poster="video-poster" controls="true"></media-video>
```

组件层是可选增强。普通 `<img>` 和 `<video>` 写法会继续保留。

---

## 🔌 插件系统

插件是存储在 `extensions` 表里的运行时扩展。插件可以只写 CSS、只写 JS，也可以 HTML + CSS + JS 联动。

### 🧪 创建或安装

1. 打开 `/admin/extensions`。
2. 上传 manifest JSON、从 manifest URL 加载，或从内置模板开始。
3. 编辑 HTML 模板、CSS、JS、自定义标签、配置和 i18n 文案。
4. 确认效果后启用插件。

### 🧱 最小组件模板

```html
<template data-tag="callout-box">
  <aside class="callout-box" data-title="{{attr:title}}">
    <strong>{{attr:title}}</strong>
    <div class="callout-body">{{slot}}</div>
  </aside>
</template>
```

```js
DocForge.register({
  id: 'callout-box',
  onLoad() {
    document.querySelectorAll('.callout-box').forEach((el) => {
      el.classList.add('is-ready');
    });
  },
});
```

在文档里使用：

```html
<callout-box title="{{t:callout.title}}">
  <img src="{{img:hero-screenshot}}" alt="" loading="lazy" />
</callout-box>
```

模板占位符：

| 占位符 | 含义 |
| --- | --- |
| `{{slot}}` | 自定义标签原始内部 HTML。 |
| `{{attr:name}}` | 读取自定义标签上的属性。 |

### 📦 官方插件与私有插件

| 目录 | Git 状态 | 用途 |
| --- | --- | --- |
| `Plugins/` | ✅ 提交 | 可以公开发布的官方插件或项目自带插件。 |
| `PrivatePlugins/` | 🚫 忽略 | 本地、私有、商业或客户项目专用插件。 |

```bash
mkdir Plugins
mkdir PrivatePlugins
```

插件卡片提供：

- 🔗 **分享**：manifest endpoint 公开时复制安装链接。
- ⬇️ **下载**：导出当前 manifest JSON，方便私有保存。

同步官方插件到 D1：

```bash
npm run plugins:sync          # 本地 D1
npm run plugins:sync:remote   # Cloudflare D1
```

---

## 🗂️ 项目结构

```text
├── migrations/              # D1 SQL 迁移
├── src/
│   ├── db/                  # Drizzle schema 和数据库初始化
│   ├── routes/              # Hono 路由：admin、api、docs、media
│   ├── services/            # auth、settings、i18n、extensions
│   ├── templates/           # 后台、前台、插件页面模板
│   ├── index.ts             # Worker 入口
│   └── types.ts             # App 类型
├── tools/
│   ├── migrate-d1.mjs       # 本地/远程 D1 迁移脚本
│   └── push-dev-vars-secrets.mjs
├── Plugins/                 # 可发布的项目自带插件 manifest
├── PrivatePlugins/          # 私有本地插件 manifest，不进 git
├── .dev.vars.example        # 可提交的本地变量模板
├── wrangler.toml            # Cloudflare 配置和安全默认值
├── package.json             # npm scripts
└── drizzle.config.ts        # Drizzle 配置
```

---

## 🧬 数据库结构

| 表 | 用途 |
| --- | --- |
| `plugins` | 文档站点：slug、名称、版本、兼容性、图标、标签、发布状态、自定义 CSS/JS。 |
| `sections` | 文档章节树，通过 `parent_id` 支持多级章节。 |
| `content_blocks` | HTML、代码、文本、图片、视频和插件内容块，存为 JSON。 |
| `media` | R2 媒体索引，以及 `{{img:key}}` / `{{video:key}}` 占位符映射。 |
| `translations` | 翻译表，按 `plugin_id + key + locale` 存储。 |
| `extensions` | 运行时插件 manifest，包含 HTML 模板、CSS、JS、标签、配置和 i18n。 |
| `site_settings` | 站点级标题、图标、页脚、自定义 CSS、Head HTML。 |
| `admins` | 后台管理员账号和密码哈希。 |
| `analytics_events` | 前台访问事件，包含文档、路径、IP、地区、UA 和时间。 |
| `schema_migrations` | 已执行 SQL 迁移记录。 |

---

## 🧰 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发服务器。 |
| `npm run db:init` | 执行本地 D1 迁移并同步官方插件。 |
| `npm run secrets:push` | 把 `.dev.vars` 同步到 Cloudflare Secrets。 |
| `npm run db:migrate:remote` | 执行远程 D1 迁移并同步官方插件。 |
| `npm run deploy` | 部署 Worker。 |
| `npm run deploy:local` | 同步 secrets、迁移远程 D1、部署 Worker。 |
| `npm run typecheck` | TypeScript 检查。 |

---

## 📄 License

MIT

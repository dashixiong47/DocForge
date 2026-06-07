# DocForge

轻量级文档管理系统：后台编辑、文档发布、媒体占位符、i18n 翻译、扩展分享和访问统计。基于 Cloudflare Workers、D1、R2。

[English](./README.md)

---

## 一键部署

第一次部署前先创建 Cloudflare 资源，并把 `wrangler.toml` 里的 `database_id` 改成真实 D1 ID：

```bash
npx wrangler d1 create docforge-db
npx wrangler r2 bucket create docforge-media
```

然后准备本地部署变量：

```powershell
Copy-Item .dev.vars.example .dev.vars
```

编辑 `.dev.vars`，至少改掉 `ADMIN_PASSWORD` 和 `JWT_SECRET`。之后一键同步变量、执行远程迁移并部署：

```bash
npm install
npm run deploy:local
```

`deploy:local` 会按顺序执行：

```bash
npm run secrets:push
npm run db:migrate:remote
wrangler deploy
```

---

## 本地运行

```powershell
Copy-Item .dev.vars.example .dev.vars
```

```bash
npm install
npm run db:init
npm run dev
```

访问 http://127.0.0.1:8787/admin。

git 默认账号是 `admin` / `admin123`。本地请在 `.dev.vars` 修改自己的账号密码，文件不会上传 git。

---

## 变量配置

提交到 git 的默认变量在 `wrangler.toml`：

```toml
[vars]
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
JWT_SECRET = "change-me-in-production"
SITE_TITLE = "DocForge"
SITE_DOMAIN = ""
```

本地和部署使用 `.dev.vars` 覆盖：

```ini
ADMIN_USERNAME=my-admin
ADMIN_PASSWORD=my-strong-password
JWT_SECRET=my-random-jwt-secret
SITE_TITLE=DocForge
SITE_DOMAIN=https://example.com
AI_TRANSLATE_API_KEY=sk-...
```

修改部署变量的流程：

```bash
# 1. 修改本地 .dev.vars
# 2. 同步到 Cloudflare Secrets
npm run secrets:push

# 3. 重新部署
npm run deploy
```

`.dev.vars`、`.env`、`.env.local`、`.wrangler/` 都不会上传 git。

---

## 项目架构

- **Cloudflare Worker**：Hono 应用入口，负责后台、前台文档、API、媒体访问。
- **D1**：保存文档、章节、内容块、翻译、扩展、设置、管理员和访问统计。
- **R2**：保存上传的图片、视频、GIF、WebP 等媒体文件。
- **SSR Templates**：后台和前台页面由 TypeScript 模板渲染。
- **Extension Runtime**：扩展可注入 CSS、JS、Head HTML，并提供自定义标签/块渲染能力。
- **i18n System**：系统文案、文档文案、扩展文案分别进入翻译表，可批量保存和 AI 翻译。

---

## 项目结构

```text
├── migrations/              # D1 SQL 迁移
├── src/
│   ├── db/                  # Drizzle schema 和数据库初始化
│   ├── routes/              # Hono 路由：admin、api、docs、media
│   ├── services/            # auth、settings、i18n、extensions
│   ├── templates/           # 后台、前台、扩展页面模板
│   ├── index.ts             # Worker 入口
│   └── types.ts             # App 类型
├── tools/
│   ├── migrate-d1.mjs       # 本地/远程 D1 迁移脚本
│   └── push-dev-vars-secrets.mjs
├── .dev.vars.example        # 可提交的本地变量模板
├── wrangler.toml            # Cloudflare 配置和安全默认值
├── package.json             # npm scripts
└── drizzle.config.ts        # Drizzle 配置
```

---

## 数据库结构

核心表：

- `plugins`：文档站点。包含 `slug`、`name`、`version`、`compatibility`、描述、图标、标签、发布状态、自定义 CSS/JS。
- `sections`：文档章节树。通过 `parent_id` 支持多级目录。
- `content_blocks`：章节内容块。HTML、代码、文本、图片、视频和扩展块都存为 JSON。
- `media`：媒体文件索引。`d2_key` 对应 R2 对象，`placeholder_key` 对应 `{{img:key}}` / `{{video:key}}`。
- `translations`：翻译表。按 `plugin_id + key + locale` 存储任意语言文案。
- `extensions`：扩展清单。保存扩展 CSS、JS、Head HTML、标签、配置和 i18n。
- `site_settings`：站点级设置，如标题、页脚、自定义 CSS、Head HTML。
- `admins`：后台管理员账号和密码哈希。
- `analytics_events`：前台访问事件，记录文档、路径、IP、地区、UA 和时间。
- `schema_migrations`：迁移脚本自动创建，用于记录已经执行过的 SQL 文件。

---

## 常用命令

```bash
npm run dev                # 本地开发
npm run db:init            # 执行本地 D1 迁移
npm run secrets:push       # 把 .dev.vars 同步到 Cloudflare Secrets
npm run db:migrate:remote  # 执行远程 D1 迁移
npm run deploy             # 部署 Worker
npm run deploy:local       # 同步变量 + 远程迁移 + 部署
npm run typecheck          # TypeScript 检查
```

---

## License

MIT

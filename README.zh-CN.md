# DocForge

🌐 轻量级文档管理系统 —— 暗色后台 + Ace 编辑器，章节管理、媒体文件、i18n 翻译。基于 Cloudflare Workers。

[English](./README.md)

---

## ✨ 功能

- **📁 文档管理** — 多文档支持，内联编辑，标签 Chip 组件，图标媒体选择器
- **✏️ Ace 编辑器** — 全屏 VSCode 风格，42 主题可选，Ctrl+S / Ctrl+Shift+F
- **🌲 章节树** — 左侧目录区，无限层级
- **🖼 媒体库** — 图片缩略图预览，分页 + 搜索，占位符 Key 绑定
- **🌐 i18n 翻译** — 原文/翻译语言切换，批量保存
- **🔐 JWT 认证** — 管理后台登录保护
- **📊 控制台** — 文档/章节/媒体数量概览

---

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| [Hono](https://hono.dev/) | Web 框架 |
| [Cloudflare Workers](https://workers.cloudflare.com/) | 运行时 |
| [D1](https://developers.cloudflare.com/d1/) | SQLite 数据库 |
| [R2](https://developers.cloudflare.com/r2/) | 对象存储（媒体文件） |
| [Drizzle ORM](https://orm.drizzle.team/) | 数据库 ORM |
| [Ace Editor](https://ace.c9.io/) | 代码编辑器 |

---

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库
npx wrangler d1 execute docforge-db --local --file=./migrations/0001_initial.sql
npx wrangler d1 execute docforge-db --local --file=./migrations/0002_translations.sql
npx wrangler d1 execute docforge-db --local --file=./migrations/0003_media_placeholder_key.sql

# 3. 启动开发服务器
npm run dev
```

访问 http://127.0.0.1:8787/admin ，默认账号 `admin` / `change-me`（可在 `wrangler.toml` 中修改）。

---

## 📁 项目结构

```
├── src/
│   ├── db/              # 数据库 Schema
│   ├── routes/          # 路由（admin、api、docs、media）
│   ├── services/        # 认证、设置等服务
│   ├── templates/       # HTML 模板（服务端渲染）
│   ├── index.ts         # 入口
│   └── types.ts         # 类型定义
├── migrations/          # D1 数据库迁移
├── wrangler.toml        # Cloudflare 配置
└── drizzle.config.ts    # Drizzle ORM 配置
```

---

## 🔧 部署

```bash
# 创建远程 D1 数据库
npx wrangler d1 create docforge-db

# 应用迁移
npx wrangler d1 execute docforge-db --remote --file=./migrations/0001_initial.sql
npx wrangler d1 execute docforge-db --remote --file=./migrations/0002_translations.sql
npx wrangler d1 execute docforge-db --remote --file=./migrations/0003_media_placeholder_key.sql

# 创建 R2 存储桶
npx wrangler r2 bucket create docforge-media

# 部署
npx wrangler deploy
```

> ⚠️ 部署前请修改 `wrangler.toml` 中的 `JWT_SECRET` 和 `ADMIN_PASSWORD` 为强密码。

---

## 📝 License

MIT

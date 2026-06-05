# DocForge

🌐 Lightweight documentation CMS — dark admin panel + Ace editor, section tree, media library, i18n translations. Built on Cloudflare Workers.

[中文文档](./README.zh-CN.md)

---

## ✨ Features

- **📁 Document Management** — Multi-doc support, inline editing, tag chip component, icon media picker
- **✏️ Ace Editor** — Full-screen VSCode-style, 42 built-in themes, Ctrl+S / Ctrl+Shift+F shortcuts
- **🌲 Section Tree** — Left sidebar directory, unlimited nesting
- **🖼 Media Library** — Image thumbnail previews, pagination + search, placeholder key binding
- **🌐 i18n Translations** — Source/translation language selector, batch save
- **🔐 JWT Auth** — Admin panel login protection
- **📊 Dashboard** — Doc/section/media stats overview

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| [Hono](https://hono.dev/) | Web Framework |
| [Cloudflare Workers](https://workers.cloudflare.com/) | Runtime |
| [D1](https://developers.cloudflare.com/d1/) | SQLite Database |
| [R2](https://developers.cloudflare.com/r2/) | Object Storage (media) |
| [Drizzle ORM](https://orm.drizzle.team/) | Database ORM |
| [Ace Editor](https://ace.c9.io/) | Code Editor |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Initialize database
npm run db:init

# 3. Start dev server
npm run dev
```

Open http://127.0.0.1:8787/admin — default credentials: `admin` / `change-me` (configure in `wrangler.toml`).

---

## 📁 Project Structure

```
├── src/
│   ├── db/              # Database schema
│   ├── routes/          # Route handlers (admin, api, docs, media)
│   ├── services/        # Auth, settings services
│   ├── templates/       # SSR HTML templates
│   ├── index.ts         # Entry point
│   └── types.ts         # Type definitions
├── migrations/          # D1 database migrations
├── wrangler.toml        # Cloudflare configuration
└── drizzle.config.ts    # Drizzle ORM config
```

---

## 🔧 Deploy

```bash
# Create remote D1 database
npx wrangler d1 create docforge-db

# Apply migrations
npx wrangler d1 execute docforge-db --remote --file=./migrations/0001_initial.sql
npx wrangler d1 execute docforge-db --remote --file=./migrations/0002_translations.sql
npx wrangler d1 execute docforge-db --remote --file=./migrations/0003_media_placeholder_key.sql

# Create R2 bucket
npx wrangler r2 bucket create docforge-media

# Deploy
npx wrangler deploy
```

> ⚠️ Change `JWT_SECRET` and `ADMIN_PASSWORD` in `wrangler.toml` to strong values before deploying.

---

## 📝 License

MIT

# DocForge

Lightweight documentation CMS with admin editing, published docs, media placeholders, i18n translations, extension sharing, and visit analytics. Built on Cloudflare Workers, D1, and R2.

[中文文档](./README.zh-CN.md)

---

## One-Command Deploy

Create Cloudflare resources first, then update `database_id` in `wrangler.toml` with the real D1 database ID:

```bash
npx wrangler d1 create docforge-db
npx wrangler r2 bucket create docforge-media
```

Create local deploy variables:

```powershell
Copy-Item .dev.vars.example .dev.vars
```

Edit `.dev.vars`, especially `ADMIN_PASSWORD` and `JWT_SECRET`. Then sync variables, run remote migrations, and deploy:

```bash
npm install
npm run deploy:local
```

`deploy:local` runs:

```bash
npm run secrets:push
npm run db:migrate:remote
wrangler deploy
```

---

## Local Development

```powershell
Copy-Item .dev.vars.example .dev.vars
```

```bash
npm install
npm run db:init
npm run dev
```

Open http://127.0.0.1:8787/admin.

Committed defaults are `admin` / `admin123`. Change your local credentials in `.dev.vars`; that file is ignored by git.

---

## Variables

Committed defaults live in `wrangler.toml`:

```toml
[vars]
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
JWT_SECRET = "change-me-in-production"
SITE_TITLE = "DocForge"
SITE_DOMAIN = ""
```

Use `.dev.vars` for local and deploy-time overrides:

```ini
ADMIN_USERNAME=my-admin
ADMIN_PASSWORD=my-strong-password
JWT_SECRET=my-random-jwt-secret
SITE_TITLE=DocForge
SITE_DOMAIN=https://example.com
AI_TRANSLATE_API_KEY=sk-...
```

To change deployed variables:

```bash
# 1. Edit local .dev.vars
# 2. Sync to Cloudflare Secrets
npm run secrets:push

# 3. Deploy again
npm run deploy
```

`.dev.vars`, `.env`, `.env.local`, and `.wrangler/` are ignored by git.

---

## Architecture

- **Cloudflare Worker**: Hono application entry for admin pages, public docs, API routes, and media access.
- **D1**: stores docs, sections, content blocks, translations, extensions, settings, admins, and analytics.
- **R2**: stores uploaded images, videos, GIFs, WebP files, and other media.
- **SSR Templates**: admin and public pages are rendered from TypeScript templates.
- **Extension Runtime**: extensions can inject CSS, JS, Head HTML, and custom renderers.
- **i18n System**: system UI, document content, and extension strings are stored in translations and can use batch or AI translation.

---

## Project Structure

```text
├── migrations/              # D1 SQL migrations
├── src/
│   ├── db/                  # Drizzle schema and DB bootstrap
│   ├── routes/              # Hono routes: admin, api, docs, media
│   ├── services/            # auth, settings, i18n, extensions
│   ├── templates/           # admin, public, and extension templates
│   ├── index.ts             # Worker entry
│   └── types.ts             # App types
├── tools/
│   ├── migrate-d1.mjs       # local/remote D1 migration runner
│   └── push-dev-vars-secrets.mjs
├── .dev.vars.example        # committed local variable template
├── wrangler.toml            # Cloudflare config and safe defaults
├── package.json             # npm scripts
└── drizzle.config.ts        # Drizzle config
```

---

## Database Schema

Core tables:

- `plugins`: published documentation sites. Stores `slug`, `name`, `version`, `compatibility`, description, icon, tags, publish status, custom CSS, and custom JS.
- `sections`: documentation tree. `parent_id` supports nested sections.
- `content_blocks`: section content blocks. HTML, code, text, image, video, and extension blocks are stored as JSON.
- `media`: media index. `d2_key` maps to R2 objects, and `placeholder_key` maps to `{{img:key}}` / `{{video:key}}`.
- `translations`: i18n store keyed by `plugin_id + key + locale`.
- `extensions`: extension manifests with CSS, JS, Head HTML, tags, config, and i18n.
- `site_settings`: site-level title, footer, custom CSS, and Head HTML.
- `admins`: admin username and password hash.
- `analytics_events`: public doc visits with doc, path, IP, country, UA, and timestamp.
- `schema_migrations`: created by the migration runner to track applied SQL files.

---

## Commands

```bash
npm run dev                # local development
npm run db:init            # run local D1 migrations
npm run secrets:push       # sync .dev.vars to Cloudflare Secrets
npm run db:migrate:remote  # run remote D1 migrations
npm run deploy             # deploy Worker
npm run deploy:local       # sync variables + remote migrations + deploy
npm run typecheck          # TypeScript check
```

---

## License

MIT

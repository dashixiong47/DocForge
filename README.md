<div align="center">

# ⚒️ DocForge

**Open documentation CMS for plugins, projects, and product docs.**  
Admin editing, i18n, media, plugins, analytics, and Cloudflare-native deployment in one small Worker app.

[简体中文](./README.zh-CN.md)

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![D1](https://img.shields.io/badge/D1-SQLite-2F81F7?style=for-the-badge)
![R2](https://img.shields.io/badge/R2-Media-22C55E?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-Router-E36002?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge)

</div>

---

## ✨ Why DocForge?

| Area | What you get |
| --- | --- |
| 🧩 **Plugin docs** | Manage multiple docs by slug, icon, version, compatibility, tags, visibility, custom CSS, and custom JS. |
| 🌍 **Localization first** | Document content, site UI, and plugin runtime strings share one translation workflow. |
| 🖼️ **Media-native writing** | Use plain `<img src="{{img:key}}">` / `<video src="{{video:key}}">`, or install richer media components. |
| 🧱 **Plugin runtime** | Add optional HTML templates, custom tags, CSS, JS, config, and reusable documentation widgets. |
| ☁️ **Cloudflare-native** | Workers for runtime, D1 for content, R2 for media. No separate server to maintain. |
| 📊 **Built-in analytics** | Visit events are stored in D1 for lightweight dashboard metrics and plugin ecosystem feedback. |

---

## 🚀 Quick Deploy

Create Cloudflare resources first, then copy the real D1 `database_id` into `wrangler.toml`:

```bash
npx wrangler d1 create docforge-db
npx wrangler r2 bucket create docforge-media
```

Create local deploy variables:

```powershell
Copy-Item .dev.vars.example .dev.vars
```

Edit `.dev.vars` and set your own `ADMIN_USERNAME` and `ADMIN_PASSWORD`. Leave `JWT_SECRET` empty if you want it generated automatically. Then deploy:

```bash
npm install
npm run deploy:local
```

`deploy:local` runs the production sequence:

```bash
npm run secrets:push
npm run db:migrate:remote
wrangler deploy
```

---

## 🧑‍💻 Local Development

```powershell
Copy-Item .dev.vars.example .dev.vars
```

```bash
npm install
npm run db:init
npm run dev
```

Open `http://127.0.0.1:8787/admin`.

Set local credentials in `.dev.vars`; this file is ignored by git. `JWT_SECRET` is generated automatically by `npm run secrets:push` when it is empty.

---

## 🔐 Variables & Secrets

DocForge keeps public configuration and private values separate:

| File / place | Git status | Purpose |
| --- | --- | --- |
| `wrangler.toml` | ✅ committed | Public defaults, bindings, resource names. No credentials. |
| `.dev.vars.example` | ✅ committed | Local variable template. |
| `.dev.vars` | 🚫 ignored | Local credentials and values pushed to Cloudflare Secrets. |
| Cloudflare Secrets | outside git | Deployment-time private values. |

Public defaults in `wrangler.toml`:

```toml
[vars]
SITE_TITLE = "DocForge"
SITE_DOMAIN = ""
```

Private values belong in `.dev.vars`. `JWT_SECRET` can be left blank; `npm run secrets:push` will generate a strong value and write it back to `.dev.vars`.

```ini
ADMIN_USERNAME=my-admin
ADMIN_PASSWORD=my-strong-password
JWT_SECRET=
SITE_TITLE=DocForge
SITE_DOMAIN=https://example.com
AI_TRANSLATE_API_KEY=sk-...
```

Update deployed secrets:

```bash
# First time only:
cp .dev.vars.example .dev.vars

# Edit ADMIN_USERNAME / ADMIN_PASSWORD locally, then push secrets.
# JWT_SECRET is generated automatically when empty:
npm run secrets:push
```

Run `npm run deploy` again when code, migrations, bindings, or non-secret Worker configuration changed.

Ignored local files and folders:

```text
.dev.vars
.env
.env.local
.wrangler/
PrivatePlugins/
scripts/
```

---

## 🏗️ Architecture

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

| Layer | Role |
| --- | --- |
| ⚡ **Worker** | Hono app entry for admin pages, public docs, APIs, and media access. |
| 🗃️ **D1** | Stores docs, sections, content blocks, translations, plugins, settings, admins, and analytics. |
| 🖼️ **R2** | Stores uploaded images, videos, GIFs, WebP files, and other media. |
| 🧾 **SSR Templates** | Public and admin pages are rendered from TypeScript templates. |
| 🧩 **Plugin Runtime** | Plugins can inject HTML templates, CSS, JS, custom tags, and custom renderers. |
| 🌍 **i18n System** | System UI, document content, and plugin strings live in translation rows. |

---

## 🖼️ Media Usage

`{{img:key}}` and `{{video:key}}` are URL tokens. Use them inside normal HTML when you want full control:

```html
<img src="{{img:hero-screenshot}}" alt="" loading="lazy" />
<video src="{{video:demo-clip}}" controls></video>
```

Install a media plugin when you want richer presentation:

```html
<media-image key="hero-screenshot" fit="cover" caption="Main UI" lightbox="true"></media-image>
<media-gallery keys="shot-1 shot-2 shot-3" mode="scroll" ratio="16/9"></media-gallery>
<media-video key="demo-clip" poster="video-poster" controls="true"></media-video>
```

The component layer is optional. Plain `<img>` and `<video>` remain supported.

---

## 🔌 Plugin System

Plugins are runtime add-ons stored in the `extensions` table. A plugin can be CSS-only, JS-only, or use HTML + CSS + JS together.

### 🧪 Create or install

1. Open `/admin/extensions`.
2. Upload a manifest JSON file, load a manifest URL, or start from a built-in template.
3. Edit HTML templates, CSS, JS, custom tags, config, and i18n strings.
4. Enable the plugin when it is ready.

### 🧱 Minimal component template

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

Use it in a document:

```html
<callout-box title="{{t:callout.title}}">
  <img src="{{img:hero-screenshot}}" alt="" loading="lazy" />
</callout-box>
```

Template placeholders:

| Placeholder | Meaning |
| --- | --- |
| `{{slot}}` | Original inner HTML of the custom tag. |
| `{{attr:name}}` | Attribute value from the custom tag. |

### 📦 Official vs private plugins

| Folder | Git status | Use case |
| --- | --- | --- |
| `Plugins/` | ✅ committed | Official or project-provided plugins safe to publish. |
| `PrivatePlugins/` | 🚫 ignored | Local, private, commercial, or client-specific plugins. |

```bash
mkdir Plugins
mkdir PrivatePlugins
```

Plugin cards include:

- 🔗 **Share**: copy an install URL when the manifest endpoint is public.
- ⬇️ **Download**: export the current manifest JSON for private storage.

Sync official plugins into D1:

```bash
npm run plugins:sync          # local D1
npm run plugins:sync:remote   # Cloudflare D1
```

---

## 🗂️ Project Structure

```text
├── migrations/              # D1 SQL migrations
├── src/
│   ├── db/                  # Drizzle schema and DB bootstrap
│   ├── routes/              # Hono routes: admin, api, docs, media
│   ├── services/            # auth, settings, i18n, extensions
│   ├── templates/           # admin, public, and plugin templates
│   ├── index.ts             # Worker entry
│   └── types.ts             # App types
├── tools/
│   ├── migrate-d1.mjs       # local/remote D1 migration runner
│   └── push-dev-vars-secrets.mjs
├── Plugins/                 # publishable project-provided plugin manifests
├── PrivatePlugins/          # private local plugin manifests, ignored by git
├── .dev.vars.example        # committed local variable template
├── wrangler.toml            # Cloudflare config and safe defaults
├── package.json             # npm scripts
└── drizzle.config.ts        # Drizzle config
```

---

## 🧬 Database Schema

| Table | Purpose |
| --- | --- |
| `plugins` | Documentation sites: slug, name, version, compatibility, icon, tags, status, custom CSS/JS. |
| `sections` | Documentation tree with nested sections through `parent_id`. |
| `content_blocks` | HTML, code, text, image, video, and plugin blocks stored as JSON. |
| `media` | R2 media index and `{{img:key}}` / `{{video:key}}` placeholder mapping. |
| `translations` | i18n store keyed by `plugin_id + key + locale`. |
| `extensions` | Runtime plugin manifests with HTML templates, CSS, JS, tags, config, and i18n. |
| `site_settings` | Site-level title, icon, footer, custom CSS, and Head HTML. |
| `admins` | Admin username and password hash. |
| `analytics_events` | Public doc visits with doc, path, IP, country, UA, and timestamp. |
| `schema_migrations` | Applied SQL migration tracking. |

---

## 🧰 Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Local development server. |
| `npm run db:init` | Run local D1 migrations and sync official plugins. |
| `npm run secrets:push` | Sync `.dev.vars` values to Cloudflare Secrets. |
| `npm run db:migrate:remote` | Run remote D1 migrations and sync official plugins. |
| `npm run deploy` | Deploy Worker. |
| `npm run deploy:local` | Sync secrets, migrate remote D1, deploy Worker. |
| `npm run typecheck` | TypeScript check. |

---

## 📄 License

MIT

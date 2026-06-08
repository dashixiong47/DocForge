# DocForge

Lightweight documentation CMS with admin editing, published docs, media placeholders, i18n translations, plugin sharing, and visit analytics. Built on Cloudflare Workers, D1, and R2.

[中文文档](./README.zh-CN.md)

---

## Features

- **Editor-first workflow**: manage docs, sections, HTML/CSS/JS, translations, and media from one admin UI.
- **Multilingual by design**: document content, system UI, and plugin strings share the same translation workflow.
- **Media-friendly docs**: media keys resolve to normal URLs, so authors can use plain `<img>` / `<video>` tags or richer media components.
- **Extensible runtime**: plugins can add optional HTML templates, custom tags, CSS, JS, and reusable documentation widgets.
- **Cloudflare-native deployment**: runs on Workers with D1 for data and R2 for media, without a separate server to maintain.

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

## Variables and Secrets

This repository keeps deployable configuration and private values separate:

- `wrangler.toml` is committed and should only contain safe defaults, bindings, and resource names.
- `.dev.vars.example` is committed as a template.
- `.dev.vars` is local only. Use it for development values and Cloudflare Secret values.
- Cloudflare Secrets are deployment state. They are pushed with `npm run secrets:push`; they are not stored in git.

Committed defaults live in `wrangler.toml`:

```toml
[vars]
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
JWT_SECRET = "change-me-in-production"
SITE_TITLE = "DocForge"
SITE_DOMAIN = ""
```

Create `.dev.vars` from the example and keep private values there:

```ini
ADMIN_USERNAME=my-admin
ADMIN_PASSWORD=my-strong-password
JWT_SECRET=my-random-jwt-secret
SITE_TITLE=DocForge
SITE_DOMAIN=https://example.com
AI_TRANSLATE_API_KEY=sk-...
```

Update deployed secrets:

```bash
# First time only:
cp .dev.vars.example .dev.vars

# Edit .dev.vars locally, then push secret values to Cloudflare:
npm run secrets:push
```

If only secret values changed, `secrets:push` is enough. Run `npm run deploy` again when code, migrations, bindings, or non-secret Worker configuration changed:

```bash
npm run deploy
```

Ignored local files and folders:

- `.dev.vars`
- `.env`
- `.env.local`
- `.wrangler/`
- `PrivatePlugins/`
- `scripts/`

---

## Architecture

- **Cloudflare Worker**: Hono application entry for admin pages, public docs, API routes, and media access.
- **D1**: stores docs, sections, content blocks, translations, plugins, settings, admins, and analytics.
- **R2**: stores uploaded images, videos, GIFs, WebP files, and other media.
- **SSR Templates**: admin and public pages are rendered from TypeScript templates.
- **Plugin Runtime**: plugins can provide optional HTML templates, CSS, JS, custom tags, and custom renderers.
- **i18n System**: system UI, document content, and plugin strings are stored in translations and can use batch or AI translation.

---

## Media Usage

`{{img:key}}` and `{{video:key}}` are URL tokens. Use them inside normal HTML when you want full control over attributes and styling:

```html
<img src="{{img:hero-screenshot}}" alt="" loading="lazy" />
<video src="{{video:demo-clip}}" controls></video>
```

For richer presentation, install a media plugin and use component tags:

```html
<media-image key="hero-screenshot" fit="cover" caption="Main UI" lightbox="true"></media-image>
<media-gallery keys="shot-1 shot-2 shot-3" mode="scroll" ratio="16/9"></media-gallery>
<media-video key="demo-clip" poster="video-poster" controls="true"></media-video>
```

The component layer is optional; plain `<img>` and `<video>` remain supported.

---

## Plugin Usage

Plugins are runtime add-ons stored in the `extensions` table. They can provide optional HTML templates, CSS, JS, custom tags, config, and their own i18n strings.

Install or create plugins from `/admin/extensions`:

1. Upload a manifest JSON file, load a manifest URL, or start from a built-in template.
2. Edit HTML templates, CSS, JS, custom tags, config, and translation strings.
3. Enable the plugin when it is ready.

Minimal widget extension HTML:

```html
<template data-tag="callout-box">
  <aside class="callout-box" data-title="{{attr:title}}">
    <strong>{{attr:title}}</strong>
    <div class="callout-body">{{slot}}</div>
  </aside>
</template>
```

Optional widget extension JS:

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

Usage in a document:

```html
<callout-box title="{{t:callout.title}}">
  <img src="{{img:hero-screenshot}}" alt="" loading="lazy" />
</callout-box>
```

Runtime content can still use normal placeholders such as `{{t:key}}`, `{{img:key}}`, and `{{video:key}}`. Plain HTML remains valid even when a component extension is not enabled.

HTML templates are optional. A plugin can be CSS-only, JS-only, or use HTML + CSS + JS together. Template placeholders:

- `{{slot}}`: original inner HTML of the custom tag.
- `{{attr:name}}`: an attribute from the custom tag.

Plugin cards include two export actions:

- **Share** copies an install URL for deployments where the manifest endpoint is public.
- **Download** exports the current manifest JSON so you can keep private plugins outside this repository.

Project-provided plugins that are safe to publish can live in `Plugins/`. Private or client-specific plugins should stay under `PrivatePlugins/`:

```bash
mkdir Plugins
mkdir PrivatePlugins
```

`Plugins/` is committed. `PrivatePlugins/` is ignored by git by default. Use `PrivatePlugins/` for local manifest backups or private plugin work that should not be published with the open-source project.

---

## Project Structure

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

## Database Schema

Core tables:

- `plugins`: published documentation sites. Stores `slug`, `name`, `version`, `compatibility`, description, icon, tags, publish status, custom CSS, and custom JS.
- `sections`: documentation tree. `parent_id` supports nested sections.
- `content_blocks`: section content blocks. HTML, code, text, image, video, and plugin blocks are stored as JSON.
- `media`: media index. `d2_key` maps to R2 objects, and `placeholder_key` maps to `{{img:key}}` / `{{video:key}}`.
- `translations`: i18n store keyed by `plugin_id + key + locale`.
- `extensions`: plugin manifests with optional HTML templates, CSS, JS, tags, config, and i18n.
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

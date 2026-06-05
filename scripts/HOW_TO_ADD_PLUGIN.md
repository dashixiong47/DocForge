## Adding a new plugin

### Prerequisites
- A `DOCUMENTATION.html` file for your UE5 plugin
- This project cloned locally with dependencies installed

### Files involved
```
scripts/import-content.ts    ← Update sectionSlugs + htmlPath
scripts/seed.sql              ← Add plugin + sections
scripts/content_seed.sql      ← Auto-generated from HTML
```

---

### Step 1: Register the plugin in seed.sql

Open `scripts/seed.sql`, append:

```sql
-- Add new plugin
DELETE FROM plugins WHERE slug = 'YourPlugin';
INSERT INTO plugins (slug, name, version, ue_version, description, badge_tags, sort_order, created_at, updated_at) VALUES
('YourPlugin', 'Your Plugin Name', '1.0.0', '5.3+', 'Short description.', '["Tag1","Tag2"]', 1, datetime('now'), datetime('now'));

-- Delete previous sections for this plugin
DELETE FROM content_blocks WHERE section_id IN (SELECT id FROM sections WHERE plugin_id = (SELECT id FROM plugins WHERE slug = 'YourPlugin'));
DELETE FROM sections WHERE plugin_id = (SELECT id FROM plugins WHERE slug = 'YourPlugin'));

-- Add sections (chapters/directories)
INSERT INTO sections (plugin_id, title_en, title_zh, slug, sort_order, created_at, updated_at) VALUES
((SELECT id FROM plugins WHERE slug = 'YourPlugin'), 'Overview', '概览', 'overview', 0, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'YourPlugin'), 'Getting Started', '快速开始', 'getting-started', 1, datetime('now'), datetime('now')),
-- ... add all sections you need
```

### Step 2: Update import-content.ts

Edit `scripts/import-content.ts`:

```typescript
// Change these two variables:
const sectionSlugs = [
  'overview', 'getting-started', 'api-reference', /* ... your sections */
];

const htmlPath = 'F:/path/to/YourPlugin/DOCUMENTATION.html';
```

### Step 3: Generate content SQL

```bash
npm run db:import
# → generates scripts/content_seed.sql
```

### Step 4: Apply all to database

```bash
npm run db:setup
```

This runs in order: init → seed → content (all idempotent).

### Step 5: Restart dev server

```bash
npm run dev
```

Visit `http://127.0.0.1:8787/YourPlugin` to see the docs.

---

### Content block types (for manual editing via Admin panel)

| Type | JSON format | Use case |
|------|-------------|----------|
| `html` | `{"html":"<div>...</div>"}` | Raw HTML (from DOCUMENTATION.html) |
| `text` | `{"textZh":"中文","textEn":"English"}` | Bilingual paragraph |
| `code` | `{"code":"...","language":"cpp"}` | Code block with syntax class |
| `table` | `{"headers":["A","B"],"rows":[["1","2"]]}` | Data table |
| `card` | `{"titleZh":"","titleEn":"","textZh":"","textEn":""}` | Single card |
| `cards` | `{"cards":[{...}]}` | Card grid |
| `callout` | `{"textZh":"","textEn":""}` | Highlighted tip/warning box |
| `code-tags` | `{"tags":["tag1","tag2"]}` | Inline code tag pills |
| `list` | `{"ordered":false,"items":[{"zh":"","en":""}]}` | Bullet/numbered list |
| `image` | `{"src":"https://...","alt":""}` | Image |

---

### Database tables

| Table | Purpose |
|-------|---------|
| `plugins` | Plugin registry (slug=URL path) |
| `sections` | Document chapters with sort_order, nested via parent_id |
| `content_blocks` | Content inside each section (type + JSON payload) |
| `media` | R2 file references |
| `site_settings` | Global theme/header/footer/CSS |

### Env vars (wrangler.toml)

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Random string for admin auth tokens |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `SITE_TITLE` | Default page title |
| `SITE_DOMAIN` | Production domain |

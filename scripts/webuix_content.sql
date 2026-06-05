-- WebUIX Plugin Documentation Content Seed
-- Fully idempotent — safe to run multiple times
-- Run: wrangler d1 execute ue5-docs --local --file=./scripts/webuix_content.sql
-- Requires: 0001 + 0002 migrations must be applied first

BEGIN TRANSACTION;

-- ══════════════════════════════════════════════════════
-- HELPERS: We use subqueries to reference IDs by slug
-- ══════════════════════════════════════════════════════

-- ── 1. Plugin ──────────────────────────────────────────
INSERT OR IGNORE INTO plugins (slug, name, version, ue_version, description, icon_url, badge_tags, sort_order, created_at, updated_at)
VALUES (
  'webuix', 'WebUIX', '0.2.0', '5.0+',
  'Unreal Engine 原生 HTML/CSS UI 插件 — 无浏览器、无 JavaScript、纯 C++ 渲染',
  'https://files.document-ue5.com/WebUIX/Icon128.png',
  '["Win64 / macOS / Linux","Android / iOS","Direct RHI","No JS Engine"]',
  0, datetime('now'), datetime('now')
);

-- ── 2. Category sections (parent_id = NULL) ────────────
-- Using INSERT ... SELECT with WHERE NOT EXISTS for idempotency

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'), NULL, '开始', 'Start', 'cat-start', 10, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='cat-start' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'), NULL, 'HTML/CSS 创作', 'Authoring', 'cat-authoring', 20, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='cat-authoring' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'), NULL, '数据与事件', 'Data & Events', 'cat-data-events', 30, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='cat-data-events' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'), NULL, '扩展元素', 'Extensions', 'cat-extensions', 40, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='cat-extensions' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'), NULL, '性能与管线', 'Performance', 'cat-performance', 50, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='cat-performance' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'), NULL, '调试', 'Debug', 'cat-debug', 60, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='cat-debug' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'), NULL, '参考', 'Reference', 'cat-reference', 70, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='cat-reference' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

-- ── 3. Child sections ──────────────────────────────────

-- Under: Start
INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-start' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '概览', 'Overview', 'overview', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='overview' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-start' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '快速开始', 'Quick Start', 'quick-start', 2, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='quick-start' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-start' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '编辑器工作流', 'Editor Workflow', 'editor-workflow', 3, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='editor-workflow' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

-- Under: Authoring
INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-authoring' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       'HTML/CSS 基础', 'Basics', 'html-css-basics', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='html-css-basics' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-authoring' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       'CSS 滤镜', 'CSS Filters', 'css-filters', 2, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='css-filters' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-authoring' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       'UI 音效', 'UI Sound', 'ui-sound', 3, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='ui-sound' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-authoring' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '动画与过渡', 'Animations', 'animations', 4, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='animations' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-authoring' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '自定义组件', 'Custom Components', 'custom-components', 5, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='custom-components' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

-- Under: Data & Events
INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-data-events' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '数据绑定与模板', 'Data Binding', 'data-binding', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='data-binding' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-data-events' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '事件桥', 'Event Bridge', 'event-bridge', 2, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='event-bridge' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

-- Under: Extensions
INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-extensions' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '动画监听', 'Animation Watch', 'ext-animation-watch', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='ext-animation-watch' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-extensions' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '拖拽系统', 'Drag System', 'ext-drag', 2, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='ext-drag' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-extensions' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '表单控件', 'Form Controls', 'ext-forms', 3, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='ext-forms' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-extensions' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '弹窗 / 提示', 'Modal / Tooltips', 'ext-modal', 4, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='ext-modal' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-extensions' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '密码输入', 'Password', 'ext-password', 5, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='ext-password' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

-- Under: Performance
INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-performance' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '渲染管线', 'Rendering Pipeline', 'perf-pipeline', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='perf-pipeline' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-performance' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       'Widget 组件池', 'Widget Pool', 'perf-pool', 2, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='perf-pool' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-performance' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '启动预热', 'Startup Warmup', 'perf-warmup', 3, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='perf-warmup' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-performance' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       'Cook 预处理', 'Cook Preprocess', 'perf-cook', 4, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='perf-cook' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

-- Under: Debug
INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-debug' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '调试控制台', 'Debug Console', 'inspector', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='inspector' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-debug' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '性能统计', 'Stats & Debug', 'debug-stats', 2, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='debug-stats' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

-- Under: Reference
INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-reference' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       'Blueprint API', 'Blueprint API', 'blueprint-api', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='blueprint-api' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-reference' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '参考速查', 'Reference Index', 'ref-index', 2, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='ref-index' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-reference' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '项目设置', 'Project Settings', 'proj-settings', 3, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='proj-settings' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

INSERT INTO sections (plugin_id, parent_id, title_zh, title_en, slug, sort_order, created_at, updated_at)
SELECT (SELECT id FROM plugins WHERE slug='webuix'),
       (SELECT id FROM sections WHERE slug='cat-reference' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
       '已知限制', 'Known Limitations', 'limitations', 4, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug='limitations' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix'));

-- ── 4. Translation rows for all section titles ─────────
-- INSERT OR REPLACE uses unique index (plugin_id, key, locale)

INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-start.title', 'zh', '开始', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-start.title', 'en', 'Start', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-authoring.title', 'zh', 'HTML/CSS 创作', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-authoring.title', 'en', 'Authoring', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-data-events.title', 'zh', '数据与事件', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-data-events.title', 'en', 'Data & Events', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-extensions.title', 'zh', '扩展元素', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-extensions.title', 'en', 'Extensions', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-performance.title', 'zh', '性能与管线', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-performance.title', 'en', 'Performance', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-debug.title', 'zh', '调试', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-debug.title', 'en', 'Debug', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-reference.title', 'zh', '参考', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.cat-reference.title', 'en', 'Reference', datetime('now'));

INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.overview.title', 'zh', '概览', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.overview.title', 'en', 'Overview', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.quick-start.title', 'zh', '快速开始', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.quick-start.title', 'en', 'Quick Start', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.editor-workflow.title', 'zh', '编辑器工作流', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.editor-workflow.title', 'en', 'Editor Workflow', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.html-css-basics.title', 'zh', 'HTML/CSS 基础', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.html-css-basics.title', 'en', 'Basics', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.css-filters.title', 'zh', 'CSS 滤镜', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.css-filters.title', 'en', 'CSS Filters', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ui-sound.title', 'zh', 'UI 音效', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ui-sound.title', 'en', 'UI Sound', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.animations.title', 'zh', '动画与过渡', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.animations.title', 'en', 'Animations', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.custom-components.title', 'zh', '自定义组件', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.custom-components.title', 'en', 'Custom Components', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.data-binding.title', 'zh', '数据绑定与模板', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.data-binding.title', 'en', 'Data Binding', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.event-bridge.title', 'zh', '事件桥', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.event-bridge.title', 'en', 'Event Bridge', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ext-animation-watch.title', 'zh', '动画监听', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ext-animation-watch.title', 'en', 'Animation Watch', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ext-drag.title', 'zh', '拖拽系统', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ext-drag.title', 'en', 'Drag System', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ext-forms.title', 'zh', '表单控件', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ext-forms.title', 'en', 'Form Controls', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ext-modal.title', 'zh', '弹窗 / 提示', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ext-modal.title', 'en', 'Modal / Tooltips', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ext-password.title', 'zh', '密码输入', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ext-password.title', 'en', 'Password', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.perf-pipeline.title', 'zh', '渲染管线', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.perf-pipeline.title', 'en', 'Rendering Pipeline', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.perf-pool.title', 'zh', 'Widget 组件池', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.perf-pool.title', 'en', 'Widget Pool', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.perf-warmup.title', 'zh', '启动预热', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.perf-warmup.title', 'en', 'Startup Warmup', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.perf-cook.title', 'zh', 'Cook 预处理', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.perf-cook.title', 'en', 'Cook Preprocess', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.inspector.title', 'zh', '调试控制台', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.inspector.title', 'en', 'Debug Console', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.debug-stats.title', 'zh', '性能统计', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.debug-stats.title', 'en', 'Stats & Debug', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.blueprint-api.title', 'zh', 'Blueprint API', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.blueprint-api.title', 'en', 'Blueprint API', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ref-index.title', 'zh', '参考速查', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.ref-index.title', 'en', 'Reference Index', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.proj-settings.title', 'zh', '项目设置', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.proj-settings.title', 'en', 'Project Settings', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.limitations.title', 'zh', '已知限制', datetime('now'));
INSERT OR REPLACE INTO translations (plugin_id, key, locale, value, updated_at) VALUES ((SELECT id FROM plugins WHERE slug='webuix'), 'sec.limitations.title', 'en', 'Known Limitations', datetime('now'));

-- ── 5. Content blocks (idempotent with WHERE NOT EXISTS) ──

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='overview' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\">WebUIX 是自研的 HTML\/CSS UI 渲染引擎，作为原生 UMG 插件运行在 Unreal Engine 中。无浏览器进程、无 JavaScript 引擎、无 CEF\/Chromium — 用熟悉的 HTML\/CSS 语法构建游戏 UI，通过 Blueprint 完成所有交互逻辑。<\/p><p data-lang=\"en\">WebUIX is a self-developed HTML\/CSS UI rendering engine running as a native UMG plugin in Unreal Engine. No browser process, no JavaScript engine, no CEF\/Chromium — build game UIs with familiar HTML\/CSS and handle all interaction logic through Blueprint.<\/p><div class=\"grid2\" style=\"margin-top:16px\"><div class=\"card\"><h4 data-lang=\"zh\">全平台支持<\/h4><h4 data-lang=\"en\">Cross-Platform<\/h4><p data-lang=\"zh\">Win64、macOS、Linux、Android、iOS — 一套 HTML\/CSS 在所有平台上渲染一致<\/p><p data-lang=\"en\">Win64, macOS, Linux, Android, iOS — one set of HTML\/CSS renders identically everywhere<\/p><\/div><div class=\"card\"><h4 data-lang=\"zh\">高性能原生渲染<\/h4><h4 data-lang=\"en\">High-Performance Native Rendering<\/h4><p data-lang=\"zh\">Direct RHI 渲染，无浏览器进程开销。支持跨帧缓存、脏区增量更新、独立 RT 拖拽预览<\/p><p data-lang=\"en\">Direct RHI rendering, no browser process overhead. Cross-frame caching, dirty-region updates, separate RT drag preview<\/p><\/div><div class=\"card\"><h4 data-lang=\"zh\">Blueprint 深度集成<\/h4><h4 data-lang=\"en\">Deep Blueprint Integration<\/h4><p data-lang=\"zh\">事件桥（OnClick 调 UFUNCTION）、数据模型绑定、完整 DOM API、自定义组件系统<\/p><p data-lang=\"en\">Event bridge (OnClick calls UFUNCTION), data model binding, full DOM API, custom component system<\/p><\/div><div class=\"card\"><h4 data-lang=\"zh\">内置调试控制台<\/h4><h4 data-lang=\"en\">Built-in Debug Console<\/h4><p data-lang=\"zh\">F8 打开 — 实时 DOM 树、元素选择器、样式计算面板、渲染统计<\/p><p data-lang=\"en\">Press F8 — live DOM tree, element picker, computed styles, render stats<\/p><\/div><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='overview' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='quick-start' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"subsection\"><h3 data-lang=\"zh\">1. 启用插件<\/h3><h3 data-lang=\"en\">1. Enable Plugin<\/h3><p data-lang=\"zh\">在 Edit → Plugins 中启用 <strong>WebUIX<\/strong>，重启编辑器。<\/p><p data-lang=\"en\">Enable <strong>WebUIX<\/strong> in Edit → Plugins and restart the editor.<\/p><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">2. 创建 HTML\/CSS 资产<\/h3><h3 data-lang=\"en\">2. Create Assets<\/h3><p data-lang=\"zh\">在 Content Browser 右键 → <strong>WebUIX → HTML Document<\/strong>。双击资产打开内置代码编辑器。<\/p><p data-lang=\"en\">Right-click in Content Browser → <strong>WebUIX → HTML Document<\/strong>. Double-click to open the built-in code editor.<\/p><pre><code class=\"language-xml\">&lt;!DOCTYPE html&gt;\n&lt;html&gt;\n&lt;body&gt;\n  &lt;div&gt;{{PlayerName}}&lt;\/div&gt;\n  &lt;button OnClick=\"OnStartClicked\"&gt;Start Game&lt;\/button&gt;\n&lt;\/body&gt;\n&lt;\/html&gt;<\/code><\/pre><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">3. 数据绑定<\/h3><h3 data-lang=\"en\">3. Data Binding<\/h3><pre><code class=\"language-cpp\">Widget-&gt;SetModelNumber(\"Health\", 85.0f);\nWidget-&gt;SetModelNumber(\"MaxHealth\", 100.0f);\nWidget-&gt;NotifyContextChanged();<\/code><\/pre><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">4. 事件处理<\/h3><h3 data-lang=\"en\">4. Handle Events<\/h3><p data-lang=\"zh\">在 Widget Blueprint 中添加名为 <code>OnStartClicked<\/code> 的 Blueprint 事件。按钮点击时自动调用。<\/p><p data-lang=\"en\">Add a Blueprint event named <code>OnStartClicked<\/code> in the Widget Blueprint. It will be called when the button is clicked.<\/p><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='quick-start' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='editor-workflow' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"grid2\"><div class=\"card\"><h4 data-lang=\"zh\">内置代码编辑器<\/h4><h4 data-lang=\"en\">Built-in Code Editor<\/h4><p data-lang=\"zh\">双击 HTML\/CSS 资产打开，支持语法高亮、Ctrl+S 保存、Alt+Shift+F 格式化、自动补全。<\/p><p data-lang=\"en\">Double-click HTML\/CSS assets. Syntax highlighting, Ctrl+S save, Alt+Shift+F format, autocomplete.<\/p><\/div><div class=\"card\"><h4 data-lang=\"zh\">外部文件同步与热重载<\/h4><h4 data-lang=\"en\">External Sync &amp; Hot Reload<\/h4><p data-lang=\"zh\">可指定外部 .html\/.css 文件路径，编辑后自动检测变化并热重载。适合开发期快速迭代。<\/p><p data-lang=\"en\">Point to external .html\/.css files; changes are auto-detected and hot-reloaded. Best for fast iteration.<\/p><\/div><div class=\"card\"><h4 data-lang=\"zh\">资源选择器<\/h4><h4 data-lang=\"en\">Resource Picker<\/h4><p data-lang=\"zh\">CSS 中写 <code>url(...)<\/code> 时可打开资源选择器，按类型筛选 UE 资产。<\/p><p data-lang=\"en\">Open the resource picker when writing <code>url(...)<\/code> in CSS, filter by type.<\/p><\/div><div class=\"card\"><h4 data-lang=\"zh\">诊断面板<\/h4><h4 data-lang=\"en\">Diagnostics<\/h4><p data-lang=\"zh\">编辑器底部状态栏显示诊断摘要，可跳转上一个\/下一个诊断。<\/p><p data-lang=\"en\">Status bar shows diagnostic summary; jump to previous\/next diagnostic.<\/p><\/div><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='editor-workflow' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='html-css-basics' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"subsection\"><h3 data-lang=\"zh\">支持的 HTML 标签<\/h3><h3 data-lang=\"en\">Supported HTML Tags<\/h3><div class=\"code-tags\"><code>rml<\/code><code>head<\/code><code>body<\/code><code>link<\/code><code>div<\/code><code>section<\/code><code>span<\/code><code>p<\/code><code>h1<\/code><code>h2<\/code><code>h3<\/code><code>h4<\/code><code>ul<\/code><code>ol<\/code><code>li<\/code><code>table<\/code><code>thead<\/code><code>tbody<\/code><code>tr<\/code><code>td<\/code><code>th<\/code><code>button<\/code><code>input<\/code><code>textarea<\/code><code>select<\/code><code>option<\/code><code>label<\/code><code>img<\/code><code>progress<\/code><code>a<\/code><code>svg<\/code><\/div><p data-lang=\"zh\" style=\"margin-top:8px\">扩展元素：<code>drag-area<\/code> <code>drag-cell<\/code> <code>drag-item<\/code> <code>handle<\/code> <code>radio-group<\/code> <code>checkbox-group<\/code> <code>dropdown<\/code> <code>password<\/code> <code>modal<\/code> <code>tooltips<\/code> <code>animation-watch<\/code><\/p><p data-lang=\"en\" style=\"margin-top:8px\">Extension elements: <code>drag-area<\/code> <code>drag-cell<\/code> <code>drag-item<\/code> <code>handle<\/code> <code>radio-group<\/code> <code>checkbox-group<\/code> <code>dropdown<\/code> <code>password<\/code> <code>modal<\/code> <code>tooltips<\/code> <code>animation-watch<\/code><\/p><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">Pseudo-class 状态<\/h3><h3 data-lang=\"en\">Pseudo-class States<\/h3><div class=\"code-tags\"><code>:hover<\/code><code>:active<\/code><code>:focus<\/code><code>:checked<\/code><code>:disabled<\/code><code>:first-child<\/code><code>:last-child<\/code><code>:nth-child(n)<\/code><\/div><p data-lang=\"zh\" style=\"margin-top:8px\">扩展状态：<code>:selected<\/code> <code>:open<\/code> <code>:dragging<\/code> <code>:valid<\/code> <code>:invalid<\/code> <code>:hot<\/code> <code>:occupied<\/code><\/p><p data-lang=\"en\" style=\"margin-top:8px\">Extension states: <code>:selected<\/code> <code>:open<\/code> <code>:dragging<\/code> <code>:valid<\/code> <code>:invalid<\/code> <code>:hot<\/code> <code>:occupied<\/code><\/p><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='html-css-basics' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='css-filters' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\">WebUIX 支持多种 CSS 滤镜效果，可用于 UI 动效、背景模糊和视觉气氛增强。<\/p><p data-lang=\"en\">WebUIX supports multiple CSS filter effects for UI motion, background blur, and visual atmosphere.<\/p><div class=\"subsection\" style=\"margin-top:12px\"><h3>filter<\/h3><table><tr><th data-lang=\"zh\">函数<\/th><th data-lang=\"en\">Function<\/th><th data-lang=\"zh\">说明<\/th><th data-lang=\"en\">Description<\/th><\/tr><tr><td><code>blur()<\/code><\/td><td data-lang=\"zh\">高斯模糊<\/td><td data-lang=\"en\">Gaussian blur<\/td><\/tr><tr><td><code>brightness()<\/code><\/td><td data-lang=\"zh\">亮度（0=黑，1=原始，&gt;1=更亮）<\/td><td data-lang=\"en\">Brightness (0=black, 1=original, &gt;1=brighter)<\/td><\/tr><tr><td><code>contrast()<\/code><\/td><td data-lang=\"zh\">对比度<\/td><td data-lang=\"en\">Contrast<\/td><\/tr><tr><td><code>saturate()<\/code><\/td><td data-lang=\"zh\">饱和度<\/td><td data-lang=\"en\">Saturation<\/td><\/tr><tr><td><code>drop-shadow()<\/code><\/td><td data-lang=\"zh\">投影（跟随轮廓）<\/td><td data-lang=\"en\">Drop shadow (follows content contour)<\/td><\/tr><\/table><pre><code class=\"language-css\">.card { filter: drop-shadow(0 10dp 24dp #00000066); }\n.card:hover { filter: brightness(1.1); transition: filter 200ms; }\n.inactive { filter: brightness(0.6) saturate(0.3); }<\/code><\/pre><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3>backdrop-filter<\/h3><pre><code class=\"language-css\">.glass-panel {\n  background: rgba(255,255,255,.12);\n  backdrop-filter: blur(16dp);\n  border-radius: 16dp;\n}<\/code><\/pre><div class=\"callout\"><p data-lang=\"zh\">backdrop-filter 会引入额外的 RHI 渲染通道，大量使用可能增加 GPU 开销。<\/p><p data-lang=\"en\">backdrop-filter introduces additional RHI render passes. Heavy usage may increase GPU cost.<\/p><\/div><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='css-filters' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='ui-sound' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\">WebUIX 支持通过 CSS 属性 <code>background-sound<\/code> 在元素交互时自动播放 UE 音频资产。无需 Blueprint 逻辑。<\/p><p data-lang=\"en\">WebUIX supports playing UE audio assets automatically on element interaction via <code>background-sound<\/code> CSS property. No Blueprint logic required.<\/p><table style=\"margin-top:12px\"><tr><th data-lang=\"zh\">属性<\/th><th data-lang=\"en\">Property<\/th><th data-lang=\"zh\">默认值<\/th><th data-lang=\"en\">Default<\/th><\/tr><tr><td><code>background-sound<\/code><\/td><td data-lang=\"zh\">指向 USoundBase 资产路径<\/td><td data-lang=\"en\">USoundBase asset path<\/td><\/tr><tr><td><code>background-sound-volume<\/code><\/td><td>1.0<\/td><td data-lang=\"zh\">音量乘数<\/td><td data-lang=\"en\">Volume multiplier<\/td><\/tr><tr><td><code>background-sound-cooldown<\/code><\/td><td>0<\/td><td data-lang=\"zh\">播放冷却（支持 s\/ms）<\/td><td data-lang=\"en\">Cooldown (supports s\/ms suffix)<\/td><\/tr><\/table><pre><code class=\"language-css\">.ui-hover-sound:hover {\n  background-sound: url(\"asset:\/\/\/WebUIX\/Sound\/glass_001.glass_001\");\n  background-sound-volume: 0.35;\n  background-sound-cooldown: 0.05s;\n}<\/code><\/pre>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='ui-sound' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='animations' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"subsection\"><h3>CSS Transitions<\/h3><pre><code class=\"language-css\">.card {\n  transform: scale(1);\n  filter: brightness(1);\n  transition: transform 180ms ease, filter 150ms;\n}\n.card:hover { transform: scale(1.04); filter: brightness(1.1); }<\/code><\/pre><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3>@keyframes<\/h3><pre><code class=\"language-css\">@keyframes slide-in {\n  0%   { transform: translateY(-24dp); opacity: 0; }\n  100% { transform: translateY(0);     opacity: 1; }\n}\n.modal-open { animation: slide-in 200ms ease-out; }\n\n@keyframes fade-pulse {\n  0%, 100% { opacity: 1; }\n  50%       { opacity: 0.5; }\n}\n.loading { animation: fade-pulse 1.2s ease-in-out infinite; }<\/code><\/pre><p data-lang=\"zh\">支持：timing-function、iteration-count、direction、fill-mode、delay、play-state。<\/p><p data-lang=\"en\">Supports: timing-function, iteration-count, direction, fill-mode, delay, play-state.<\/p><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='animations' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='custom-components' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\">WebUIX 允许在 Blueprint 中创建全新的 HTML 标签 — 拥有完整生命周期的组件。<\/p><p data-lang=\"en\">WebUIX lets you create entirely new HTML tags in Blueprint — full components with their own lifecycle.<\/p><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">快速创建<\/h3><h3 data-lang=\"en\">Quick Creation<\/h3><ol><li data-lang=\"zh\">创建 Blueprint，父类选择 <strong>UWebUIXComponent<\/strong><\/li><li data-lang=\"en\">Create a Blueprint with parent <strong>UWebUIXComponent<\/strong><\/li><li data-lang=\"zh\">在 Class Settings 中填写 <code>TagName<\/code>（如 <code>my-card<\/code>）<\/li><li data-lang=\"en\">Set <code>TagName<\/code> (e.g., <code>my-card<\/code>) in Class Settings<\/li><li data-lang=\"zh\">编写默认 HTML 模板和 CSS，实现 <code>Construct<\/code> \/ <code>Tick<\/code> \/ <code>Destruct<\/code> 事件<\/li><li data-lang=\"en\">Write default HTML template and CSS, implement <code>Construct<\/code> \/ <code>Tick<\/code> \/ <code>Destruct<\/code> events<\/li><\/ol><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3>DOM API<\/h3><pre><code class=\"language-cpp\">Dom-&gt;GetElementById(\"my-id\");\nDom-&gt;SetAttribute(\"badge\", \"5\");\nDom-&gt;ClassListAdd(\"highlight\");\nDom-&gt;StyleSetProperty(\"color\", \"#ff0\");\nDom-&gt;AppendChild(newElement);<\/code><\/pre><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='custom-components' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='data-binding' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"subsection\"><h3 data-lang=\"zh\">上下文变量 <code>{{变量}}<\/code><\/h3><h3 data-lang=\"en\">Context Variables<\/h3><pre><code class=\"language-html\">&lt;span&gt;{{PlayerName}}&lt;\/span&gt;\n&lt;div style=\"width: {{Percent}}%;\"&gt;{{Score}}&lt;\/div&gt;<\/code><\/pre><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">数据模型 <code>{{Model.Key}}<\/code><\/h3><h3 data-lang=\"en\">Data Model<\/h3><pre><code class=\"language-cpp\">Widget-&gt;SetModelString(\"PlayerName\", \"Alice\");\nWidget-&gt;SetModelNumber(\"Health\", 85.0f);\nWidget-&gt;SetModelBool(\"IsAlive\", true);\nWidget-&gt;NotifyContextChanged();<\/code><\/pre><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">模板指令<\/h3><h3 data-lang=\"en\">Template Directives<\/h3><pre><code class=\"language-html\">&lt;template foreach=\"item in Model.Items\"&gt;\n  &lt;div&gt;{{item.Name}}&lt;\/div&gt;\n&lt;\/template&gt;\n&lt;template if=\"{{Model.IsLoggedIn}}\"&gt;\n  &lt;div&gt;Welcome, {{PlayerName}}!&lt;\/div&gt;\n&lt;\/template&gt;\n&lt;div show=\"{{Model.HasBonus}}\"&gt;Bonus Active!&lt;\/div&gt;<\/code><\/pre><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='data-binding' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='event-bridge' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\">通过 HTML 事件属性调用 Blueprint UFUNCTION，按函数名查找 Widget 或 Bridge Target。<\/p><p data-lang=\"en\">Call Blueprint UFUNCTIONs via HTML event attributes; looked up by name on Widget or Bridge Target.<\/p><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">支持的事件<\/h3><h3 data-lang=\"en\">Supported Events<\/h3><div class=\"code-tags\"><code>OnClick<\/code><code>OnDblClick<\/code><code>OnInput<\/code><code>OnChange<\/code><code>OnFocus<\/code><code>OnBlur<\/code><code>OnKeyDown<\/code><code>OnKeyUp<\/code><code>OnOpen<\/code><code>OnClose<\/code><code>OnDragstart<\/code><code>OnDrag<\/code><code>OnDragend<\/code><code>OnDragover<\/code><code>OnDragout<\/code><code>OnDragdrop<\/code><\/div><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">使用示例<\/h3><h3 data-lang=\"en\">Usage Examples<\/h3><pre><code class=\"language-html\">&lt;button OnClick=\"StartGame\"&gt;Start&lt;\/button&gt;\n&lt;button OnClick=\"OpenSettings(panel=&apos;video&apos;)\"&gt;Settings&lt;\/button&gt;\n&lt;input value=\"{{Model.SearchText}}\" OnChange=\"OnSearchChanged(value)\" \/&gt;<\/code><\/pre><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='event-bridge' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='ext-animation-watch' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\"><code>&lt;animation-watch&gt;<\/code> 观察指定范围内的 CSS 动画状态变化，通过事件桥将 JSON payload 发送给 Blueprint。<\/p><p data-lang=\"en\"><code>&lt;animation-watch&gt;<\/code> observes CSS animation state changes and sends JSON payloads to Blueprint via the event bridge.<\/p><pre><code class=\"language-html\">&lt;animation-watch id=\"hud-watch\"\n  scope=\"subtree\" visible-only=\"true\"\n  emit-update=\"true\" update-rate=\"8\"\n  OnAnimationStart=\"OnHudAnimationStart\"\n  OnAnimationEnd=\"OnHudAnimationEnd\"&gt;\n  &lt;div class=\"animated-card\"&gt;Reward&lt;\/div&gt;\n&lt;\/animation-watch&gt;<\/code><\/pre>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='ext-animation-watch' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='ext-drag' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"subsection\"><h3 data-lang=\"zh\">网格拖拽<\/h3><h3 data-lang=\"en\">Grid Drag<\/h3><pre><code class=\"language-html\">&lt;drag-area id=\"bag\" columns=\"5\" rows=\"4\" count=\"13\" gap=\"8dp\"\n  OnDragdrop=\"OnBagDrop(TargetId)\"&gt;\n  &lt;drag-cell class=\"slot\"&gt;&lt;span&gt;#{{dragCell::DisplayIndex}}&lt;\/span&gt;&lt;\/drag-cell&gt;\n  &lt;drag-item id=\"sword\" col=\"0\" row=\"0\" cols=\"2\" rows=\"2\"&gt;&lt;b&gt;2x2&lt;\/b&gt;&lt;\/drag-item&gt;\n&lt;\/drag-area&gt;<\/code><\/pre><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">自由拖拽（浮动面板）<\/h3><h3 data-lang=\"en\">Free Drag (Floating Panel)<\/h3><pre><code class=\"language-html\">&lt;div id=\"panel\" class=\"floating-panel\"&gt;\n  &lt;handle class=\"title-bar\" move_target=\"panel\"&gt;Drag Panel&lt;\/handle&gt;\n  &lt;p&gt;This panel can be moved by dragging the title bar.&lt;\/p&gt;\n&lt;\/div&gt;<\/code><\/pre><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">拖拽状态 CSS<\/h3><h3 data-lang=\"en\">Drag State CSS<\/h3><pre><code class=\"language-css\">drag-cell:hot { background: #38bdf833; }\ndrag-item:dragging { opacity: .72; transform: scale(1.04); }\ndrag-item:invalid { filter: drop-shadow(0 0 8dp #ef4444); }<\/code><\/pre><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='ext-drag' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='ext-forms' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"subsection\"><h3>radio-group \/ radio-option<\/h3><pre><code class=\"language-html\">&lt;radio-group value=\"comfortable\" OnChange=\"OnRadioChanged(value)\"&gt;\n  &lt;radio-option value=\"compact\"&gt;Compact&lt;\/radio-option&gt;\n  &lt;radio-option value=\"comfortable\" selected&gt;Comfortable&lt;\/radio-option&gt;\n&lt;\/radio-group&gt;<\/code><\/pre><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3>dropdown \/ dropdown-option<\/h3><pre><code class=\"language-html\">&lt;dropdown value=\"rhi\" placeholder=\"Select mode\" OnChange=\"OnDropdownChanged(value)\"&gt;\n  &lt;dropdown-option value=\"rhi\" selected&gt;RHI&lt;\/dropdown-option&gt;\n  &lt;dropdown-option value=\"slate\"&gt;Slate fallback&lt;\/dropdown-option&gt;\n&lt;\/dropdown&gt;<\/code><\/pre><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='ext-forms' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='ext-modal' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"subsection\"><h3>modal<\/h3><pre><code class=\"language-html\">&lt;button modal-action=\"open\" modal-target=\"settings-modal\"&gt;Open&lt;\/button&gt;\n&lt;modal id=\"settings-modal\" value=\"{{SettingsModalOpen}}\"\n  width=\"420dp\" mask=\"true\" close-on-press-escape=\"true\"\n  OnChange=\"OnSettingsModalChanged(value)\"&gt;\n  &lt;modal-title&gt;Settings&lt;\/modal-title&gt;\n  &lt;modal-footer&gt;\n    &lt;button modal-action=\"cancel\"&gt;Cancel&lt;\/button&gt;\n    &lt;button modal-action=\"confirm\"&gt;Confirm&lt;\/button&gt;\n  &lt;\/modal-footer&gt;\n&lt;\/modal&gt;<\/code><\/pre><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3>tooltips<\/h3><pre><code class=\"language-html\">&lt;tooltips placement=\"top\" effect=\"dark\"&gt;\n  &lt;button&gt;Hover me&lt;\/button&gt;\n  &lt;tooltips-content&gt;&lt;b&gt;Tip title&lt;\/b&gt;&lt;\/tooltips-content&gt;\n&lt;\/tooltips&gt;<\/code><\/pre><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='ext-modal' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='ext-password' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"subsection\"><h3>password<\/h3><p data-lang=\"zh\">内部管理原生 password\/text 输入和眼睛切换按钮。<\/p><p data-lang=\"en\">Owns a native password\/text input and eye toggle button.<\/p><pre><code class=\"language-html\">&lt;password value=\"\" placeholder=\"Access code\"\n  name=\"AccessCode\" OnInput=\"OnAccessCodeInput(value)\" \/&gt;<\/code><\/pre><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='ext-password' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='perf-pipeline' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\">WebUIX 使用保留渲染架构，每帧仅重新绘制发生变化的区域。<\/p><p data-lang=\"en\">WebUIX uses a retained rendering architecture; only changed regions are redrawn each frame.<\/p><pre><code>HTML + CSS -&gt; DOM -&gt; Style Cascade -&gt; Layout -&gt; Display List -&gt; RHI Render Target -&gt; Slate Present<\/code><\/pre><div class=\"grid2\" style=\"margin-top:16px\"><div class=\"card\"><h4 data-lang=\"zh\">瓦片绘制缓存<\/h4><h4 data-lang=\"en\">Tile Paint Cache<\/h4><p data-lang=\"zh\">页面分为瓦片，稳定区域不重绘。仅脏瓦片被重新光栅化。<\/p><p data-lang=\"en\">Stable regions are not redrawn. Only dirty tiles are re-rasterized.<\/p><\/div><div class=\"card\"><h4 data-lang=\"zh\">独立拖拽预览<\/h4><h4 data-lang=\"en\">Independent Drag Preview<\/h4><p data-lang=\"zh\">拖拽预览渲染在独立透明 RT 上，主页面纹理不会被修改。<\/p><p data-lang=\"en\">Drag preview renders on a separate transparent RT; main page texture is never modified.<\/p><\/div><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='perf-pipeline' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='perf-pool' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\"><strong>UWebUIXWidgetPoolComponent<\/strong> 管理 Widget 实例池，实现即时的页面切换。池中的 Widget 在隐藏\/显示周期中保留 DOM 状态、滚动位置和输入焦点。<\/p><p data-lang=\"en\"><strong>UWebUIXWidgetPoolComponent<\/strong> manages a pool of Widget instances for instant page switching. Pooled widgets retain DOM state, scroll position, and input focus.<\/p><pre><code class=\"language-cpp\">PoolComponent-&gt;ShowWebUIXWidget(MyWidgetClass, ViewportZOrder);\nPoolComponent-&gt;HideWebUIXWidget(MyWidgetClass);\n\/\/ Calling Show again reuses the same instance — no recreation<\/code><\/pre>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='perf-pool' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='perf-warmup' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\"><strong>UWebUIXStartupWarmupSubsystem<\/strong> 在游戏启动时自动扫描已 Cook 的 Widget Blueprint，预加载文档和资源。首次打开 UI 零延迟。<\/p><p data-lang=\"en\"><strong>UWebUIXStartupWarmupSubsystem<\/strong> automatically scans cooked Widget Blueprints at game start and preloads documents. Zero delay on first UI open.<\/p><table style=\"margin-top:12px\"><tr><th data-lang=\"zh\">模式<\/th><th data-lang=\"en\">Mode<\/th><th data-lang=\"zh\">说明<\/th><th data-lang=\"en\">Description<\/th><\/tr><tr><td><code>DocumentCacheOnly<\/code><\/td><td data-lang=\"zh\">异步后台预加载（推荐）<\/td><td data-lang=\"en\">Async background preload (recommended)<\/td><\/tr><tr><td><code>PrecreateHiddenWidget<\/code><\/td><td data-lang=\"zh\">创建 Widget 并以 Collapsed 状态加入视口，用 ShowPrewarmedWidget() 立即显示<\/td><td data-lang=\"en\">Creates Widget as Collapsed in viewport, use ShowPrewarmedWidget() for instant display<\/td><\/tr><\/table>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='perf-warmup' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='perf-cook' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\">UWebUIXHtmlDocument 在保存\/Cook 时生成预计算数据，运行时直接使用，无需文件 I\/O 或重新解析。<\/p><p data-lang=\"en\">UWebUIXHtmlDocument generates precomputed data at save\/cook time. Runtime uses this directly — no file I\/O or re-parsing.<\/p><table style=\"margin-top:12px\"><tr><th data-lang=\"zh\">数据<\/th><th data-lang=\"en\">Data<\/th><th data-lang=\"zh\">说明<\/th><th data-lang=\"en\">Description<\/th><\/tr><tr><td><code>ResolvedHtmlBundle<\/code><\/td><td data-lang=\"zh\">合并后的 HTML + CSS<\/td><td data-lang=\"en\">Merged HTML + linked CSS<\/td><\/tr><tr><td><code>CookedDomNodes<\/code><\/td><td data-lang=\"zh\">预解析的 DOM 树<\/td><td data-lang=\"en\">Pre-parsed DOM tree<\/td><\/tr><tr><td><code>CookedStyleSheet<\/code><\/td><td data-lang=\"zh\">已解析的样式表<\/td><td data-lang=\"en\">Resolved stylesheet<\/td><\/tr><tr><td><code>CookedImageResources<\/code><\/td><td data-lang=\"zh\">压缩后的图片字节<\/td><td data-lang=\"en\">Compressed image bytes<\/td><\/tr><\/table>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='perf-cook' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='inspector' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\">内置调试工具，Editor\/PIE 下可用。焦点落在 WebUIX 画面后按 <strong>F8<\/strong> 打开或关闭。<\/p><p data-lang=\"en\">Built-in debug tool, available in Editor\/PIE. Focus a WebUIX view and press <strong>F8<\/strong> to toggle.<\/p><div class=\"grid2\" style=\"margin-top:16px\"><div class=\"card\"><h4 data-lang=\"zh\">元素选择器<\/h4><h4 data-lang=\"en\">Element Picker<\/h4><p data-lang=\"zh\">从渲染画面选择元素。Pick 模式只做 hit-test，不触发交互。<\/p><p data-lang=\"en\">Select elements from the rendered view. Pick mode only hit-tests.<\/p><\/div><div class=\"card\"><h4 data-lang=\"zh\">DOM 树<\/h4><h4 data-lang=\"en\">DOM Tree<\/h4><p data-lang=\"zh\">左侧显示实际渲染树。VSCode 风格语法配色，Ctrl+C 复制节点文本。<\/p><p data-lang=\"en\">Left panel shows the rendered tree. VSCode-style syntax colors, Ctrl+C to copy.<\/p><\/div><div class=\"card\"><h4 data-lang=\"zh\">右侧 Tabs<\/h4><h4 data-lang=\"en\">Details Tabs<\/h4><p data-lang=\"zh\">Styles、Computed、Layout、Attributes、Events、Bindings。<\/p><p data-lang=\"en\">Styles, Computed, Layout, Attributes, Events, Bindings.<\/p><\/div><div class=\"card\"><h4 data-lang=\"zh\">事件模拟<\/h4><h4 data-lang=\"en\">Event Simulation<\/h4><p data-lang=\"zh\">Events tab 提供 Hover\/Unhover\/Focus\/Blur\/Click 按钮模拟交互。<\/p><p data-lang=\"en\">Events tab provides Hover\/Unhover\/Focus\/Blur\/Click buttons.<\/p><\/div><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='inspector' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='debug-stats' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"grid2\"><div class=\"card\"><h4>GetLastRenderStats()<\/h4><p data-lang=\"zh\">查看 RhiDrawCallCount、RhiBatchCount、BackdropFilterPassCount 等约 90 个统计字段。<\/p><p data-lang=\"en\">Inspect ~90 stats fields including RhiDrawCallCount, RhiBatchCount, BackdropFilterPassCount.<\/p><\/div><div class=\"card\"><h4>GetLastEventDebugInfo()<\/h4><p data-lang=\"zh\">查看最近一次事件桥调用，排查 HTML 事件名、参数、目标对象。<\/p><p data-lang=\"en\">Inspect the most recent event bridge call to debug event names, arguments, targets.<\/p><\/div><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='debug-stats' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='blueprint-api' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\" style=\"color:var(--c-muted)\">WebUIX 公开 Blueprint API 参考：<\/p><p data-lang=\"en\" style=\"color:var(--c-muted)\">WebUIX public Blueprint API reference:<\/p><div class=\"grid2\"><div class=\"card\"><h4>Document<\/h4><div class=\"code-tags\"><code>ReloadDocument<\/code><code>SetCulture<\/code><code>RefreshLocalization<\/code><\/div><\/div><div class=\"card\"><h4>DOM<\/h4><div class=\"code-tags\"><code>GetElementById<\/code><code>QuerySelector<\/code><code>QuerySelectorAll<\/code><code>CreateElement<\/code><code>AppendChild<\/code><code>Prepend<\/code><code>InsertBefore<\/code><code>RemoveChild<\/code><code>Remove<\/code><code>SetTextContent<\/code><code>GetTextContent<\/code><code>SetInnerHTML<\/code><code>SetAttribute<\/code><code>GetAttribute<\/code><code>RemoveAttribute<\/code><code>StyleSetProperty<\/code><code>ClassListAdd<\/code><code>ClassListRemove<\/code><code>ClassListToggle<\/code><code>Focus<\/code><code>Blur<\/code><code>Click<\/code><code>ScrollIntoView<\/code><\/div><\/div><div class=\"card\"><h4 data-lang=\"zh\">数据模型<\/h4><h4 data-lang=\"en\">Data Model<\/h4><div class=\"code-tags\"><code>SetModelString<\/code><code>SetModelNumber<\/code><code>SetModelBool<\/code><code>GetModelString<\/code><code>GetModelNumber<\/code><code>GetModelBool<\/code><code>NotifyContextChanged<\/code><code>RefreshContextBindings<\/code><\/div><\/div><div class=\"card\"><h4 data-lang=\"zh\">调试<\/h4><h4 data-lang=\"en\">Debug<\/h4><div class=\"code-tags\"><code>GetLastRenderStats<\/code><code>GetLastEventDebugInfo<\/code><\/div><\/div><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='blueprint-api' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='ref-index' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<div class=\"subsection\"><h3 data-lang=\"zh\">事件属性<\/h3><h3 data-lang=\"en\">Event Attributes<\/h3><div class=\"code-tags\"><code>OnClick<\/code><code>OnDblClick<\/code><code>OnInput<\/code><code>OnChange<\/code><code>OnOpen<\/code><code>OnClose<\/code><code>OnFocus<\/code><code>OnBlur<\/code><code>OnKeyDown<\/code><code>OnKeyUp<\/code><code>OnDragstart<\/code><code>OnDrag<\/code><code>OnDragend<\/code><code>OnDragover<\/code><code>OnDragout<\/code><code>OnDragdrop<\/code><code>OnAnimationStart<\/code><code>OnAnimationUpdate<\/code><code>OnAnimationEnd<\/code><code>OnAnimationCancel<\/code><\/div><\/div><div class=\"subsection\" style=\"margin-top:12px\"><h3 data-lang=\"zh\">CSS 音效属性<\/h3><h3 data-lang=\"en\">CSS Sound Properties<\/h3><div class=\"code-tags\"><code>background-sound<\/code><code>background-sound-volume<\/code><code>background-sound-pitch<\/code><code>background-sound-cooldown<\/code><\/div><\/div>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='ref-index' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='proj-settings' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<p data-lang=\"zh\">通过 Project Settings → Plugins → WebUIX 访问（UWebUIXSettings）。<\/p><p data-lang=\"en\">Access via Project Settings → Plugins → WebUIX (UWebUIXSettings).<\/p><table style=\"margin-top:12px\"><tr><th>Setting<\/th><th data-lang=\"zh\">默认<\/th><th data-lang=\"en\">Default<\/th><th data-lang=\"zh\">说明<\/th><th data-lang=\"en\">Description<\/th><\/tr><tr><td><code>TargetFrameRate<\/code><\/td><td>60<\/td><td data-lang=\"zh\">最大渲染帧率<\/td><td data-lang=\"en\">Max render rate<\/td><\/tr><tr><td><code>bEnableExperimentalNativeIme<\/code><\/td><td>false<\/td><td data-lang=\"zh\">启用原生 Windows IME（实验性）<\/td><td data-lang=\"en\">Enable native Windows IME (experimental)<\/td><\/tr><tr><td><code>bAutoPrewarmDocument<\/code><\/td><td>true<\/td><td data-lang=\"zh\">首次加载时自动预热<\/td><td data-lang=\"en\">Auto pre-warm on first load<\/td><\/tr><tr><td><code>TextContrast<\/code><\/td><td>1.0<\/td><td data-lang=\"zh\">文字对比度乘数<\/td><td data-lang=\"en\">Text contrast multiplier<\/td><\/tr><tr><td><code>DocumentRoot<\/code><\/td><td>—<\/td><td data-lang=\"zh\">外置 HTML 文件根目录<\/td><td data-lang=\"en\">Root for external HTML files<\/td><\/tr><\/table>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='proj-settings' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

INSERT INTO content_blocks (section_id, type, content_json, sort_order, created_at, updated_at)
SELECT (SELECT id FROM sections WHERE slug='limitations' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')),
'html', '{"html":"<ul data-lang=\"zh\"><li>支持平台：Win64、macOS、Linux、Android、iOS。<\/li><li>自研 HTML\/CSS 渲染器，不是 Chromium，不执行 JavaScript。<\/li><li>不支持 &lt;video&gt;、&lt;audio&gt;、&lt;canvas&gt;、&lt;iframe&gt;。<\/li><li>不支持 CSS 自定义属性 var(--...) — 使用模板绑定系统替代。<\/li><li>不支持 SVG 渲染 — 使用 PNG\/JPG 图片资产。<\/li><li>不支持浏览器 API（window、fetch、localStorage 等）。<\/li><li>IME 原生输入法（Windows）为实验性功能。<\/li><li>无远程 URL 支持，所有资产来自 UE 资产系统。<\/li><\/ul><ul data-lang=\"en\"><li>Supported platforms: Win64, macOS, Linux, Android, iOS.<\/li><li>Self-developed HTML\/CSS renderer, not Chromium. Does not execute JavaScript.<\/li><li>&lt;video&gt;, &lt;audio&gt;, &lt;canvas&gt;, &lt;iframe&gt; are not supported.<\/li><li>CSS custom properties var(--...) are not supported — use the template binding system.<\/li><li>SVG rendering is not supported — use PNG\/JPG image assets.<\/li><li>Browser APIs (window, fetch, localStorage, etc.) are not supported.<\/li><li>Native Windows IME is experimental.<\/li><li>No remote URL support — all assets from UE asset system.<\/li><\/ul>"}',
0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE section_id=(SELECT id FROM sections WHERE slug='limitations' AND plugin_id=(SELECT id FROM plugins WHERE slug='webuix')) AND sort_order=0);

COMMIT;

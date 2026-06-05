-- Seed: Import WebUIX Documentation
-- Safe for re-run (uses OR REPLACE)

-- Delete and re-insert plugin by slug
DELETE FROM plugins WHERE slug = 'WebUIX';
INSERT INTO plugins (slug, name, version, ue_version, description, badge_tags, sort_order, created_at, updated_at) VALUES
('WebUIX', 'WebUIX', '0.2.0', '5.0+',
 'Unreal Engine native HTML/CSS UI plugin — no browser, no JavaScript, pure C++ renderer',
 '["Win64 / macOS / Linux","Android / iOS","Direct RHI","No JS Engine"]',
 0, datetime('now'), datetime('now'));

-- Delete plugin sections and re-insert
DELETE FROM content_blocks WHERE section_id IN (SELECT id FROM sections WHERE plugin_id = (SELECT id FROM plugins WHERE slug = 'WebUIX'));
DELETE FROM sections WHERE plugin_id = (SELECT id FROM plugins WHERE slug = 'WebUIX');

-- Sections
INSERT INTO sections (plugin_id, title_en, title_zh, slug, sort_order, created_at, updated_at) VALUES
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Overview', '概览', 'overview', 0, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Quick Start', '快速开始', 'quick-start', 1, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Editor Workflow', '编辑器工作流', 'editor-workflow', 2, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'HTML/CSS Basics', 'HTML/CSS 基础', 'html-css-basics', 3, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'CSS Filters', 'CSS 滤镜', 'css-filters', 4, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'UI Sound', 'UI 音效', 'ui-sound', 5, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Animations & Transitions', '动画与过渡', 'animations', 6, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Animation Watch', '动画监听', 'ext-animation-watch', 7, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Custom Components', '自定义组件', 'custom-components', 8, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Data Binding & Templates', '数据绑定与模板', 'data-binding', 9, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Event Bridge', '事件桥', 'event-bridge', 10, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Drag System', '拖拽系统', 'ext-drag', 11, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Form Controls', '表单控件', 'ext-forms', 12, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Modal / Tooltips', '弹窗 / 提示', 'ext-modal', 13, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Password', '密码输入', 'ext-password', 14, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Rendering Pipeline', '渲染管线', 'perf-pipeline', 15, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Widget Pool', 'Widget 组件池', 'perf-pool', 16, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Startup Warmup', '启动预热', 'perf-warmup', 17, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Cook Preprocess', 'Cook 预处理', 'perf-cook', 18, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Debug Console', '调试控制台', 'inspector', 19, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Performance Stats', '性能统计', 'debug-stats', 20, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Blueprint API', 'Blueprint API', 'blueprint-api', 21, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Reference Index', '参考速查', 'ref-index', 22, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Project Settings', '项目设置', 'settings', 23, datetime('now'), datetime('now')),
((SELECT id FROM plugins WHERE slug = 'WebUIX'), 'Known Limitations', '已知限制', 'limitations', 24, datetime('now'), datetime('now'));

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const mode = process.argv.includes('--remote') ? 'remote' : 'local';
const dbName = process.env.D1_DATABASE || 'docforge-db';
const root = process.cwd();
const migrationsDir = resolve(root, 'migrations');
const tmpDir = resolve(root, '.wrangler');

mkdirSync(tmpDir, { recursive: true });

if (!existsSync(migrationsDir)) {
  console.error('Missing migrations directory.');
  process.exit(1);
}

const migrationFiles = readdirSync(migrationsDir)
  .filter(name => /^\d+_.+\.sql$/.test(name))
  .sort();

if (!migrationFiles.length) {
  console.log('No migrations found.');
  process.exit(0);
}

function runWrangler(args) {
  const result = spawnSync('npx', ['wrangler', ...args], {
    cwd: root,
    shell: true,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function runSql(sql, label) {
  const file = resolve(tmpDir, `${label}-${mode}.sql`);
  writeFileSync(file, sql);
  runWrangler(['d1', 'execute', dbName, modeFlag, '--file', file]);
}

function sqlString(value) {
  return String(value).replace(/'/g, "''");
}

const modeFlag = mode === 'remote' ? '--remote' : '--local';

const existingSchemaChecks = {
  '0001_initial.sql': "SELECT name FROM sqlite_master WHERE type='table' AND name='plugins';",
  '0002_translations.sql': "SELECT name FROM sqlite_master WHERE type='table' AND name='translations';",
  '0003_media_placeholder_key.sql': "SELECT name FROM pragma_table_info('media') WHERE name='placeholder_key';",
  '0004_plugin_custom_css.sql': "SELECT name FROM pragma_table_info('plugins') WHERE name='custom_css';",
  '0005_extensions.sql': "SELECT name FROM sqlite_master WHERE type='table' AND name='extensions';",
  '0006_extension_tags.sql': "SELECT name FROM pragma_table_info('extensions') WHERE name='tags';",
  '0007_extension_i18n.sql': "SELECT name FROM pragma_table_info('extensions') WHERE name='i18n';",
  '0008_plugin_enabled.sql': "SELECT name FROM pragma_table_info('plugins') WHERE name='enabled';",
  '0009_plugin_custom_js.sql': "SELECT name FROM pragma_table_info('plugins') WHERE name='custom_js';",
  '0010_analytics_events.sql': "SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_events';",
  '0011_plugins_compatibility_column.sql': "SELECT name FROM pragma_table_info('plugins') WHERE name='compatibility';",
  '0012_extension_html_templates.sql': "SELECT name FROM pragma_table_info('extensions') WHERE name='html';",
};

runSql(
  "CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')));",
  'migration-bootstrap',
);

function queryJson(sql, label) {
  const marker = resolve(tmpDir, `${label}-${mode}.sql`);
  writeFileSync(marker, sql);
  const result = spawnSync('npx', [
    'wrangler', 'd1', 'execute', dbName, modeFlag, '--file', marker, '--json',
  ], {
    cwd: root,
    shell: true,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    process.exit(result.status ?? 1);
  }

  try {
    const stdout = result.stdout || '[]';
    const jsonStart = stdout.indexOf('[');
    return JSON.parse(jsonStart >= 0 ? stdout.slice(jsonStart) : stdout);
  } catch {
    return result.stdout || '';
  }
}

function hasRows(queryResult) {
  if (typeof queryResult === 'string') return false;
  const results = Array.isArray(queryResult) ? queryResult : [queryResult];
  return results.some(item => Array.isArray(item?.results) && item.results.length > 0);
}

function markApplied(file) {
  runSql(
    `INSERT OR IGNORE INTO schema_migrations (filename) VALUES ('${sqlString(file)}');`,
    'migration-mark-applied',
  );
}

for (const file of migrationFiles) {
  const recorded = queryJson(
    `SELECT filename FROM schema_migrations WHERE filename = '${sqlString(file)}';`,
    'migration-recorded',
  );

  if (hasRows(recorded)) {
    console.log(`Skipping ${file}`);
    continue;
  }

  const schemaCheck = existingSchemaChecks[file];
  if (schemaCheck && hasRows(queryJson(schemaCheck, 'migration-schema-check'))) {
    console.log(`Marking ${file} as already applied`);
    markApplied(file);
    continue;
  }

  console.log(`Applying ${file}`);
  runWrangler(['d1', 'execute', dbName, modeFlag, '--file', resolve(migrationsDir, file)]);
  markApplied(file);
}

console.log(`D1 ${mode} migrations complete.`);

#!/usr/bin/env node
/**
 * Fetches non-printing SCSS utility files (functions + mixins) from the
 * WordPress REST API (GET /wp-json/timberland/v1/scss-utils) and writes them
 * directly into the headless non-printing layer, overwriting framework files
 * in place.
 *
 * Writes (overwrites each run):
 *   src/scss/non-printing/functions/_{name}.scss  (one per function file)
 *   src/scss/non-printing/functions/_all.scss      (barrel — regenerated)
 *   src/scss/non-printing/mixins/_{name}.scss      (one per mixin file)
 *   src/scss/non-printing/mixins/_all.scss         (barrel — regenerated)
 *
 * Files never touched: _custom-functions.scss, _custom-mixins.scss,
 * _custom-placeholders.scss, _export-data.scss
 *
 * No .generated suffix — the WP files reference each other by base name
 * (e.g. @use "utilities") so those cross-references must resolve as-is.
 * Files carry an AUTO-GENERATED header to make their origin clear.
 *
 * Set SYNC_SCSS_UTILS=false in .env.local to skip (writes placeholder stubs
 * so builds succeed offline). TIMBERLAND_API_URL must point to the WP install.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const FUNCTIONS_DIR = join(root, 'src', 'scss', 'non-printing', 'functions');
const MIXINS_DIR    = join(root, 'src', 'scss', 'non-printing', 'mixins');

// Framework files served by the endpoint. Used for placeholder generation.
// Update when the endpoint adds or removes files.
const FUNCTION_NAMES = ['utilities', 'colors', 'rem', 'em', 'letter-spacing', 'css-vars', 'svg-bg', 'zindex'];
const MIXIN_NAMES    = ['content-utilities', 'flex-card-grid', 'layout-utilities', 'css-grid', 'flexbox', 'css-columns'];

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------
function loadDotEnv(path) {
  if (!existsSync(path)) return {};
  const result = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
    result[key] = val;
  }
  return result;
}

const env = { ...loadDotEnv(join(root, '.env.local')), ...process.env };

// ---------------------------------------------------------------------------
// Barrel writers
// ---------------------------------------------------------------------------

// Write functions/_all.scss. When names is null, uses FUNCTION_NAMES.
function writeFunctionBarrel(names, sourceUrl) {
  const list = names ?? FUNCTION_NAMES;
  const src  = sourceUrl ?? '(not yet synced)';
  const lines = [
    '// AUTO-GENERATED — do not edit manually. Managed by sync-scss-utils.mjs.',
    '// Source: ' + src,
    '// Run `npm run sync-scss-utils` to refresh.',
    '',
    ...list.map(n => '@forward "' + n + '";'),
    '@forward "custom-functions";',
    '',
  ];
  writeFileSync(join(FUNCTIONS_DIR, '_all.scss'), lines.join('\n'), 'utf8');
}

// Write mixins/_all.scss. When names is null, uses MIXIN_NAMES.
function writeMixinBarrel(names, sourceUrl) {
  const list = names ?? MIXIN_NAMES;
  const src  = sourceUrl ?? '(not yet synced)';
  const lines = [
    '// AUTO-GENERATED — do not edit manually. Managed by sync-scss-utils.mjs.',
    '// Source: ' + src,
    '// Run `npm run sync-scss-utils` to refresh.',
    '',
    ...list.map(n => '@forward "' + n + '";'),
    '@forward "export-data";',
    '@forward "custom-mixins";',
    '@forward "custom-placeholders";',
    '',
  ];
  writeFileSync(join(MIXINS_DIR, '_all.scss'), lines.join('\n'), 'utf8');
}

// ---------------------------------------------------------------------------
// Placeholder helpers — ensure framework files exist so builds don't fail
// after a fresh clone or when sync is disabled.
// ---------------------------------------------------------------------------
function ensurePlaceholders() {
  const stub = '// AUTO-GENERATED — run `npm run sync-scss-utils` to populate.\n';
  for (const name of FUNCTION_NAMES) {
    const out = join(FUNCTIONS_DIR, '_' + name + '.scss');
    if (!existsSync(out)) writeFileSync(out, stub, 'utf8');
  }
  for (const name of MIXIN_NAMES) {
    const out = join(MIXINS_DIR, '_' + name + '.scss');
    if (!existsSync(out)) writeFileSync(out, stub, 'utf8');
  }
  writeFunctionBarrel(null);
  writeMixinBarrel(null);
}

if (env.SYNC_SCSS_UTILS === 'false') {
  ensurePlaceholders();
  console.log('[sync-scss-utils] SYNC_SCSS_UTILS=false — skipped.');
  process.exit(0);
}

if (!env.TIMBERLAND_API_URL) {
  ensurePlaceholders();
  console.log('[sync-scss-utils] TIMBERLAND_API_URL not set — skipped. Add it to .env.local to enable scss-utils sync.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------
const base = env.TIMBERLAND_API_URL.replace(/\/$/, '');
const url  = base + '/wp-json/timberland/v1/scss-utils';

console.log('[sync-scss-utils] Fetching ' + url);

let utils;
try {
  const res = await fetch(url);
  if (!res.ok) {
    console.error('[sync-scss-utils] HTTP ' + res.status + ' ' + res.statusText + ' — aborting.');
    process.exit(1);
  }
  utils = await res.json();
} catch (err) {
  console.error('[sync-scss-utils] Fetch failed: ' + err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Post-processing transforms applied to all synced files before writing
// ---------------------------------------------------------------------------

// Strip IE 7 *zoom hack — produces invalid CSS that Turbopack's PostCSS parser
// rejects. The enclosing block is left intact; only the *zoom line is removed.
function postProcess(content) {
  return content.replace(/[ \t]*\*zoom\s*:\s*\d+\s*;\n?/g, '');
}

// ---------------------------------------------------------------------------
// Write framework files (overwrite in place)
// ---------------------------------------------------------------------------
const functions = utils.functions ?? [];
const mixins    = utils.mixins    ?? [];

let fileCount = 0;

for (const { name, content } of functions) {
  const out = join(FUNCTIONS_DIR, '_' + name + '.scss');
  writeFileSync(out, postProcess(content), 'utf8');
  fileCount++;
}

for (const { name, content } of mixins) {
  const out = join(MIXINS_DIR, '_' + name + '.scss');
  writeFileSync(out, postProcess(content), 'utf8');
  fileCount++;
}

console.log('[sync-scss-utils] Wrote ' + fileCount + ' files (' + functions.length + ' functions, ' + mixins.length + ' mixins).');

// ---------------------------------------------------------------------------
// Regenerate barrel files
// ---------------------------------------------------------------------------
writeFunctionBarrel(functions.map(f => f.name), url);
writeMixinBarrel(mixins.map(m => m.name), url);
console.log('[sync-scss-utils] Regenerated functions/_all.scss and mixins/_all.scss.');

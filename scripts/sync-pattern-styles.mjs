#!/usr/bin/env node
/**
 * Fetches pattern SCSS source files and the block→pattern dependency map from
 * the WordPress REST API (GET /wp-json/timberland/v1/pattern-styles) and writes
 * them into src/scss/patterns/{level}/{name}.scss.
 *
 * Writes:
 *   src/scss/patterns/{level}/_{name}.scss              (one per pattern, e.g. atoms/_button.scss)
 *   src/scss/manifests/_block-patterns.generated.json  (block → pattern slug mapping)
 *   src/scss/manifests/_pattern-manifest.generated.json (previous-state manifest for change detection)
 *
 * Files never touched: anything not in the API response.
 *
 * Change detection:
 *   On each run the script compares the incoming pattern list against
 *   _pattern-manifest.generated.json (written by the previous run). New patterns
 *   are logged so developers know to wire up component CSS imports. Removed
 *   patterns are overwritten with an empty stub so existing @use references
 *   compile but produce no styles — a clear signal to clean up.
 *
 * Set SYNC_PATTERN_STYLES=false in .env.local to skip. When skipped, the
 * script writes placeholder stubs for any listed patterns that don't exist yet
 * (using the stored manifest) so offline builds still compile.
 * TIMBERLAND_API_URL must point to the WP install.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const PATTERNS_DIR   = join(root, 'src', 'scss', 'patterns');
const MANIFESTS_DIR  = join(root, 'src', 'scss', 'manifests');
const MANIFEST_FILE  = join(MANIFESTS_DIR, '_pattern-manifest.generated.json');
const BLOCKS_FILE    = join(MANIFESTS_DIR, '_block-patterns.generated.json');

const LEVEL_DIRS = ['atoms', 'molecules', 'organisms', 'templates', 'pages'];

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
// Helpers
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function patternPath(level, name) {
  return join(PATTERNS_DIR, level, '_' + name + '.scss');
}

function readManifest() {
  if (!existsSync(MANIFEST_FILE)) return null;
  try {
    return JSON.parse(readFileSync(MANIFEST_FILE, 'utf8'));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Skip / offline placeholder path
// ---------------------------------------------------------------------------
function ensurePlaceholders() {
  ensureDir(PATTERNS_DIR);
  ensureDir(MANIFESTS_DIR);
  for (const level of LEVEL_DIRS) ensureDir(join(PATTERNS_DIR, level));

  const manifest = readManifest();
  if (!manifest) return; // no manifest = no patterns written yet; nothing to placeholder

  const stub = '// AUTO-GENERATED — run `npm run sync-pattern-styles` to populate.\n';
  for (const { name, level } of manifest.patterns ?? []) {
    const out = patternPath(level, name);
    if (!existsSync(out)) writeFileSync(out, stub, 'utf8');
  }
}

if (env.SYNC_PATTERN_STYLES === 'false') {
  ensurePlaceholders();
  console.log('[sync-pattern-styles] SYNC_PATTERN_STYLES=false — skipped.');
  process.exit(0);
}

if (!env.TIMBERLAND_API_URL) {
  ensurePlaceholders();
  console.log('[sync-pattern-styles] TIMBERLAND_API_URL not set — skipped. Add it to .env.local to enable pattern styles sync.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------
const base = env.TIMBERLAND_API_URL.replace(/\/$/, '');
const url  = base + '/wp-json/timberland/v1/pattern-styles';

console.log('[sync-pattern-styles] Fetching ' + url);

let data;
try {
  const res = await fetch(url);
  if (!res.ok) {
    console.error('[sync-pattern-styles] HTTP ' + res.status + ' ' + res.statusText + ' — aborting.');
    process.exit(1);
  }
  data = await res.json();
} catch (err) {
  console.error('[sync-pattern-styles] Fetch failed: ' + err.message);
  process.exit(1);
}

const patterns = data.patterns ?? [];
const blocks   = data.blocks   ?? {};

// ---------------------------------------------------------------------------
// Change detection against stored manifest
// ---------------------------------------------------------------------------
const prevManifest  = readManifest();
const prevPatterns  = prevManifest?.patterns ?? null; // null = first run ever

if (prevPatterns !== null) {
  const prevKeys    = new Set(prevPatterns.map(p => p.level + '/' + p.name));
  const currentKeys = new Set(patterns.map(p => p.level + '/' + p.name));

  const added   = patterns.filter(p => !prevKeys.has(p.level + '/' + p.name));
  const removed = prevPatterns.filter(p => !currentKeys.has(p.level + '/' + p.name));

  if (added.length > 0) {
    const names = added.map(p => p.level + '/' + p.name).join(', ');
    console.log('[sync-pattern-styles] ' + added.length + ' new pattern' + (added.length === 1 ? '' : 's') + ' appeared: ' + names);
    console.log('[sync-pattern-styles] Add @use "patterns/{level}/{name}" imports to the relevant component CSS modules.');
  }

  if (removed.length > 0) {
    for (const p of removed) {
      const out = patternPath(p.level, p.name);
      const stub = '// PATTERN REMOVED — ' + p.level + '/' + p.name + ' was removed from the WP theme.\n// Remove @use references to this file from your component CSS modules.\n';
      writeFileSync(out, stub, 'utf8');
    }
    const names = removed.map(p => p.level + '/' + p.name).join(', ');
    console.log('[sync-pattern-styles] ' + removed.length + ' pattern' + (removed.length === 1 ? '' : 's') + ' removed: ' + names);
    console.log('[sync-pattern-styles] Stubs written — remove @use references from component CSS modules and delete the stub files.');
  }
}

// ---------------------------------------------------------------------------
// Ensure directories exist
// ---------------------------------------------------------------------------
ensureDir(PATTERNS_DIR);
ensureDir(MANIFESTS_DIR);
for (const level of LEVEL_DIRS) ensureDir(join(PATTERNS_DIR, level));

// ---------------------------------------------------------------------------
// Write pattern SCSS files
// ---------------------------------------------------------------------------
let fileCount = 0;

const USE_VARIABLES = '@use "variables" as *;\n';

for (const { name, level, scss } of patterns) {
  const out = patternPath(level, name);
  // WP webpack injects variables via additionalData; Dart Sass module isolation
  // means @use-loaded partials don't receive that injection. Prepend explicitly.
  const content = scss.startsWith('@use "variables"') ? scss : USE_VARIABLES + scss;
  writeFileSync(out, content, 'utf8');
  fileCount++;
}

console.log('[sync-pattern-styles] Wrote ' + fileCount + ' pattern files.');

// ---------------------------------------------------------------------------
// Write blocks mapping
// ---------------------------------------------------------------------------
writeFileSync(BLOCKS_FILE, JSON.stringify(blocks, null, 2) + '\n', 'utf8');
console.log('[sync-pattern-styles] Wrote _block-patterns.generated.json (' + Object.keys(blocks).length + ' block mappings).');

// ---------------------------------------------------------------------------
// Update manifest
// ---------------------------------------------------------------------------
const manifest = {
  generated_at: new Date().toISOString(),
  source: url,
  patterns: patterns.map(({ name, level }) => ({ name, level })),
};
writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

if (prevPatterns === null) {
  console.log('[sync-pattern-styles] First sync — ' + patterns.length + ' patterns written. Add @use "patterns/{level}/{name}" imports to component CSS modules as needed.');
}

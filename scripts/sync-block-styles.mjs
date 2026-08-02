#!/usr/bin/env node
/**
 * Fetches framework block SCSS source files from the WordPress REST API
 * (GET /wp-json/timberland/v1/block-styles) and writes them into
 * src/scss/blocks/_{slug}.scss.
 *
 * These synced files are the source layer — do not edit them directly. To
 * include a block's styles in the global stylesheet, add a @forward entry to
 * src/scss/printing/wordpress/blocks/timberland/_all.scss. To add overrides,
 * create src/scss/printing/wordpress/blocks/timberland/_{slug}.scss with
 * @use "../../../../blocks/{slug}" plus your custom rules and forward that file instead.
 * Block components can also @use "blocks/{slug}" directly in .module.scss files.
 *
 * Writes:
 *   src/scss/blocks/_{slug}.scss              (one per block, overwritten on each run)
 *   src/scss/blocks/_manifest.generated.json
 *
 * Change detection:
 *   Compares against the stored manifest. New blocks are logged; removed blocks
 *   are stubbed so existing @use references compile but produce no styles.
 *
 * Set SYNC_BLOCK_STYLES=false in .env.local to skip. When skipped the script
 * writes placeholder stubs for any listed blocks that don't exist yet so
 * offline builds still compile.
 * TIMBERLAND_API_URL must point to the WP install.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const BLOCKS_DIR    = join(root, 'src', 'scss', 'blocks');
const MANIFEST_FILE = join(BLOCKS_DIR, '_manifest.generated.json');

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

function blockPath(slug) {
  return join(BLOCKS_DIR, '_' + slug + '.scss');
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
  ensureDir(BLOCKS_DIR);

  const manifest = readManifest();
  if (!manifest) return;

  const stub = '// AUTO-GENERATED — run `npm run sync-block-styles` to populate.\n';
  for (const slug of manifest.slugs ?? []) {
    if (!existsSync(blockPath(slug))) writeFileSync(blockPath(slug), stub, 'utf8');
  }
}

if (env.SYNC_BLOCK_STYLES === 'false') {
  ensurePlaceholders();
  console.log('[sync-block-styles] SYNC_BLOCK_STYLES=false — skipped.');
  process.exit(0);
}

if (!env.TIMBERLAND_API_URL) {
  ensurePlaceholders();
  console.log('[sync-block-styles] TIMBERLAND_API_URL not set — skipped. Add it to .env.local to enable block styles sync.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------
const base = env.TIMBERLAND_API_URL.replace(/\/$/, '');
const url  = base + '/wp-json/timberland/v1/block-styles';

console.log('[sync-block-styles] Fetching ' + url);

let data;
try {
  const res = await fetch(url);
  if (!res.ok) {
    console.error('[sync-block-styles] HTTP ' + res.status + ' ' + res.statusText + ' — aborting.');
    process.exit(1);
  }
  data = await res.json();
} catch (err) {
  console.error('[sync-block-styles] Fetch failed: ' + err.message);
  process.exit(1);
}

const blocks = data.blocks ?? [];

// ---------------------------------------------------------------------------
// Change detection against stored manifest
// ---------------------------------------------------------------------------
const prevManifest = readManifest();
const prevSlugs    = prevManifest?.slugs ?? null; // null = first run ever

if (prevSlugs !== null) {
  const prevSet    = new Set(prevSlugs);
  const currentSet = new Set(blocks.map(b => b.slug));

  const added   = blocks.filter(b => !prevSet.has(b.slug));
  const removed = prevSlugs.filter(s => !currentSet.has(s));

  if (added.length > 0) {
    const names = added.map(b => b.slug).join(', ');
    console.log('[sync-block-styles] ' + added.length + ' new block' + (added.length === 1 ? '' : 's') + ': ' + names);
    console.log('[sync-block-styles] Add @forward "blocks/{slug}" to src/scss/printing/wordpress/blocks/timberland/_all.scss to include in the global stylesheet.');
  }

  if (removed.length > 0) {
    for (const slug of removed) {
      const stub = '// BLOCK REMOVED — ' + slug + ' was removed from the WP theme.\n// This stub keeps existing @use references compiling — safe to delete.\n';
      writeFileSync(blockPath(slug), stub, 'utf8');
    }
    const names = removed.join(', ');
    console.log('[sync-block-styles] ' + removed.length + ' block' + (removed.length === 1 ? '' : 's') + ' removed: ' + names + '. Stubs written.');
  }
}

// ---------------------------------------------------------------------------
// Ensure directory exists
// ---------------------------------------------------------------------------
ensureDir(BLOCKS_DIR);

// ---------------------------------------------------------------------------
// Write block SCSS files
// ---------------------------------------------------------------------------
let fileCount = 0;

const USE_VARIABLES = '@use "variables" as *;\n';

for (const { slug, scss } of blocks) {
  // WP webpack injects variables via additionalData; Dart Sass module isolation
  // means synced files don't receive that injection. Prepend explicitly when needed.
  const content = scss.startsWith('@use "variables"') ? scss : USE_VARIABLES + scss;
  writeFileSync(blockPath(slug), content, 'utf8');
  fileCount++;
}

console.log('[sync-block-styles] Wrote ' + fileCount + ' block files to src/scss/blocks/.');

// ---------------------------------------------------------------------------
// Update manifest
// ---------------------------------------------------------------------------
const slugs = blocks.map(b => b.slug).sort();
const manifest = {
  generated_at: new Date().toISOString(),
  source: url,
  slugs,
};
writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

if (prevSlugs === null) {
  console.log('[sync-block-styles] First sync — ' + blocks.length + ' blocks written.');
  console.log('[sync-block-styles] Add @forward "blocks/{slug}" entries to src/scss/printing/wordpress/blocks/timberland/_all.scss for each block you want in the global stylesheet.');
}

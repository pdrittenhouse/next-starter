#!/usr/bin/env node
/**
 * Fetches the compiled SVG spritemap from the WordPress REST API
 * (GET /wp-json/timberland/v1/icons) and writes:
 *
 *   public/spritemap.svg
 *     The full merged spritemap from all theme layers (child > plugin > framework).
 *     Icons are referenced in templates as:
 *       <svg><use href="/spritemap.svg#sprite-{name}"></use></svg>
 *
 * Requires TIMBERLAND_API_URL in .env.local (same var used by sync-tokens).
 * Set SYNC_ICONS=false to skip without error (e.g. in CI without a WP instance).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const OUT  = join(root, 'public', 'spritemap.svg');

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

function ensurePlaceholder() {
  if (!existsSync(OUT)) {
    writeFileSync(OUT, '<svg xmlns="http://www.w3.org/2000/svg"><!-- run `npm run sync-icons` to populate --></svg>\n', 'utf8');
  }
}

if (env.SYNC_ICONS === 'false') {
  ensurePlaceholder();
  console.log('[sync-icons] SYNC_ICONS=false — skipped.');
  process.exit(0);
}

if (!env.TIMBERLAND_API_URL) {
  ensurePlaceholder();
  console.log('[sync-icons] TIMBERLAND_API_URL not set — skipped. Add it to .env.local to enable icon sync.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------
const base = env.TIMBERLAND_API_URL.replace(/\/$/, '');
const url  = `${base}/wp-json/timberland/v1/icons`;

console.log(`[sync-icons] Fetching ${url}`);

let data;
try {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[sync-icons] HTTP ${res.status} ${res.statusText} — aborting.`);
    process.exit(1);
  }
  data = await res.json();
} catch (err) {
  console.error(`[sync-icons] Fetch failed: ${err.message}`);
  process.exit(1);
}

if (!data?.spritemap) {
  console.error('[sync-icons] Response missing spritemap field — aborting.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
writeFileSync(OUT, data.spritemap, 'utf8');
console.log(`[sync-icons] Wrote public/spritemap.svg (source: ${data.url ?? url})`);

#!/usr/bin/env node
/**
 * Reads the active child theme's theme.json from the WordPress install and
 * generates src/scss/printing/wordpress/_global-styles.scss.
 *
 * Generates:
 *   --wp--preset--color--* CSS custom properties (from settings.color.palette)
 *   --wp--preset--font-size--* CSS custom properties (from settings.typography.fontSizes)
 *   .has-{slug}-background-color / .has-{slug}-color / .has-{slug}-border-color utility classes
 *   .has-{slug}-font-size utility classes
 *
 * These mirror what WordPress outputs at runtime from theme.json.
 * Required in headless because WP's runtime CSS is not available.
 *
 * Configuration (.env.local):
 *   TIMBERLAND_API_URL   — WP install URL (also used by other sync scripts)
 *   TIMBERLAND_CHILD_SLUG — child theme directory slug (e.g. natural-rose)
 *   SYNC_THEME_JSON=false — skip this script
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const OUTPUT_FILE = join(root, 'src', 'scss', 'printing', 'wordpress', '_global-styles.scss');

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

if (env.SYNC_THEME_JSON === 'false') {
  console.log('[sync-theme-json] SYNC_THEME_JSON=false — skipped.');
  process.exit(0);
}

if (!env.TIMBERLAND_API_URL) {
  console.log('[sync-theme-json] TIMBERLAND_API_URL not set — skipped. Add it to .env.local to enable.');
  process.exit(0);
}

if (!env.TIMBERLAND_CHILD_SLUG) {
  console.log('[sync-theme-json] TIMBERLAND_CHILD_SLUG not set — skipped. Add it to .env.local (e.g. TIMBERLAND_CHILD_SLUG=natural-rose).');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------
const base = env.TIMBERLAND_API_URL.replace(/\/$/, '');
const url  = `${base}/wp-content/themes/${env.TIMBERLAND_CHILD_SLUG}/theme.json`;

console.log('[sync-theme-json] Fetching ' + url);

let themeJson;
try {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[sync-theme-json] HTTP ${res.status} ${res.statusText} — aborting.`);
    process.exit(1);
  }
  themeJson = await res.json();
} catch (err) {
  console.error('[sync-theme-json] Fetch failed: ' + err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Extract palette and font sizes
// ---------------------------------------------------------------------------
const palette   = themeJson?.settings?.color?.palette   ?? [];
const fontSizes = themeJson?.settings?.typography?.fontSizes ?? [];

if (palette.length === 0 && fontSizes.length === 0) {
  console.log('[sync-theme-json] No color palette or font sizes found in theme.json — nothing to generate.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Generate SCSS
// ---------------------------------------------------------------------------
const lines = [
  `// AUTO-GENERATED — run \`npm run sync-theme-json\` to update.`,
  `// Source: ${env.TIMBERLAND_CHILD_SLUG}/theme.json`,
  `// Mirrors CSS that WordPress generates at runtime from theme.json settings.`,
  `// Required in headless because WP's runtime global-styles CSS is not loaded.`,
  `//`,
  `// Color palette entries: ${palette.length}`,
  `// Font size entries:     ${fontSizes.length}`,
  ``,
];

// CSS custom properties
if (palette.length > 0 || fontSizes.length > 0) {
  lines.push(`:root {`);

  if (palette.length > 0) {
    lines.push(`  // Color palette — mirrors theme.json settings.color.palette`);
    for (const { slug, color } of palette) {
      lines.push(`  --wp--preset--color--${slug}: ${color};`);
    }
  }

  if (palette.length > 0 && fontSizes.length > 0) {
    lines.push('');
  }

  if (fontSizes.length > 0) {
    lines.push(`  // Font sizes — mirrors theme.json settings.typography.fontSizes`);
    for (const { slug, size } of fontSizes) {
      lines.push(`  --wp--preset--font-size--${slug}: ${size};`);
    }
  }

  lines.push(`}`, ``);
}

// Color utility classes
if (palette.length > 0) {
  lines.push(`// Color utility classes — applied to blocks when a color is set in the editor`);
  for (const { slug } of palette) {
    lines.push(`// ${slug}`);
    lines.push(`.has-${slug}-background-color { background-color: var(--wp--preset--color--${slug}) !important; }`);
    lines.push(`.has-${slug}-color             { color: var(--wp--preset--color--${slug}) !important; }`);
    lines.push(`.has-${slug}-border-color      { border-color: var(--wp--preset--color--${slug}) !important; }`);
  }
  lines.push('');
}

// Font size utility classes
if (fontSizes.length > 0) {
  lines.push(`// Font size utility classes`);
  for (const { slug } of fontSizes) {
    lines.push(`.has-${slug}-font-size { font-size: var(--wp--preset--font-size--${slug}) !important; }`);
  }
  lines.push('');
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');
console.log(`[sync-theme-json] Wrote _global-styles.scss (${palette.length} colors, ${fontSizes.length} font sizes).`);

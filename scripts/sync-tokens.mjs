#!/usr/bin/env node
/**
 * Fetches compiled SCSS design tokens from the WordPress REST API
 * (GET /wp-json/timberland/v1/design-tokens) and writes
 * src/scss/non-printing/_synced.generated.scss.
 *
 * All 14 expected Bootstrap variables are always written — null when the WP
 * theme doesn't override them. This guarantees that `@use "../synced.generated"
 * as s;` in _bootstrap.scss can always reference `s.$var` without "Undefined
 * variable" errors.
 *
 * _bootstrap.scss uses `if(s.$var != null, s.$var, fallback)` for each variable
 * so the developer's fallback is used when the synced value is null.
 *
 * scssBootstrap key → Sass variable mapping:
 *   Most keys map directly (e.g. btn-border-radius → $btn-border-radius).
 *   Exception: font-family-headings → $headings-font-family (Bootstrap name).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const OUT = join(root, 'src', 'scss', 'non-printing', '_synced.generated.scss');

// All expected Bootstrap variables. Always written — null if WP theme doesn't set them.
// [jsonKey, sassVarName]
const BOOTSTRAP_VARS = [
  ['line-height-base',      'line-height-base'],
  ['h1-font-size',          'h1-font-size'],
  ['h2-font-size',          'h2-font-size'],
  ['h3-font-size',          'h3-font-size'],
  ['h4-font-size',          'h4-font-size'],
  ['h5-font-size',          'h5-font-size'],
  ['h6-font-size',          'h6-font-size'],
  ['font-family-base',      'font-family-base'],
  ['font-family-headings',  'headings-font-family'],
  ['link-color',            'link-color'],
  ['link-hover-color',      'link-hover-color'],
  ['btn-border-radius',     'btn-border-radius'],
  ['body-bg',               'body-bg'],
  ['body-color',            'body-color'],
];

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

// Ensure the file always exists so builds don't fail after a fresh clone.
// Writes null for all expected variables so _bootstrap.scss @use references
// are never "Undefined variable".
function ensurePlaceholder() {
  if (!existsSync(OUT)) {
    const nullLines = BOOTSTRAP_VARS.map(([, sassVar]) => `$${sassVar}: null !default;`);
    const content = [
      '// AUTO-GENERATED — run `npm run sync-tokens` to populate.',
      '',
      '// Bootstrap tokens (all null until sync runs)',
      ...nullLines,
      '',
    ].join('\n');
    writeFileSync(OUT, content, 'utf8');
  }
}

if (env.SYNC_TOKENS === 'false') {
  ensurePlaceholder();
  console.log('[sync-tokens] SYNC_TOKENS=false — skipped.');
  process.exit(0);
}

if (!env.TIMBERLAND_API_URL) {
  ensurePlaceholder();
  console.log('[sync-tokens] TIMBERLAND_API_URL not set — skipped. Add it to .env.local to enable token sync.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------
const base = env.TIMBERLAND_API_URL.replace(/\/$/, '');
const url  = `${base}/wp-json/timberland/v1/design-tokens`;

console.log(`[sync-tokens] Fetching ${url}`);

let tokens;
try {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[sync-tokens] HTTP ${res.status} ${res.statusText} — aborting.`);
    process.exit(1);
  }
  tokens = await res.json();
} catch (err) {
  console.error(`[sync-tokens] Fetch failed: ${err.message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

/**
 * Convert a JSON value to a Sass literal, or return null for missing/null values.
 * CSS function values (rgb(), calc(), var(), etc.) are written unquoted.
 * Everything else that is a string is quoted.
 */
function toSassLiteral(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number')  return String(val);
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'string') {
    // CSS/Sass functions and hex colors — write unquoted
    if (/^(rgb|rgba|hsl|hsla|calc|var|linear-gradient|#)/.test(val)) return val;
    // Font stacks and other quoted strings
    return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Build output
// ---------------------------------------------------------------------------
const bootstrap = tokens.scssBootstrap ?? {};

const lines = [
  '// AUTO-GENERATED — do not edit manually.',
  `// Source: ${url}`,
  '// Run `npm run sync-tokens` to refresh.',
  '//',
  '// All 14 Bootstrap token variables are always written.',
  '// null = WP theme uses Bootstrap default; _bootstrap.scss if() falls back to its own value.',
  '',
  '// --- Bootstrap tokens ---',
];

let nonNullCount = 0;
for (const [jsonKey, sassVar] of BOOTSTRAP_VARS) {
  const raw = bootstrap[jsonKey];
  const sassVal = toSassLiteral(raw);
  if (sassVal !== null) {
    lines.push(`$${sassVar}: ${sassVal} !default;`);
    nonNullCount++;
  } else {
    lines.push(`$${sassVar}: null !default;`);
  }
}

lines.push('');

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
writeFileSync(OUT, lines.join('\n'), 'utf8');
const rel = OUT.replace(root + '/', '');
console.log(`[sync-tokens] Wrote ${rel} (${nonNullCount} of ${BOOTSTRAP_VARS.length} variables synced).`);

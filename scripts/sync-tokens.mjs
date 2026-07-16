#!/usr/bin/env node
/**
 * Fetches compiled SCSS design tokens from the WordPress REST API
 * (GET /wp-json/timberland/v1/design-tokens) and writes
 * src/scss/non-printing/_synced.generated.scss.
 *
 * Synced tokens:
 *   Scalar Bootstrap variables (from scssBootstrap key)
 *   $font-size-base          (from fontSizes.base)
 *   $grid-breakpoints        (from scssBreakpoints)
 *   $container-max-widths    (from contentWidths)
 *   $spacers                 (from scssSpacing)
 *   $theme-colors            (from scssColors)
 *
 * All variables are always written — null when the WP theme doesn't provide them.
 * This guarantees @use references in _bootstrap.scss never throw "Undefined variable".
 * _bootstrap.scss uses if(s.$var != null, s.$var, fallback) for each variable.
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

// Bootstrap scalar variables. Always written — null if WP theme doesn't set them.
// [jsonKey within scssBootstrap, sassVarName]
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

// Map tokens: [top-level JSON key, Sass variable name]
const SASS_MAPS = [
  ['scssBreakpoints', 'grid-breakpoints'],
  ['contentWidths',   'container-max-widths'],
  ['scssSpacing',     'spacers'],
  ['scssColors',      'theme-colors'],
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
function ensurePlaceholder() {
  if (!existsSync(OUT)) {
    const nullScalars = BOOTSTRAP_VARS.map(([, v]) => `$${v}: null !default;`);
    const nullMaps = SASS_MAPS.map(([, v]) => `$${v}: null !default;`);
    const content = [
      '// AUTO-GENERATED — run `npm run sync-tokens` to populate.',
      '',
      '// Bootstrap scalar tokens (all null until sync runs)',
      ...nullScalars,
      '$font-size-base: null !default;',
      '',
      '// Synced map tokens (all null until sync runs)',
      ...nullMaps,
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
 * CSS function values (rgb(), calc(), var(), etc.) and CSS dimension values
 * (18.75rem, 64em, etc.) are written unquoted. Everything else is quoted.
 */
function toSassLiteral(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number')  return String(val);
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (Array.isArray(val)) {
    // Font stacks serialized as arrays: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"]
    // Items with spaces are re-quoted; bare identifiers are left unquoted.
    if (val.length === 0) return null;
    const parts = val.map(item => {
      const s = String(item);
      return /\s/.test(s) ? `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : s;
    });
    return parts.join(', ');
  }
  if (typeof val === 'string') {
    // CSS/Sass functions and hex colors — write unquoted
    if (/^(rgb|rgba|hsl|hsla|calc|var|linear-gradient|#)/.test(val)) return val;
    // CSS dimension values (e.g. 18.75rem, 64em, 1.5rem, 0px) — write unquoted
    if (/^-?\d*\.?\d+(rem|em|px|%|vh|vw|vmin|vmax|pt|cm|mm|in|ex|ch)$/.test(val)) return val;
    // Font stacks and other quoted strings
    return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return null;
}

// Write a Sass map key: numeric strings become unquoted numbers; all others are quoted.
function toSassMapKey(k) {
  return /^-?\d+(\.\d+)?$/.test(k) ? k : `"${k}"`;
}

// Serialize a plain JS object as a Sass map literal, or return null if empty/invalid.
function toSassMap(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const entries = Object.entries(obj);
  if (entries.length === 0) return null;
  const lines = entries.map(([k, v]) => {
    const sassVal = toSassLiteral(v);
    return sassVal !== null ? `  ${toSassMapKey(k)}: ${sassVal}` : null;
  }).filter(Boolean);
  if (lines.length === 0) return null;
  return `(\n${lines.join(',\n')},\n)`;
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
  '// Scalar and map tokens are always written.',
  '// null = WP theme uses Bootstrap default; _bootstrap.scss if() falls back to its own value.',
  '',
  '// --- Bootstrap scalar tokens ---',
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

// $font-size-base from fontSizes.base (separate top-level key, not in scssBootstrap)
const fontSizeBase = toSassLiteral(tokens.fontSizes?.base ?? null);
if (fontSizeBase !== null) {
  lines.push(`$font-size-base: ${fontSizeBase} !default;`);
  nonNullCount++;
} else {
  lines.push('$font-size-base: null !default;');
}

lines.push('', '// --- Synced map tokens ---');

for (const [jsonKey, sassVar] of SASS_MAPS) {
  const obj = tokens[jsonKey];
  const sassMap = obj ? toSassMap(obj) : null;
  if (sassMap !== null) {
    lines.push(`$${sassVar}: ${sassMap} !default;`);
    nonNullCount++;
  } else {
    lines.push(`$${sassVar}: null !default;`);
  }
}

lines.push('');

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
const totalVars = BOOTSTRAP_VARS.length + 1 + SASS_MAPS.length; // scalars + font-size-base + maps
writeFileSync(OUT, lines.join('\n'), 'utf8');
const rel = OUT.replace(root + '/', '');
console.log(`[sync-tokens] Wrote ${rel} (${nonNullCount} of ${totalVars} variables synced).`);

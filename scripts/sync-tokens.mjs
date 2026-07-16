#!/usr/bin/env node
/**
 * Fetches compiled SCSS design tokens from the WordPress REST API
 * (GET /wp-json/timberland/v1/design-tokens) and writes two files:
 *
 *   src/scss/non-printing/_synced.generated.scss
 *     Scalar Bootstrap variables (from scssBootstrap key)
 *     $font-size-base/lg/sm      (from fontSizes key)
 *     $font-stack-*              (from fontFamilies key)
 *     $font-weight-*             (from fontWeights key)
 *     $grid-breakpoints          (from scssBreakpoints)
 *     $container-max-widths      (from contentWidths)
 *     $spacers                   (from scssSpacing)
 *     $theme-colors              (from scssColors)
 *     $c-palette                 (derived from scssColors, nested map)
 *     $z-indexes                 (from scssZIndexes — Sass list)
 *     $transition-short/medium/long (from transitionDurations)
 *
 *   src/scss/printing/_synced-css-variables.scss
 *     :root { --button-*: value; }  (from buttonVariables)
 *
 * All variables are always written — null when the WP theme doesn't provide them.
 * This guarantees @use references never throw "Undefined variable".
 * Consumer files use if(s.$var != null, s.$var, fallback) for each variable.
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
const OUT          = join(root, 'src', 'scss', 'non-printing', '_synced.generated.scss');
const OUT_PRINTING = join(root, 'src', 'scss', 'printing', '_synced-css-variables.scss');

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

// Font stack variables from fontFamilies top-level key.
// [jsonKey within fontFamilies, sassVarName]
const FONT_STACK_VARS = [
  ['font-stack-serif',      'font-stack-serif'],
  ['font-stack-sans-serif', 'font-stack-sans-serif'],
  ['font-stack-base',       'font-stack-base'],
  ['font-stack-headings',   'font-stack-headings'],
  ['font-stack-monospace',  'font-stack-monospace'],
  ['font-stack-code',       'font-stack-code'],
  ['font-stack-buttons',    'font-stack-buttons'],
];

// Font weight variables from fontWeights top-level key.
// [jsonKey within fontWeights, sassVarName]
const FONT_WEIGHT_VARS = [
  ['light',  'font-weight-light'],
  ['normal', 'font-weight-normal'],
  ['bold',   'font-weight-bold'],
];

// Map tokens: [top-level JSON key, Sass variable name]
const SASS_MAPS = [
  ['scssBreakpoints', 'grid-breakpoints'],
  ['contentWidths',   'container-max-widths'],
  ['scssSpacing',     'spacers'],
  ['scssColors',      'theme-colors'],
];

// Transition duration scalars from transitionDurations key.
// [jsonKey within transitionDurations, sassVarName]
const TRANSITION_VARS = [
  ['short',  'transition-short'],
  ['medium', 'transition-medium'],
  ['long',   'transition-long'],
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

// Ensure both output files always exist so builds don't fail after a fresh clone.
function ensurePlaceholder() {
  if (!existsSync(OUT)) {
    const nullBootstrap    = BOOTSTRAP_VARS.map(([, v]) => `$${v}: null !default;`);
    const nullFontStacks   = FONT_STACK_VARS.map(([, v]) => `$${v}: null !default;`);
    const nullWeights      = FONT_WEIGHT_VARS.map(([, v]) => `$${v}: null !default;`);
    const nullMaps         = SASS_MAPS.map(([, v]) => `$${v}: null !default;`);
    const nullTransitions  = TRANSITION_VARS.map(([, v]) => `$${v}: null !default;`);
    const content = [
      '// AUTO-GENERATED — run `npm run sync-tokens` to populate.',
      '',
      '// Bootstrap scalar tokens (all null until sync runs)',
      ...nullBootstrap,
      '$font-size-base: null !default;',
      '$font-size-lg: null !default;',
      '$font-size-sm: null !default;',
      '',
      '// Font stack tokens (all null until sync runs)',
      ...nullFontStacks,
      '',
      '// Font weight tokens (all null until sync runs)',
      ...nullWeights,
      '',
      '// Synced map tokens (all null until sync runs)',
      ...nullMaps,
      '$c-palette: null !default;',
      '$z-indexes: null !default;',
      '',
      '// Transition duration tokens (all null until sync runs)',
      ...nullTransitions,
      '',
    ].join('\n');
    writeFileSync(OUT, content, 'utf8');
  }
  if (!existsSync(OUT_PRINTING)) {
    writeFileSync(OUT_PRINTING, '// AUTO-GENERATED — run `npm run sync-tokens` to populate.\n', 'utf8');
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
    // CSS dimension values (e.g. 18.75rem, 64em, 1.5rem, 0px, 200ms) — write unquoted
    if (/^-?\d*\.?\d+(rem|em|px|%|vh|vw|vmin|vmax|pt|cm|mm|in|ex|ch|ms|s)$/.test(val)) return val;
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
// CSS value serializer (for printing/_synced-css-variables.scss)
// ---------------------------------------------------------------------------

/**
 * Convert a JSON value to a CSS custom property value string, or return null.
 * Used for the printing output file only — does not produce Sass syntax.
 */
function toCssValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    // Font family lists: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"]
    // Multi-word names get CSS double-quotes; single-word are bare identifiers.
    if (val.length === 0) return null;
    return val.map(item => {
      const s = String(item);
      return /\s/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s;
    }).join(', ');
  }
  if (typeof val === 'string') return val;
  return null;
}

// ---------------------------------------------------------------------------
// $c-palette builder
// ---------------------------------------------------------------------------

// Semantic role keys are excluded from $c-palette (they belong in $theme-colors only).
const SEMANTIC_ROLES = new Set([
  'primary', 'secondary', 'tertiary', 'quaternary', 'quinary',
  'senary', 'septenary', 'octonary', 'nonary', 'denary',
  'success', 'info', 'warning', 'danger', 'light', 'dark',
]);

const VARIANT_SUFFIXES = ['-dark', '-light', '-ultralight', '-transparent'];

// Build a nested $c-palette structure from the flat scssColors map.
// Colors with variant suffixes (-dark, -light, etc.) become sub-keys of their base color.
function buildCPalette(flatColors) {
  const palette = {};
  for (const [key, value] of Object.entries(flatColors)) {
    if (SEMANTIC_ROLES.has(key)) continue;
    let placed = false;
    for (const suffix of VARIANT_SUFFIXES) {
      if (key.endsWith(suffix)) {
        const baseName = key.slice(0, -suffix.length);
        if (flatColors[baseName] !== undefined && !SEMANTIC_ROLES.has(baseName)) {
          if (!palette[baseName]) palette[baseName] = {};
          palette[baseName][suffix.slice(1)] = value;
          placed = true;
          break;
        }
      }
    }
    if (!placed) {
      if (!palette[key]) palette[key] = {};
      palette[key].base = value;
    }
  }
  return palette;
}

// Serialize the nested palette as a Sass map of maps.
function toNestedSassMap(palette) {
  const entries = Object.entries(palette);
  if (!entries.length) return null;
  const outerLines = entries.map(([name, variants]) => {
    const variantLines = Object.entries(variants).map(([variant, value]) => {
      const sassVal = toSassLiteral(value);
      return sassVal ? `    "${variant}": ${sassVal}` : null;
    }).filter(Boolean);
    if (!variantLines.length) return null;
    return `  "${name}": (\n${variantLines.join(',\n')},\n  )`;
  }).filter(Boolean);
  return outerLines.length ? `(\n${outerLines.join(',\n')},\n)` : null;
}

// ---------------------------------------------------------------------------
// Build output
// ---------------------------------------------------------------------------
const bootstrap          = tokens.scssBootstrap      ?? {};
const fontFamilies       = tokens.fontFamilies       ?? {};
const fontWeights        = tokens.fontWeights        ?? {};
const fontSizes          = tokens.fontSizes          ?? {};
const transitionDurations = tokens.transitionDurations ?? {};

const lines = [
  '// AUTO-GENERATED — do not edit manually.',
  `// Source: ${url}`,
  '// Run `npm run sync-tokens` to refresh.',
  '//',
  '// Scalar and map tokens are always written.',
  '// null = WP theme uses Bootstrap default; consumer files if() fall back to their own value.',
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

// $font-size-base/lg/sm from fontSizes top-level key
for (const [sizeKey, sassVar] of [['base', 'font-size-base'], ['lg', 'font-size-lg'], ['sm', 'font-size-sm']]) {
  const sassVal = toSassLiteral(fontSizes[sizeKey] ?? null);
  if (sassVal !== null) {
    lines.push(`$${sassVar}: ${sassVal} !default;`);
    nonNullCount++;
  } else {
    lines.push(`$${sassVar}: null !default;`);
  }
}

lines.push('', '// --- Font stack tokens ---');

for (const [jsonKey, sassVar] of FONT_STACK_VARS) {
  const raw = fontFamilies[jsonKey];
  const sassVal = toSassLiteral(raw ?? null);
  if (sassVal !== null) {
    lines.push(`$${sassVar}: ${sassVal} !default;`);
    nonNullCount++;
  } else {
    lines.push(`$${sassVar}: null !default;`);
  }
}

lines.push('', '// --- Font weight tokens ---');

for (const [jsonKey, sassVar] of FONT_WEIGHT_VARS) {
  const raw = fontWeights[jsonKey];
  const sassVal = toSassLiteral(raw ?? null);
  if (sassVal !== null) {
    lines.push(`$${sassVar}: ${sassVal} !default;`);
    nonNullCount++;
  } else {
    lines.push(`$${sassVar}: null !default;`);
  }
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

// $c-palette derived from scssColors (nested map of color variants)
const flatColors = tokens.scssColors;
if (flatColors && typeof flatColors === 'object') {
  const palette  = buildCPalette(flatColors);
  const nestedMap = toNestedSassMap(palette);
  if (nestedMap !== null) {
    lines.push(`$c-palette: ${nestedMap} !default;`);
    nonNullCount++;
  } else {
    lines.push('$c-palette: null !default;');
  }
} else {
  lines.push('$c-palette: null !default;');
}

// $z-indexes from scssZIndexes (JSON array → Sass list of quoted strings)
const zIndexes = tokens.scssZIndexes;
if (Array.isArray(zIndexes) && zIndexes.length > 0) {
  const items = zIndexes.map(name => `"${name}"`).join(',\n  ');
  lines.push(`$z-indexes: (\n  ${items},\n) !default;`);
  nonNullCount++;
} else {
  lines.push('$z-indexes: null !default;');
}

lines.push('', '// --- Transition duration tokens ---');

for (const [jsonKey, sassVar] of TRANSITION_VARS) {
  const sassVal = toSassLiteral(transitionDurations[jsonKey] ?? null);
  if (sassVal !== null) {
    lines.push(`$${sassVar}: ${sassVal} !default;`);
    nonNullCount++;
  } else {
    lines.push(`$${sassVar}: null !default;`);
  }
}

lines.push('');

// ---------------------------------------------------------------------------
// Write non-printing file
// ---------------------------------------------------------------------------
const totalVars = BOOTSTRAP_VARS.length + 3 + FONT_STACK_VARS.length + FONT_WEIGHT_VARS.length + SASS_MAPS.length + 1 + 1 + TRANSITION_VARS.length;
writeFileSync(OUT, lines.join('\n'), 'utf8');
const rel = OUT.replace(root + '/', '');
console.log(`[sync-tokens] Wrote ${rel} (${nonNullCount} of ${totalVars} variables synced).`);

// ---------------------------------------------------------------------------
// Build printing CSS variables file (button CSS custom properties)
// ---------------------------------------------------------------------------
const buttonVariables = tokens.buttonVariables;
const printingLines = [
  '// AUTO-GENERATED — do not edit manually.',
  `// Source: ${url}`,
  '// Run `npm run sync-tokens` to refresh.',
  '//',
  '// Button CSS custom property overrides — imported after _css-variables.scss',
  '// so these values win over the hardcoded defaults in that file.',
];

if (buttonVariables && typeof buttonVariables === 'object' && Object.keys(buttonVariables).length > 0) {
  printingLines.push('', ':root {');
  let buttonCount = 0;
  for (const [key, val] of Object.entries(buttonVariables)) {
    const cssVal = toCssValue(val);
    if (cssVal !== null) {
      printingLines.push(`  --button-${key}: ${cssVal};`);
      buttonCount++;
    }
  }
  printingLines.push('}', '');
  writeFileSync(OUT_PRINTING, printingLines.join('\n'), 'utf8');
  const relPrinting = OUT_PRINTING.replace(root + '/', '');
  console.log(`[sync-tokens] Wrote ${relPrinting} (${buttonCount} button CSS custom properties).`);
} else {
  printingLines.push('');
  writeFileSync(OUT_PRINTING, printingLines.join('\n'), 'utf8');
  const relPrinting = OUT_PRINTING.replace(root + '/', '');
  console.log(`[sync-tokens] Wrote ${relPrinting} (no buttonVariables from API).`);
}

#!/usr/bin/env node
/**
 * Generate the icon CSS from what is actually used.
 *
 * Ported from the framework's `src/tools/gen-icons.mjs`, with one deliberate difference in what
 * it produces — see "Why this emits CSS, not registrations" below.
 *
 * Why this exists
 * ----------------
 * Both icon libraries were wrong in opposite directions.
 *
 *   - Bootstrap Icons shipped **all of it**: `@import 'bootstrap-icons/font/bootstrap-icons'`
 *     emitted 2,078 `.bi-*` glyph rules for the handful this codebase names.
 *   - Font Awesome shipped a **hand-maintained** list (`printing/libs/_fa.scss`), and a
 *     hand-maintained list has no mechanism for removing anything: of its five regular icons,
 *     four — `arrow-left`, `chevron-left`, `chevron-right`, `rss` — appear nowhere else in the
 *     repo at all.
 *
 * Both errors are invisible. An icon emitted and never used costs bytes silently; an icon used
 * but never emitted renders as empty space with no console error and no build warning, because
 * the `::before` rule simply does not exist and the `<i>` element is left alone.
 *
 * Three inputs, unioned
 * ---------------------
 *   1. `icon-defaults.mjs`              — icons wanted unconditionally
 *   2. the source scan                  — literal `fa-user` / `bi-gear` tokens in src/
 *   3. `tests/icons/stored-values.json` — what the CMS content uses
 *
 * Sources 2 and 3 are exhaustive between them: an icon reaches the DOM either as a literal
 * class string in a component or as a stored field value, and there is no third path. That
 * matters because these components barely name an icon — `SvgMenuIcon.tsx` composes
 * `<i class="{fa_style} fa-{fa_icon}">` from ACF data at render time, so source alone would see
 * only the few hardcoded ones.
 *
 * Source 3 is produced by `wp timberland icon-scan --out=-` against the WordPress install this
 * app reads from, and committed. Measured 2026-11-05 against headless-test: **zero** icons in
 * every family, across 774 postmeta and 802 option rows. The scan is still load-bearing — the
 * moment an editor picks an icon there, source-only narrowing would silently drop it — so a
 * missing or stale scan is reported rather than assumed empty.
 *
 * Why this emits CSS, not registrations
 * -------------------------------------
 * The framework's version writes `library.add()` registrations and an `icon-manifest.json` that
 * feeds **PurgeCSS's safelist** — purge is what actually narrows its CSS. Neither starter runs
 * PurgeCSS, so a manifest alone would narrow nothing. This version therefore writes the glyph
 * rules directly, which reaches the same outcome without a purge step and without the
 * safelisting a purge would require for runtime-composed class names.
 *
 * Failure policy
 * --------------
 * Deliberately asymmetric, and this is where it diverges from the framework, which fails on any
 * unresolvable name:
 *
 *   - a name from `icon-defaults.mjs` or the content scan that does not resolve  -> FAIL
 *   - a name from the SOURCE scan that does not resolve                          -> warn, drop
 *
 * The source scan is a regex over TypeScript and MDX, so it necessarily picks up prose and
 * identifiers that merely look like icon names — `fa_icon` field docs, Phosphor weight
 * modifiers such as `ph-bold`. Failing the build on those would make the scan unusable.
 * Defaults and stored values are deliberate assertions that an icon exists, so there a miss is
 * a real error and the alternative is emitting nothing and rendering blank.
 *
 *   node scripts/gen-icons.mjs
 *   node scripts/gen-icons.mjs --check    # verify the committed output is current, write nothing
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import defaults from './icon-defaults.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

const BI_PKG = path.join(repoRoot, 'node_modules/bootstrap-icons/font');
const FA_VARS = path.join(
  repoRoot, 'node_modules/@fortawesome/fontawesome-free/scss/_variables.scss',
);

/* ───────────────────────────── library indexes ───────────────────────────── */

/**
 * Bootstrap Icons: name -> codepoint.
 *
 * Read from the package's own `bootstrap-icons.json` (decimal codepoints) rather than parsed out
 * of its Sass, so an upgrade cannot leave the emitted `content:` values disagreeing with the
 * font file shipped alongside them.
 */
async function biIndex() {
  const json = JSON.parse(await readFile(path.join(BI_PKG, 'bootstrap-icons.json'), 'utf8'));
  return new Map(Object.entries(json).map(([name, cp]) => [name, cp.toString(16)]));
}

/**
 * Font Awesome: name -> codepoint, for `$icons` (solid + regular) and `$brand-icons`.
 *
 * Parsed from FA's `_variables.scss` because that is the only machine-readable form the free
 * package ships that is keyed the way the CSS classes are. `metadata/icons.yml` would need a
 * YAML parser as a new dependency to say the same thing.
 */
async function faIndex() {
  const src = await readFile(FA_VARS, 'utf8');

  // Two steps, because FA's maps are indirect: `$icons` lists `"check": $var-check`, and the
  // codepoint lives in a separate `$var-check: \f00c;` definition. Reading only the maps yields
  // variable names, not codepoints -- which resolves every lookup to nothing, silently.
  const codepoints = new Map();
  for (const m of src.matchAll(/^\$var-([a-z0-9-]+):\s*\\([0-9a-f]{3,5});/gim)) {
    codepoints.set(m[1], m[2].toLowerCase());
  }
  if (codepoints.size === 0) {
    throw new Error(`gen-icons: no $var-* codepoints found in ${FA_VARS} -- library layout changed`);
  }

  // The maps say which names belong to which family, which is what decides the font file a
  // glyph renders from: `$icons` is solid + regular, `$brand-icons` is the brands face.
  const read = (mapName) => {
    const start = src.indexOf(`$${mapName}: (`);
    if (start === -1) throw new Error(`gen-icons: $${mapName} not found in ${FA_VARS}`);
    const body = src.slice(start, src.indexOf('\n);', start));
    const out = new Map();
    for (const m of body.matchAll(/"([a-z0-9-]+)":\s*\$var-([a-z0-9-]+)/g)) {
      const cp = codepoints.get(m[2]);
      if (cp) out.set(m[1], cp);
    }
    if (out.size === 0) throw new Error(`gen-icons: $${mapName} parsed to nothing`);
    return out;
  };
  return { icons: read('icons'), brands: read('brand-icons') };
}

/** The `.bi::before` preamble and `@font-face`, copied verbatim from the library at generate
 *  time rather than hand-maintained, so an upgrade carries through. Everything before the map. */
async function biPreamble() {
  const src = await readFile(path.join(BI_PKG, 'bootstrap-icons.scss'), 'utf8');
  const cut = src.indexOf('$bootstrap-icons-map: (');
  if (cut === -1) throw new Error('gen-icons: $bootstrap-icons-map not found — library layout changed');
  return src.slice(0, cut).trimEnd();
}

/* ─────────────────────────────── the scans ───────────────────────────────── */

const SOURCE_EXT = /\.(tsx?|astro|mdx)$/i;

async function sourceFiles(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await sourceFiles(full, out);
    else if (SOURCE_EXT.test(e.name)) out.push(full);
  }
  return out;
}

/** Literal `fa-*` / `bi-*` tokens anywhere in the app source. */
async function scanSource() {
  const found = { fa: new Set(), bi: new Set() };
  for (const file of await sourceFiles(path.join(repoRoot, 'src'))) {
    const text = await readFile(file, 'utf8');
    for (const m of text.matchAll(/\b(fa|bi)-([a-z0-9]+(?:-[a-z0-9]+)*)\b/g)) {
      found[m[1]].add(m[2]);
    }
  }
  return found;
}

/**
 * The content scan, as written by `wp timberland icon-scan`.
 *
 * Its `icons.fa` keys carry the `fa-` prefix and `icons.bi` keys do not — that asymmetry is the
 * scanner's, not a bug here, so both shapes are normalised. `icons.sprite` is a spritemap
 * selection, not a library icon, and is ignored.
 */
async function scanStored() {
  const file = path.join(repoRoot, 'tests/icons/stored-values.json');
  if (!existsSync(file)) {
    console.warn(
      '[gen:icons] WARNING: no tests/icons/stored-values.json.\n'
      + '            Falling back to defaults + source scan, which CANNOT see an icon chosen in\n'
      + '            the CMS. Regenerate with:\n'
      + '              wp timberland icon-scan --out=- > tests/icons/stored-values.json\n',
    );
    return { fa: new Set(), bi: new Set(), stale: true };
  }
  const json = JSON.parse(await readFile(file, 'utf8'));
  const names = (group) =>
    new Set(Object.keys(json?.icons?.[group] ?? {}).map((n) => n.replace(/^(fa|bi)-/, '')));
  return { fa: names('fa'), bi: names('bi'), generatedAt: json.generated_at, site: json.site_url };
}

/* ─────────────────────────────── resolution ──────────────────────────────── */

const problems = [];

/**
 * @param {Set<string>} names
 * @param {Map<string,string>[]} indexes  Searched in order; first hit wins.
 * @param {string} origin                 'default' | 'stored' | 'source'
 */
function resolve(names, indexes, origin, library) {
  const hits = new Map();
  for (const name of names) {
    const idx = indexes.find((m) => m.has(name));
    if (idx) {
      hits.set(name, idx.get(name));
    } else if (origin === 'source') {
      // Heuristic input: prose and identifiers look like icon names. Dropped, not fatal.
      continue;
    } else {
      problems.push(`${library}: "${name}" (from ${origin}) is not a real icon name`);
    }
  }
  return hits;
}

const bi = await biIndex();
const fa = await faIndex();
const src = await scanSource();
const stored = await scanStored();

const faHits = new Map([
  ...resolve(new Set(defaults.fa), [fa.icons], 'default', 'Font Awesome'),
  ...resolve(new Set(defaults.faBrands), [fa.brands], 'default', 'Font Awesome brands'),
  ...resolve(stored.fa, [fa.icons, fa.brands], 'stored', 'Font Awesome'),
  ...resolve(src.fa, [fa.icons, fa.brands], 'source', 'Font Awesome'),
]);
const biHits = new Map([
  ...resolve(new Set(defaults.bi), [bi], 'default', 'Bootstrap Icons'),
  ...resolve(stored.bi, [bi], 'stored', 'Bootstrap Icons'),
  ...resolve(src.bi, [bi], 'source', 'Bootstrap Icons'),
]);

if (problems.length) {
  console.error('[gen:icons] FAILED — unresolvable icon names:\n  ' + problems.join('\n  '));
  console.error(
    '\n  These came from icon-defaults.mjs or the content scan, which assert that an icon\n'
    + '  exists. Emitting nothing for them would render blank with no error, so this is fatal.\n',
  );
  process.exit(1);
}

/* ──────────────────────────────── emission ───────────────────────────────── */

const sorted = (m) => [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
const BANNER = (tool) => `// GENERATED by scripts/gen-icons.mjs — do not edit.\n`
  + `//\n`
  + `// Emits ONLY the ${tool} glyph rules this app can actually render: the union of\n`
  + `// scripts/icon-defaults.mjs, a scan of src/ for literal class tokens, and\n`
  + `// tests/icons/stored-values.json (what the CMS content uses).\n`
  + `//\n`
  + `// Codepoints are emitted literally rather than looked up from the library's Sass map, so\n`
  + `// this file has no dependency on which variables happen to be in scope where it is\n`
  + `// imported. They are read at generate time from the installed package, so an upgrade is\n`
  + `// picked up by re-running the generator and cannot drift silently.\n`;

const faScss = BANNER('Font Awesome')
  + `//\n// Replaces the hand-maintained printing/libs/_fa.scss. Must be imported from inside\n`
  + `// printing/libs/_font-awesome.scss, after FA's own core, so .fa/.fas/.fab base rules exist.\n\n`
  + sorted(faHits).map(([n, cp]) => `.fa-${n}::before { content: "\\${cp}"; }`).join('\n')
  + '\n';

// The library's own `$bootstrap-icons-font-dir` default is "./fonts", which resolved correctly
// only because the `@import` used to sit INSIDE the package. Imported from
// src/scss/generated/ instead, "./fonts" resolves to src/scss/generated/fonts and the build
// fails with `Can't resolve './generated/fonts/bootstrap-icons.woff2'`. So the path is computed
// here, from this file to the installed package, and emitted with `!default` — which keeps the
// precedence a consumer expects: an assignment made BEFORE the import (astro-starter points it
// at /fonts/bootstrap-icons/ in public/) still wins, and this only supplies the fallback the
// library itself used to.
const biFontDir = path
  .relative(path.join(repoRoot, 'src/scss/generated'), path.join(BI_PKG, 'fonts'))
  .split(path.sep)
  .join('/');

const biScss = BANNER('Bootstrap Icons')
  + `//\n// Replaces @import 'bootstrap-icons/font/bootstrap-icons', which emits all 2,078 glyph\n`
  + `// rules. The preamble below — variables, @font-face and the .bi base rule — is copied\n`
  + `// VERBATIM from the library at generate time, so a library upgrade carries through instead\n`
  + `// of being silently pinned to whatever was true when this was first written.\n\n`
  + `// Font location, computed relative to THIS file. See the note in gen-icons.mjs: the\n`
  + `// library's own "./fonts" default assumes the import happens from inside the package.\n`
  + `$bootstrap-icons-font-dir: "${biFontDir}" !default;\n\n`
  + await biPreamble()
  + '\n\n'
  + sorted(biHits).map(([n, cp]) => `.bi-${n}::before { content: "\\${cp}"; }`).join('\n')
  + '\n';

const manifest = {
  generated_at: new Date().toISOString(),
  stored_values: stored.stale
    ? null
    : { site_url: stored.site ?? null, generated_at: stored.generatedAt ?? null },
  icons: {
    fa: Object.fromEntries(sorted(faHits)),
    bi: Object.fromEntries(sorted(biHits)),
  },
};

const targets = [
  [path.join(repoRoot, 'src/scss/generated/_icons-fa.scss'), faScss],
  [path.join(repoRoot, 'src/scss/generated/_icons-bi.scss'), biScss],
  [path.join(repoRoot, 'src/generated/icon-manifest.json'), JSON.stringify(manifest, null, 2) + '\n'],
];

if (checkOnly) {
  let drift = false;
  for (const [file, want] of targets) {
    const have = existsSync(file) ? await readFile(file, 'utf8') : null;
    // The manifest carries a timestamp, so compare only its icon sets.
    const same = file.endsWith('.json') && have
      ? JSON.stringify(JSON.parse(have).icons) === JSON.stringify(manifest.icons)
      : have === want;
    if (!same) {
      drift = true;
      console.error(`[gen:icons] STALE: ${path.relative(repoRoot, file)}`);
    }
  }
  if (drift) {
    console.error('[gen:icons] run `npm run gen:icons` and commit the result.');
    process.exit(1);
  }
  console.log('[gen:icons] committed output is current.');
  process.exit(0);
}

for (const [file, content] of targets) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

console.log(`[gen:icons] Font Awesome: ${faHits.size} glyph(s)`);
console.log(`[gen:icons] Bootstrap Icons: ${biHits.size} glyph(s) (library ships 2,078)`);
if (!stored.stale) {
  console.log(`[gen:icons] content scan: ${stored.site ?? '?'} @ ${stored.generatedAt ?? '?'}`
    + ` — fa ${stored.fa.size}, bi ${stored.bi.size}`);
}

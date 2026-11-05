#!/usr/bin/env node
/**
 * Subset the icon webfonts to the glyphs this app can actually render.
 *
 * Icon fonts are the largest single transfer these apps can make, and almost none of it
 * renders. Measured in the browser on astro-starter before this existed: rendering **one**
 * Bootstrap icon, one Font Awesome solid icon and one brand icon fetched
 *
 *   bootstrap-icons.woff2   131 KB
 *   fa-brands-400.woff2     112 KB
 *   fa-solid-900.woff2      116 KB
 *   --------------------------------
 *   359 KB to display 3 glyphs.
 *
 * Note *when* that happens. These faces carry `font-display: block` and are fetched only when
 * a glyph actually renders, so a page whose icons all come from the SVG spritemap — the front
 * page, for one — requests none of them. This is not a saving on every page; it is a saving on
 * every page that shows an icon-font glyph, which is most pages with a list, card or share
 * widget.
 *
 * How the glyph set is decided
 * ---------------------------
 * From `src/generated/icon-manifest.json`, written by `gen-icons.mjs` — so the font and the
 * stylesheet are narrowed from one source and cannot disagree. Run this AFTER `gen:icons`.
 *
 * The framework's equivalent runs after webpack instead, because there the surviving set is
 * whatever PurgeCSS left behind. Neither starter purges, so here the manifest is the authority
 * and this can run at any point after generation.
 *
 * Every Font Awesome face is subset to the SAME codepoint set, rather than trying to work out
 * which face each glyph belongs to. A glyph the face does not contain is simply absent from its
 * subset — HarfBuzz skips it — so the union is both correct and much simpler than tracking
 * whether a given icon was used as `fas`, `far` or `fab`. Guessing that wrong would render a
 * blank, which is the failure this whole mechanism exists to prevent.
 *
 * Both `woff2` and `woff` are emitted. Bootstrap Icons' `@font-face` lists both, and under
 * Turbopack a missing file referenced by `src:` is a hard build error rather than a silent
 * fallback.
 *
 * Idempotent: always reads the pristine faces from `node_modules`, never from its own output,
 * so re-running cannot subset a subset.
 *
 *   node scripts/subset-icon-fonts.mjs [--dry-run]
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

const MANIFEST = path.join(repoRoot, 'src/generated/icon-manifest.json');

/**
 * Each face, its pristine source, and where the stylesheet expects to find it.
 *
 * The destinations match the paths already configured in SCSS — `$font-path` in
 * `non-printing/libs/_font-awesome.scss` and `$bootstrap-icons-font-dir` in
 * `printing/libs/_bootstrap-icons.scss` — so subsetting changes the bytes, not the wiring.
 */
const FACES = [
  {
    family: 'bootstrap-icons',
    set: 'bi',
    src: 'node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff2',
    dest: 'public/fonts/bootstrap-icons/bootstrap-icons',
  },
  {
    family: 'Font Awesome 7 Free (solid)',
    set: 'fa',
    src: 'node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2',
    dest: 'public/webfonts/fa-solid-900',
  },
  {
    family: 'Font Awesome 7 Free (regular)',
    set: 'fa',
    src: 'node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.woff2',
    dest: 'public/webfonts/fa-regular-400',
  },
  {
    family: 'Font Awesome 7 Brands',
    set: 'fa',
    src: 'node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.woff2',
    dest: 'public/webfonts/fa-brands-400',
  },
];

if (!existsSync(MANIFEST)) {
  console.error(
    '[subset:icons] FAILED: no src/generated/icon-manifest.json.\n'
    + '               Run `npm run gen:icons` first — the glyph set comes from there, and\n'
    + '               guessing it would ship a font missing the icons the CSS references.',
  );
  process.exit(1);
}

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
const codepoints = {
  bi: Object.values(manifest.icons.bi ?? {}),
  fa: Object.values(manifest.icons.fa ?? {}),
};

/** Codepoints as the text `subset-font` expects. */
const asText = (hexes) => hexes.map((h) => String.fromCodePoint(parseInt(h, 16))).join('');

const { default: subsetFont } = await import('subset-font');

let before = 0;
let after = 0;
const rows = [];

for (const face of FACES) {
  const srcPath = path.join(repoRoot, face.src);
  if (!existsSync(srcPath)) {
    console.warn(`[subset:icons] SKIPPED ${face.family}: ${face.src} not installed`);
    continue;
  }

  const hexes = codepoints[face.set];
  if (hexes.length === 0) {
    console.warn(
      `[subset:icons] SKIPPED ${face.family}: the manifest lists no ${face.set} glyphs.\n`
      + '               Not subsetting to nothing — that would be indistinguishable from a\n'
      + '               broken font if the manifest were ever generated empty by mistake.',
    );
    continue;
  }

  const buf = await readFile(srcPath);
  const text = asText(hexes);

  for (const format of ['woff2', 'woff']) {
    const out = await subsetFont(buf, text, { targetFormat: format });
    const target = path.join(repoRoot, `${face.dest}.${format}`);
    if (!dryRun) {
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, out);
    }
    if (format === 'woff2') {
      before += buf.length;
      after += out.length;
      rows.push({ family: face.family, glyphs: hexes.length, before: buf.length, after: out.length });
    }
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`[subset:icons]${dryRun ? ' (dry run)' : ''}`);
for (const r of rows) {
  const pct = (100 * (1 - r.after / r.before)).toFixed(1);
  console.log(`  ${r.family}  (${r.glyphs} glyph set)\n      ${kb(r.before)} -> ${kb(r.after)}  (-${pct}%)`);
}
if (rows.length) {
  const pct = (100 * (1 - after / before)).toFixed(1);
  console.log(`  total woff2: ${kb(before)} -> ${kb(after)}  (-${pct}%)`);
}

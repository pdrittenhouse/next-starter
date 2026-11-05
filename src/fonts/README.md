# `src/fonts/`

Self-hosted **text** webfonts go here. Empty on purpose: as of 2026-11-05 this repo hosts none,
and every Typekit / Google Fonts line in `src/scss/printing/_type.scss` is commented out.

Two things are already wired and will pick up the first face dropped in here, so neither has
to be rediscovered (H5 / TODO.md §1d):

| | What it does | Where |
|---|---|---|
| `npm run gen:fonts` | Writes `<name>.subset.woff2` beside each `.woff2`, plus `src/scss/generated/_font-subset-ranges.scss` with the matching `unicode-range` pair. Runs in `prebuild`/`predev`. | `scripts/gen-font-subsets.mjs` |
| fontaine | Generates a metric-matched fallback `@font-face` per family and appends it to the `font-family` stack, so the fallback→real swap does not move the layout. | next: `postcss.config.mjs` · astro: `scripts/build-css.mjs` |

## Using a face you add here

`gen:fonts` writes the subset file and the ranges, but it does **not** write the `@font-face`
rules — declare both faces yourself, in `printing/_type.scss`:

```scss
@use '../generated/font-subset-ranges' as ranges;

@font-face {                                  // the subset: small, covers ordinary copy
  font-family: 'Your Face';
  src: url('../../fonts/your-face.subset.woff2') format('woff2');
  unicode-range: #{ranges.$font-subset-range};
  font-display: swap;
}
@font-face {                                  // the complement: the original, everything else
  font-family: 'Your Face';
  src: url('../../fonts/your-face.woff2') format('woff2');
  unicode-range: #{ranges.$font-subset-complement};
  font-display: swap;
}
```

Both are required. The pair partitions the Unicode codespace exactly, so a character the subset
lacks costs one extra request rather than rendering in the wrong typeface. Shipping only the
subset is the failure this design exists to prevent — a single accented character in an editor's
copy falling back to a different face mid-word, which no test notices.

Icon fonts are **not** handled here. They come from `node_modules` / `public/`, their glyph set
is decided by which `.bi-*` / `.fa-*` rules survive the build rather than by a Unicode range, and
fontaine is explicitly configured to skip them — a metric-matched sans-serif fallback for an
icon font is meaningless. The framework subsets those with a separate tool that must run after
a purge step, which neither starter currently has.

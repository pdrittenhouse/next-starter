/**
 * PostCSS configuration — exists only to add `fontaine` (H5 / TODO.md §1d).
 *
 * Fontaine generates a metric-matched fallback `@font-face` for a family and appends that
 * fallback's name to the family's `font-family` stack, so the swap from fallback to real face
 * does not move the layout. On the WordPress side this was worth a measurable CLS improvement.
 *
 * DORMANT BY DESIGN as of 2026-11-05. This repo self-hosts no text webfont — every Typekit and
 * Google Fonts line in `src/scss/printing/_type.scss` is commented out — so the only families
 * present are icon fonts, which are deliberately excluded below. It is wired now so the first
 * self-hosted face is covered without anyone rediscovering that the framework solved this.
 *
 * The PostCSS plugin, NOT fontaine's bundler transform. The transform sees each file's raw,
 * pre-Sass source, and this project's `@font-face` rules are emitted by a Sass mixin
 * (`font-face()` in `non-printing/mixins/_content-utilities.scss`) — so the transform never
 * sees a literal `@font-face` at all. The PostCSS plugin runs on fully-compiled CSS, where the
 * rule exists.
 *
 * ── Three things that were measured rather than assumed ──────────────────────────────────
 *
 * 1. TURBOPACK DOES READ THIS FILE. `next dev` and `next build` are Turbopack in Next 16, and
 *    it was not obvious the config would be honoured at all. Verified with a real face in
 *    `src/fonts/`: fontaine ran and emitted five metric-matched fallbacks for it.
 *
 * 2. NEXT'S OWN POSTCSS DEFAULTS ARE *NOT* DISPLACED HERE, so they are deliberately not
 *    copied in. `getDefaultPlugins()` — `postcss-flexbugs-fixes` + `postcss-preset-env` — is
 *    webpack-only code (`build/webpack/config/blocks/css/plugins.js`) and applies only when no
 *    project config is found. Under Turbopack that path is not taken. Measured both ways on
 *    the same page: vendor prefixes were byte-identical with and without this file present
 *    (-webkit- 2272, -moz- 2427, -ms- 70), so adding preset-env would be importing webpack-era
 *    defaults into a Turbopack build for no reason. CAVEAT: this changes if anyone runs
 *    `next build --webpack`, where a project config does replace the defaults — re-check then.
 *
 * 3. ICON FAMILIES NEEDED AN EXPLICIT EXCLUSION. The framework relies on `resolvePath`
 *    returning non-`src/fonts/` paths unchanged, which makes them unresolvable and skipped.
 *    THAT DOES NOT WORK HERE: `resolvePath` was never called once (Turbopack rewrites `url()`
 *    before fontaine sees it, and fontaine resolves the result itself), and fontaine generated
 *    metric-matched fallbacks for all four icon families — Font Awesome 7 Free, Font Awesome 7
 *    Brands, bootstrap-icons and Phosphor — 25 extra `@font-face` rules, taking the page from
 *    5 to 36. A metric-matched *sans-serif* fallback for an icon font is meaningless, and
 *    bootstrap-icons' came out as `size-adjust: 100%; ascent-override: 100%` because fontaine
 *    could not read real metrics for it. `skipFontFaceGeneration` below fixes it: measured
 *    back down to 11 (5 originals + 5 ChunkFive fallbacks + 1), with each icon family keeping
 *    only its own face.
 *
 *    Fontaine has no "ignore this family" option, so the icon stacks still get the fallback
 *    NAME appended (`font-family: bootstrap-icons, bootstrap-icons fallback`). That is inert:
 *    no `@font-face` is generated for it, so the browser cannot resolve the name and skips it.
 */
import fontaine from 'fontaine/postcss';

/**
 * Families whose fallback `@font-face` must never be generated.
 *
 * Matched against the family name with fontaine's ` fallback` suffix stripped. Anchored at the
 * start so a text family merely *containing* one of these words is unaffected. Keep in step
 * with the icon libraries imported in `src/scss/printing/_all.scss`.
 */
const ICON_FAMILY = /^(font awesome|bootstrap-icons|phosphor|hamburgers)/i;

export default {
  plugins: [
    fontaine({
      // `{}` enables fontaine's automatic category-aware fallbacks (sans-serif / serif /
      // monospace) for every family, rather than hand-picking per-font metrics.
      fallbacks: {},
      skipFontFaceGeneration: (fallbackName) =>
        ICON_FAMILY.test(fallbackName.replace(/\s+fallback$/i, '')),
    }),
  ],
};

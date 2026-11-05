/**
 * Split a self-hosted webfont into a small primary face plus a `unicode-range` complement.
 *
 * Ported from the framework's `webpack-plugins/lib/font-subset.js` (CommonJS there, ESM here).
 * Keep the two in step: the ranges below are the contract between the bytes a subset file
 * contains and the `unicode-range` the CSS declares, and they must not drift apart.
 *
 * A text webfont ships every glyph its designer drew; a site renders a fraction of them.
 * Measured on the WordPress install these starters read from: 91 distinct codepoints across
 * every post, option, term and meta row, of which three were non-ASCII (`»`, `’`, `…`).
 *
 * **Why a content scan does not decide the glyph set.** It was the obvious design and it is the
 * wrong one. A subset built from today's content breaks the moment an editor types a character
 * nobody anticipated -- an accented name, an em dash -- and the break is a single glyph falling
 * back to a different typeface mid-word, which no test notices and no editor connects to a
 * build step. So the scan informs the *choice* of range and nothing more: correctness comes from
 * emitting the original file as a second `@font-face` carrying the complementary
 * `unicode-range`. A codepoint outside the subset then costs one extra request, not a wrong
 * glyph. Nothing can be missing, so nothing has to be predicted.
 *
 * What the browser does with the pair: it consults `unicode-range` before fetching, so the full
 * face is downloaded only if the page actually contains a character the subset lacks. For
 * ordinary English copy it is never requested at all.
 *
 * Measured on the framework's own faces with `basic latin + punctuation`:
 *
 *   VarelaRound-Regular   43,920 B -> 17,132 B  (-61%)
 *   chunkfive-webfont     16,752 B -> 11,076 B  (-34%)
 */

/** Highest codepoint the complement needs to cover. */
export const MAX_CODEPOINT = 0x10ffff;

export const SUBSET_RANGES = Object.freeze([
  // Basic Latin, INCLUDING the C0 control range below U+20.
  //
  // Starting at U+20 looks right -- no font draws a tab -- and is wrong. Markup is full of
  // literal tabs and newlines, the browser counts them as text content, and with U+0-1F left to
  // the complement it matched that face and fetched the full 42.9 KB file. Measured on the
  // WordPress install before the fix: 8,094 tabs and 6,216 newlines in text nodes computing to
  // `Varela Round`, and both original files downloading alongside both subsets -- 88.1 KB where
  // 59.3 KB had been.
  //
  // Claiming them costs nothing. There are no glyphs to include, so the subset file does not
  // grow; the range merely stops the browser looking elsewhere for a character the layout
  // engine handles itself.
  { from: 0x0000, to: 0x007e },
  // The punctuation a word processor or Gutenberg substitutes on its own -- curly quotes, en
  // and em dashes, the ellipsis. Omitting these is how a subset most often shows: an apostrophe
  // in a different typeface inside a word.
  { from: 0x2010, to: 0x2015 }, // hyphens and dashes
  { from: 0x2018, to: 0x201a }, // single quotes
  { from: 0x201c, to: 0x201e }, // double quotes
  { from: 0x2020, to: 0x2022 }, // dagger, double dagger, bullet
  { from: 0x2026, to: 0x2026 }, // ellipsis
  { from: 0x2030, to: 0x2030 }, // per mille
  { from: 0x2039, to: 0x203a }, // single angle quotes
  { from: 0x00ab, to: 0x00ab }, // left double angle quote
  { from: 0x00bb, to: 0x00bb }, // right double angle quote -- in use on this install
  { from: 0x00a0, to: 0x00a0 }, // no-break space
  { from: 0x00a9, to: 0x00a9 }, // copyright
  { from: 0x00ae, to: 0x00ae }, // registered
  { from: 0x2122, to: 0x2122 }, // trade mark
  { from: 0x20ac, to: 0x20ac }, // euro
  { from: 0x00a3, to: 0x00a3 }, // pound
]);

/**
 * Private Use Area blocks, excluded from BOTH faces.
 *
 * This matters more in these repos than it did in the framework. Both starters emit the full
 * Bootstrap Icons and Font Awesome stylesheets -- 2,078 `.bi-*` and ~650 `.fa-*` glyph rules --
 * every one of which sets `content: "\fXXX"`, a Private Use Area codepoint. Those rules reach
 * elements a text font also styles. Measured on the framework install:
 * `.fa-square-facebook::before{content:"\f082"}` still matched the `<svg>` Font Awesome's JS
 * swaps in, that element computed to a text family, and a complement face claiming U+F082
 * therefore made the browser fetch the whole 42.9 KB text font to render one invisible glyph --
 * total font bytes went UP, 59.3 KB to 88.1 KB.
 *
 * A text webfont contains no PUA glyphs, so claiming to cover them can only ever cause a
 * pointless download. Excluded, the codepoint matches neither face, falls through to the
 * fallback stack, and renders exactly what it rendered before: nothing visible.
 */
export const PRIVATE_USE_RANGES = Object.freeze([
  { from: 0xe000, to: 0xf8ff },     // BMP Private Use Area
  { from: 0xf0000, to: 0xffffd },   // Supplementary Private Use Area-A
  { from: 0x100000, to: 0x10fffd }, // Supplementary Private Use Area-B
]);

/**
 * The characters the subset face must contain.
 *
 * @return {string} Every codepoint in SUBSET_RANGES, concatenated.
 */
export function subsetCharacters() {
  let out = '';
  for (const { from, to } of SUBSET_RANGES) {
    for (let cp = from; cp <= to; cp++) out += String.fromCodePoint(cp);
  }
  return out;
}

/** `U+41` / `U+20-7E` -- CSS unicode-range syntax for one span. */
function formatRange({ from, to }) {
  const hex = (n) => n.toString(16).toUpperCase();
  return from === to ? `U+${hex(from)}` : `U+${hex(from)}-${hex(to)}`;
}

/**
 * The `unicode-range` value for the subset face.
 *
 * @return {string} Comma-separated spans, in ascending codepoint order.
 */
export function subsetUnicodeRange() {
  return [...SUBSET_RANGES].sort((a, b) => a.from - b.from).map(formatRange).join(', ');
}

/**
 * The `unicode-range` value for the full face: everything the subset does not cover.
 *
 * Computed as the complement rather than written out, because the two must partition the
 * codespace exactly. Overlap would let the browser choose either face for a shared character --
 * and since the full face is listed second it would win, quietly fetching 43 KB to render an
 * `a`. A gap would make a codepoint unrenderable in the intended family altogether.
 *
 * @return {string} Comma-separated spans covering U+0 to U+10FFFF minus the subset.
 */
export function complementUnicodeRange() {
  const excluded = [...SUBSET_RANGES, ...PRIVATE_USE_RANGES].sort((a, b) => a.from - b.from);
  const gaps = [];
  let cursor = 0x0000;

  for (const { from, to } of excluded) {
    if (from > cursor) gaps.push({ from: cursor, to: from - 1 });
    cursor = Math.max(cursor, to + 1);
  }
  if (cursor <= MAX_CODEPOINT) gaps.push({ from: cursor, to: MAX_CODEPOINT });

  return gaps.map(formatRange).join(', ');
}

/**
 * Produce the subset of a font.
 *
 * `subset-font` is HarfBuzz compiled to WASM, so this needs no Python toolchain and runs
 * wherever the build does.
 *
 * @param  {Buffer} buffer       - The original font file.
 * @param  {object} [options]
 * @param  {string} [options.targetFormat='woff2']
 * @return {Promise<Buffer>} The subset font.
 */
export async function subsetBuffer(buffer, options = {}) {
  // Imported lazily so that merely importing this module -- for the ranges, say -- does not
  // require the subsetting dependency to be installed.
  const { default: subsetFont } = await import('subset-font');
  const { targetFormat = 'woff2' } = options;

  return subsetFont(buffer, subsetCharacters(), { targetFormat });
}

/**
 * The filename a subset is written as, beside its original.
 *
 * @param  {string} filename - e.g. `VarelaRound-Regular.woff2`
 * @return {string} e.g. `VarelaRound-Regular.subset.woff2`
 */
export function subsetFilename(filename) {
  return filename.replace(/\.(woff2?|ttf|otf)$/i, '.subset.$1');
}

'use strict';

/**
 * Per-render generated identifiers, and how to collapse them to a stable placeholder.
 *
 * The framework mints a fresh random identifier on every render, so anything recording a class
 * name verbatim churns on every capture even when nothing has changed. `capture.js` hit this
 * first -- a re-baseline touched 80 files, ~70 of them pure identifier churn -- and T5's state
 * derivation hit the identical problem through a different door: a derived selector
 * `.navbar-nav.navbar-mGWwZiW9Wo.dropdown-hover > ul > .dropdown > .dropdown-menu` came back as
 * `.navbar-nav.navbar-SYzhBJFBq3.dropdown-hover > …` on the next run, so one state key was
 * reported REMOVED and another ADDED on a page where nothing had moved.
 *
 * ## Why this file does not fully de-duplicate the logic
 *
 * `collect()` in `capture.js` carries its own inline copy of these patterns, and has to:
 * it is handed to `page.evaluate()`, which serialises the function source and runs it in the
 * browser, where `require` does not exist. A function that closes over an import cannot cross
 * that boundary.
 *
 * So the split is deliberate. In-page code keeps an inline copy; everything running in Node
 * uses this module. **If these patterns ever change, both places change.** That duplication is
 * recorded here rather than left to be discovered, because an undocumented second copy is how
 * the three near-identical CSS minifiers happened.
 *
 * The patterns themselves, and the reasoning behind their precision, are documented at length
 * on `collect()` -- anchored to the two generators actually in this codebase (a Twig loop
 * drawing exactly 10 characters from `[a-z] + [A-Z] + [0-9] + '-' + '_'`, and ACF's `id_gen`
 * uniqid-shaped 13 lowercase-hex) rather than to any trailing run that looks random. That
 * precision is the point: matching any 10-character tail mangled `js-social-nav-exists` into
 * `js-social-<id>`, and destroying a real label misleads whoever reads the diff.
 */

/** ACF `id_gen`: a uniqid-shaped 13 lowercase-hex run concatenated onto a prefix. */
const RE_UNIQID = /[0-9a-f]{13}$/;

/** Separator + exactly 10 generator characters carrying an uppercase letter or underscore. */
const RE_RANDOM10 = /([-_])(?=[A-Za-z0-9_-]{10}$)[A-Za-z0-9_-]*[A-Z_][A-Za-z0-9_-]*$/;

/** The all-lowercase-and-digits draw, with no internal hyphen (that is what keeps real names safe). */
const RE_RANDOM10_LOWER = /([-_])(?=[a-z0-9]{10}$)[a-z0-9]*\d[a-z0-9]*$/;

/**
 * Collapse a generated identifier at the end of one class token to `<id>`.
 *
 * @param  {string} token A single class token, without the leading dot.
 * @return {string}
 */
function normaliseClassToken(token) {
  if (typeof token !== 'string' || token.length < 11) return token;

  const u = token.replace(RE_UNIQID, '<id>');
  if (u !== token) return u;

  const r = token.replace(RE_RANDOM10, '$1<id>');
  if (r !== token) return r;

  return token.replace(RE_RANDOM10_LOWER, '$1<id>');
}

/**
 * Collapse generated identifiers inside a full CSS selector.
 *
 * Operates per class token rather than on the whole string, because the patterns are anchored
 * to the END of a token (`$`) -- a selector like `.navbar-<id>.dropdown-hover > ul` has the
 * generated run in the middle, where an end-anchored pattern would never see it.
 *
 * Only class tokens are touched. Element names, combinators, attribute selectors and
 * pseudo-classes are left exactly as they are.
 *
 * @param  {string} selector
 * @return {string}
 */
function normaliseSelector(selector) {
  if (typeof selector !== 'string' || selector === '') return selector;

  // A class token runs from a `.` up to the next character that cannot appear in one. The
  // alphabet here deliberately includes `-` and `_`, because the generator's own alphabet does.
  return selector.replace(/\.(-?[A-Za-z0-9_-]+)/g, (match, token) => `.${normaliseClassToken(token)}`);
}

module.exports = {
  normaliseClassToken,
  normaliseSelector,
  RE_UNIQID,
  RE_RANDOM10,
  RE_RANDOM10_LOWER,
};

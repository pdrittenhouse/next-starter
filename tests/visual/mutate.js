'use strict';

/**
 * F5: the mutation engine behind the gate's self-check.
 *
 * Every guarantee the gate makes was, before this existed, verified exactly once by hand —
 * X15's precondition inverted, T12 validated by reintroducing X10's deletion, F3 the same,
 * F4's two checks by removing a baseline and neutering a filter. Four one-off proofs, none
 * repeatable, none re-run since. A refactor of `capture.js` or `diff.js` could silently
 * remove any of those capabilities and every test would stay green, which is the same
 * structure as the three holes F4 was built to close, one level up.
 *
 * This module breaks a page's CSS on purpose so `self-check.spec.js` can assert the gate
 * notices. Mutations happen in flight via `page.route()` — no rebuild, so each one costs
 * milliseconds instead of a two-minute webpack run.
 *
 * Two rules shape everything here:
 *
 * 1. **Derive the victim, never name it.** A hardcoded `--bs-card-bg` rots the moment that
 *    declaration moves, and it rots *silently* into a vacuous pass: the strip finds nothing,
 *    the mutated page is identical to the clean one, and an assertion that the gate "noticed
 *    a change" would be asserting against no change at all. Same reasoning as F4 deriving its
 *    component inventory from build output. Every `pick*` function below reads the live
 *    snapshot and returns what that page actually has.
 *
 * 2. **Prove the mutation landed, separately from proving the gate saw it.** Each mutation
 *    reports how many declarations it actually removed or rewrote. A self-check that cannot
 *    tell "the gate missed this" from "the CSS was never modified" is worthless, because the
 *    second failure mode is the likely one and it looks like success.
 */

/* ------------------------------------------------------------------------------ *
 * CSS text surgery
 * ------------------------------------------------------------------------------ */

const NAME_CHAR = /[A-Za-z0-9_-]/;

/**
 * Index just past the end of a declaration value starting at `from`, respecting the
 * things a regex gets wrong.
 *
 * `;` and `}` terminate a declaration — except inside a string or parentheses, and this
 * codebase has live cases of both: `--bs-accordion-btn-icon` is a
 * `url("data:image/svg+xml;charset=utf8,…")`, whose value contains the terminator twice
 * before the real one. Truncating there would leave `charset=utf8,…")` as orphaned text
 * and corrupt every rule after it, producing a page-wide diff that looks like the gate
 * working perfectly while actually testing nothing it claims to.
 *
 * @param {string} css
 * @param {number} from index just after the declaration's `:`
 * @returns {{end: number, terminator: ';'|'}'|null}} `end` is exclusive; for a `}`
 *   terminator it points AT the brace, which must survive.
 */
function findValueEnd(css, from) {
  let parens = 0;
  let quote = null;

  for (let i = from; i < css.length; i++) {
    const ch = css[i];

    if (quote) {
      if (ch === '\\') { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '/' && css[i + 1] === '*') {
      const close = css.indexOf('*/', i + 2);
      i = close === -1 ? css.length : close + 1;
      continue;
    }
    if (ch === '(') { parens++; continue; }
    if (ch === ')') { if (parens > 0) parens--; continue; }
    if (parens > 0) continue;

    if (ch === ';') return { end: i + 1, terminator: ';' };
    if (ch === '}') return { end: i, terminator: '}' };
  }
  return { end: css.length, terminator: null };
}

/**
 * Remove every declaration of `name` from a stylesheet.
 *
 * Serves both mutation classes: a custom property (`--bs-pagination-active-bg`) and an
 * ordinary one (`border-radius`). Custom property names are case-sensitive; standard
 * property names are ASCII case-insensitive, and are compared that way.
 *
 * Only declarations are touched. Three contexts are deliberately skipped, each of which a
 * substring match would have corrupted:
 *   - outside any `{}` block — a selector such as `.border-radius-0`
 *   - inside parentheses — `@media (min-width: 600px)` is not a `min-width` declaration,
 *     and `min-width` is in the captured property set, so this is a live hazard rather
 *     than a theoretical one
 *   - mid-value — `transition: border-radius .2s` names the property but is not one
 *
 * @param {string} css
 * @param {string} name property name, with `--` prefix for a custom property
 * @returns {{css: string, count: number}}
 */
function stripDeclarations(css, name) {
  const isCustom = name.startsWith('--');
  const target = isCustom ? name : name.toLowerCase();
  const len = name.length;

  let out = '';
  let count = 0;
  let i = 0;
  let braces = 0;
  let parens = 0;
  // True where a declaration may begin: right after `{`, `}` or `;`, through whitespace.
  let atDeclStart = false;

  const matchesHere = (at) => {
    const slice = css.slice(at, at + len);
    if ((isCustom ? slice : slice.toLowerCase()) !== target) return false;
    const next = css[at + len];
    // A longer name that merely starts with ours (`--bs-card-bg-rgb`) is not a match.
    return !(next !== undefined && NAME_CHAR.test(next));
  };

  while (i < css.length) {
    const ch = css[i];

    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < css.length) {
        if (css[j] === '\\') { j += 2; continue; }
        if (css[j] === quote) { j++; break; }
        j++;
      }
      out += css.slice(i, j);
      i = j;
      atDeclStart = false;
      continue;
    }

    if (ch === '/' && css[i + 1] === '*') {
      const close = css.indexOf('*/', i + 2);
      const end = close === -1 ? css.length : close + 2;
      out += css.slice(i, end);
      i = end;
      // A comment is transparent: `{ /* c */ color: red }` is still a declaration start.
      continue;
    }

    if (ch === '{') { braces++; atDeclStart = true; out += ch; i++; continue; }
    if (ch === '}') { if (braces > 0) braces--; atDeclStart = true; out += ch; i++; continue; }
    if (ch === ';') { atDeclStart = true; out += ch; i++; continue; }
    if (ch === '(') { parens++; atDeclStart = false; out += ch; i++; continue; }
    if (ch === ')') { if (parens > 0) parens--; atDeclStart = false; out += ch; i++; continue; }
    if (/\s/.test(ch)) { out += ch; i++; continue; }

    if (atDeclStart && braces > 0 && parens === 0 && matchesHere(i)) {
      let j = i + len;
      while (j < css.length && /\s/.test(css[j])) j++;
      if (css[j] === ':') {
        const { end } = findValueEnd(css, j + 1);
        i = end;
        count++;
        atDeclStart = true;
        continue;
      }
    }

    atDeclStart = false;
    out += ch;
    i++;
  }

  return { css: out, count };
}

/**
 * Append a `:root` override for a custom property.
 *
 * Used rather than rewriting the existing declaration in place because that declaration's
 * authored location is not knowable from a snapshot — the value may be set in any of a
 * dozen bundles, and in this codebase usually in more than one. Appending the same override
 * to *every* served sheet makes the outcome independent of which sheet wins the cascade:
 * whichever is last, the computed value is the sentinel.
 */
function appendRootOverride(css, name, value) {
  return `${css}\n:root{${name}:${value}}\n`;
}

/**
 * Swap the document positions of two stylesheet `<link>` tags.
 *
 * `load-order.spec.js` reads cascade order from the navigation response's raw HTML, not
 * from response timing, so the only way to break a load-order precondition is to reorder
 * the document itself.
 *
 * `<noscript>` blocks are excluded from matching: they duplicate every deferred sheet with
 * `media="all"` for JS-off clients, so a needle would otherwise match the duplicate and
 * "swap" two tags the parser never looks at — a mutation that applies, reports success, and
 * changes nothing the checker reads.
 *
 * @returns {{html: string, swapped: boolean, reason?: string}}
 */
function swapLinkTags(html, beforeNeedle, afterNeedle) {
  const noscript = [];
  const nsRe = /<noscript>[\s\S]*?<\/noscript>/gi;
  let ns;
  while ((ns = nsRe.exec(html))) noscript.push([ns.index, ns.index + ns[0].length]);
  const inNoscript = (at) => noscript.some(([s, e]) => at >= s && at < e);

  const tags = [];
  const linkRe = /<link[^>]*rel=['"]stylesheet['"][^>]*>/gi;
  let m;
  while ((m = linkRe.exec(html))) {
    if (inNoscript(m.index)) continue;
    tags.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
  }

  const a = tags.find((t) => t.text.includes(beforeNeedle));
  const b = tags.find((t) => t.text.includes(afterNeedle));
  if (!a) return { html, swapped: false, reason: `no <link> matched "${beforeNeedle}"` };
  if (!b) return { html, swapped: false, reason: `no <link> matched "${afterNeedle}"` };
  if (a.start === b.start) {
    return { html, swapped: false, reason: 'both needles matched the same <link>' };
  }

  const [first, second] = a.start < b.start ? [a, b] : [b, a];
  const out = html.slice(0, first.start)
    + second.text
    + html.slice(first.end, second.start)
    + first.text
    + html.slice(second.end);

  return { html: out, swapped: true };
}

/* ------------------------------------------------------------------------------ *
 * Victim selection — derived from a live snapshot, never hardcoded
 * ------------------------------------------------------------------------------ */

/**
 * An element-level custom property declaration to strip.
 *
 * Read from the snapshot's per-element `vars`, which by construction holds only properties
 * whose computed value differs from the parent's — i.e. ones a rule actually sets on that
 * element. Removing one therefore has somewhere to fall back to, which is what makes it
 * report as `removed` rather than `changed`.
 *
 * Ordered by how many elements declare it, so the mutation produces the clearest signal,
 * then by name so a tie resolves identically on every run.
 *
 * @returns {{name: string, elements: number, sample: string}|null}
 */
function pickElementVar(snapshot, { prefix = '--bs-' } = {}) {
  const counts = new Map();
  const samples = new Map();
  for (const el of Object.values(snapshot.elements || {})) {
    for (const [name, value] of Object.entries(el.vars || {})) {
      counts.set(name, (counts.get(name) || 0) + 1);
      if (!samples.has(name)) samples.set(name, value);
    }
  }
  if (counts.size === 0) return null;

  const rank = (entries) => entries
    .sort((x, y) => (y[1] - x[1]) || x[0].localeCompare(y[0]))[0];

  const all = [...counts.entries()];
  const preferred = all.filter(([n]) => n.startsWith(prefix));
  const chosen = rank(preferred.length ? preferred : all);
  return { name: chosen[0], elements: chosen[1], sample: samples.get(chosen[0]) };
}

/**
 * A `:root` custom property to rewrite, preferring the palette entry whose loss X10 proved
 * is both real and invisible to rendering until a `:focus` state occurs.
 *
 * @returns {{name: string, value: string}|null}
 */
function pickRootVar(snapshot, { preferred = ['--bs-primary', '--bs-secondary'] } = {}) {
  const root = snapshot.rootVars || {};
  const names = Object.keys(root);
  if (names.length === 0) return null;
  for (const want of preferred) {
    if (want in root) return { name: want, value: root[want] };
  }
  const fallback = names.filter((n) => n.startsWith('--bs-')).sort()[0] || names.sort()[0];
  return { name: fallback, value: root[fallback] };
}

/**
 * Candidate properties for the ordinary-declaration mutation, in preference order.
 *
 * Preference exists for stability, not convenience. Stripping every `display` or `width`
 * declaration restructures the page: elements collapse, `:nth-of-type` paths shift, and the
 * differ reports hundreds of added/removed elements. That still fails — but it stops being
 * a test of "does a changed property value get reported on the property channel", which is
 * the specific guarantee under test. These are heavily themed here and visually scoped.
 *
 * The *choice among them* is still derived: a candidate is only used if the live snapshot
 * proves the page actually styles it.
 */
const SAFE_PROPERTY_CANDIDATES = [
  'border-radius', 'letter-spacing', 'text-transform', 'font-style',
  'text-decoration-line', 'box-shadow', 'outline-width', 'background-color', 'color',
];

/**
 * Properties never used as a fallback victim: stripping these changes the element set
 * rather than a property value, so a diff proves the wrong thing.
 */
const STRUCTURAL_PROPERTIES = new Set([
  'display', 'position', 'width', 'height', 'min-width', 'min-height',
  'max-width', 'max-height', 'box-sizing', 'overflow-x', 'overflow-y',
  'flex-direction', 'flex-wrap', 'flex-basis', 'grid-template-columns', 'grid-template-rows',
  'visibility', 'transform', 'aspect-ratio',
]);

/**
 * A standard property this page demonstrably styles, whose declarations can be stripped.
 *
 * "Demonstrably styles" = the captured elements hold at least two distinct values for it.
 * One value everywhere means every element inherits the same thing and stripping it may
 * change nothing, which would be indistinguishable from the gate failing to notice.
 *
 * @returns {{name: string, distinctValues: number}|null}
 */
function pickStandardProperty(snapshot, { candidates = SAFE_PROPERTY_CANDIDATES } = {}) {
  const distinct = new Map();
  for (const el of Object.values(snapshot.elements || {})) {
    for (const [prop, value] of Object.entries(el.styles || {})) {
      if (value === '' || value === undefined) continue;
      if (!distinct.has(prop)) distinct.set(prop, new Set());
      distinct.get(prop).add(value);
    }
  }
  if (distinct.size === 0) return null;

  for (const name of candidates) {
    const seen = distinct.get(name);
    if (seen && seen.size >= 2) return { name, distinctValues: seen.size };
  }

  const fallback = [...distinct.entries()]
    .filter(([name, seen]) => !STRUCTURAL_PROPERTIES.has(name) && seen.size >= 2)
    .sort((x, y) => (y[1].size - x[1].size) || x[0].localeCompare(y[0]))[0];
  return fallback ? { name: fallback[0], distinctValues: fallback[1].size } : null;
}

/* ------------------------------------------------------------------------------ *
 * In-flight interception
 * ------------------------------------------------------------------------------ */

/**
 * Route every stylesheet request through `transform`.
 *
 * `transform` is read on each request rather than captured once, so one installed route can
 * serve both passes of a test: take the clean snapshot under an identity transform, swap the
 * transform, take the mutated snapshot. That matters more than it looks. Capturing the clean
 * pass through this same fetch-and-fulfill path means the *only* difference between the two
 * snapshots is the mutation itself — if interception perturbed anything (headers, timing,
 * encoding), it perturbs both sides equally instead of masquerading as a detected
 * regression.
 *
 * Responses are served `no-store` with validators stripped, because the second navigation
 * requests the same URLs: a memory-cache hit or a 304 would never reach this handler, the
 * mutation would silently not apply, and the test would report the gate as blind when
 * nothing was ever broken.
 *
 * @param {import('@playwright/test').Page} page
 * @param {() => (css: string, url: string) => string} getTransform
 * @returns {Promise<{intercepted: number, changed: number, skipped: number, sheets: string[]}>}
 *   live stats object, mutated in place as requests arrive
 */
async function routeCssMutation(page, getTransform) {
  const stats = { intercepted: 0, changed: 0, skipped: 0, sheets: [] };

  // Inline <style> blocks, which arrive inside the HTML document rather than as `.css`
  // requests and so are invisible to the stylesheet route below.
  //
  // This is not a corner case on this project: PatternLoader inlines its whole critical
  // pattern group at `wp_head:7`, and BootstrapLoader inlines the Bootstrap critical group
  // at priority 6, so a large share of the CSS that decides first-paint layout never travels
  // as a stylesheet at all. Without this, a self-check could strip a declaration from every
  // served stylesheet, see the page render identically because an inline block still supplied
  // it, and report the gate as blind when the mutation simply never reached the real source.
  // That is exactly what happened with `--bs-nav-link-padding-x`: declared three times in the
  // inlined bootstrap-combined-critical block and once in the linked styles.css, so stripping
  // the link alone changed nothing.
  //
  // Ordering is not load-bearing: the stylesheet route's predicate only matches paths ending
  // in `.css`, which a document request never does, so the two cannot contend. Non-document
  // requests reaching this handler are passed straight through with `route.fallback()`.
  await page.route(
    () => true,
    async (route) => {
      if (route.request().resourceType() !== 'document') {
        await route.fallback();
        return;
      }

      let resp;
      try {
        resp = await route.fetch();
      } catch (e) {
        await route.fallback();
        return;
      }

      let html = null;
      try {
        html = await resp.text();
      } catch (e) {
        html = null;
      }

      if (html === null || resp.status() !== 200) {
        await route.fulfill({ response: resp });
        return;
      }

      const url = route.request().url();
      const transform = getTransform();
      let blocks = 0;

      // Only the contents of each <style> element are passed to the transform. Handing it
      // the whole document would let a CSS-shaped regex match markup and corrupt the page,
      // which reads as a site failure rather than a mutation.
      const next = html.replace(
        /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,
        (whole, open, css, close) => {
          blocks++;
          let out = css;
          try {
            out = transform(css, `${url}#inline-style-${blocks}`);
          } catch (e) {
            return whole;
          }
          if (out !== css) {
            stats.changed++;
            stats.sheets.push(`${url} <style> #${blocks}`);
          }
          return open + out + close;
        }
      );

      if (blocks > 0) {
        stats.intercepted++;
      }

      const headers = { ...resp.headers() };
      delete headers['content-encoding'];
      delete headers['content-length'];
      delete headers.etag;
      delete headers['last-modified'];
      headers['cache-control'] = 'no-store';

      await route.fulfill({ status: resp.status(), headers, body: next });
    }
  );

  await page.route(
    (url) => url.pathname.toLowerCase().endsWith('.css'),
    async (route) => {
      let resp;
      try {
        resp = await route.fetch();
      } catch (e) {
        await route.fallback();
        return;
      }

      let text = null;
      try {
        text = await resp.text();
      } catch (e) {
        text = null;
      }

      if (text === null || resp.status() !== 200) {
        stats.skipped++;
        await route.fulfill({ response: resp });
        return;
      }

      stats.intercepted++;
      const url = route.request().url();
      let next = text;
      try {
        next = getTransform()(text, url);
      } catch (e) {
        // A transform that throws must not take the page down with it — that would look
        // like a site failure rather than a broken self-check.
        stats.skipped++;
        await route.fulfill({ response: resp });
        return;
      }

      if (next !== text) {
        stats.changed++;
        stats.sheets.push(url);
      }

      const headers = { ...resp.headers() };
      delete headers['content-encoding'];
      delete headers['content-length'];
      delete headers.etag;
      delete headers['last-modified'];
      headers['cache-control'] = 'no-store';
      headers['content-type'] = headers['content-type'] || 'text/css';

      await route.fulfill({ status: resp.status(), headers, body: next });
    }
  );

  return stats;
}

module.exports = {
  findValueEnd,
  stripDeclarations,
  appendRootOverride,
  swapLinkTags,
  pickElementVar,
  pickRootVar,
  pickStandardProperty,
  routeCssMutation,
  SAFE_PROPERTY_CANDIDATES,
  STRUCTURAL_PROPERTIES,
};

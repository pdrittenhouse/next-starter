'use strict';

/**
 * Captures a computed-style snapshot of a page.
 *
 * What gets captured
 * ------------------
 * Elements carrying a `class` attribute, plus a short list of structural tags.
 * That is not an arbitrary sample: PurgeCSS removes rules matched by *class*
 * selectors, so classed elements are where a purge regression can appear at all.
 * Unclassed elements are styled by element/inherited selectors, which the purge
 * safelist already protects wholesale.
 *
 * Capturing every element instead would mean ~1,261 elements x 73 properties x 8
 * URLs x 3 viewports — a baseline nobody can review, where a real regression hides
 * among a million unchanged values.
 *
 * Determinism
 * -----------
 * Sub-pixel layout values differ run to run (120.328px vs 120.33px), so numeric px
 * values are rounded to 2dp. Animations and transitions are disabled before capture
 * and web fonts are awaited, because both change computed values mid-flight.
 *
 * Element identity
 * ----------------
 * Keyed by a tag + :nth-of-type path from <html>. Stable under content edits; it
 * does shift when a sibling is inserted, so the snapshot also records tag/class
 * per element. When a key disappears the differ reports it as removed rather than
 * reporting every later element as changed.
 */

const STRUCTURAL_TAGS = ['body', 'main', 'header', 'footer', 'nav', 'aside', 'article', 'section'];

/**
 * Non-deterministic styles to exclude, as {selector, properties?}.
 *
 * Omit `properties` to skip the element entirely; name them to keep watching the
 * rest. Prefer naming them — dropping a whole element loses 70+ properties to fix
 * one, and dropping a property globally loses it everywhere.
 *
 * Carousels are the live case. Flickity and Slick position cells with JS-computed
 * inline transforms, so two consecutive requests give the same untouched page a
 * different matrix() — observed translate -853.312px vs 1706.62px on the 404 route.
 * FREEZE_CSS cannot help, because in CSS terms nothing is animating.
 *
 * The carousel height entries below (O3b) are the widest exclusion here and the only
 * one that gives up coverage outside the carousel itself, so the reasoning is on the
 * record. The header logo slider resolves to one of exactly two heights, 152.42px or
 * 240px, and the 87.58px delta propagates unchanged up the box tree: the carousel box,
 * `.site-header--wrapper`, `.navbar.site-header`, body's `height`, and body's first
 * `grid-template-rows` track all move by that same amount. Suppressing only the
 * carousel would leave the three derived values still failing, so the ancestors are
 * named too.
 *
 * The coverage given up is narrower than that sounds, and it was checked rather than
 * assumed. Only the outer <header>, `.site-header--wrapper` and body lose `height`.
 * The 13 inner `site-header--*` elements — the alert, container, rows, columns,
 * branding, navigation, navbar wrapper, the two nav regions, social nav and search —
 * all keep theirs, and the diff confirms none of them move when the flake fires: the
 * wrapper absorbs the carousel's 87.58px without its siblings changing. So a real
 * header regression still has 13 asserted heights to surface through, plus every
 * other property on the two excluded elements (padding, border, background, position,
 * display, and the grid *columns*).
 *
 * What the height actually is, measured: Flickity writes an inline `height` onto
 * `.flickity-viewport` (152.422px in the stable case) computed from the tallest cell,
 * and never re-measures. `.flickity-carousel`, `.flickity-carousel--wrapper` and
 * `.block-logo-slider` all just inherit that baked value, which is why they move in
 * lockstep — and why the pre-existing `.flickity-viewport` height exclusion is the
 * correct precedent rather than a loose analogy. That baked value is sensitive to
 * which CSS has applied at measure time: blocking `blocks-content-*.css` before load
 * yields 208px, `patterns-content-*.css` 79.14px, all CSS but the Flickity library
 * 212px, nothing blocked 152.42px.
 *
 * Four hypotheses were tested and disproven before resorting to this:
 *
 * - Settle timing. Both heights were captured with `meta.layoutSettled === true`, so
 *   the quiesce wait in `snapshot()` is not firing early.
 * - Bistable init. 152.42px held across five consecutive snapshots, a six-second
 *   observation window, and images delayed by 1.2s.
 * - Lazy images. The carousel runs `lazyLoad`/`bgLazyLoad`/`imagesLoaded`, but six
 *   bounded probe runs reported 152px with all 6 images loaded, with and without
 *   awaiting them.
 *
 * - A CSS-vs-measure race. The obvious reading of the table above is that Flickity
 *   sometimes measures before a conditional bundle lands. Delaying
 *   `blocks-content-*.css` by 2.5s does not reproduce it: a pending <head> stylesheet
 *   also blocks script execution, so Flickity's `$(document).ready()` init is delayed
 *   with it and still measures after the CSS applies. The ordering that produces the
 *   240px variant has not been identified.
 *
 * It has never reproduced outside a full 92-test run: not in roughly twenty earlier
 * attempts, not in 60 consecutive loads of the exact failing target (60/60 at
 * 152.422px), and not under any CSS blocking or delay manipulation tried.
 * What would reopen it: a repro in isolation, or either height appearing while the
 * other is in the baseline on a *single*-target run — both would mean the cause is
 * addressable rather than a property of the whole-suite run.
 *
 * Worth being clear about what this exclusion does and does not mean. It stops the
 * gate flaking; it does not make the page deterministic. An 87.58px header height that
 * varies between loads is a layout shift a real visitor can see, so the underlying
 * bistability is tracked as CLS work (E12), not closed.
 *
 * A second, unrelated bistable-layout source was found fixing E19 (the font-swap CLS
 * spike): giving `Varela Round`/`chunkfive` `font-display: optional` plus a
 * metric-matched fallback (see `FontFallbackPlugin.js`) was the fix, not a new bug, but
 * it has one side effect worth naming rather than letting the gate just flake on it.
 * `optional` decides, within a short window after each page load, whether to commit to
 * the fallback for that load's whole lifetime or swap to the real face once it is
 * ready — unlike the old `swap`, it never reflows mid-page, but which of the two it
 * picks for *this* load is itself a timing race (was the font request fast enough to
 * beat the decision window). The fallback's `size-adjust`/`ascent-override` etc. match
 * the real face closely but not exactly, so nav text sized by either font differs by a
 * sub-pixel amount (0.01–0.16px observed) depending on which one won. Confirmed
 * reproducible, not a one-off: 3 repeated runs of the same target gave changed, clean,
 * changed. Confirmed it is this mechanism and not something else: the property is
 * always `width`/`height`/`bottom` on elements whose rendered text uses one of these
 * two font stacks, never anything unrelated.
 */
const DEFAULT_IGNORE = [
  { selector: '.flickity-cell, .carousel-cell', properties: ['transform', 'top', 'bottom'] },
  { selector: '.flickity-viewport, .flickity-slider', properties: ['transform', 'height'] },
  { selector: '.slick-track, .slick-slide', properties: ['transform', 'width'] },
  // O3b — see the note above before widening or narrowing these three.
  { selector: '.block-logo-slider, .flickity-carousel--wrapper, .flickity-carousel', properties: ['height'] },
  { selector: '.site-header--wrapper, .site-header', properties: ['height'] },
  { selector: 'body', properties: ['height', 'grid-template-rows'] },
  // Also inherits the delta, via normal flow rather than the box tree: a full-suite
  // run put one `.screen-reader-text` at top 350.27px against a 437.84px baseline,
  // the same 87.57px. Asserting the offset of a visually-hidden element carries no
  // information anyway — it sits at top:-1000px in the normal case.
  // `bottom` is excluded for the same reason, caught instead by the E19 font-settle
  // race documented above — same element, same "offset carries no information" logic.
  { selector: '.screen-reader-text', properties: ['top', 'bottom'] },
  // E44. `.container` uses Bootstrap's `margin-inline: auto`, and Chrome serialises that
  // inconsistently between page loads: `getComputedStyle().marginLeft` returns either `0px`
  // (the computed value, since `auto` computes to zero) or `100px` (the used value), decided
  // per load and stable within it. Forcing a layout flush before reading does not change it.
  //
  // Unusually for an entry here, the element is demonstrably not moving: across 12 probe runs
  // covering both states, `offsetLeft` and `getBoundingClientRect().left` were 100 every time,
  // with the container 1080px inside a 1280px parent. Nothing a visitor could see differs --
  // only what the value serialises to. This had cost three discarded gate runs before it was
  // traced, and was briefly mistaken for the unexplained ~1.0 CLS spike.
  { selector: '.container', properties: ['margin-left', 'margin-right'] },
  // `--fa` holds a glyph codepoint for the webfont `::before` path. Font Awesome replaces
  // every `.fa-*` element with an inline `<svg class="svg-inline--fa">` via `dom.watch()`,
  // and the SVG path never reads it — which is why `PurgeTimberlandPlugin`'s safelist
  // deliberately does NOT keep `.fa-{name}` glyph rules: retaining them only makes the
  // browser fetch a webfont nothing renders. The declarations therefore exist solely in the
  // deferred `-full` supersets, so asserting on them makes the gate fail whenever those are
  // switched off, for a value that cannot change what a visitor sees. That is a permanent
  // veto on a ~85 KB gzipped saving in exchange for nothing, so the property is excluded
  // rather than the safelist widened.
  //
  // Narrow on purpose: only `--fa`, and only on elements FA has already replaced. If the SVG
  // swap ever stops happening the elements keep their `.fa-*` classes and no longer match
  // `.svg-inline--fa`, so that regression still surfaces here instead of being hidden.
  { selector: '.svg-inline--fa', properties: ['--fa'] },
  // E19 font-settle race — see the note above. Generic/structural classes only, not
  // per-instance ones (`.menu-item-43`, `.about`, etc.), so new nav items/content need
  // no update here: every nav link and menu item shares `.nav-link`/`.menu-item`.
  { selector: '.nav-link, .menu-item', properties: ['width'] },
  {
    selector: '.site-header--row, .collapse.navbar-collapse, .site-header--navbar-wrapper, ' +
      '.site-header--primary-nav, .site-header--secondary-nav, .site-header--utility-nav, .button-wrapper',
    properties: ['height'],
  },
];

/** CSS injected before capture to stop motion from perturbing computed values. */
const FREEZE_CSS = `
*, *::before, *::after {
  animation-delay: 0s !important;
  animation-duration: 0s !important;
  animation-iteration-count: 1 !important;
  transition-delay: 0s !important;
  transition-duration: 0s !important;
  scroll-behavior: auto !important;
}`;

/**
 * Runs in the browser. Must be self-contained — no closures over Node scope.
 *
 * @param {{properties: string[], structuralTags: string[], maxElements: number,
 *          captureCustomProperties: boolean}} args
 * @returns {{elements: Object, rootVars: Object, meta: Object}}
 */
function collect(args) {
  const { properties, structuralTags, maxElements, ignore, captureCustomProperties } = args;
  const structural = new Set(structuralTags);

  // Resolve ignore rules to concrete elements once, not per element per rule.
  const skipEl = new Set();
  const skipProp = new Map(); // element -> Set(property)
  for (const rule of ignore || []) {
    let matched = [];
    try {
      matched = Array.from(document.querySelectorAll(rule.selector));
    } catch (e) {
      matched = []; // an invalid selector must not take the whole capture down
    }
    for (const el of matched) {
      if (!rule.properties || rule.properties.length === 0) {
        skipEl.add(el);
        continue;
      }
      if (!skipProp.has(el)) skipProp.set(el, new Set());
      for (const prop of rule.properties) skipProp.get(el).add(prop);
    }
  }

  const pathOf = (el) => {
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node.tagName.toLowerCase() !== 'html') {
      const tag = node.tagName.toLowerCase();
      const parent = node.parentElement;
      if (!parent) { parts.unshift(tag); break; }
      const sameTag = Array.prototype.filter.call(parent.children, (c) => c.tagName === node.tagName);
      parts.unshift(sameTag.length > 1 ? `${tag}:nth-of-type(${sameTag.indexOf(node) + 1})` : tag);
      node = parent;
    }
    return parts.join('>');
  };

  // Round numeric px so sub-pixel jitter is not a diff. Leave everything else verbatim.
  const norm = (v) => {
    if (typeof v !== 'string' || v === '') return v;
    return v.replace(/-?\d+\.\d+px/g, (m) => `${Math.round(parseFloat(m) * 100) / 100}px`);
  };

  /**
   * Collapse per-render generated identifiers to a stable placeholder.
   *
   * `classes` is recorded for human-readable diff reporting only — diff.js keys elements by
   * path and never compares the field. But the framework mints a fresh random identifier per
   * render, so storing them verbatim rewrote a baseline on EVERY capture even when nothing
   * had changed: a re-baseline touched 80 files, ~70 of them pure identifier churn. That
   * works directly against the reason baselines are JSON rather than PNG, which is that they
   * should diff in review.
   *
   * Anchored to the two generators actually in the codebase rather than guessed:
   *
   *   1. A Twig loop building EXACTLY 10 characters from `[a-z] + [A-Z] + [0-9] + '-' + '_'`
   *      (see e.g. menu.twig's `for i in 1..10` / `random(alpha ~ alpha|upper ~ num ~ '-_')`),
   *      appended after a separator: `navbar-2dXYRzmX23`, `collapse_Ae0VT3xj6R`.
   *      Note the alphabet INCLUDES `-` and `_`, so the random run can itself contain
   *      separators (`searchform-gPO-iOxrkt`) — which is why this matches a fixed-width
   *      trailing run after the last separator rather than splitting on separators.
   *   2. ACF `id_gen`, a `uniqid()`-shaped 13 lowercase-hex string, concatenated straight
   *      onto a prefix: `menu6ac5d9602a812`, `list-id--menu6ac5d9602a812`.
   *
   * Not handled, and not needed here: the Storybook addon's own `random` shim returns 7
   * base36 characters, which only affects Storybook renders, not this gate.
   *
   * **Precision matters more than completeness here**, which is a correction to the first
   * attempt at this. Matching any trailing 10-character run mangled real class names —
   * `js-social-nav-exists` became `js-social-<id>`, and `wp-image-6538` would have become
   * `wp-<id>`, because `nav-exists` and `image-6538` are also exactly 10 characters. A false
   * positive destroys a meaningful label and misleads whoever reads the diff, which is the
   * opposite of the goal; a miss merely leaves that one token churning, which is visible and
   * fixable. So the random run must additionally contain an uppercase letter or an
   * underscore — neither of which occurs in this codebase's strictly kebab-case class names.
   *
   * The known cost, measured rather than estimated: the only shape still missed is a run that
   * is all lowercase-and-digits *and* contains a hyphen — `navbar-0-wbh63q1s`. Both patterns
   * exclude it deliberately, because that is indistinguishable by shape from a real kebab-case
   * name carrying a number (`image-6538` inside `wp-image-6538`), and mangling a real label is
   * the worse failure. In practice it leaves one `classes` line churning in one baseline of 80
   * per capture, rotating as the random draw changes. Four rounds of widening the patterns got
   * from 70 files to 1; a fifth would trade that last line for real false-positive risk, so it
   * stops here. The identifiers in question come from header partials (`searchform.twig`, the
   * nav templates), which mint their own ids outside any fixture data's control.
   *
   * Applies to `classes` only; `id` is no longer recorded at all (see the element record
   * below for why).
   *
   * **There is a second copy of these patterns in `generated-ids.js`**, used by T5's state
   * derivation, which hit this same churn through a different door (a derived SELECTOR rather
   * than a class list). The duplication is structural, not laziness: this function is handed to
   * `page.evaluate()`, which serialises its source and runs it in the browser, where `require`
   * does not exist — a function closing over an import cannot cross that boundary. If these
   * patterns change, change both. Recorded because an undocumented second copy is exactly how
   * the three near-identical CSS minifiers happened.
   */
  const RE_UNIQID = /[0-9a-f]{13}$/;
  // Separator + exactly 10 generator characters, where the run carries an uppercase letter
  // or an underscore (impossible in this codebase's kebab-case class names)...
  const RE_RANDOM10 = /([-_])(?=[A-Za-z0-9_-]{10}$)[A-Za-z0-9_-]*[A-Z_][A-Za-z0-9_-]*$/;
  // ...or is all-lowercase-and-digits with no internal hyphen. That second form is the
  // ~0.5% of generated runs that happen to draw no uppercase (`navbar-h5b0acceag`,
  // `searchform-u9fh0pckkt`), which the first pattern alone missed — 5 of 80 baselines still
  // churned on it. The no-hyphen requirement is what keeps real names safe: a kebab-case
  // segment carrying digits has a hyphen in it (`image-6538` in `wp-image-6538`,
  // `nav-exists` in `js-social-nav-exists`), a random run does not. Verified against every
  // class token present in all 80 committed baselines, not reasoned about.
  const RE_RANDOM10_LOWER = /([-_])(?=[a-z0-9]{10}$)[a-z0-9]*\d[a-z0-9]*$/;

  const normClass = (t) => {
    if (typeof t !== 'string' || t.length < 11) return t;
    const u = t.replace(RE_UNIQID, '<id>');
    if (u !== t) return u;
    const r = t.replace(RE_RANDOM10, '$1<id>');
    if (r !== t) return r;
    return t.replace(RE_RANDOM10_LOWER, '$1<id>');
  };


  // Renderable elements only. `querySelectorAll('*')` also returns <head> machinery —
  // <style>, <link>, <meta>, <script> — which has no computed appearance to gate on, and
  // whose count is not stable: the number of injected <style> elements varies between
  // otherwise identical runs (observed 14 vs 18 on the same page, and 13 in the server HTML
  // across ten fetches, so the extra ones are injected client-side). That made
  // `meta.totalElements` churn by exactly the <style> delta — 718 vs 719 between two
  // consecutive baseline captures, +4/+4 in a browser probe — for elements that can never
  // be the subject of a style regression. None of them were ever *captured* (they carry no
  // class), so this only ever polluted the count, but a count that moves on its own is worse
  // than no count: it is indistinguishable from content appearing or disappearing, which is
  // how it was first mistaken for DOM nondeterminism.
  const NON_RENDERED = new Set(['STYLE', 'LINK', 'META', 'SCRIPT', 'TITLE', 'BASE', 'HEAD', 'NOSCRIPT', 'TEMPLATE']);
  const all = Array.prototype.filter.call(
    document.querySelectorAll('*'),
    (el) => !NON_RENDERED.has(el.tagName),
  );
  const out = {};
  let considered = 0;
  let captured = 0;
  let truncated = false;
  let elementsWithVars = 0;
  let varDeclarations = 0;

  // The whole :root custom-property set, once. This is the theme's palette and token
  // layer, and it is where a cross-tier mistake shows up first — a child theme losing
  // its own --bs-primary to the parent's is a single changed value here. One element,
  // measured at ~3ms, so there is no reason to sample it.
  const rootVars = {};
  if (captureCustomProperties) {
    const rcs = window.getComputedStyle(document.documentElement);
    for (let i = 0; i < rcs.length; i++) {
      const name = rcs.item(i);
      if (name.charCodeAt(0) !== 45 || name.charCodeAt(1) !== 45) continue;
      rootVars[name] = norm(rcs.getPropertyValue(name).trim());
    }
  }

  for (const el of all) {
    const tag = el.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'template') continue;
    const hasClass = el.classList.length > 0;
    if (!hasClass && !structural.has(tag)) continue;
    if (skipEl.has(el)) continue;
    considered++;
    if (captured >= maxElements) { truncated = true; continue; }

    const cs = window.getComputedStyle(el);
    const dropped = skipProp.get(el);
    const styles = {};
    for (const prop of properties) {
      if (dropped && dropped.has(prop)) continue;
      styles[prop] = norm(cs.getPropertyValue(prop));
    }

    // Custom properties declared ON THIS ELEMENT — i.e. whose computed value differs
    // from the parent's. Custom properties inherit, so an element's value matches its
    // parent's unless a rule sets it here; that comparison is what separates the handful
    // of real declarations from the ~1,400 every element merely inherits from :root.
    // Capturing the inherited set per element would multiply baseline size by ~20x for
    // no added signal — the inherited values are already covered once by rootVars.
    // The root element is skipped here on purpose: it has no parent to diff against, so
    // every inherited property would look "declared" and it would duplicate the whole
    // rootVars set into this element (measured: 1,461 spurious entries, 6x the real
    // signal). rootVars already covers it.
    let vars;
    const varParent = captureCustomProperties ? el.parentElement : null;
    if (varParent) {
      const ps = window.getComputedStyle(varParent);
      for (let i = 0; i < cs.length; i++) {
        const name = cs.item(i);
        if (name.charCodeAt(0) !== 45 || name.charCodeAt(1) !== 45) continue;
        if (dropped && dropped.has(name)) continue;
        const v = cs.getPropertyValue(name);
        if (v === ps.getPropertyValue(name)) continue;
        if (!vars) vars = {};
        vars[name] = norm(v.trim());
      }
      if (vars) {
        varDeclarations += Object.keys(vars).length;
        elementsWithVars++;
      }
    }

    const key = pathOf(el);
    out[key] = {
      tag,
      // `id` is deliberately NOT recorded. It was, and nothing ever read it: diff.js labels
      // elements from `tag`/`classes` only, and neither the spec nor the canary touch it. So
      // its sole effect was churn — generated ids (`modal_znJaL1__LcLabel`, `t-xxT8xQ40`)
      // change every render, and no amount of pattern-matching catches every generator shape.
      // Three rounds of widening the normaliser below each turned up another form: a random
      // run with a `Label` suffix (so end-anchored patterns miss it), a 10-character id with
      // no prefix at all, a lowercase run containing a hyphen. Deleting data nobody reads
      // beats indefinitely chasing its shape, and unlike a broader regex it cannot
      // mis-normalise a real name.
      // Normalise before sorting: a changed random identifier also shifts its alphabetical
      // position, so sorting raw values moved unrelated tokens around in the diff too.
      classes: hasClass ? Array.from(el.classList).map(normClass).sort().join(' ') : undefined,
      styles,
      vars,
    };
    captured++;
  }

  return {
    elements: out,
    rootVars,
    meta: {
      totalElements: all.length,
      consideredElements: considered,
      capturedElements: captured,
      truncated,
      propertyCount: properties.length,
      ignoredElements: skipEl.size,
      elementsWithIgnoredProperties: skipProp.size,
      customProperties: captureCustomProperties,
      rootVarCount: Object.keys(rootVars).length,
      elementsWithVars,
      varDeclarations,
    },
  };
}

/**
 * Navigate, settle the page, and return a snapshot.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} url
 * @param {object} opts
 * @returns {Promise<object>} snapshot
 */
async function snapshot(page, url, opts = {}) {
  const {
    properties,
    structuralTags = STRUCTURAL_TAGS,
    maxElements = 1500,
    settleMs = 250,
    triggerLazy = true,
    interact = null,
    ignore = DEFAULT_IGNORE,
    captureCustomProperties = true,
    // Layout-quiesce wait (see below). Defaults are deliberately cheap: three matching
    // reads 100ms apart is ~300ms on a page that is already still, and the budget only
    // comes into play on a page that genuinely keeps moving.
    stabilityChecks = 3,
    stabilityIntervalMs = 100,
    stabilityBudgetMs = 5000,
  } = opts;

  // Stop `focus()` from scrolling the page, without stopping it from focusing.
  //
  // A component that opens itself on load and focuses its own panel will scroll that panel
  // into view, and if the panel sits far down the document the page ends up hundreds or
  // thousands of pixels from the top. That matters here because the header's geometry is
  // driven by scroll-state classes that site JS toggles (`scroll-down`, `header-shrunk`), so
  // where the page happens to be sitting changes `position`, `top`, `bottom`, `min-height`
  // and the body's `padding-top` — real captured properties, reported as real differences.
  //
  // It is a *race*, not a steady offset: `triggerLazy` below walks the page and returns to
  // the top, and the focus call lands on either side of that walk depending on how quickly
  // the component initialises. So the capture sees the top of the page on some runs and the
  // scrolled position on others, and reports whichever properties differ between them.
  // Observed on `tl-fixture-bootstrap-components`, where a Bootstrap offcanvas renders with
  // `show` already applied: `activate()` calls `focus()` on it ~850ms after load and the page
  // settles around y=2713 of 3613.
  //
  // `preventScroll` is the targeted fix: focus still moves, so `:focus`/`:focus-visible`
  // styling is captured exactly as a visitor would get it, and only the scroll side effect is
  // suppressed. Forcing the scroll position instead would fight the page and still race;
  // blurring would change which element matches `:focus`. Must be an init script — the call
  // happens in site JS, so a patch applied after `goto` would be too late.
  await page.addInitScript(() => {
    for (const proto of [HTMLElement.prototype, SVGElement.prototype]) {
      if (!proto || !proto.focus) continue;
      const original = proto.focus;
      proto.focus = function (options) {
        return original.call(this, { ...(options || {}), preventScroll: true });
      };
    }
  });

  const response = await page.goto(url, { waitUntil: 'load' });
  const status = response ? response.status() : 0;

  await page.addStyleTag({ content: FREEZE_CSS });

  // Lazy-loaded images change layout when they arrive. Walk the page to trigger
  // them, then return to the top so scroll-linked styles land in a known state.
  if (triggerLazy) {
    await page.evaluate(async () => {
      const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => r()));
      }
      window.scrollTo(0, 0);
    });
  }

  // Per-target interaction, for styles that exist only in a state JS puts the page into.
  //
  // A content scan sees a page at rest, so CSS behind an interaction state is invisible to
  // both the purge and this gate -- the purge drops it and the gate does not notice. WordPress
  // core's navigation block is the case that forced this: `is-menu-open` and `has-modal-open`
  // are applied by the Interactivity API on click, and 34 of its 38 overlay rules purge away
  // without them, leaving an opened menu at `flex-direction: row` with 2px-wide submenus. That
  // is guarded by a safelist, and a safelist with nothing asserting it is how the stale icon
  // scan and the empty CSS file both shipped green.
  //
  // Runs here on purpose: after `triggerLazy` so a state opened over lazy content is not
  // undone by the scroll walk, and after FREEZE_CSS so an animating panel is captured at its
  // end state rather than mid-transition -- the overlay animates continuously, which is why
  // screenshot comparison of it never stabilises.
  //
  // The function is responsible for leaving the page settled; the stability wait below is a
  // backstop, not a substitute. Failures are deliberately not swallowed: an interaction that
  // silently stops working leaves the state it was meant to reach unguarded, which is the
  // failure this exists to prevent.
  if (typeof interact === 'function') {
    await interact(page);
  }

  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));

  // Wait for deferred stylesheets to actually apply.
  //
  // `Performance::defer_content_css()` ships these as `media="print"` with an
  // `onload="this.media='all'"` swap, so between `load` and that swap firing the sheet is
  // downloaded but contributes nothing to computed style. Capturing in that window silently
  // measures the page as if the sheet were missing — which looks exactly like a purge gap,
  // because the deferred `-full` copies are the ones carrying the classes a purge dropped.
  //
  // Nothing used to wait for this; it was masked by how long the page took to settle for
  // other reasons, and surfaced the moment `preventScroll` above removed the scroll churn:
  // identical runs began reporting `--fa` REMOVED on the social icons with the full
  // fallbacks enabled, because `timberland-full.css` had not been promoted yet.
  //
  // Only links that carry the swap are waited on. A genuinely print-only stylesheet keeps
  // `media="print"` forever and must not be waited for, so the `onload` attribute is what
  // distinguishes "deferred, not applied yet" from "not meant for screen at all".
  const deferredApplied = await page.waitForFunction(() => {
    const pending = [...document.querySelectorAll('link[rel="stylesheet"][media="print"]')]
      .filter((l) => /this\.media/.test(l.getAttribute('onload') || ''));
    return pending.length === 0;
  }, undefined, { timeout: 10000 }).then(() => true).catch(() => false);

  if (!deferredApplied) {
    console.warn(`  ! ${url}: deferred stylesheets were still on media="print" after 10s`
      + ' — the capture may be missing their declarations');
  }

  // Wait for layout to stop moving, rather than hoping a fixed delay is long enough.
  //
  // `networkidle` and `fonts.ready` both resolve while script-driven layout is still
  // settling, and the flat `settleMs` below cannot tell the difference between "settled" and
  // "not started yet". Polling a whole-document layout signature until it repeats covers any
  // late shift — carousel init, image decode, equal-height passes — without the gate needing
  // to know which library caused it. `offset*` is used rather than getBoundingClientRect
  // because it is integer-valued, so sub-pixel jitter cannot stop the signature stabilising.
  //
  // **This does NOT fix O3, and was added while trying to.** Worth recording so the next
  // person does not re-run the experiment: the header logo slider resolves to either
  // 152.42px or 240px, cascading into `.site-header` (432.28px vs 519.86px) and total page
  // height, on most pages. The hypothesis was that the capture caught it mid-settle. It does
  // not: two consecutive captures recorded the two different heights with
  // `meta.layoutSettled === true` in BOTH. Each height is individually stable — in isolation
  // the slider held 152.42px across five snapshots, a six-second observation, and a run with
  // 1.2s-delayed images. So the carousel latches one of two values at init and keeps it, and
  // no amount of additional waiting can help. Fixing O3 means making that initialisation
  // deterministic (or ignoring the height), not waiting longer.
  //
  // Kept regardless, because waiting for quiesce rather than a fixed 250ms is correct on its
  // own terms and is cheap on an already-still page (~300ms).
  const stable = await page.evaluate(async ({ checks, intervalMs, budgetMs }) => {
    const signature = () => {
      let h = 0;
      const all = document.querySelectorAll('*');
      for (let i = 0; i < all.length; i++) {
        const el = all[i];
        h = (h * 31 + el.offsetHeight + el.offsetWidth * 7) % 2147483647;
      }
      // Scroll offset and the root/body class lists are part of the signature because the
      // rest of it cannot see them: `offsetWidth`/`offsetHeight` and `scrollHeight` are all
      // invariant under scrolling, so a page in the middle of a scroll animation hashes
      // identically at every position and the loop below declares it settled on the first
      // comparison. Several captured properties do move with scroll, via the scroll-state
      // classes site JS toggles, so "nothing is moving" has to include "the page is not
      // being scrolled and its state classes have stopped changing".
      return [
        all.length,
        h,
        document.documentElement.scrollHeight,
        Math.round(window.scrollY),
        document.documentElement.className,
        document.body ? document.body.className : '',
      ].join(':');
    };
    const started = Date.now();
    let last = signature();
    let repeats = 0;
    while (Date.now() - started < budgetMs) {
      await new Promise((r) => setTimeout(r, intervalMs));
      const now = signature();
      if (now === last) {
        if (++repeats >= checks) return { settled: true, waitedMs: Date.now() - started };
      } else {
        repeats = 0;
        last = now;
      }
    }
    return { settled: false, waitedMs: Date.now() - started };
  }, { checks: stabilityChecks, intervalMs: stabilityIntervalMs, budgetMs: stabilityBudgetMs });

  if (!stable.settled) {
    console.warn(`  ! ${url}: layout still shifting after ${stable.waitedMs}ms`
      + ' — the capture may have caught a mid-settle value (raise stabilityBudgetMs)');
  }

  if (settleMs) await page.waitForTimeout(settleMs);

  const result = await page.evaluate(collect, {
    properties, structuralTags, maxElements, ignore, captureCustomProperties,
  });

  return {
    url,
    status,
    viewport: page.viewportSize(),
    ...result,
    // `layoutSettled` is recorded; the elapsed time deliberately is NOT. Everything returned
    // here is serialised into the baseline, and a millisecond reading never repeats — storing
    // it reintroduced exactly the churn the identifier normalisation above just removed (two
    // consecutive captures differed only by `layoutWaitMs: 305` vs `304`, in 70 of 80 files).
    // The duration is surfaced as a warning instead, which is the only case anyone needs it.
    meta: { ...result.meta, layoutSettled: stable.settled },
  };
}

module.exports = { snapshot, collect, FREEZE_CSS, STRUCTURAL_TAGS, DEFAULT_IGNORE };

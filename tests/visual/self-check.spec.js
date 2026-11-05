'use strict';

/**
 * F5: proves the gate catches each class of regression it claims to.
 *
 * Every other spec here answers "did the site change". This one answers "would we know if
 * it had" — by breaking the CSS the browser receives and asserting the gate's own machinery
 * reports it, on the right channel, naming the right thing.
 *
 * Why it exists: before this, each capability had been verified exactly once, by hand, by
 * deliberately breaking something and looking at the output. X15's precondition inverted,
 * T12 validated by reintroducing X10's deletion, F3 the same, F4's two checks by removing a
 * baseline and neutering a filter. Four proofs, none repeatable, none re-run since. A
 * refactor of `capture.js` or `diff.js` could have removed any of those capabilities and
 * every test would have stayed green — structurally the same hole F4 was built to close, one
 * level up. Each guarantee here stops being something someone once checked and becomes
 * something CI checks.
 *
 * How a mutation is applied: `page.route()` rewrites stylesheet responses in flight, so no
 * rebuild is involved and each mutation costs milliseconds rather than a two-minute webpack
 * run. See `mutate.js` for the derive-the-victim rule and the CSS scanner that makes the
 * text surgery safe.
 *
 * Two assertions per test, and the order matters:
 *   1. the mutation actually landed (declarations removed > 0, or the mutated value is the
 *      sentinel)
 *   2. the gate reported it
 * Without the first, a mutation that silently failed to apply would produce two identical
 * snapshots and the test would blame the gate for missing a regression that never existed.
 *
 * Honest limit, stated here rather than discovered later: this proves the guarantees someone
 * thought to assert, not the absence of blindness. The list grows as gaps are found. That is
 * ordinary test-suite evolution, not a solved problem.
 *
 * Zero-config: the page to mutate is derived from config the theme already provides for
 * other reasons (F4's `fullCoveragePath`, else a T4 canary target, else the first target).
 * Override with `selfCheck: { path }` if a theme needs a different one.
 */

const { test, expect } = require('@playwright/test');
const { resolveConfig, viewportsFor } = require('./config.js');
const { snapshot } = require('./capture.js');
const { diffSnapshots, formatDiff } = require('./diff.js');
const { measureRenderBlockingCss, MIN_RENDER_BLOCKING_BYTES } = require('./css-budget.js');
const { parseStylesheetOrder, positionsFor } = require('./load-order.js');
const {
  stripDeclarations, appendRootOverride, swapLinkTags,
  pickElementVar, pickRootVar, pickStandardProperty, routeCssMutation,
} = require('./mutate.js');

const cfg = resolveConfig();

/**
 * The page to mutate.
 *
 * `fullCoveragePath` is preferred because F4 defines it as the page that renders every
 * component — which makes it, by construction, the page with the most custom-property
 * declarations to pick a victim from.
 */
function selfCheckTarget() {
  const explicit = cfg.selfCheck && cfg.selfCheck.path;
  const cc = cfg.componentCoverage;
  const canary = cfg.targets.find((t) => t.canary === true);
  const wanted = explicit
    || (cc && cc.fullCoveragePath)
    || (canary && canary.path)
    || cfg.targets[0].path;
  const target = cfg.targets.find((t) => t.path === wanted);
  return { path: wanted, target };
}

const { path: SELF_PATH, target: SELF_TARGET } = selfCheckTarget();
const VIEWPORT = SELF_TARGET
  ? viewportsFor(cfg, SELF_TARGET)[0]
  : cfg.viewports[cfg.viewports.length - 1];

const SNAP_OPTS = {
  properties: cfg.properties,
  maxElements: cfg.maxElements,
  settleMs: cfg.settleMs,
  triggerLazy: SELF_TARGET && SELF_TARGET.triggerLazy !== undefined
    ? SELF_TARGET.triggerLazy
    : cfg.triggerLazy,
  ignore: cfg.ignore,
  captureCustomProperties: cfg.captureCustomProperties,
};

const IDENTITY = (css) => css;

/**
 * Clean and mutated snapshots of the same page, both taken through the same interception
 * path so the mutation is the only difference between them.
 */
async function cleanThenMutated(page, mutation) {
  await page.setViewportSize({ width: VIEWPORT.width, height: VIEWPORT.height });

  let transform = IDENTITY;
  const stats = await routeCssMutation(page, () => transform);

  const clean = await snapshot(page, cfg.baseUrl + SELF_PATH, SNAP_OPTS);
  expect(
    stats.intercepted,
    `no stylesheet requests were intercepted on ${SELF_PATH} — every mutation below would`
    + ' be a no-op and every assertion vacuous'
  ).toBeGreaterThan(0);
  expect(clean.status, `${SELF_PATH}: expected HTTP 200, got ${clean.status}`).toBe(200);
  expect(stats.changed, 'the identity pass changed a stylesheet').toBe(0);

  const victim = mutation.pick(clean);
  expect(victim, mutation.noVictimMessage).not.toBeNull();

  transform = mutation.transform(victim);
  const mutated = await snapshot(page, cfg.baseUrl + SELF_PATH, SNAP_OPTS);

  return { clean, mutated, victim, stats };
}

test.describe('gate self-check (F5)', () => {
  /**
   * T12's reason for existing: a custom-property declaration that disappears means the
   * element silently fell back to an inherited or earlier-tier value. Two of X10's nine
   * regressions were `:focus`-only box-shadows, which never appear in a computed-style
   * capture at all — so the var channel is the only thing that can see them.
   */
  test('a removed --bs-* declaration is reported as REMOVED and named', async ({ page }) => {
    test.skip(!cfg.captureCustomProperties, 'captureCustomProperties is off for this theme');

    let removed = 0;
    const { clean, mutated, victim } = await cleanThenMutated(page, {
      pick: (snap) => pickElementVar(snap),
      noVictimMessage: `${SELF_PATH} captured no element-level custom property declarations,`
        + ' so there is nothing to strip. Point selfCheck.path at a page that renders themed'
        + ' components.',
      transform: (v) => (css) => {
        const r = stripDeclarations(css, v.name);
        removed += r.count;
        return r.css;
      },
    });

    expect(
      removed,
      `${victim.name} was declared on ${victim.elements} captured element(s) but no served`
      + ' stylesheet contained a declaration of it — the mutation never applied, so this'
      + ' test cannot say anything about the gate. Likely an inline <style> source, or the'
      + ' CSS scanner in mutate.js failing to match it.'
    ).toBeGreaterThan(0);

    const d = diffSnapshots(clean, mutated);
    const report = formatDiff(d);

    expect(d.clean, `stripping every declaration of ${victim.name} from ${removed} place(s)`
      + ' produced a CLEAN diff — the gate did not notice').toBe(false);

    const hits = d.varsByProperty[victim.name] || [];
    expect(
      hits.length,
      `the diff is not clean but ${victim.name} is absent from the custom-property channel.`
      + ' Something else changed instead, so this run proves nothing about var removal.'
      + ` Channels reported: ${Object.keys(d.varsByProperty).join(', ') || 'none'}`
    ).toBeGreaterThan(0);
    expect(
      hits.some((h) => h.kind === 'removed'),
      `${victim.name} is reported, but not as 'removed' — kinds seen:`
      + ` ${[...new Set(hits.map((h) => h.kind))].join(', ')}. A removal classified as a`
      + ' change is the asymmetry diff.js exists to preserve (see diff.test.mjs).'
    ).toBe(true);

    expect(report, 'the formatted report does not name the removed property').toContain(victim.name);
    expect(report, 'the formatted report does not mark it REMOVED').toContain('REMOVED');

    console.log(`  = self-check: ${victim.name} stripped from ${removed} declaration(s)`
      + ` -> reported on ${hits.length} element(s), ${hits.filter((h) => h.kind === 'removed').length} REMOVED`);
  });

  /**
   * The palette channel. A child theme losing its own `--bs-primary` to the parent's is a
   * single changed value at `:root`, and it is the cross-tier mistake X10 measured.
   */
  test('a changed :root custom property is reported on the rootVars channel', async ({ page }) => {
    test.skip(!cfg.captureCustomProperties, 'captureCustomProperties is off for this theme');

    // Two sentinels so the mutation is guaranteed to differ from whatever is there now.
    const SENTINELS = ['#0f0e0d', '#1e1d1c'];
    let sentinel = null;

    const { clean, mutated, victim } = await cleanThenMutated(page, {
      pick: (snap) => pickRootVar(snap),
      noVictimMessage: `${SELF_PATH} captured no :root custom properties`,
      transform: (v) => {
        sentinel = SENTINELS.find((s) => s !== v.value.trim()) || SENTINELS[0];
        return (css) => appendRootOverride(css, v.name, sentinel);
      },
    });

    expect(
      mutated.rootVars[victim.name],
      `the :root override for ${victim.name} did not win the cascade (still`
      + ` ${JSON.stringify(mutated.rootVars[victim.name])}), so the mutation never applied.`
      + ' Something declares it with higher specificity than :root.'
    ).toBe(sentinel);

    const d = diffSnapshots(clean, mutated);
    expect(d.clean, `${victim.name} changed at :root but the diff is CLEAN`).toBe(false);

    const hit = d.rootVarDiff.find((v) => v.name === victim.name);
    expect(
      hit,
      `${victim.name} changed but is absent from rootVarDiff. Reported instead:`
      + ` ${d.rootVarDiff.map((v) => v.name).join(', ') || 'nothing'}`
    ).toBeTruthy();
    expect(hit.kind).toBe('changed');
    expect(hit.from).toBe(victim.value);
    expect(hit.to).toBe(sentinel);
    expect(d.counts.rootVarsAffected).toBeGreaterThan(0);
    expect(formatDiff(d)).toContain(victim.name);

    console.log(`  = self-check: :root ${victim.name} ${JSON.stringify(victim.value)}`
      + ` -> ${sentinel}, reported with ${d.counts.rootVarsAffected} :root var(s) affected`);
  });

  /**
   * The original purpose of the whole gate: a rule PurgeCSS should not have removed. Here
   * the equivalent is every declaration of one property disappearing from the cascade.
   */
  test('a removed ordinary declaration is reported on the property channel', async ({ page }) => {
    let removed = 0;
    const { clean, mutated, victim } = await cleanThenMutated(page, {
      pick: (snap) => pickStandardProperty(snap),
      noVictimMessage: `${SELF_PATH} does not style any candidate property with at least two`
        + ' distinct values, so stripping one might change nothing',
      transform: (v) => (css) => {
        const r = stripDeclarations(css, v.name);
        removed += r.count;
        return r.css;
      },
    });

    expect(
      removed,
      `${victim.name} holds ${victim.distinctValues} distinct values across captured`
      + ' elements but no served stylesheet declared it — the mutation never applied'
    ).toBeGreaterThan(0);

    const d = diffSnapshots(clean, mutated);
    expect(d.clean, `stripping every ${victim.name} declaration from ${removed} place(s)`
      + ' produced a CLEAN diff — the gate did not notice').toBe(false);

    const hits = d.byProperty[victim.name] || [];
    expect(
      hits.length,
      `the diff is not clean but ${victim.name} is absent from the property channel.`
      + ` Reported instead: ${Object.keys(d.byProperty).join(', ') || 'nothing'}`
    ).toBeGreaterThan(0);
    expect(d.counts.valuesChanged).toBeGreaterThan(0);
    expect(formatDiff(d)).toContain(victim.name);

    console.log(`  = self-check: ${victim.name} stripped from ${removed} declaration(s)`
      + ` -> reported on ${hits.length} element(s)`);
  });

  /**
   * T4's mechanism, which is C3 made concrete: `minify_css()` returns null on a PCRE
   * backtrack limit, an empty file is written, and `0 !== false` records it as success.
   * Serving empty bundles reproduces exactly that outcome.
   *
   * Asserts the canary's detection logic fires rather than re-running the canary and
   * expecting a failure, which Playwright cannot express.
   */
  test('an empty CSS bundle collapses the canary\'s render-blocking floor', async ({ page }) => {
    const canaryTarget = cfg.targets.find((t) => t.canary === true);
    const canaryPath = canaryTarget ? canaryTarget.path : SELF_PATH;

    let transform = IDENTITY;
    const stats = await routeCssMutation(page, () => transform);

    // Measure the real page first: the floor is only meaningful if this page clears it.
    const before = await measureRenderBlockingCss(page, cfg.baseUrl + canaryPath);
    expect(
      before.totalBytes,
      `${canaryPath} serves only ${(before.totalBytes / 1024).toFixed(1)} KB of`
      + ` render-blocking CSS, already under the ${(MIN_RENDER_BLOCKING_BYTES / 1024).toFixed(0)} KB`
      + ' floor — the canary is failing on the real site, so this test cannot distinguish'
      + ' a working canary from a broken page'
    ).toBeGreaterThanOrEqual(MIN_RENDER_BLOCKING_BYTES);

    transform = () => '';
    const after = await measureRenderBlockingCss(page, cfg.baseUrl + canaryPath);

    expect(stats.changed, 'no stylesheet was emptied — the mutation never applied')
      .toBeGreaterThan(0);
    expect(
      after.blockingCount,
      'no render-blocking <link> tags remain, so the floor would collapse for the wrong'
      + ' reason (missing links rather than empty bundles)'
    ).toBeGreaterThan(0);
    expect(
      after.totalBytes,
      `bundles were emptied but render-blocking CSS still measures`
      + ` ${(after.totalBytes / 1024).toFixed(1)} KB — the canary's floor would not fire`
    ).toBeLessThan(MIN_RENDER_BLOCKING_BYTES);

    // The canary's second, independent signal. Reported rather than asserted: inline
    // <style> output (wp_add_inline_style, the customizer CSS) is not interceptable as a
    // stylesheet request, so a theme that sets its font stack there keeps a styled body
    // font even with every external bundle emptied. That would make this a false failure
    // about a real-but-narrower guarantee, so the byte floor above is the hard assertion
    // and this prints what actually happened.
    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    const fontSignalFires = !fontFamily.includes('sans-serif');

    console.log(`  = self-check: ${before.blockingCount} bundle(s) emptied —`
      + ` ${(before.totalBytes / 1024).toFixed(1)} KB -> ${(after.totalBytes / 1024).toFixed(1)} KB,`
      + ` floor fires; font signal ${fontSignalFires ? 'fires' : `does NOT fire (body font-family still ${JSON.stringify(fontFamily)}`
        + ' — inline CSS, not an external bundle)'}`);
  });

  /**
   * X15's precondition. `ParentCssDedupePlugin` removes rules from a child bundle because an
   * identical rule is delivered by a sheet loading earlier; if that order ever flips, the
   * deduped bundle is simply missing rules, with no error and nothing a re-recorded style
   * baseline would reveal.
   *
   * Mutates the document rather than response timing, because cascade order follows DOM
   * position — which is also why `positionsFor` looks at raw document order rather than a
   * blocking/deferred bucket.
   */
  test('swapping two <link> tags breaks the load-order precondition', async ({ page }) => {
    const lo = cfg.loadOrder;
    const req = lo && (lo.requires || [])[0];
    test.skip(!req, 'no loadOrder.requires configured for this theme');

    const loPath = (lo.paths && lo.paths[0]) || '/';
    const response = await page.goto(cfg.baseUrl + loPath, { waitUntil: 'domcontentloaded' });
    const html = await response.text();

    const real = parseStylesheetOrder(html);
    const realPos = positionsFor(real.all, req);
    expect(
      realPos.beforeAt,
      `"${req.before}" is not enqueued on ${loPath} at all, so there is no satisfied`
      + ' precondition here to break'
    ).not.toBe(-1);
    expect(realPos.afterAt, `"${req.after}" is not enqueued on ${loPath}`).not.toBe(-1);
    expect(
      realPos.beforeAt,
      'the precondition is already violated on the real page — fix that before asking'
      + ' whether a mutation would be caught'
    ).toBeLessThan(realPos.afterAt);

    const swap = swapLinkTags(html, req.before, req.after);
    expect(swap.swapped, `could not swap the two <link> tags: ${swap.reason}`).toBe(true);

    const mutatedOrder = parseStylesheetOrder(swap.html);
    expect(
      mutatedOrder.all.length,
      'the swapped document parses to a different number of stylesheets than the real one,'
      + ' so the mutation corrupted the HTML rather than reordering it'
    ).toBe(real.all.length);

    const pos = positionsFor(mutatedOrder.all, req);
    expect(pos.beforeAt, `"${req.before}" vanished from the swapped document`).not.toBe(-1);
    expect(pos.afterAt, `"${req.after}" vanished from the swapped document`).not.toBe(-1);
    expect(
      pos.beforeAt > pos.afterAt,
      `the <link> tags were swapped but "${req.before}" still parses as loading before`
      + ` "${req.after}" (positions ${pos.beforeAt} and ${pos.afterAt}) — the order check`
      + ' would stay green on a document that violates its own precondition'
    ).toBe(true);

    console.log(`  = self-check: load order ${loPath} — swapping`
      + ` ${req.before.split('/').pop()} / ${req.after.split('/').pop()} moves positions`
      + ` ${realPos.beforeAt}<${realPos.afterAt} -> ${pos.beforeAt}>${pos.afterAt}, caught`);
  });
});

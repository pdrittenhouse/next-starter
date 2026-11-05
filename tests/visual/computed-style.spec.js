'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { resolveConfig, viewportsFor } = require('./config.js');
const { snapshot } = require('./capture.js');
const { diffSnapshots, formatDiff } = require('./diff.js');

const cfg = resolveConfig();
const UPDATE = process.env.UPDATE_BASELINES === '1';

/**
 * Stable JSON: keys sorted at every level so a baseline diff in review shows only
 * what actually changed, rather than reordering noise.
 */
function stableStringify(value) {
  const sort = (v) => {
    if (Array.isArray(v)) return v.map(sort);
    if (v && typeof v === 'object') {
      return Object.keys(v).sort().reduce((acc, k) => {
        if (v[k] !== undefined) acc[k] = sort(v[k]);
        return acc;
      }, {});
    }
    return v;
  };
  return `${JSON.stringify(sort(value), null, 2)}\n`;
}

for (const target of cfg.targets) {
  for (const vp of viewportsFor(cfg, target)) {
    const label = `${target.name} @ ${vp.name}`;
    const file = path.join(cfg.baselineDir, `${target.name}.${vp.name}.json`);

    test(label, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Per-target override: a block fixture carrying many OFAT variants (F2) can multiply
      // its own single-instance element count by the number of class-composing choice values
      // it sweeps -- menu's ~150-element nav tree x 39 variants is ~5,200 elements, posts-loop's
      // heavier tree x 130 variants is ~12,000. Below the true count, truncation silently drops
      // whatever falls past the cut -- observed concretely: block-menu's footer social-nav
      // items and block-posts-loop's own tail fell outside a 1,500/3,000 cap respectively,
      // each read by the differ as the element having been REMOVED (its old key disappeared)
      // with no replacement, rather than as "not captured this run". Global default stays low
      // because most fixtures do not need this.
      const maxElements = target.maxElements === undefined ? cfg.maxElements : target.maxElements;

      const current = await snapshot(page, cfg.baseUrl + target.path, {
        properties: cfg.properties,
        maxElements,
        settleMs: cfg.settleMs,
        // Per-target override: a page with no lazy-loaded content gains nothing from the
        // scroll-through and can be actively destabilised by it. The components fixture
        // (F3) is the case that forced this -- it is tall and imageless, so scrolling it
        // only served to leave the theme's hide-on-scroll header in its hidden state,
        // which settleMs was not long enough to unwind.
        triggerLazy: target.triggerLazy === undefined ? cfg.triggerLazy : target.triggerLazy,
        // Per-target interaction, for CSS that only applies in a JS-opened state. See the
        // `interact` note in capture.js for why it runs where it does.
        interact: target.interact,
        ignore: cfg.ignore,
        captureCustomProperties: cfg.captureCustomProperties,
      });

      // A target whose URL stops resolving is a broken test, not a style change. The URL is in
      // the message because the commonest cause by far is a baseUrl pointing somewhere that is
      // not the site: `visual.config.js` falls back to `http://localhost` when
      // TIMBERLAND_VISUAL_BASE_URL is unset, and the symptom is EVERY target failing this
      // assertion at ~1.4s each, which reads like a mass style regression until you see the host.
      const expectStatus = target.expectStatus === undefined ? 200 : target.expectStatus;
      expect(
        current.status,
        `${label}: expected HTTP ${expectStatus}, got ${current.status} from `
        + `${cfg.baseUrl + target.path}`
        + (current.status === 404 ? ' — if every target is failing this, check cfg.baseUrl '
          + '(TIMBERLAND_VISUAL_BASE_URL) before looking at the theme' : ''),
      ).toBe(expectStatus);
      expect(current.meta.capturedElements, `${label}: captured no elements`).toBeGreaterThan(0);
      if (current.meta.truncated) {
        console.warn(`  ! ${label}: hit maxElements=${maxElements}`
          + ` (${current.meta.consideredElements} considered) — raise it or the tail is unguarded`);
      }

      const isFirstCapture = !fs.existsSync(file);

      if (isFirstCapture || UPDATE) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, stableStringify(current));
        const verb = UPDATE ? 'updated' : 'created';
        const stats = `  (${current.meta.capturedElements} elements x ${current.meta.propertyCount} props`
          + `${current.meta.customProperties ? `, ${current.meta.rootVarCount} :root vars`
            + ` + ${current.meta.varDeclarations} element var decls` : ''})`;
        console.log(`  + baseline ${verb}: ${path.basename(file)}${stats}`);

        // A first capture in a NORMAL run fails, deliberately. It used to pass silently, which
        // meant a newly added target's first green proved nothing at all — the run recorded
        // whatever rendered, including a render that was wrong, and from then on defended it.
        // That is the same failure this suite exists to catch and has been bitten by twice:
        // T4's whole premise is that a baseline captured mid-regression encodes the regression
        // as expected, and C7 did exactly that for real (a poisoned widget cache recorded an
        // icon as `quaternary` where `primary` was correct). "Nothing to compare against" is
        // not the same as "nothing changed", so it must not report as a pass.
        //
        // The file is still written, so the capture is there to read and commit once reviewed;
        // the next run passes. An intentional capture goes through UPDATE_BASELINES=1, which
        // is an explicit statement that the current render is the intended one.
        if (isFirstCapture && !UPDATE) {
          throw new Error(
            `No baseline existed for ${label} — one was just captured, but nothing has verified it.\n\n`
            + `  Written to: ${file}\n\n`
            + '  Review it before committing: a baseline is only as trustworthy as the render it\n'
            + '  captured, and this run had nothing to compare against. Check for values that look\n'
            + '  wrong rather than merely present — zero heights, a colour that should not be\n'
            + '  transparent, a region that should not be empty.\n\n'
            + '  Then re-run; it will pass. To capture deliberately instead, use\n'
            + '  UPDATE_BASELINES=1, which states that the current render is the intended one.',
          );
        }

        return;
      }

      const baseline = JSON.parse(fs.readFileSync(file, 'utf8'));
      const d = diffSnapshots(baseline, current);

      if (!d.clean) {
        const report = formatDiff(d);
        // Written beside the baseline so a failing run leaves something reviewable.
        const out = path.join(cfg.baselineDir, '__diffs__', `${target.name}.${vp.name}.txt`);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, `${report}\n`);

        // Attach to the HTML report so a failure is inspectable there rather than
        // only as a terminal wall of text. The structured diff is attached as well
        // as the formatted one, so it can be fed to other tooling.
        await testInfo.attach('computed-style-diff.txt', {
          body: report,
          contentType: 'text/plain',
        });
        await testInfo.attach('computed-style-diff.json', {
          body: JSON.stringify(d, null, 2),
          contentType: 'application/json',
        });
        // A screenshot is not the gate, but it makes a textual diff far easier to
        // interpret when the change turns out to be visible.
        await testInfo.attach('screenshot.png', {
          body: await page.screenshot({ fullPage: false }),
          contentType: 'image/png',
        });
        throw new Error(`${report}\n\n  (also written to ${out})`
          + '\n  If this change is intended, re-run with UPDATE_BASELINES=1 and commit the'
          + '\n  updated baseline alongside the change that caused it.');
      }

      console.log(`  = ${label}: clean (${d.counts.currentElements} elements)`);
    });
  }
}

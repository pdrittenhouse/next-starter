'use strict';

/**
 * T3: fails when render-blocking CSS exceeds a committed budget. The only thing
 * that stops render-blocking size creeping back up after the CSS workstream
 * (X-tier) brings it down — without this, nothing re-measures it.
 *
 * Reuses the same target list and TIMBERLAND_VISUAL_CONFIG resolution as the
 * computed-style gate, rather than a separate config shape — a budget target is
 * just a visual-gate target with an extra `maxBytes` (bytes) field. Targets
 * without `maxBytes` are skipped; this spec adds nothing to a theme that hasn't
 * opted any target in.
 */

const { test, expect } = require('@playwright/test');
const { resolveConfig } = require('./config.js');
const { measureRenderBlockingCss } = require('./css-budget.js');

const cfg = resolveConfig();
const budgeted = cfg.targets.filter((t) => typeof t.maxBytes === 'number');

for (const target of budgeted) {
  test(`CSS budget: ${target.name}`, async ({ page }) => {
    const result = await measureRenderBlockingCss(page, cfg.baseUrl + target.path);

    if (result.totalBytes > target.maxBytes) {
      const lines = result.breakdown.map(
        (b) => `    ${(b.bytes / 1024).toFixed(1).padStart(8)} KB  ${b.href.replace(cfg.baseUrl, '')}`
      );
      console.log(`  ! ${target.name}: ${(result.totalBytes / 1024).toFixed(1)} KB`
        + ` of ${result.blockingCount} render-blocking stylesheet(s):\n${lines.join('\n')}`);
    }

    expect(
      result.totalBytes,
      `${target.name}: ${(result.totalBytes / 1024).toFixed(1)} KB render-blocking CSS`
        + ` exceeds the ${(target.maxBytes / 1024).toFixed(1)} KB budget`
        + ' — see the breakdown above for which bundle grew'
    ).toBeLessThanOrEqual(target.maxBytes);
  });
}

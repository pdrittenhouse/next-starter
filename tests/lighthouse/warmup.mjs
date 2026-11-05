#!/usr/bin/env node
/**
 * Warms the server before `lhci collect`, so the first measured run is not paying for
 * everyone else's cold start (T9).
 *
 * Why this exists
 * ----------------
 * The first post-X8 capture showed `/` trending *monotonically faster* across its five
 * runs -- LCP 7750, 5713, 6093, 6087, 3785 ms -- for a 3,965 ms spread, while `/blog/`
 * and the content post sat at 532 and 756 ms on the same capture. A spread that trends
 * in one direction is warming, not noise, and a median taken across it is a median of
 * "the server getting faster" rather than of the page's performance.
 *
 * That mattered the moment the baseline had to judge something: E17's expected LCP gain
 * is on the order of a second, and nothing of that size is detectable inside a 3,965 ms
 * spread -- on the one target E17 actually affects. Averaging harder does not fix a
 * trend; removing its cause does.
 *
 * Lighthouse itself cannot be the warmer: it uses a fresh profile and a cold browser
 * cache per run by design. So the warming is server-side -- PHP opcache, the WP object
 * cache, and this framework's on-demand combined-CSS files under
 * `uploads/timberland/combined/` -- and a plain HTTP request is enough to trigger all
 * of it.
 *
 * Deliberately not part of `aggregate.mjs`: discarding the first report there would also
 * work, but it throws away a measurement to hide a cause, and leaves the committed
 * `runs_per_target` describing something other than the runs that were used.
 *
 * This script deliberately touches nothing in `.lighthouseci/`. `lhci collect` clears the
 * previous `lhr-*` reports itself, and the one artefact it does not clear -- the cold-run
 * receipt from cold-collect.mjs -- is handled by the mtime test in `aggregate.mjs`, so a warm
 * run straight after a cold one needs no cleanup step here. Keeping that check in one place
 * means it also covers a hand-run `lhci collect`, which no cleanup here ever could.
 *
 * Usage: chained before `lhci collect` by the theme's `npm run test:lighthouse`.
 */

import { readFileSync } from 'fs';
import path from 'path';

// The THEME this harness is being run for. These scripts live in the framework and are
// invoked from a theme's package.json, so the theme root is the working directory rather
// than anything derivable from this file's own location -- which is what `__dirname`
// previously assumed, back when a copy of this file sat in every theme.
// Override with TIMBERLAND_LIGHTHOUSE_ROOT when invoking from elsewhere.
const ROOT = process.env.TIMBERLAND_LIGHTHOUSE_ROOT || process.cwd();

// Read the URLs from the collect config, so this cannot drift from what is measured.
const rc = readFileSync(path.join(ROOT, 'lighthouserc.cjs'), 'utf8');
const urls = [...rc.matchAll(/'(https?:\/\/[^']+)'/g)].map((m) => m[1]);

if (urls.length === 0) {
  console.error('warmup: no URLs found in lighthouserc.cjs — nothing to warm.');
  process.exit(1);
}

// Local by Flywheel serves a self-signed cert; every other probe in this project's
// suite carries the equivalent, for the same reason.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PASSES = Number(process.env.TIMBERLAND_LH_WARMUP_PASSES || 3);

console.log(`warmup: ${PASSES} pass(es) over ${urls.length} URL(s) before collection`);

for (let pass = 1; pass <= PASSES; pass += 1) {
  for (const url of urls) {
    const started = Date.now();
    try {
      const res = await fetch(url, { redirect: 'follow' });
      await res.arrayBuffer();
      const ms = Date.now() - started;
      console.log(`  pass ${pass}  ${res.status}  ${String(ms).padStart(5)} ms  ${url}`);
    } catch (err) {
      // A warmup failure is not a collection failure -- say so and carry on, rather
      // than blocking a measurement because a warming request was refused.
      console.warn(`  pass ${pass}  FAILED (${err.message}) ${url}`);
    }
  }
}

console.log('warmup: done.');

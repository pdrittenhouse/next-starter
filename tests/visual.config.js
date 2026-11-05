/**
 * Visual/CSS gate configuration for this starter (H4).
 *
 * The specs, helpers and `createVisualConfig()` under tests/visual/ are copied from the
 * framework (pdrittenhouse/timberland, tests/visual/). They had to be COPIED rather than
 * referenced: the WordPress themes reach them through `vendor/pdrittenhouse/timberland`, and
 * these starters have no Composer install and no dependency on the framework at all.
 *
 * Only three of the framework's twenty-five specs came across, deliberately:
 *
 *   computed-style.spec.js  computed-style diff per element against a stored baseline
 *   css-budget.spec.js      render-blocking CSS byte budget
 *   self-check.spec.js      proves the gate catches what it claims to, by breaking the CSS
 *
 * The rest assert against server-rendered Twig, a WordPress fixture page, the purge safelist,
 * or the generated icon registry — none of which exist here. `self-check` is included because
 * without it a green suite is not evidence of anything; it is the one the framework's own
 * docs say to port first.
 *
 * BASELINES ARE MACHINE-BOUND for the screenshot spec only, which is not ported. The
 * computed-style baselines here are portable: they record resolved CSS values, not pixels.
 *
 * TARGETS. Only the two routes that exist independently of CMS content, matching
 * lighthouserc.cjs so both gates measure the same surface. Add real content routes to both
 * together, then re-run with `npm run test:visual:update` to seed their baselines.
 */
'use strict';

const path = require('path');
const { createVisualConfig } = require('./visual/config.js');

module.exports = createVisualConfig({
  // The production server, started by playwright.config.js's `webServer`. Dev servers compile
  // on demand and emit different CSS (unminified, differently ordered), so a baseline taken
  // against one does not describe what ships.
  baseUrl: 'http://localhost:3000',


  // CSS BUDGETS. Set at what each route ships TODAY, so the gate fails on growth rather than
  // describing an aspiration. They are ceilings to drive down, not targets to fill: both
  // starters ship far more render-blocking CSS than they need, and the numbers below are the
  // measurement that made that concrete rather than assumed.
  //
  // Measured in DECODED bytes (`response.body().length`), so the figure is independent of
  // whether the server compresses — which matters here, because astro's standalone node server
  // does not and next's does. Compression changes what a browser waits for; it does not change
  // how much CSS the app produces, and this budget tracks the latter.
  //
  // Lower these whenever a change reduces the real figure. A budget that is never tightened
  // stops being a ratchet and becomes a rubber stamp.
  targets: [
    // 3,133.3 KB today across 8 chunks, the largest 1,846.3 KB
    { name: 'site-home', path: '/', maxBytes: 3_210_000 },
    // 1,907.2 KB today: 1,846.3 KB shared chunk + 60.9 KB route chunk
    { name: 'search', path: '/search', maxBytes: 1_960_000 },
  ],

  baselineDir: path.join(__dirname, 'visual/__baselines__'),

  // No self-signed certificate here, unlike the Local-served WordPress install.
  ignoreHTTPSErrors: false,
});

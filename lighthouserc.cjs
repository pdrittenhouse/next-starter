/**
 * Lighthouse CI collection config (H4).
 *
 * `.cjs`, not `.js`: these repos set `"type": "module"` in package.json, so a `.js` file
 * using `module.exports` dies with "module is not defined in ES module scope" and lhci
 * prints its help text instead of an error that names the cause.
 *
 * MEASURES THE PRODUCTION SERVER, not the dev server. `astro dev` / `next dev` compile on
 * demand and report numbers that move with the compiler's cache rather than with the app, so a
 * ratchet built on them would mostly measure Vite/Turbopack. `startServerCommand` below runs the
 * built app, so `npm run test:lighthouse` builds first.
 *
 * TARGETS. Deliberately only the two routes that exist independently of CMS content, so this
 * config works on a fresh clone pointed at any WordPress install. Add the project's real
 * content routes here AND to tests/lighthouse/targets.json (the names map 1:1) — a ratchet over
 * the home page alone will not notice a regression in a post template.
 *
 * NUMBER OF RUNS. Five, not one. Measured on the WordPress side of this project: three runs on
 * identical committed code produced CLS 0.032, 0.428, 0.032. A single run cannot distinguish a
 * regression from the swing a metric always has, which is why aggregate.mjs commits min/median/
 * max rather than a score. Raise it for a decision that matters; nine is what the WP side uses.
 */
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/search',
      ],
      numberOfRuns: 5,
      startServerCommand: 'npx next start',
      startServerReadyPattern: 'Ready|started server',
      startServerReadyTimeout: 120000,
    },
  },
};

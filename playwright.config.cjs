/**
 * Playwright runner config for the visual/CSS gate (H4).
 *
 * `.cjs` for the same reason lighthouserc is: the repo root sets `"type": "module"`, so a
 * `.js` config using `module.exports` would be parsed as an ES module and fail. The specs
 * themselves stay `.js` and are scoped to CommonJS by tests/package.json.
 *
 * Mirrors the framework's tests/visual/playwright.config.js, with one difference that matters:
 * `webServer` builds and serves the PRODUCTION app. The framework's version points at an
 * already-running WordPress site, which has no equivalent here — and measuring the dev server
 * would bake Vite/Turbopack's on-demand output into the baseline instead of what ships.
 *
 * `reuseExistingServer` is on locally so repeated runs do not pay the build each time; CI gets
 * a clean build because the port is free there.
 */
'use strict';

const { defineConfig } = require('@playwright/test');
const visual = require('./tests/visual.config.js');

module.exports = defineConfig({
  testDir: './tests/visual',
  // One worker: the specs share a baseline directory and the self-check mutates responses.
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: visual.baseUrl,
    ignoreHTTPSErrors: visual.ignoreHTTPSErrors,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npm run build && npx next start',
    url: visual.baseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
  },
});

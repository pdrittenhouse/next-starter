'use strict';

const path = require('path');
const { ALL } = require('./properties.js');
const { DEFAULT_IGNORE } = require('./capture.js');

/**
 * Factory for the computed-style gate's configuration.
 *
 * Keeps the split the retired `tests/vrt/backstop-settings.js` used: the framework owns the mechanism and
 * the defaults, and a consuming theme passes its own targets. Baselines belong to
 * the theme, not here — they are snapshots of site-specific content and would be
 * meaningless in the framework.
 *
 *   const { createVisualConfig } = require(
 *     './vendor/pdrittenhouse/timberland/tests/visual/config.js'
 *   );
 *   module.exports = createVisualConfig({
 *     baseUrl: 'https://example.local',
 *     targets: [{ name: 'home', path: '/' }],
 *   });
 *
 * Point the runner at a theme's config with TIMBERLAND_VISUAL_CONFIG=/abs/path.
 */

/**
 * Three viewports, not all six Bootstrap breakpoints.
 *
 * Six would mean 8 URLs x 6 = 48 snapshots per run for little extra signal: sm/md
 * and xl/xxl rarely differ in which rules match, only in computed widths that the
 * adjacent breakpoint already covers. These three straddle every `@media` boundary
 * the framework actually branches on. Add breakpoints per-target when a component
 * genuinely changes behaviour at one.
 */
const DEFAULT_VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
];

/** Viewports for a target: its own override, else the global set. */
function viewportsFor(cfg, target) {
  const names = target.viewports;
  if (!names) return cfg.viewports;
  const byName = new Map(cfg.viewports.map((v) => [v.name, v]));
  return names.map((n) => {
    if (typeof n === 'object') return n;
    const v = byName.get(n);
    if (!v) throw new Error(`[visual] target ${target.name}: unknown viewport "${n}"`);
    return v;
  });
}

function createVisualConfig(overrides = {}) {
  const cfg = {
    baseUrl: 'https://natural-rose.local',
    targets: [],
    viewports: DEFAULT_VIEWPORTS,
    properties: ALL,
    baselineDir: null,
    maxElements: 1500,
    settleMs: 250,
    triggerLazy: true,
    ignore: DEFAULT_IGNORE,
    ignoreHTTPSErrors: true,
    // T12: capture CSS custom property values as well as the 73 standard properties.
    // Costs ~0.9s per snapshot (the per-element inheritance comparison; the :root set
    // is ~3ms). Set false to opt out, accepting that custom-property regressions —
    // including a child theme silently losing its palette to the parent's — become
    // invisible to the gate. See T12 in PERFORMANCE-REMEDIATION.html.
    captureCustomProperties: true,
    // F4: derived coverage assertions. Opt in from the theme; see coverage.spec.js.
    componentCoverage: null,
    iconCoverage: null,
    // Declares that this site is configured to serve purged WordPress core CSS, which only the
    // person who enabled the ACF option can state. core-css.spec.js holds the site to it: the
    // served bytes must match the build's purged artefacts rather than core's originals. Left
    // false, that spec skips, because a site without the feature is correctly serving originals.
    coreCssPurge: false,
    // Absolute path to the manifest written by `subset-icon-fonts.mjs`. Set it and
    // icon-glyphs.spec.js asserts that every Private Use Area codepoint the compiled CSS
    // references still renders in a subset font -- the one failure a computed-style baseline
    // cannot see, because a missing glyph is blank space rather than a layout change.
    iconGlyphManifest: null,
    // Set to { frameworkDir, themeDir } to assert the generated icon registry is current
    // with the committed scan. Null skips the check, which is right for a theme that does
    // not generate a registry of its own and uses the framework's.
    iconRegistry: null,
    // E62: structural WordPress settings that site-structure.spec.js asserts. Null takes the
    // defaults, which suit a conventional site; the keys exist for the two variations that are
    // legitimate rather than broken, and which only the site's owner can distinguish from damage:
    //   expectPostsPage               false when the site deliberately has no posts page, so
    //                                 `show_on_front = page` with `page_for_posts = 0` is correct
    //                                 rather than the loss that prompted this check.
    //   allowUnassignedMenuLocations  location slugs that are registered but intentionally left
    //                                 without a menu. Prefer not registering the location at all --
    //                                 `timberland/site/menus` filters the list -- and use this only
    //                                 when something outside the theme registers it.
    // T6: axe-core rule IDs this site has accepted as existing debt. `accessibility.spec.js`
    // reports every violation but fails only on IDs absent from this list, so the spec is a
    // ratchet against NEW problems rather than an audit demanding the backlog be cleared
    // first -- a spec that is permanently red is a spec nobody reads. Record WHY each entry
    // is here; the list is accepted debt, not a mute button. Left empty, any violation on an
    // opted-in target fails, which is the right default for a theme starting clean.
    knownA11yViolations: [],
    siteStructure: null,
    ...overrides,
  };

  if (!Array.isArray(cfg.targets) || cfg.targets.length === 0) {
    throw new Error('[visual] createVisualConfig: at least one target is required');
  }
  for (const t of cfg.targets) {
    if (!t || typeof t.name !== 'string' || typeof t.path !== 'string') {
      throw new Error(`[visual] each target needs {name, path}; got ${JSON.stringify(t)}`);
    }
    // A target may narrow the viewport set. Block fixtures only need one: block CSS
    // rarely branches on breakpoint in ways the page-template targets do not already
    // cover, and 48 block pages x 3 viewports is 144 snapshots for little extra signal.
    if (t.viewports !== undefined && (!Array.isArray(t.viewports) || t.viewports.length === 0)) {
      throw new Error(`[visual] target ${t.name}: viewports must be a non-empty array if given`);
    }
    // T6: opt this target into accessibility.spec.js. A strict boolean because a truthy-but-
    // wrong value (a string, say) would silently opt a target in or out.
    if (t.states !== undefined && typeof t.states !== 'boolean') {
      throw new Error(`[visual] target ${t.name}: states must be a boolean if given`);
    }
    if (t.stateViewports !== undefined && !Array.isArray(t.stateViewports)) {
      throw new Error(`[visual] target ${t.name}: stateViewports must be an array if given`);
    }
    if (t.stateViewports !== undefined && t.states !== true) {
      throw new Error(`[visual] target ${t.name}: stateViewports is set but states is not true`);
    }
    if (t.maxStates !== undefined && !Number.isInteger(t.maxStates)) {
      throw new Error(`[visual] target ${t.name}: maxStates must be an integer if given`);
    }
    if (t.maxStates !== undefined && t.states !== true) {
      throw new Error(`[visual] target ${t.name}: maxStates is set but states is not true`);
    }
    if (t.png !== undefined && typeof t.png !== 'boolean') {
      throw new Error(`[visual] target ${t.name}: png must be a boolean if given`);
    }
    if (t.pngViewports !== undefined && !Array.isArray(t.pngViewports)) {
      throw new Error(`[visual] target ${t.name}: pngViewports must be an array if given`);
    }
    if (t.pngViewports !== undefined && t.png !== true) {
      // Otherwise the narrowing silently does nothing, which reads as "PNGs are limited to
      // desktop" when in fact none are being taken at all.
      throw new Error(`[visual] target ${t.name}: pngViewports is set but png is not true`);
    }
    if (t.a11y !== undefined && typeof t.a11y !== 'boolean') {
      throw new Error(`[visual] target ${t.name}: a11y must be a boolean if given`);
    }
    // Expected HTTP status, declared per target rather than inferred from its name.
    // A target whose URL stops resolving is a broken test, not a style regression, so
    // this is asserted before any diffing.
    if (t.expectStatus !== undefined && !Number.isInteger(t.expectStatus)) {
      throw new Error(`[visual] target ${t.name}: expectStatus must be an integer if given`);
    }
    // An interaction to perform before capture, for styles reachable only in a state JS puts
    // the page into -- an opened navigation overlay, say. Validated as a function here rather
    // than tolerated as a truthy value, because a misspelled or non-callable entry would
    // otherwise be skipped in silence and the state it was meant to reach would go unguarded,
    // which is the failure the option exists to prevent.
    if (t.interact !== undefined && typeof t.interact !== 'function') {
      throw new Error(`[visual] target ${t.name}: interact must be a function if given`);
    }
  }
  const names = cfg.targets.map((t) => t.name);
  const dupe = names.find((n, i) => names.indexOf(n) !== i);
  if (dupe) throw new Error(`[visual] duplicate target name: ${dupe}`);

  if (cfg.siteStructure !== null) {
    if (typeof cfg.siteStructure !== 'object' || Array.isArray(cfg.siteStructure)) {
      throw new Error('[visual] siteStructure must be an object or null');
    }
    const allowed = cfg.siteStructure.allowUnassignedMenuLocations;
    if (allowed !== undefined && !Array.isArray(allowed)) {
      throw new Error('[visual] siteStructure.allowUnassignedMenuLocations must be an array if given');
    }
  }

  if (!cfg.baselineDir) {
    throw new Error('[visual] baselineDir is required — baselines belong to the consuming theme');
  }
  cfg.baselineDir = path.resolve(cfg.baselineDir);
  cfg.baseUrl = cfg.baseUrl.replace(/\/$/, '');

  return cfg;
}

/** Resolve the active config: TIMBERLAND_VISUAL_CONFIG, else the framework's own. */
function resolveConfig() {
  const p = process.env.TIMBERLAND_VISUAL_CONFIG
    ? path.resolve(process.env.TIMBERLAND_VISUAL_CONFIG)
    : path.join(__dirname, 'visual.config.js');
  // eslint-disable-next-line global-require, import/no-dynamic-require
  return require(p);
}

module.exports = { createVisualConfig, resolveConfig, viewportsFor, DEFAULT_VIEWPORTS };

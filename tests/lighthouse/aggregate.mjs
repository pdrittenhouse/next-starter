#!/usr/bin/env node
/**
 * Turns the raw Lighthouse reports `lhci collect` writes to `.lighthouseci/` into a
 * committed per-metric baseline (T9).
 *
 * Why this exists rather than just running `lhci collect` and stopping: a raw report
 * per run is what Lighthouse produces, but what the next performance workstream
 * needs to diff against is a *stable* number per metric per target -- and a single
 * run cannot supply that on this site. Three runs on identical, committed code
 * produced CLS of 0.032, 0.428, 0.032 (see PERFORMANCE-REMEDIATION.html, E12); TTFB
 * has been observed swinging 1.38s warm to ~5s cold locally. Reporting only the
 * median absorbs an outlier; reporting the spread (min/max) alongside it is what
 * lets a later comparison tell "this got worse" apart from "this is within the
 * swing this metric always has" -- which a bare score cannot.
 *
 * Deliberately does not use `lhci`'s own `assert`/`upload` phases. There is nothing
 * to assert a budget against yet (this run creates the baseline those budgets would
 * compare to), and no LHCI server exists to upload to -- nor is one needed, since
 * this script reads the same local .lighthouseci/ output `assert`/`upload` would
 * have read, and writes the result as plain committed JSON instead.
 *
 * `.lighthouseci/` itself is gitignored (ephemeral, per-run); this script's output
 * (tests/lighthouse/baseline.json) is the committed artifact, mirroring how
 * tests/baseline/baseline.json (the `wp timberland benchmark` output, a different
 * metric set -- server-side TTFB/query-count, not Lighthouse's client-side
 * TBT/LCP/CLS/FCP/SI) is committed and `.lighthouseci/`'s raw per-run JSON is not.
 *
 * `--compare` is the other half of that, and the reason the spread is committed at all.
 * It aggregates the current run exactly the same way, prints it against the committed
 * baseline, and *writes nothing* -- so measuring what a change bought cannot destroy the
 * "before" it is being measured against. That is not a hypothetical footgun: the default
 * mode overwrites baseline.json in place, and the baseline is a committed artifact from a
 * state of the code that no longer exists on disk.
 *
 * **How it decides something actually moved.** Not by comparing medians -- at N=5 on this
 * site a median can move 20% on identical code (CLS 0.032/0.428/0.032 on three runs of the
 * same commit, E12). It bootstraps the *difference of medians* from the two samples (10,000
 * resamples, seeded so the verdict is reproducible) and reports a move only when the 95%
 * confidence interval excludes zero.
 *
 * An earlier version of this used non-overlapping [min, max] ranges instead, and that rule
 * had to be replaced before it was used to judge anything. It cannot detect a change smaller
 * than the observed spread -- E17's expected LCP gain is ~1 s against a 3,965 ms spread on
 * `/`, the one target E17 affects -- and worse, min and max can only *widen* with more runs,
 * so raising N made the rule stricter rather than more sensitive. A rule whose power goes
 * down as you collect more data is the wrong rule. The min-max spread is still printed,
 * because it is the right thing to *show*; it is just not the right thing to test with.
 *
 * **The median test has its own blind spot, found the hard way.** E12's fix eliminated a
 * rare catastrophic layout shift -- CLS 0.9959 on 1 run in 9, 0.0323 on the other 8 -- and
 * `--compare` reported it as "indistinguishable" on every metric, because the median
 * (0.0323) never moved: it was never the outlier that was the problem. A test that can
 * ship a fix which removes a 0.97 CLS spike and calls it "no change" is missing exactly
 * the kind of regression (and improvement) this tool exists to catch.
 *
 * The first fix attempted here was the obvious one -- bootstrap the same 95% CI, applied
 * to the worst observed value (sample max, or min for `performance_score`) instead of the
 * median. **It failed on E12's own numbers**, caught by testing it against them before
 * trusting it, the same discipline this file's own history already demanded once. The
 * "after" sample has no spike at all, so every bootstrap resample of its max returns the
 * exact same value -- zero variance. The "before" sample's resampled max is the spike only
 * when a resample happens to draw that one point: P(drawn at least once in 9 picks) =
 * 1 - (8/9)^9 ≈ 65%. So roughly a third of the 10,000 (before, after) resample pairs land
 * on an exact tie -- diff exactly 0 -- which is enough mass at the boundary to push the
 * CI's upper bound to precisely 0.0 rather than past it, and `hi < 0` fails by exactly the
 * margin that makes the test meaningless. A continuous-distribution CI is the wrong tool
 * for a statistic with a point mass this large; the obvious fix was not the right one.
 *
 * What replaced it is not a significance test at all, deliberately: a plain count. For
 * each metric, take the baseline's own worst observed value as a threshold and count how
 * many runs in each sample are at least that bad. E12: baseline threshold is its own
 * max, 0.9959 -- by construction 1 of baseline's own 9 runs meets it (itself); 0 of the
 * fixed build's 9 runs do. "1 of 9 -> 0 of 9 runs at or beyond the baseline's own worst
 * case" is the plain fact a bootstrap CI could not state cleanly, needs no distributional
 * assumption, and is honest about being descriptive rather than inferential -- the same
 * footing this file already gives the printed min/max, just turned into a comparison
 * instead of two numbers side by side.
 *
 * Usage: npm run test:lighthouse            # collect -> write baseline.json
 *        npm run test:lighthouse:compare    # collect -> diff, write nothing
 * (run after `lhci collect --config=./lighthouserc.js`; `npm run test:lighthouse`
 * does both in one command, `npm run test:lighthouse:compare` the compare form)
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'fs';
import path from 'path';

// The THEME this harness is being run for. These scripts live in the framework and are
// invoked from a theme's package.json, so the theme root is the working directory rather
// than anything derivable from this file's own location -- which is what `__dirname`
// previously assumed, back when a copy of this file sat in every theme.
// Override with TIMBERLAND_LIGHTHOUSE_ROOT when invoking from elsewhere.
const ROOT = process.env.TIMBERLAND_LIGHTHOUSE_ROOT || process.cwd();
const LHCI_DIR = path.join(ROOT, '.lighthouseci');

// Throttling profile, and why there are two baselines rather than one.
//
// Lighthouse's simulated (Lantern) throttling and real applied throttling disagree
// substantially on this site. Measured on identical code in the same minute: simulated
// scored 0.77-0.87 with FCP ~1,515 ms, while real scored a steady 0.67 with FCP
// ~3,968 ms. Neither is wrong -- simulated models the network analytically, real applies
// it and waits -- but a number from one is not comparable to a number from the other,
// and this project has already drawn conclusions from simulated runs that real runs
// contradict.
//
// So the two are kept as separate committed artifacts. The unsuffixed baseline.json
// remains the simulated one, so every figure recorded against it historically keeps its
// meaning; `--profile=real` reads and writes its own file instead. Real throttling is
// what Chrome DevTools and PageSpeed report, which is what anyone eyeballing the site
// will quote back.
// The headless flag is part of a profile's identity, not an implementation detail.
// Measured on this site: the same page, same Chrome binary, same simulated throttling
// scores a median 0.83 headless and 0.66 in a real browser window -- a ~17 point gap,
// mostly because headless reports TBT as 0 ms where a window reports 107-263 ms. A
// headless figure and a DevTools figure are therefore not the same measurement, and
// conflating them has already produced one phantom regression investigation.
const PROFILES = {
  simulated: {
    file: 'baseline.json',
    throttlingMethod: 'simulate',
    headless: true,
    label: 'mobile form factor, simulated throttling, HEADLESS (lhci/Lighthouse CLI defaults) -- change-detector only, not comparable to DevTools',
  },
  real: {
    file: 'baseline-real.json',
    throttlingMethod: 'devtools',
    headless: true,
    label: 'mobile form factor, real applied throttling (throttlingMethod: devtools), HEADLESS -- change-detector only, not comparable to DevTools',
  },
  window: {
    file: 'baseline-window.json',
    throttlingMethod: 'simulate',
    headless: false,
    label: 'mobile form factor, simulated throttling, REAL (non-headless) Chrome window -- the profile that matches what Chrome DevTools reports by default',
  },
  // Same throttling and headless as `simulated`; the difference is SERVER state, not the
  // browser. Every other profile here is distinguished by something the report records, so
  // aggregate can refuse a mismatched capture. Server warmth is not in the report, so this
  // one is gated on the receipt cold-collect.mjs writes instead -- see requiresColdReceipt.
  //
  // Why it is worth a separate baseline rather than a note: the warm/cold gap on
  // updater-starter measured 0.93 vs 0.79 with FCP +336 to +894 ms (CI excluding zero), and a
  // warm 0.93 quoted against a DevTools 72 already triggered one false regression hunt.
  cold: {
    file: 'baseline-cold.json',
    throttlingMethod: 'simulate',
    headless: true,
    requiresColdReceipt: true,
    label: 'mobile form factor, simulated throttling, HEADLESS, COLD SERVER (on-demand combined CSS/JS cleared, no warmup) -- what the first visitor after a deploy gets',
  },
};

const PROFILE_ARG = process.argv.find((a) => a.startsWith('--profile='));
const PROFILE = PROFILE_ARG ? PROFILE_ARG.slice('--profile='.length) : 'simulated';

// A cold capture cannot be told from a warm one by reading the reports, so the receipt
// cold-collect.mjs leaves behind is the only evidence. Without this check, running
// `lhci collect` by hand (warm) and aggregating with --profile=cold would silently write a
// warm baseline into baseline-cold.json and every later comparison would be against a lie.
const COLD_RECEIPT = path.join(process.cwd(), '.lighthouseci', 'cold-run.json');

// The receipt is evidence only about the reports sitting NEXT to it, so its mere presence is
// not enough -- it has to still describe them.
//
// cold-collect.mjs writes it AFTER `lhci collect` returns, so in a genuine cold capture the
// receipt is newer than every report. A later warm run does not remove it: `lhci collect`
// clears only `lhr-*.json` / `lhr-*.html` (@lhci/utils/src/saved-reports.js
// clearSavedReportsAndLHRs, which collect.js calls unless --additive), and nothing in
// warmup.mjs touches the directory. So without a freshness test the receipt outlives the
// reports it vouched for, and every warm aggregation after a cold one refuses until someone
// works out that `rm -rf .lighthouseci` is the fix.
//
// Comparing mtimes closes that: a receipt older than the newest report is describing reports
// that no longer exist. Note this also means stale cold reports can never be mixed into a
// warm aggregation -- lhci deletes them itself -- so the receipt is the only stale artefact
// there is to reason about.
//
// Deliberately here rather than as a cleanup step in warmup.mjs: the check then holds for
// ANY entry point, a hand-run `lhci collect` included, and there is one place to port rather
// than one per collector.
function coldReceiptIsCurrent() {
  if (!existsSync(COLD_RECEIPT)) return false;
  const dir = path.dirname(COLD_RECEIPT);
  const receiptAt = statSync(COLD_RECEIPT).mtimeMs;
  let newestReport = 0;
  for (const f of readdirSync(dir)) {
    if (!/^lhr-.*\.json$/.test(f)) continue;
    newestReport = Math.max(newestReport, statSync(path.join(dir, f)).mtimeMs);
  }
  // No reports at all -- nothing for the receipt to describe, and the "no reports" error
  // below is the more useful one to hit.
  if (newestReport === 0) return false;
  return receiptAt >= newestReport;
}

const HAS_COLD_RECEIPT = coldReceiptIsCurrent();
const HAS_STALE_COLD_RECEIPT = !HAS_COLD_RECEIPT && existsSync(COLD_RECEIPT);

if (PROFILES[PROFILE]?.requiresColdReceipt && !HAS_COLD_RECEIPT) {
  console.error(
    HAS_STALE_COLD_RECEIPT
      ? `aggregate --profile=${PROFILE}: the .lighthouseci/cold-run.json receipt is STALE --\n`
        + '  it predates the reports in that directory, so those were collected by a later\n'
        + '  warm or hand-run collect, not by cold-collect.mjs.\n'
        + '  Use: npm run test:lighthouse:cold'
      : `aggregate --profile=${PROFILE}: no .lighthouseci/cold-run.json receipt found.\n`
        + '  These reports were not collected against a cold server, or were collected by hand.\n'
        + '  Use: npm run test:lighthouse:cold'
  );
  process.exit(1);
}

// And the inverse, which matters just as much. A cold capture aggregated as `simulated`
// silently overwrites the WARM baseline with cold numbers -- caught doing exactly that while
// testing the guard above, which then reads as a 14-point regression on the next comparison.
// The receipt is evidence in both directions, so refuse it here too.
if (!PROFILES[PROFILE]?.requiresColdReceipt && HAS_COLD_RECEIPT) {
  console.error(
    `aggregate --profile=${PROFILE}: a cold-run receipt is present in .lighthouseci/, so these\n`
    + '  reports were collected against a COLD server and are not comparable to this profile.\n'
    + `  Either aggregate them with --profile=cold, or just re-collect warm -- the receipt\n`
    + '  goes stale on its own once newer reports land next to it:\n'
    + '    npm run test:lighthouse'
  );
  process.exit(1);
}
if (!Object.hasOwn(PROFILES, PROFILE)) {
  console.error(`aggregate: unknown --profile=${PROFILE}. Known profiles: ${Object.keys(PROFILES).join(', ')}`);
  process.exit(1);
}
// Baselines are per-site data and stay committed in the THEME, even though this script
// now lives in the framework.
const OUT = path.join(ROOT, 'tests/lighthouse', PROFILES[PROFILE].file);

// Maps the config's target names to the exact URLs lighthouserc.js collects, so the
// baseline is readable by name (matching tests/visual.config.js's target naming)
// rather than only by raw URL.
// Supplied by the theme at `tests/lighthouse/targets.json` as a `{ url: name }` map, so
// the baseline reads by name -- matching tests/visual.config.js's target naming -- rather
// than by raw URL. Optional: without it, names are derived from the URL path, which is
// serviceable but will not match the visual config's names for fixture routes.
function loadTargetNames() {
  const file = path.join(ROOT, 'tests/lighthouse/targets.json');
  if (existsSync(file)) {
    try {
      return JSON.parse(readFileSync(file, 'utf8'));
    } catch (err) {
      console.warn(`aggregate: ${file} is unreadable, falling back to derived names (${err.message})`);
    }
  }
  return null;
}
const TARGET_NAMES = loadTargetNames();

/** Derive a readable name from a URL when the theme supplies no map. */
function deriveName(url) {
  try {
    const p = new URL(url).pathname.replace(/^\/+|\/+$/g, '');
    return p === '' ? 'site-home' : p.replace(/\//g, '-');
  } catch {
    return url;
  }
}

// `higherIsBetter` exists only so --compare can label a move "better"/"worse" rather than
// leaving the reader to remember which way each metric points. performance_score is the one
// that goes up; every timing and CLS goes down.
const METRICS = [
  ['performance_score', (lhr) => lhr.categories.performance.score, null, true],
  ['tbt_ms', (lhr) => lhr.audits['total-blocking-time'].numericValue, 1, false],
  ['lcp_ms', (lhr) => lhr.audits['largest-contentful-paint'].numericValue, 1, false],
  ['cls', (lhr) => lhr.audits['cumulative-layout-shift'].numericValue, 4, false],
  ['fcp_ms', (lhr) => lhr.audits['first-contentful-paint'].numericValue, 1, false],
  ['si_ms', (lhr) => lhr.audits['speed-index'].numericValue, 1, false],
];

const COMPARE = process.argv.includes('--compare');

function round(n, digits) {
  if (digits === null) return n;
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

function median(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

if (!existsSync(LHCI_DIR)) {
  console.error(`aggregate: ${path.relative(ROOT, LHCI_DIR)} does not exist -- run`);
  console.error('  lhci collect --config=./lighthouserc.js');
  console.error('first (or use `npm run test:lighthouse`, which does both).');
  process.exit(1);
}

// `lhr-` prefixed, not merely `.json`: lhci writes its reports as lhr-<timestamp>.json, but
// other things legitimately live in this directory too (cold-collect.mjs's receipt, and
// lhci's own assertion-results.json / links.json when those phases run). The old filter
// took every .json and then failed validation on the first non-report it met, reporting it
// as a report collected with throttlingMethod "undefined" -- confusing, and it blocked a
// capture that was perfectly valid.
const reportFiles = readdirSync(LHCI_DIR).filter((f) => f.startsWith('lhr-') && f.endsWith('.json'));
if (reportFiles.length === 0) {
  console.error(`aggregate: no .json reports in ${path.relative(ROOT, LHCI_DIR)}`);
  process.exit(1);
}

// Group raw reports by requestedUrl.
const byUrl = new Map();
for (const file of reportFiles) {
  const lhr = JSON.parse(readFileSync(path.join(LHCI_DIR, file), 'utf8'));

  // Refuse to aggregate reports that were not collected the way this profile claims.
  // The failure this prevents is silent and expensive: the collected reports and the
  // baseline they are written to or diffed against would describe different throttling,
  // and the resulting "regression" or "improvement" would be an artifact of the config
  // rather than the code.
  const actual = lhr.configSettings?.throttlingMethod;
  const expected = PROFILES[PROFILE].throttlingMethod;
  if (actual !== expected) {
    console.error(`aggregate --profile=${PROFILE}: expected throttlingMethod "${expected}", but ${file} was collected with "${actual}".`);
    console.error(`  Collect with the matching config first (lighthouserc.js for simulated, lighthouserc.real.js for real, collect-window.mjs for window).`);
    process.exit(1);
  }

  // Headless-ness is checked the only way the report actually records it: the browser's
  // own user agent. Chrome reports itself as "HeadlessChrome/..." when headless.
  const wasHeadless = (lhr.environment?.hostUserAgent || '').includes('HeadlessChrome');
  if (wasHeadless !== PROFILES[PROFILE].headless) {
    console.error(`aggregate --profile=${PROFILE}: expected headless=${PROFILES[PROFILE].headless}, but ${file} was collected with headless=${wasHeadless}.`);
    console.error(`  A headless score and a real-window score differ by ~17 points on this site, so these cannot be mixed or diffed against each other.`);
    process.exit(1);
  }

  const url = lhr.requestedUrl;
  if (!byUrl.has(url)) byUrl.set(url, []);
  byUrl.get(url).push(lhr);
}

const results = {};
let totalRuns = 0;

for (const [url, lhrs] of byUrl) {
  const name = TARGET_NAMES?.[url] ?? deriveName(url);
  totalRuns = Math.max(totalRuns, lhrs.length);

  const metrics = {};
  for (const [key, extract, digits] of METRICS) {
    const values = lhrs.map(extract);
    metrics[key] = {
      median: round(median(values), digits),
      min: round(Math.min(...values), digits),
      max: round(Math.max(...values), digits),
      samples: values.map((v) => round(v, digits)),
    };
  }

  results[name] = { url, runs: lhrs.length, metrics };
}

const baseline = {
  generated_at: new Date().toISOString(),
  lighthouse_defaults: PROFILES[PROFILE].label,
  runs_per_target: totalRuns,
  results,
};

if (!COMPARE) {
  writeFileSync(OUT, JSON.stringify(baseline, null, 2) + '\n', 'utf8');

  console.log(`lighthouse baseline written: ${path.relative(ROOT, OUT)}`);
  for (const [name, r] of Object.entries(results)) {
    const p = r.metrics.performance_score;
    const cls = r.metrics.cls;
    console.log(
      `  ${name.padEnd(16)} perf ${p.median} (${p.min}-${p.max})   CLS ${cls.median} (${cls.min}-${cls.max})`
    );
  }
  process.exit(0);
}

// --compare: report against the committed baseline, write nothing.
if (!existsSync(OUT)) {
  console.error(`aggregate --compare: no committed baseline at ${path.relative(ROOT, OUT)}.`);
  console.error('  Run without --compare first to create one.');
  process.exit(1);
}

const prev = JSON.parse(readFileSync(OUT, 'utf8'));

/**
 * Seeded PRNG, so two runs of --compare on the same data give the same verdict. An
 * unseeded bootstrap would make a borderline result flicker between "moved" and "not"
 * across invocations, which is precisely the kind of instability this tool exists to
 * remove rather than add.
 */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BOOTSTRAP_RESAMPLES = 10000;

/** The worst observed value -- the sample max, or the sample min when higher is better. */
function tailStat(samples, higherIsBetter) {
  return higherIsBetter ? Math.min(...samples) : Math.max(...samples);
}

/**
 * How many runs in `samples` are at least as bad as `threshold` -- "bad" meaning <=
 * threshold when higher is better, >= threshold otherwise. Used with a baseline's own
 * worst observed value as the threshold, so the count for the baseline side is always
 * >= 1 (its own extreme) and the count for the other side answers "how many of these
 * would have counted as baseline-normal's worst case."
 */
function countAtLeastAsBad(samples, threshold, higherIsBetter) {
  return samples.filter((v) => (higherIsBetter ? v <= threshold : v >= threshold)).length;
}

/**
 * Bootstrap the difference of a statistic (median, by default) between two samples and
 * test whether 0 is outside the 95% CI. `statFn` is what makes this reusable for the tail
 * check below -- same resampling, same CI rule, a different summary of each resample.
 *
 * Assumption-light on purpose: these samples are small, not normal, and sometimes
 * bimodal (`/`'s CLS was literally {0, 0.0323, 0.4287}). A rank/resampling method says
 * what it can from that without pretending the distribution is something it is not.
 */
function bootstrapVerdict(before, after, higherIsBetter, statFn = median) {
  if (!before || !Array.isArray(before.samples) || before.samples.length === 0) {
    return { label: 'new', moved: false, delta: null, ci: null };
  }
  const a = before.samples;
  const b = after.samples;
  const delta = statFn(b) - statFn(a);

  const rand = rng(0x5eed);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const diffs = new Array(BOOTSTRAP_RESAMPLES);
  for (let i = 0; i < BOOTSTRAP_RESAMPLES; i += 1) {
    const ra = Array.from({ length: a.length }, () => pick(a));
    const rb = Array.from({ length: b.length }, () => pick(b));
    diffs[i] = statFn(rb) - statFn(ra);
  }
  diffs.sort((x, y) => x - y);
  const lo = diffs[Math.floor(0.025 * BOOTSTRAP_RESAMPLES)];
  const hi = diffs[Math.floor(0.975 * BOOTSTRAP_RESAMPLES)];
  const moved = lo > 0 || hi < 0;

  let label = 'indistinguishable';
  if (moved) {
    const improved = higherIsBetter ? delta > 0 : delta < 0;
    label = improved ? 'BETTER' : 'WORSE';
  }
  return { label, moved, delta, ci: [lo, hi] };
}

console.log(`\nLighthouse: current run vs committed baseline (${prev.generated_at})`);
console.log(`  baseline runs/target: ${prev.runs_per_target}   this run: ${totalRuns}`);
console.log('  verdict = bootstrapped 95% CI on the median difference; "indistinguishable"');
console.log('  means that CI includes zero. (min-max) is shown for context, not tested.');
console.log('  "severe runs" = count of runs at least as bad as the BASELINE\'s own worst');
console.log('  value -- a plain count, not a significance test, printed only when it changes.');
console.log('  Exists because E12 removed a 0.97 CLS spike and the median test above called');
console.log('  it "indistinguishable" -- the median was never the problem, the one outlier');
console.log('  run was. See the docblock for why a CI on the tail doesn\'t work either.\n');

let moved = 0;
let severeChanged = 0;
for (const [name, r] of Object.entries(results)) {
  const was = prev.results?.[name]?.metrics;
  console.log(`  ${name}`);
  console.log(
    `    ${'metric'.padEnd(18)}${'baseline'.padEnd(24)}${'now'.padEnd(24)}${'change (95% CI)'.padEnd(30)}verdict`,
  );
  for (const [key, , digits, higherIsBetter] of METRICS) {
    const b = was?.[key];
    const a = r.metrics[key];
    const v = bootstrapVerdict(b, a, higherIsBetter, median);
    if (v.moved) moved += 1;
    const d = digits === null ? 3 : Math.max(1, digits);
    // Round for display: a baseline written by this script is already rounded, but one
    // hand-edited or produced by an older version is not, and an unrounded float blows
    // the column alignment out in a table whose whole job is to be read.
    const fmt = (m) => (m ? `${round(m.median, d)} (${round(m.min, d)}-${round(m.max, d)})` : '—');
    const change = v.ci
      ? `${v.delta >= 0 ? '+' : ''}${v.delta.toFixed(d)} [${v.ci[0].toFixed(d)}, ${v.ci[1].toFixed(d)}]`
      : '—';
    console.log(
      `    ${key.padEnd(18)}${fmt(b).padEnd(24)}${fmt(a).padEnd(24)}${change.padEnd(30)}${v.label}`,
    );
    if (!b) continue;
    const threshold = tailStat(b.samples, higherIsBetter);
    const severeBefore = countAtLeastAsBad(b.samples, threshold, higherIsBetter);
    const severeAfter = countAtLeastAsBad(a.samples, threshold, higherIsBetter);
    // Only worth a line when the count actually differs -- most metrics never have a
    // run that bad on either side, and printing it every time would bury the one row
    // that matters under five that don't.
    if (severeAfter !== severeBefore) {
      severeChanged += 1;
      const dir = severeAfter < severeBefore ? 'FEWER' : 'MORE';
      console.log(
        `    ${'  severe runs'.padEnd(18)}${`${severeBefore}/${b.samples.length}`.padEnd(24)}${`${severeAfter}/${a.samples.length}`.padEnd(24)}${`(>= ${threshold})`.padEnd(30)}${dir} SEVERE RUNS`,
      );
    }
  }
  console.log('');
}

console.log(
  moved
    ? `  ${moved} metric(s) moved: the 95% CI on the median difference excludes zero.`
    : '  No metric moved: every CI on the median difference includes zero.',
);
console.log(
  severeChanged
    ? `  ${severeChanged} metric(s) changed how many runs were as bad as the baseline's own worst case.`
    : '  No metric changed how many runs were as bad as the baseline\'s own worst case.',
);
console.log(`  Nothing written — ${path.relative(ROOT, OUT)} still holds the baseline.`);
console.log('  To adopt this run as the new baseline, re-run without --compare.\n');

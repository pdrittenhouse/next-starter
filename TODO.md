# TODO

> **Status (updated 2026-11-05):** sections **1a**, **1b** and **2** are now DONE — see the
> notes inline. Everything else is still unstarted. Captured 2026-10-18 from a review of the
> WordPress-side performance remediation (`perf/remediation` across `timberland`,
> `timberland-starter`, `natural-rose`, `timberland-extended`), to record what still
> needs porting and why it was not done at the time.
>
> For block/component coverage specifically, see **COMPONENT-TESTING-PLAN.md** —
> this document does not restate it. Note that the plan's "Current state" table was
> written 2026-09-06 and is now out of date on one point: the framework no longer has
> only a jest stub and a dormant Backstop config, it has a working Playwright suite of
> ~164 tests under `tests/visual/`.

---

## 1. Deferred ports from the WP performance work

Four fixes from that work **were** applied to this repo on 2026-10-18 (invalid
`transition-property` in the social-nav pattern, the hardcoded alert font in the header
pattern, `transition: all` on buttons, and the `--block-branding-width` tokens). The
items below were deliberately left out.

### 1a. Per-block lazy-loading and fetchpriority wiring (biggest single gap)

> **DONE 2026-11-05** — next-starter `befbe1c`, astro-starter `2f37e7e`. Tracked as H1.
> Two premises below turned out wrong. (1) "Query the `lazyLoading` group per block" —
> **no query change was needed at all.** The typed fields exist, but both starters fetch
> blocks via `attributesJSON`, and the snake_case group has been arriving in it all along
> (`"lazy_loading": {"disable_lazy_loading": false, "prioritize_image": false}`); nothing
> read it. (2) "The `Image` components already accept and emit `fetchpriority`" — true of
> astro only; next-starter's atom mapped the prop solely to next/image's `priority` flag,
> which under Next 16 emits a `<link rel="preload">` and drops `loading` but never sets the
> attribute. Now one `resolveLazyLoading()` per repo, wired into the five blocks that render
> an inline `<Image>` (image, card, hero-unit, jumbotron, quote), with `prioritize_image`
> winning as the explicit LCP hint. Browser-verified on ticked content.

This is the dominant theme of the WP template work and is **entirely absent here**. On the
WP side, `image_loading_attrs(fields.lazy_loading_disable_lazy_loading, fields.lazy_loading_prioritize_image)`
was threaded through every image-bearing block — across the 14 changed plugin templates and
the framework's `card`, `image`, `quote`, `post-meta` and `hero-unit` templates, the diffs
carry 31 `fetchpriority`, 16 `image_loading_attrs`, 10 `lazy_loading_disable_lazy_loading`
and 6 `lazy_loading_prioritize_image` additions.

Here, the `Image` components already accept and emit `fetchpriority`/`loading`
(11 references in next-starter, 6 in astro-starter, plus ~30-40 `loading=` sites), but
**nothing reads the ACF `lazyLoading` group from GraphQL** — `lazyLoading` and
`disableLazyLoading` have zero occurrences in either repo. So an editor's per-block choice
of "prioritize this image" or "disable lazy loading" is silently ignored, and the LCP image
is never marked as such.

The field is available: `prioritizeImage` is present on `TeBlockHeroUnit` (120 fields) and
`BlockSection`, supplied by the lazy-loading module clone. The work is to query the
`lazyLoading` group per block and pass it into the existing `Image` props — not to change
the components themselves.

### 1b. The E12 header fixes

> **DONE 2026-11-05** — next-starter `09d0095`, astro-starter `e966e8d`. Tracked as H2.
> Reproduced in each starter before porting rather than transplanted: a single-step jump to
> the top from a parked header measured **CLS 0.3029 (next) / 0.2981 (astro)**, both
> attributed to `HEADER#siteHeader`, and 0.000 after. Note the safelisting the WP side
> needed does **not** apply — neither starter runs PurgeCSS.

Two related changes to the hide-header behaviour, absent here:

- **`header-near-top`** — within a header's height of the top, the header must always be
  revealed regardless of the last scroll direction. Without it, overlay mode persists down
  to `scrollTop` 0 while the body padding that reserves the header's space is only covered
  while the header is shown, so parking just below the header height and flicking down
  leaves a blank band at the top of the viewport.
- **`header-swap`** — suppresses the transform transition for the single frame in which the
  header leaves overlay mode (`position: fixed` + body padding) and re-enters normal flow.
  Without it the transform is still mid-flight when `header-hidden` is dropped and carries
  on unwinding against an in-flow element. On the WP side this was measured at
  **CLS 0.226, deterministic** on a one-step return to the top.

Porting needs **both** a SCSS and a JS change, and the JS is the reason this was not
auto-ported: WP does the class juggling inside `hiddenHeader()` with a `requestAnimationFrame`
to drop `header-swap` on the next frame, and that has to be rewritten against this repo's
own scroll handler rather than copied. Read the two side by side first.

Reference: `timberland/src/design-system/patterns/03-organisms/header/index.js`
(the `header-near-top` / `header-swap` block) and the matching rules in `_header.scss`.

### 1c. Button icons in the promo posts-loop pattern

`_posts-loop~promo.twig` gained icon markup for button left/right icons —
`<span class="icon"><i class="{fa_icon_style} {fa_icon}" style="...">` — with inline colour,
font-size and offset. This is the only template change in the whole set that touches
`class=` (12 lines). Check the equivalent promo pattern component here renders button icons
the same way.

### 1d. Font subsetting and metric-matched fallbacks

This repo has no `unicode-range` anywhere, no `_font-subset-ranges.scss`, and no
metric-matched fallback faces. On the WP side, subsetting splits each self-hosted face
into a subset face plus a full-face complement keyed by `unicode-range`, so the full file
is fetched only for a character the subset lacks — for ordinary English copy, never. The
metric-matched fallbacks were worth a measurable CLS improvement.

This is a build-pipeline addition, not a file-for-file port. Decide whether it belongs here
before starting.

### 1e. Generated icon registry — open question, decide before doing

The WP side now generates `icon-manifest.json`, `icon-universe.json`, `icons.{bi,fa,ph}.js`
and `_icons-generated.scss` from source and database scans, so exactly the icons the content
uses get registered. This repo instead pulls icon components from npm packages and keys off
`src/lib/icons/iconType.ts`.

Given this repo has already moved ~1 MB of icon payloads out of CSS into external files,
the npm-component approach may be deliberate and better suited here. **Confirm that before
treating the registry as a gap.**

### 1f. Related content issue (not this repo's to fix, but it affects what renders)

The `prioritize_image` field moved out of the hero-unit group into the lazy-loading module,
where it is exposed prefixed as `lazy_loading_prioritize_image`. Stored content did not
follow: on the natural-rose database, **56 posts still store the old bare `prioritize_image`
key against only 11 on the new prefixed one**. Those 56 are already not being read by WP
either. If 1a is implemented before that content is migrated, those posts will still render
without the priority hint — the gap is in the data, not the query.

---

### 1g. Checked and deliberately NOT ported — do not re-investigate

| Item | Why no action |
|---|---|
| ACF `section_padding`/`section_margin` rename | **No GraphQL impact.** Verified by swapping the pre-rename JSON back in and introspecting: `BlockSection` is 74 fields in both states, zero diff. WPGraphQL-ACF flattens clone fields, so names come from the underlying module — `padding` still resolves to `ModulePaddingPadding`, and `margin` was already absent before the change. `buildAcfBlockStyle.ts` needs no edit. |
| bfcache / Vide `unload` handler | Vide is not a dependency here and there are no `unload` listeners in `src`. Nothing to fix. |
| jQuery `js-{pattern}-exists` scaffolding removal | This repo never had that scaffolding (0 occurrences). jQuery itself is genuinely used (slick carousel in astro-starter, ~23 references in next-starter) and is not the same question. |
| `aspect-ratio` third argument `:is(.content, img)` | A no-op here. The `aspect-ratio` variant always wraps the image in `.content`; `picture` is a separate variant that never enters the ratio box. The WP fix existed because its WebP path puts `<img>` directly inside `<picture>`. |
| Service worker changes | Neither starter ships a service worker. |
| `will-change` on buttons | Identical to the WP version — not drift. |

## 2. Resolve the synced-layer divergence (do this before any of section 1)

> **RESOLVED 2026-11-05** — next-starter `8aaa72d`, astro-starter `c4d52ff`. Tracked as H3.
> The layers are **forks**, and `SYNC_PATTERN_STYLES` / `SYNC_BLOCK_STYLES` now require an
> explicit opt-in (the default was inverted, since `.env.local` is gitignored and so
> protected exactly one machine). Two claims below are wrong: point 2 ("the sync has
> apparently never run") — **five files per repo do carry the AUTO-GENERATED header** and
> are genuine mirrors that sync cleanly; and the question was never uniform, it is **per
> layer**. The 502 is also gone; all four endpoints answer 200.

Several SCSS layers in this repo are **generated from the WordPress REST API**, per the
sync scripts' own documentation:

| Layer | Written by | Endpoint |
|---|---|---|
| `src/scss/patterns/**` | `scripts/sync-pattern-styles.mjs` | `/wp-json/timberland/v1/pattern-styles` |
| `src/scss/non-printing/{functions,mixins}/**` | `scripts/sync-scss-utils.mjs` | `/wp-json/timberland/v1/scss-utils` |
| `src/scss/blocks/**` | `scripts/sync-block-styles.mjs` | `/wp-json/timberland/v1/block-styles` |
| `src/scss/_design-tokens.generated.scss`, `printing/_synced-css-variables.scss` | `scripts/sync-tokens.mjs` | `/wp-json/timberland/v1/design-tokens` |

`src/scss/printing/_css-variables.scss` is **not** a sync target and is hand-maintained.

Three things need settling:

1. **Four of the fixes applied on 2026-10-18 live in synced layers** (`patterns/organisms/_social-nav.scss`,
   `patterns/organisms/_header.scss`, `patterns/molecules/_branding.scss`,
   `non-printing/mixins/_content-utilities.scss`). They were placed to match the WP source
   exactly, so a sync against an up-to-date WP install should be a no-op — but a sync against
   a *stale* one would revert them.
2. **The sync has apparently never run here.** None of those files carry the AUTO-GENERATED
   header the scripts say they write; the current contents look like the original manual seed.
3. **They have since diverged substantially.** `patterns/organisms/_header.scss` differs from
   the framework's by roughly 1,900 lines. If these layers are meant to be pure mirrors, the
   first real sync will be a large and possibly breaking change that has nothing to do with the
   performance work. If they are intentional forks, the sync scripts are a hazard and should be
   gated off.

Also note `TIMBERLAND_API_URL` in `.env.local` points at `http://headless-test.local`, which
was returning **502** on 2026-10-18. The same endpoints respond 200 on the natural-rose install,
so the framework side works — the configured source host was simply down.

---

## 3. Testing — port the natural-rose suite

This repo currently has **no test infrastructure at all**: no Playwright, Vitest, Jest, axe or
Lighthouse CI dependency, and no test script. Storybook is set up (89 stories, a11y and Apollo addons) but nothing in it is asserted in CI.

The WordPress side runs two complementary suites worth mirroring here.

### 3a. The visual/CSS gate (`timberland/tests/visual/`, ~164 tests)

Playwright-based, and mostly *not* screenshot diffing — it asserts on computed styles and
delivery, which is what actually caught regressions during the remediation:

| Spec | What it guards |
|---|---|
| `computed-style.spec.js` | computed-style diffs per element against a stored baseline — the workhorse |
| `load-order.spec.js` | stylesheet document order, including inline `<style>` blocks |
| `css-budget.spec.js` | byte budgets per bundle |
| `css-complement.spec.js` | that deferred CSS actually complements critical CSS |
| `core-css.spec.js` | the pinned/purged WordPress core block CSS |
| `safelist-drift.spec.js`, `safelist-rendered.spec.js` | purge safelist vs what renders |
| `icon-coverage.spec.js`, `icon-glyphs.spec.js`, `icon-registry.spec.js` | every referenced icon is registered and renders a real glyph |
| `font-display.spec.js` | `font-display` on every face |
| `self-check.spec.js` | that the harness itself still detects a planted change — mutates linked sheets **and** inline `<style>` blocks |
| `canary.spec.js`, `targets-drift.spec.js`, `admin-context-safety.spec.js` | harness and fixture integrity |

`self-check.spec.js` is the one to port early: without it a green suite is not evidence of
anything. The mutation helper lives in `tests/visual/mutate.js`.

### 3b. Lighthouse with a score ratchet (`natural-rose/tests/lighthouse/`)

Three profiles, each with its own committed baseline:

- `lighthouserc.js` — simulated throttling, headless. The reliable default.
- `lighthouserc.real.js` — real throttling, headless.
- `tests/lighthouse/collect-window.mjs` — headed window profile; matches DevTools, but is
  load-sensitive and flaky under parallel work.

`tests/lighthouse/aggregate.mjs` reduces the runs and compares against
`baseline.json` / `baseline-real.json` / `baseline-window.json`; `warmup.mjs` primes caches
first. The rule in force on the WP side is a **ratchet**: only commit changes whose scores are
equal or better, and measure one thing at a time.

Two traps worth carrying over: `lhci collect` does **not** clear `.lighthouseci`, so a stale
run can silently pollute an aggregate (`collect-window.mjs` does clear it); and
`aggregate.mjs` reads every `.json` it finds.

### Suggested order

1. Playwright + a computed-style baseline for a handful of representative routes.
2. `self-check` equivalent, so the suite is trustworthy before it is trusted.
3. Load-order and CSS-budget assertions.
4. Lighthouse CI with one profile and a committed baseline, then adopt the ratchet.
5. Only then widen to the per-block matrix in COMPONENT-TESTING-PLAN.md.

A caveat on scope: the WP suites assert against server-rendered Twig output and a WordPress
fixture page. Here the equivalent fixture is a route rendered from the same WordPress content
over GraphQL, so the fixture layer is shared but the assertions are not portable verbatim.

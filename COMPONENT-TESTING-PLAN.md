# Component Testing Plan

> **Status:** Not started. This is a design proposal, not an implementation record.
> Captured 2026-09-06 so the reasoning isn't lost.

Goal: automated verification that every component and block works across **all of
its options**, in each app, driven from real WordPress content.

Each app is verified independently against the framework and a shared WordPress
fixture — not against the other app. See
[Decision: separate per-app suites](#decision-separate-per-app-suites) for why, and
for what that trades away.

---

## Current state

| | next-starter | astro-starter | timberland (framework) |
|---|---|---|---|
| Storybook | v10 — 89 stories, 96 `.mdx`, a11y + apollo addons | **0 stories** | v10 (HTML/Twig) |
| Test runner | none | none | jest, but only a `tests/unit/dummy/sum.test.js` stub |
| Visual regression | none | none | `tests/vrt/` Backstop config **scaffolded, dormant** — backstop not installed, no npm script |
| Accessibility | addon only, nothing enforced | none | `tests/accessibility/pa11y.js` — pa11y not installed |
| E2E / interaction | none | none | none |

Component counts: 41 blocks in each starter (+7 extended in Astro), plus 15 atoms /
17 molecules / 8 organisms in Astro.

`tests/vrt/backstop-settings.js` in the framework is worth building on — it already
auto-enumerates Storybook story IDs from `story-paths.js` and exposes a factory so
themes can append live-page scenarios.

---

## Why Storybook alone is not the answer

The instinct is "add Storybook to Astro, then diff stories." That should **not** be
the primary strategy.

In the September 2026 debugging session that prompted this document, ~30 distinct
defects were found and fixed. Storybook would have caught approximately **none** of
them:

- 66 GraphQL schema-validation errors across the two routing queries — Storybook
  feeds components mock props and never touches the schema
- `editor_palette` never registered with WPGraphQL — WordPress-side
- The WPGraphQL-for-ACF clone-interface leak (91k field definitions, 5s per
  request) — WordPress-side
- 121 malformed `:px` CSS declarations per page from ACF returning `''` for unset
  numbers — *possibly*, if a story passed `''` rather than a number, which stories
  rarely do

Every one of those lived in the **data path**, not the component. Component-isolated
tests would have been green for the entire period the front page rendered an empty
`<body>`.

Secondary consideration: Storybook's Astro support has never been first-class —
Astro components are server-rendered, which fits Storybook's browser-renderer model
poorly. **Verify current state before betting on it.**

Keep next-starter's Storybook for component documentation and a11y spot-checks. Do
not make it the parity mechanism.

---

## Decision: separate per-app suites

**Decided 2026-09-07.** Each app gets its own suite, verified against the framework
and its WordPress fixture. Neither app is the other's oracle, and there is no shared
cross-render diff.

Rationale: each app has an independent contract with WordPress. Verifying both
against the same fixture proves both correct without coupling the suites to each
other.

What this buys:

- **The divergent rendering models stop mattering.** astro-starter is pure SSR;
  next-starter is static + 60s ISR, so next can serve content up to a minute stale
  while astro serves live. A cross-app DOM diff would have produced false failures
  purely from that timing skew, and would have needed both apps pinned to a known
  snapshot to be trustworthy.
- **No DOM-normalisation problem.** Comparing Astro output to React output would have
  required normalising away `data-astro-source-file`, React hydration comments and
  generated ids, and hoping the two frameworks' wrapper markup differed only
  cosmetically. That was the plan's load-bearing unknown; this decision removes it.
- **The suites can diverge where the frameworks do** — Storybook stays useful on the
  next side without needing an Astro equivalent.

What this gives up: **port equivalence is no longer directly tested.** Separate
suites answer "is each app correct against WordPress?" but not "did the Astro port
preserve the React behaviour?" A block could be wrong in both apps in the same way,
or right in both while differing in output, and neither suite would notice. Accepted
deliberately — the fixture assertions are expected to be specific enough that a
genuine behavioural divergence shows up as one app failing an assertion the other
passes.

---

## Proposed layers, in value order

### 1. Schema contract check in CI

Introspect the live schema, validate every `gql` document against it, fail the build
on error. GraphQL Codegen does this and works identically for both apps.

This one check catches the entire class of bug that caused the September outage, in
seconds, with no browser. **Highest value, smallest effort — do this first.**

### 2. A reproducible WordPress fixture page

One page (or a few) containing every block at every meaningful option permutation.

The critical constraint: it must be **seedable, not hand-authored**. A page built in
wp-admin is a database artifact CI cannot rebuild and that drifts silently. Commit
the block markup as a fixture and add a `timberland fixture-seed` WP-CLI command
alongside the existing `blocks-scan` / `fields-copy` / `fields-list` commands.

This is the piece that makes layers 3 and 4 possible, and the piece that currently
does not exist in any form.

### 3. Per-app render assertions against the fixture

For each app independently, request the fixture URIs and assert the rendered output
against expectations derived from the WordPress content — that each block in the
fixture produced its mapped component, that no block silently fell through to the
`renderedHtml` default, that no dead CSS declarations were emitted, that the
document has the structural landmarks it should.

This exercises the real `query → buildBlockTree → BLOCK_MAP → component` path rather
than components in isolation, which is where every defect in the September session
actually lived. A Node script; no framework required.

It would have caught the September blank page instantly (structural landmarks
missing) and the 121 `:px` declarations (dead-declaration assertion).

Each app is checked against **WordPress**, not against the other app — see
[Decision: separate per-app suites](#decision-separate-per-app-suites).

### 4. Behaviour, visual, and accessibility on the fixture

Playwright against both apps for the interactive blocks — accordion expands, modal
traps focus, tabs switch, carousel advances, offcanvas toggles. Plus screenshot
comparison and `axe`.

This is where "all options and features work" is genuinely tested; a DOM diff will
not catch broken JavaScript. Playwright's built-in screenshot comparison is better
maintained than Backstop as of 2026, though the existing `tests/vrt` scaffold is a
reasonable alternative if you'd rather not add a dependency.

---

## Keeping it maintainable

Drive the test matrix from data already generated, rather than hand-writing 41×2
test files.

`src/scss/manifests/_block-manifest.generated.json` enumerates all 41 block slugs,
synced from WordPress. Assert that every slug has:

1. a fixture instance on the kitchen-sink page
2. a story in next-starter
3. a component registered in both `BLOCK_MAP`s

A new block added in WordPress then **fails the suite until covered**, which turns
coverage from a spreadsheet into a build failure.

---

## Suggested first slice

1. Layer 1 — schema contract check in CI, both apps
2. Layer 2 — fixture page + seed command
3. A thin version of layer 3 over a handful of blocks in one app, then mirror the
   harness to the other

Layers 1 and 2 are shared groundwork; the fixture and the schema check serve both
apps. Only layer 3 upward is duplicated per app, and the duplication is the point.

---

## Open questions

- Current state of Storybook support for Astro — unverified. Lower stakes now that
  the suites are independent: astro-starter can be tested through rendered pages
  without ever gaining stories.
- Whether the fixture should be one large page or one page per block group; one page
  is cheaper to render, per-block is easier to attribute failures to
- Where CI runs, and whether it can reach a WordPress instance (the schema check and
  every layer below it need one)
- Whether the per-app assertions can be specific enough to catch a behavioural
  divergence between the ports, given that cross-app comparison is off the table

**Resolved:** whether Astro and React output can be normalised to a comparable DOM.
Moot — see [Decision: separate per-app suites](#decision-separate-per-app-suites).

---

## Related

- `docs/guides/graphql.md` in the framework — the WPGraphQL-for-ACF clone-interface
  leak and the patch it needs
- `docs/guides/troubleshooting.md` — symptom-first entry for the same
- `tests/vrt/backstop-settings.js` in the framework — existing dormant VRT harness

# Component Testing Plan

> **Status:** Not started. This is a design proposal, not an implementation record.
> Captured 2026-09-06 so the reasoning isn't lost.

Goal: automated verification that every component and block works across **all of
its options**, and that behaviour is identical between `next-starter` and
`astro-starter`, driven from real WordPress content.

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

### 3. Cross-render parity diff

Fetch the same URI from both apps, normalise away framework noise —
`data-astro-source-file`, React hydration comments, generated ids — then diff DOM
structure and computed class/style sets.

This is the direct answer to "does functionality port," because it exercises the real
`query → buildBlockTree → BLOCK_MAP → component` path in both apps rather than
components in isolation. A Node script; no framework required.

It would have caught the September blank page instantly, the 121 `:px` declarations,
and any block whose Astro port diverged from the React original.

**Load-bearing assumption:** that the two DOMs can be normalised to a comparable
form. If Astro and React diverge more than cosmetically in wrapper markup, the diff
becomes noisy and has to soften into a looser structural assertion. Prove this on a
single block before building the rest.

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

1. Layer 1 — schema contract check in CI
2. Layer 2 — fixture page + seed command
3. A thin version of layer 3 over a handful of blocks, to settle the normalisation
   question

If the normalisation approach holds, the remainder is mechanical.

---

## Open questions

- Current state of Storybook support for Astro — unverified
- Whether Astro and React output can be normalised to a comparable DOM — unverified,
  and layer 3 depends on it entirely
- Whether the fixture should be one large page or one page per block group; one page
  is cheaper to diff, per-block is easier to attribute failures to
- Where CI runs, and whether it can reach a WordPress instance (the schema check and
  every layer below it need one)

---

## Related

- `docs/guides/graphql.md` in the framework — the WPGraphQL-for-ACF clone-interface
  leak and the patch it needs
- `docs/guides/troubleshooting.md` — symptom-first entry for the same
- `tests/vrt/backstop-settings.js` in the framework — existing dormant VRT harness

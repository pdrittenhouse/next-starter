# Performance backlog

Measured findings from this app. Ordered by original payoff estimate, which two
rounds of measurement have since revised — read the status line on each item
rather than trusting the ordering.

## Status

| item | state |
|---|---|
| 1. Uncached site-level GraphQL | **fixed** — all 17 site-level calls tagged `site`, webhook-invalidated |
| 2. CSS weight | **partly fixed** — ~1 MB of icon payloads gone; the remaining plan was rewritten after measuring |
| 3. Content images | **fixed for `core/image`**, latent for gallery / cover / media-text |
| 4. Inline RSC flight payload | open |

The two rewrites in item 2 are worth reading before picking up CSS work: both
per-pattern loading and critical-CSS deferral measured far worse than this file
originally assumed, and the cheap win is somewhere else.

Numbers were measured against a local WordPress (`headless-test.local`) with 4
pieces of content, on the `mask-image`-refactored CSS and with the
wpgraphql-acf clone-interface patch applied. They are relative, not absolute.

astro-starter has its own `PERFORMANCE.md` with the same first three items —
they are shared defects, inherited from the same design system and the same
WordPress queries.

---

## 1. 20 uncached site-level GraphQL requests per page — FIXED

**The single highest-leverage item.**

Every rendered page issues ~20 GraphQL requests whose results are *identical for
every page on the site*:

| file | calls per page |
|---|---|
| `stories/templates/partials/wrapper/HeaderPattern.tsx` | 8 |
| `stories/templates/partials/wrapper/FooterPattern.tsx` | 8 |
| `app/layout.tsx` | 4 |

Global CSS, spritemap icons, design tokens, menus, header/footer options,
customizer settings, co-brand, traveling CTA — all site-level, all re-fetched
per render.

**None of them pass cache options.** `lib/wp/client.ts` only sets
`fetchOptions.next` when a caller supplies `options.next`, and these callers do
not.

### Two things make this less visible here than in astro-starter

- ISR spreads regeneration across requests instead of paying it N times in one
  build, so it shows up as a slow first hit rather than a slow build.
- Only 5 paths prerender on this install, so the build cost is small in
  absolute terms.

It is still ~20 × ~0.55s on every cold render. Measured: `/category/uncategorized`
took 23s, `/search?s=a` 12s.

### FIXED — and a correction to what this file used to say

**This item is resolved.** All 17 site-level calls now pass
`{ next: SITE_CACHE }` (`lib/wp/cacheTags.ts`), which caches them for an hour
and tags them `site`, and the WordPress revalidation webhook invalidates that
tag the moment anything site-level changes. See `app/api/revalidate/route.ts`.

An earlier version of this file asserted:

> **Next's Data Cache does not cache POST requests**, and every GraphQL call
> here is a POST. Adding `{ next: { revalidate: 60 } }` will not fix it.

**That was wrong**, and it is a widely repeated claim, so it is worth recording
why. In Next 16.2.10, `next/dist/server/lib/patch-fetch.js`:

```js
let autoNoCache = Boolean(
  (hasUnCacheableHeader || isUnCacheableMethod) && revalidateStore?.revalidate === 0
);
```

POST forces no-cache only when the route is **already fully dynamic**
(`revalidate === 0`). On a route with `export const revalidate = 60` that
condition is false, and the sole remaining gate is `finalRevalidate > 0`
(same file). The method is never re-checked after that line. And
`incremental-cache/index.js` `generateCacheKey` reads the request body into the
key, so distinct GraphQL queries do not collide.

So the conclusion drawn from the false premise — "port `TtlCache` to next" —
was also wrong, and the actual fix was one option object per call site.

What genuinely does not work is passing cache options from a route that opts
into dynamic rendering: `force-dynamic`, `cookies()`, `searchParams`. There the
fetch is uncacheable no matter what it asks for. That is the real constraint,
and it is about the *route*, not the HTTP method.

The `{ next: { revalidate: 60 } }` already present in `route-content.tsx` and
`node-renderer.tsx` was therefore doing exactly what it looks like it does.

---

## 2. CSS — partly fixed, and the original plan for the rest was wrong

`app/layout.tsx` imports `../scss/global.scss`, one line — `@use "printing/all"`
— which pulls in every library and every pattern regardless of what the page
renders. No PurgeCSS and no `optimizeCss` are configured.

### DONE — 1 MB of icon payloads moved out of CSS

`_sprite-mask.scss` embedded each icon from the generated `$sprites` map as a
percent-encoded data URI, so every icon in the set shipped on every page. The
same 38 icons are 201.7 KB as standalone files, now written to `public/icons/`
by `scripts/build-icon-files.mjs` and referenced as `url("/icons/<name>.svg")`.

Production CSS after the change — the main chunk carries all 38 external
references and 31.5 KB of inline URIs, which is Bootstrap's own form-control
iconography and correctly stays inline:

    .next/static/chunks/2cym_sgvr1zxk.css   1634.4 KB   inline-uri 31.5 KB

Note `url(/spritemap.svg#sprite-<name>)` does NOT work, even though that
spritemap exists for `<use>`: the fragment names a `<symbol>`, which is not
standalone-renderable, so browsers render nothing. Hence one file per icon.

### The remaining weight, measured by module

Measured on astro-starter, which syncs the identical design-system SCSS, so the
composition carries over even though the bundler and chunk names differ:

| module | size |
|---|---|
| libs/bootstrap | 438.4 KB |
| utilities | 355.1 KB |
| sprites (icon *classes*, no payloads) | 145.9 KB |
| libs/bootstrap-icons | 81.0 KB |
| wordpress/all | 49.2 KB |
| css-variables | 43.7 KB |
| libs/font-awesome | 38.9 KB |
| libs/hamburgers | 34.0 KB |
| components/all | 12.7 KB |
| **always-loaded base, no patterns** | **1199.2 KB** |
| all 40 design-system patterns summed | 653.7 KB |

The top three are **939 KB — 78% of the base** — and are almost entirely unused
generated permutations: Bootstrap's utility API emits every utility at every
breakpoint, `sprites` emits ~1,520 selectors (38 icons x 20 palette variants x
2), and `bootstrap-icons` is 2,078 selectors.

### Why per-pattern loading is NOT the answer

This was the plan's headline item. The mechanics work — all 40 patterns compile
standalone with a zero-output `@import` prelude — but the arithmetic does not:

| per-page under per-pattern loading | total | saving |
|---|---|---|
| shell only (header + footer + nav) | 1698.5 KB | 8.3% |
| shell + card-grid + card | 1783.6 KB | 3.7% |
| shell + every other pattern | 1852.9 KB | 0% |

The always-loaded base is 1199.2 KB and contains **no pattern CSS at all**, and
`organisms/header` alone is **438.9 KB standalone, 67% of all pattern CSS**, and
loads on every page regardless.

So ~8% best case — and next-starter pays more for it than astro does. `<head>`
is rendered by the layout, which does not know the page's patterns, so it needs
React 19's `<link precedence>` hoisting (this app is on React 18.3.1, valid for
Next 16, which accepts ^18.2.0) or `<link>` tags in the body. Not worth it at
this size.

### Why deferring non-critical CSS is also poor value right now

A critical/deferred split must break at a single boundary or it reorders the
cascade. Cumulative sizes (astro-measured, same SCSS):

| split point | critical | deferred |
|---|---|---|
| through `01-atoms` | 802.7 KB | 1049.4 KB (56.7%) |
| through `03-organisms` | 1435.1 KB | 417.0 KB (22.5%) |
| through `utilities` | 1790.2 KB | 61.9 KB (3.3%) |

Only the last is safe, and it is 3.3%. The 22.5% option defers `utilities`, so
`.d-none` would not apply on first paint and hidden content flashes visible. The
56.7% option defers `.site-header`, so the header renders unstyled.

For reference, WordPress defers its four large bundles with `media="print"` plus
`onload="this.media='all'"` and a `<noscript>` fallback — see `Performance.php`
and the `timberland/performance/deferred_css_handles` filter. (Counting
`<link rel=stylesheet>` tags in WordPress source double-counts those handles,
because each deferred sheet also emits the `<noscript>` copy. They are not
fetched twice.)

> **Note on the reversal.** Per-pattern splitting and CSS deferring were both
> explicitly asked for as wanted future work. The numbers above are why they are
> not recommended *yet* rather than a decision to drop them: at 8.3% and 3.3%
> they cost more in per-request logic, a React upgrade and cascade risk than they
> return. Both become worth doing once the 1199 KB base is trimmed — deferral in
> particular only makes sense when there is something safely deferrable. Revisit
> after PurgeCSS.

### So: trim the generated permutations

On these numbers the remaining work is PurgeCSS or `optimizeCss` against
rendered markup, plus narrowing the Bootstrap utility map and the sprite
colour-variant matrix at source. Lower risk than per-pattern loading, no
per-request logic, no React upgrade, and it applies to both starters unchanged.
Target is well under 700 KB, at which point deferring becomes worthwhile too.

For context on the original comparison: this app shipped 6,577 KB total against
WordPress's 4,614 KB on the same page — CSS +1,387 KB, JS +325 KB, HTML
+324 KB, with fewer requests (26 vs 84) but 43% more bytes. The icon fix above
takes roughly 1 MB off the CSS side of that.

---

## 3. Content images — FIXED for core/image, latent elsewhere

A 1.4 MB PNG, 22% of a page's bytes and almost certainly the LCP element, was
emitted as a raw `<img src="http://wordpress.local/wp-content/uploads/…">`
because it arrived inside WordPress block HTML via `dangerouslySetInnerHTML`.

**Fixed**, and more cheaply than this file predicted. It said the fix "means
parsing block content rather than injecting it as HTML"; in fact mapping
`core/image` to `CoreImageBlock` in `BLOCK_MAP` was enough, and that component
routes the image through `next/image`.

What remains is latent rather than fixed. Images inside `core/gallery`,
`core/cover` or `core/media-text`, or inside raw `content` HTML on a node with no
`editorBlocks`, still bypass the pipeline. None exist on this install, so there
is nothing to measure yet — the same one-line `BLOCK_MAP` treatment should work
for each when they first appear.

---

## 4. HTML carries 205 KB of inline script

The document is 412 KB, of which 205 KB is inline `<script>` — the RSC flight
payload, 51 `self.__next_f.push()` calls. Because the whole `node` (including
`editorBlocks` and `content`) flows through `NodeRenderer`, its data is
serialized into the document *in addition to* the rendered markup. Content is
effectively sent twice.

Trimming what crosses the server/client boundary would shrink it. Inherent to
RSC to some degree, but 205 KB is a lot.

---

## Not needed here, unlike astro-starter

- **Capping `generateStaticParams`** — unnecessary. It can return a subset and
  ISR populates the rest on first request. Astro has no equivalent, which is why
  its backlog carries that item and a durable-cache item.
- **A response cache** — unnecessary. `revalidate` on the content route *is* the
  HTML cache, and it persists across restarts. Adding one would store the same
  output twice under two independent expiry clocks.

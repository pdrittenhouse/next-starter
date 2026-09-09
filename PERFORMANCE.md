# Performance backlog

Measured findings from this app, deferred to a dedicated optimization pass.
Ordered by payoff.

Numbers were measured against a local WordPress (`headless-test.local`) with 4
pieces of content, on the `mask-image`-refactored CSS and with the
wpgraphql-acf clone-interface patch applied. They are relative, not absolute.

astro-starter has its own `PERFORMANCE.md` with the same first three items —
they are shared defects, inherited from the same design system and the same
WordPress queries.

---

## 1. 20 uncached site-level GraphQL requests per page

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

### The fix, and a trap

**Next's Data Cache does not cache POST requests**, and every GraphQL call here
is a POST. Adding `{ next: { revalidate: 60 } }` will not fix it. React's
`cache()` dedupes within a single render but not across renders.

So it needs an explicit in-process TTL cache, the same as astro-starter's
`lib/cache/ttlCache.ts`. Worth porting that module rather than inventing a
second one.

Corollary worth knowing: the `{ next: { revalidate: 60 } }` already present in
`route-content.tsx` and `node-renderer.tsx` is probably not doing what it looks
like it does, for the same POST reason. What actually keeps `/[[...uri]]` on the
static path is the *absence of dynamic APIs* — no `searchParams`, no `cookies()`,
no `draftMode()` — not fetch caching. Do not remove those annotations on the
assumption they are load-bearing without checking, but do not trust them either.

---

## 2. 3.9 MB of CSS on every page

`app/layout.tsx` imports `../scss/global.scss`, which is one line —
`@use "printing/all"` — and that pulls in every library and every pattern
regardless of what the page renders: whole Bootstrap, whole Font Awesome, whole
Bootstrap Icons, `sprites`, and all of `01-atoms` … `05-pages`.

Compiles to 19,144 rules, 1,692 media queries, 13,268 custom properties across 8
files.

**1,042 KB of the single 2.68 MB chunk is 243 inlined SVG data-URIs** — the
generated `$sprites` map, so every icon in the set ships on every page. Getting
the payloads out of the stylesheet (one external SVG sprite referenced by
`mask-image: url(/sprite.svg#name)`) is the next step.

No PurgeCSS and no `optimizeCss` are configured.

For comparison on the same page: this app ships 6,577 KB total against
WordPress's 4,614 KB — CSS +1,387 KB, JS +325 KB, HTML +324 KB. Fewer requests
(26 vs 84), but 43% more bytes.

WordPress also defers its four large bundles (`timberland-styles-full`,
`parent-styles-full`, `bootstrap-critical-full`, `bootstrap-utilities-full`)
with the `media="print"` + `onload` trick and a `<noscript>` fallback — see
`Performance.php` and the `timberland/performance/deferred_css_handles` filter.
So its render-blocking CSS is much smaller than its total, while this app ships
one ~2.7 MB blocking stylesheet with no critical/deferred split at all.

Note for anyone re-measuring: counting `<link rel=stylesheet>` tags in the
WordPress source double-counts those four, because each deferred sheet also
emits a `<noscript>` copy under the same handle. They are not fetched twice.

### Planned work — all three are wanted

**a. Cut the bulk.** Move the 1 MB of icon data-URIs out of CSS into one
external SVG sprite referenced by `mask-image: url(/sprite.svg#name)`. Import
icon and utility subsets instead of whole Bootstrap / Font Awesome / Bootstrap
Icons. Configure PurgeCSS or `optimizeCss`. Largest byte reduction for the least
structural change.

**b. Defer non-critical CSS**, mirroring `Performance.php`. Improves FCP/LCP
without changing total bytes. Harder in Next than in Astro: Next controls the
`<link>` tags it emits for imported CSS, so deferring them means either
`<link precedence>` (React 19 — this app is on React 18.3.1) or moving the
non-critical CSS out of the import graph and emitting the tags by hand.

**c. Per-pattern loading**, mirroring `PatternLoader`. The detection inputs
already exist at render time — `node.editorBlocks` gives the page's blocks and
`GET_TEMPLATE_PATTERNS` gives the template's pattern tree, and `NodeRenderer`
already fetches both.

Two Next-specific obstacles for (c), neither present in astro-starter:

- `<head>` is rendered by `app/layout.tsx`, which does not know the page's
  patterns. React 19's `<link rel="stylesheet" precedence>` hoisting is the
  clean fix and would need the React upgrade first; otherwise the links go in
  the body.
- `PATTERN_MAP` statically imports every pattern, so per-component CSS imports
  all collapse into one shared chunk. Real splitting needs that map converted to
  `next/dynamic` imports.

Sequencing: (a) first, since it shrinks what the other two carry. (b) is the
cheapest FCP win. (c) is the largest change and is easier after (a).

Measure repeat-visit navigation as well as cold first paint — a single cached
bundle beats per-page CSS once a visitor reaches a second page, so the split
should be validated on both.

---

## 3. Content images bypass `next/image`

A 1.4 MB PNG — 22% of a page's total bytes, and almost certainly the LCP element
— is emitted as a raw `<img src="http://wordpress.local/wp-content/uploads/…">`
because it arrives inside WordPress block HTML via `dangerouslySetInnerHTML`.

`next/image` *is* wired up and used elsewhere (`/_next/image?` appears on the
page), so this is an untaken opportunity rather than a missing feature. Fixing it
means parsing block content rather than injecting it as HTML. Highest payoff of
any single change on a content-heavy page; also the most work.

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

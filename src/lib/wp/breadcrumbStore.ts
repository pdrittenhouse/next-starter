import { cache } from 'react';

/**
 * Per-request holder for the current node's breadcrumb trail.
 *
 * ─── Why a store and not a prop ─────────────────────────────────────────────
 *
 * A breadcrumb block can appear anywhere in the block tree: inside page
 * content, but also inside a header or footer widget area. Those widget-area
 * renders call `BlockRenderer` with widget blocks and have no node to pass
 * down — and they still legitimately want the CURRENT page's trail. Threading
 * it as a prop would mean touching all thirteen `BlockRenderer` call sites and
 * would still not reach the widget areas.
 *
 * astro-starter solves the same problem with `Astro.locals`. React has no
 * equivalent for server components, but `cache()` gives the needed property:
 * it memoises per request, so the object returned below is one shared mutable
 * cell for the duration of a single render and is NOT shared between
 * concurrent requests. That last part is the whole reason a plain module-level
 * `let` is wrong here — it would leak one visitor's breadcrumbs into another's
 * page under concurrency.
 *
 * ─── Direction of data flow ─────────────────────────────────────────────────
 *
 * `NodeRenderer` seeds it, because that is the only component that has the
 * resolved node. Blocks read it. Anything reading before the seed gets null,
 * which is the correct answer for a node-less route (search, a date archive).
 */

export interface BreadcrumbCrumb {
  label?: string | null;
  url?: string | null;
  isCurrentPage?: boolean | null;
}

interface BreadcrumbCell {
  crumbs: BreadcrumbCrumb[] | null;
}

const store = cache((): BreadcrumbCell => ({ crumbs: null }));

/** Called once per render by NodeRenderer. */
export function setBreadcrumbs(crumbs: BreadcrumbCrumb[] | null | undefined): void {
  store().crumbs = crumbs ?? null;
}

/** Read the current request's trail. Null when the route has no node. */
export function getBreadcrumbs(): BreadcrumbCrumb[] | null {
  return store().crumbs;
}

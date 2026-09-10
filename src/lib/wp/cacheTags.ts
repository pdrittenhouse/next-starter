/**
 * The cache-tag vocabulary shared with WordPress.
 *
 * `Timberland\Framework\Revalidation` emits these strings when content
 * changes; this module is the front-end half of that contract. The two must
 * agree exactly, so the shapes live in one place rather than being spelled out
 * at each call site.
 *
 *   site                     site-level data (menus, options, customizer)
 *   post:{id}                one specific node
 *   type:{post_type}         listings of that type
 *   term:{taxonomy}:{slug}   one term archive
 *   author:{id}              one author archive
 *   date:{YYYY}              a year archive
 *   date:{YYYY-MM}           a month archive
 *
 * WordPress deliberately reports what CHANGED rather than what to purge —
 * deriving the affected route list there would mean reimplementing this app's
 * routing in PHP. Mapping a tag onto routes is this side's job, and with Next's
 * Data Cache that mapping is simply `revalidateTag`, because the tag attached
 * to a fetch is the same string.
 *
 * Mirrors astro-starter's `lib/wp/cacheTags.ts`, which needs the same
 * vocabulary for a cache that cannot tag anything.
 */

/** Site-level data: menus, theme options, customizer, title, tagline. */
export const SITE_TAG = 'site';

export const postTag = (id: number | string) => `post:${id}`;
export const typeTag = (postType: string) => `type:${postType}`;
export const termTag = (taxonomy: string, slug: string) => `term:${taxonomy}:${slug}`;
export const authorTag = (id: number | string) => `author:${id}`;

/** `date:2026` for a year archive, `date:2026-09` for a month. */
export const dateTag = (year: string | number, month?: string | number) =>
  month === undefined ? `date:${year}` : `date:${year}-${String(month).padStart(2, '0')}`;

/**
 * Cache options for a site-level GraphQL query.
 *
 * ─── Why this exists, and why the revalidate window is long ─────────────────
 *
 * Every rendered page issues ~20 GraphQL requests whose results are identical
 * for every page on the site — global CSS, spritemap icons, design tokens,
 * menus, header and footer options, customizer settings, co-brand, traveling
 * CTA. None of them passed cache options, so every one was re-fetched on every
 * render at roughly 0.55s each. See PERFORMANCE.md item 1.
 *
 * An hour rather than 60 seconds because these are now invalidated by webhook
 * the moment WordPress changes them. The TTL is the fallback for when a webhook
 * is lost or unconfigured, not the primary freshness mechanism — so it should
 * be long enough to actually save the work.
 *
 * ─── The POST question ──────────────────────────────────────────────────────
 *
 * Every GraphQL call here is a POST, and it is widely repeated that Next's Data
 * Cache does not cache POSTs. That is not true of Next 16 as configured here.
 * In `next/dist/server/lib/patch-fetch.js`, POST forces no-cache only when the
 * route is ALREADY fully dynamic (`revalidateStore.revalidate === 0`); on a
 * route with `export const revalidate = 60` that condition is false, and the
 * only remaining gate is `finalRevalidate > 0`. The request body is part of the
 * cache key (`incremental-cache/index.js`, `generateCacheKey`), so distinct
 * queries do not collide.
 *
 * What genuinely does not work is passing these options from a route that opts
 * into dynamic rendering — `force-dynamic`, `cookies()`, `searchParams`. There
 * the fetch is uncacheable no matter what it asks for.
 */
export const SITE_CACHE = {
  revalidate: 3600,
  tags: [SITE_TAG],
} as const;

/** Cache options for a query about one specific node. */
export function nodeCache(id: number | string, postType?: string) {
  return {
    revalidate: 3600,
    tags: postType ? [postTag(id), typeTag(postType), SITE_TAG] : [postTag(id), SITE_TAG],
  };
}

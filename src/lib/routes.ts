/**
 * The app's own routes, as opposed to WordPress content.
 *
 * Mirrors `lib/routes.ts` in astro-starter. Two consumers that must never
 * disagree:
 *
 *   - `proxy.ts` uses it to decide what NOT to rewrite. Rewriting an app
 *     route onto `/search` or `/paged/*` sends it to WordPress, which has no
 *     node for it.
 *   - `app/[[...uri]]/page.tsx#generateStaticParams` uses it to refuse to
 *     prerender a WordPress URI that would shadow one of these.
 *
 * They were separate lists at first — the proxy had its own
 * `isOwnDynamicRoute()`, which knew about `/search` and `/paged` but not
 * `/author` or `/data`, so `/author/jane?s=cat` was rewritten to the search
 * route and the author archive silently became a search results page. That
 * function is gone; this list replaced it.
 *
 * ADD NEW TOP-LEVEL ROUTES HERE when adding a directory under `src/app/`.
 */

/** First path segments owned by this app. */
export const APP_ROUTE_SEGMENTS = new Set([
  'api',
  'author',
  'data',
  'paged',
  'preview',
  'search',
]);

/** WordPress server paths. These can never be front-end content — reject them. */
export const WP_SERVER_PREFIXES = new Set([
  'wp-content',
  'wp-admin',
  'wp-includes',
  'wp-json',
  'wp-cron.php',
]);

export const ASSET_EXTENSION =
  /\.(ico|png|jpg|jpeg|gif|webp|avif|svg|css|js|mjs|map|txt|xml|json|woff|woff2|ttf|eot|pdf|zip)$/i;

export function firstSegment(pathname: string): string | undefined {
  return pathname.split('/').filter(Boolean)[0];
}

/** True when this app owns the path, so WordPress must not be consulted for it. */
export function isAppRoute(pathname: string): boolean {
  const first = firstSegment(pathname);
  return Boolean(first && APP_ROUTE_SEGMENTS.has(first));
}

/** True for anything that shouldn't reach the redirect or rewrite layers. */
export function isNonContentPath(pathname: string): boolean {
  const first = firstSegment(pathname);
  if (!first) return false;
  if (WP_SERVER_PREFIXES.has(first)) return true;
  const segments = pathname.split('/').filter(Boolean);
  return ASSET_EXTENSION.test(segments[segments.length - 1]);
}

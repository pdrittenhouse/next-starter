/**
 * `POST /api/revalidate` — inbound cache invalidation from WordPress.
 *
 * `Timberland\Framework\Revalidation` POSTs here whenever content changes, so
 * an editor's publish appears immediately instead of after the ISR window.
 * Without it, `revalidate = 60` is the only freshness mechanism the site has.
 *
 * Payload (see the PHP module for the emitting side):
 *
 *   {
 *     "purgeAll": false,
 *     "tags":  ["post:12", "type:post", "term:category:news", "site"],
 *     "paths": ["/hello-world/", "/old-slug/"],
 *     "timestamp": 1789079674
 *   }
 *
 * Tags are the primary mechanism: they match the tags attached to fetches in
 * `lib/wp/cacheTags.ts`, so `revalidateTag` invalidates exactly the queries
 * whose data changed, wherever in the app they were made. Paths are a
 * belt-and-braces second pass for the rendered-page cache, and matter most for
 * a slug change — where WordPress sends both the old and new URL, and the old
 * one has no tag of its own to invalidate.
 *
 * ─── Auth ────────────────────────────────────────────────────────────────────
 *
 * A shared secret in a header, compared in constant time. This mirrors
 * `HeadlessPreview::handle_exchange`, which does the same thing with the same
 * secret-shaped credential, so the framework has one auth story for
 * server-to-server calls rather than two.
 *
 * An HMAC over the body would additionally prove the payload was not altered in
 * transit and allow replay rejection. Over HTTPS between two servers the shared
 * secret is adequate, and the endpoint is idempotent — a replayed purge costs a
 * re-render and nothing else.
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { clearAllCaches } from '@/lib/cache/ttlCache';

/**
 * Never prerender or cache this route. A cached invalidation endpoint would be
 * a genuinely funny bug.
 */
export const dynamic = 'force-dynamic';

const SECRET_HEADER = 'x-timberland-revalidate-secret';

interface RevalidatePayload {
  purgeAll?: boolean;
  tags?: unknown;
  paths?: unknown;
  timestamp?: number;
}

/**
 * Tags revalidated when WordPress says everything changed.
 *
 * `purgeAll` arrives when route resolution itself changed — the permalink
 * structure, the front-page setting, posts-per-page — or when one request
 * touched more content than it was worth enumerating (a bulk edit or an
 * importer). There is no "revalidate everything" call in Next, so this covers
 * the tags the app actually attaches. `revalidatePath('/', 'layout')` then
 * sweeps the rendered-page cache for every route beneath it.
 */
const PURGE_ALL_TAGS = ['site'];

/** Reject absurd input before it reaches the cache API. */
function toStringArray(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string' && v.length > 0 && v.length < 512)
    .slice(0, limit);
}

/**
 * Only same-origin, absolute-rooted paths.
 *
 * WordPress already sends relative paths, but this endpoint is reachable by
 * anyone holding the secret, and `revalidatePath` with attacker-chosen input is
 * not something to leave unbounded. A protocol-relative `//evil.example` would
 * otherwise pass a naive `startsWith('/')` check.
 */
function safePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('..');
}

export async function POST(request: Request) {
  const secret = process.env.WP_REVALIDATE_SECRET;

  if (!secret) {
    console.error('[revalidate] WP_REVALIDATE_SECRET is not set — refusing all requests.');
    return Response.json({ error: 'Revalidation is not configured.' }, { status: 503 });
  }

  const provided = request.headers.get(SECRET_HEADER) ?? '';

  // Constant-time compare. Length is checked first because timingSafeEqual
  // throws on a length mismatch, and the length of a secret is not the part
  // worth protecting.
  const { timingSafeEqual } = await import('node:crypto');
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: 'Forbidden.' }, { status: 403 });
  }

  let payload: RevalidatePayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const purgeAll = payload.purgeAll === true;
  const tags = purgeAll ? PURGE_ALL_TAGS : toStringArray(payload.tags, 100);
  const paths = purgeAll ? [] : toStringArray(payload.paths, 100).filter(safePath);

  // `{ expire: 0 }` rather than the bare `revalidateTag(tag)` or `'max'`, and
  // the difference matters.
  //
  // Next 16 made the second argument required. Omitting it still works but logs
  // a deprecation warning telling you to pass `'max'` or use `updateTag` —
  // and `updateTag` throws outright in a route handler (it is Server
  // Actions only), so that half of the advice does not apply here.
  //
  // `'max'` resolves to a cacheLife profile with a large `expire`, which in
  // `revalidate.js` means the tag is marked stale but the rendered path is NOT
  // force-revalidated — stale-while-revalidate. The first visitor after a
  // publish would still be served the old page. That is precisely the symptom
  // this endpoint exists to remove.
  //
  // An explicit `{ expire: 0 }` satisfies the required-argument rule while
  // taking the same immediate-expiry branch as the deprecated single-arg call
  // (`if (!profile || cacheLife?.expire === 0)`), so the next request renders
  // fresh.
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  if (purgeAll) {
    // 'layout' rather than 'page' so every route nested under / is swept, not
    // just the home page itself.
    revalidatePath('/', 'layout');
  }

  // The redirect table lives in an in-process `TtlCache`, not the Data Cache,
  // so `revalidateTag` and `revalidatePath` do not touch it. Without this a
  // permalink-structure change — which is exactly what `purgeAll` reports —
  // leaves the middleware matching against a stale redirect table for up to
  // five more minutes.
  //
  // Only on purgeAll: the table is one small query, but re-fetching it on every
  // ordinary post save would be pointless work, since redirect rules do not
  // change when a post's content does.
  const clearedCaches = purgeAll ? clearAllCaches() : [];

  return Response.json({
    revalidated: true,
    purgeAll,
    tags,
    paths,
    clearedCaches,
    at: Date.now(),
  });
}

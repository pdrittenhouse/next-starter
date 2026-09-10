/**
 * WordPress redirect lookup, backed by the `redirects` GraphQL field.
 *
 * Replaces the previous approach in `utils.ts#checkRedirects()`, which made a
 * live `fetch(uri, { redirect: 'manual' })` against WordPress on EVERY
 * non-homepage request and read the `Location` header. That cost a full
 * WordPress page render per front-end request — measured at ~0.47s, paid before
 * the node fetch. Its `controller.abort()` also fired after `await`, so the
 * response had already arrived and the abort saved nothing.
 *
 * The trade-off: the old probe was mechanism-agnostic, catching redirects from
 * any source. This reads the Redirection plugin's table via `GET_REDIRECTS`,
 * which had been dead code. Anything redirecting outside that table (a
 * `wp_redirect` in a theme hook, a server rewrite) is no longer honoured. In
 * exchange the per-request cost drops to zero once the table is cached.
 */

import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_REDIRECTS } from '@/lib/wp/queries';
import { TtlCache } from '@/lib/cache/ttlCache';

export interface RedirectRule {
  from: string;
  to: string;
  statusCode: number;
  /** Redirection plugin match type, e.g. 'url' or 'regex'. */
  matchType?: string | null;
}

export interface RedirectMatch {
  to: string;
  statusCode: number;
}

const TABLE_KEY = 'redirects';

/**
 * One entry, refreshed every 5 minutes and servable stale for another 5 while
 * refreshing. Redirects change rarely; a few minutes of staleness is a fair
 * price for removing a WordPress round trip from the request path.
 */
const tableCache = new TtlCache<RedirectRule[]>({
  ttlMs: 5 * 60_000,
  staleMs: 5 * 60_000,
  maxEntries: 1,
  name: 'redirectTable',
});

async function loadTable(): Promise<RedirectRule[]> {
  const { data, errors } = await fetchGraphQL<{ redirects: RedirectRule[] | null }>(
    print(GET_REDIRECTS),
  );

  if (errors?.length) {
    console.error('[redirects] GraphQL errors loading the redirect table:', errors);
    // Cache the empty result rather than retrying per request — a broken query
    // should not reintroduce a per-request WordPress call.
    return [];
  }

  return data?.redirects ?? [];
}

/** Trailing-slash-insensitive, case-insensitive comparison. */
function normalise(uri: string): string {
  const trimmed = uri.replace(/\/+$/, '');
  return (trimmed === '' ? '/' : trimmed).toLowerCase();
}

/**
 * Resolve a URI against the redirect table.
 *
 * @param uri  Request path, e.g. `/old-page/`. Query strings should be stripped
 *             by the caller; the Redirection plugin matches on path.
 */
export async function matchRedirect(uri: string): Promise<RedirectMatch | null> {
  const rules = await tableCache.get(TABLE_KEY, loadTable);
  if (!rules.length) return null;

  const target = normalise(uri);

  for (const rule of rules) {
    if (!rule?.from || !rule?.to) continue;

    if (rule.matchType === 'regex') {
      try {
        // Anchored so a rule for `/foo` does not fire on `/barfoobaz`.
        if (new RegExp(`^${rule.from}$`, 'i').test(uri)) {
          return { to: rule.to, statusCode: rule.statusCode || 301 };
        }
      } catch {
        // An invalid pattern in WordPress shouldn't break routing.
        console.warn('[redirects] skipping unparseable regex rule:', rule.from);
      }
      continue;
    }

    if (normalise(rule.from) === target) {
      return { to: rule.to, statusCode: rule.statusCode || 301 };
    }
  }

  return null;
}

/** Testing / cache-invalidation hook. */
export function clearRedirectCache(): void {
  tableCache.clear();
}

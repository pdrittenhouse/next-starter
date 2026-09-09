import type { SearchParams } from '@/lib/wp/utils/paginationArgs';

interface PaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor?: string;
  startCursor?: string;
  /**
   * The current request's query params, passed down from the route. Every
   * template that renders pagination already receives these for
   * `paginationArgs`.
   */
  searchParams?: SearchParams;
}

/**
 * Cursor-based pagination for archive listings.
 * Mirrors: templates/partials/menus/pagination.twig
 *
 * ─── A server component, deliberately ────────────────────────────────────────
 *
 * This was `'use client'` with `usePathname()` and `useSearchParams()`. Two
 * problems, both invisible until you looked:
 *
 *   1. `useSearchParams()` cannot be read during a static render. Any archive
 *      reached through the ISR'd catch-all — a date archive at `/2022`, say —
 *      returned a 500 with `BAILOUT_TO_CLIENT_SIDE_RENDERING`. Wrapping it in
 *      `<Suspense>` would have stopped the 500, but then the server would emit
 *      no pagination at all and crawlers would never see page 2.
 *
 *   2. `usePathname()` returns the REWRITTEN path. The proxy rewrites a cursor
 *      request to `/paged/<path>`, so the hrefs would have carried that
 *      internal prefix.
 *
 * Both go away by building query-only relative hrefs. `?after=X` resolves
 * against the browser's current URL, which is the pre-rewrite one — so the
 * component needs no pathname at all, and is correct under rewrites by
 * construction.
 *
 * Plain `<a>` rather than `next/link`: this is a full server-rendered archive
 * either way, and it keeps the component off the client entirely. astro-starter
 * reaches the same result differently, via `Astro.originPathname` — Astro
 * exposes the pre-rewrite path and Next does not.
 */
export function Pagination({
  hasNextPage,
  hasPreviousPage,
  endCursor,
  startCursor,
  searchParams,
}: PaginationProps) {
  if (!hasNextPage && !hasPreviousPage) return null;

  function buildUrl(cursor: string, direction: 'after' | 'before') {
    const params = new URLSearchParams();
    // Carry the rest of the query through — the search term above all, or
    // paging a search would drop it and page through everything instead.
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (key === 'after' || key === 'before') continue;
      if (typeof value === 'string') params.set(key, value);
      else if (Array.isArray(value) && value[0] != null) params.set(key, value[0]);
    }
    params.set(direction, cursor);
    return `?${params.toString()}`;
  }

  return (
    <div className="pagination-wrapper">
      <div className="container">
        <div className="row">
          <div className="col">
            <nav className="pagination" aria-label="Pagination">
              {hasPreviousPage && startCursor && (
                <a
                  href={buildUrl(startCursor, 'before')}
                  className="pagination-link prev"
                >
                  &laquo; Previous
                </a>
              )}
              {hasNextPage && endCursor && (
                <a
                  href={buildUrl(endCursor, 'after')}
                  className="pagination-link next"
                >
                  Next &raquo;
                </a>
              )}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

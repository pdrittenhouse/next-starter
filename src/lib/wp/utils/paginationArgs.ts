/**
 * Parse cursor pagination parameters into WPGraphQL connection arguments.
 *
 * WPGraphQL follows the Relay spec: forward pagination uses `first` + `after`,
 * backward pagination uses `last` + `before`. The two pairs are mutually
 * exclusive — a non-null `first` alongside `before` is rejected — so this
 * returns one pair or the other rather than merging them.
 *
 * `partials/pagination.tsx` builds `?after=<endCursor>` / `?before=<startCursor>`
 * links and deletes the opposing key, so at most one should ever be present. If
 * both somehow arrive, `after` wins.
 *
 * Unlike the Astro port, which reads `Astro.url` from inside any component, a
 * React Server Component has no access to the request URL. Only the route
 * segment receives `searchParams`, so the resolved object is passed in here and
 * the result threaded down to the list templates as a prop.
 */

export const DEFAULT_PER_PAGE = 10;

export interface PaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  // Index signature so the result is directly assignable to the
  // Record<string, unknown> that fetchGraphQL takes for variables.
  [key: string]: number | string | undefined;
}

/** The shape Next.js resolves `searchParams` to in a route segment. */
export type SearchParams = Record<string, string | string[] | undefined>;

function first_(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * @param searchParams  Resolved `searchParams` from the route segment.
 * @param perPage       Items per page. Defaults to DEFAULT_PER_PAGE.
 */
export function paginationArgs(
  searchParams: SearchParams | undefined,
  perPage: number = DEFAULT_PER_PAGE,
): PaginationArgs {
  const after = first_(searchParams?.after);
  const before = first_(searchParams?.before);

  if (after) {
    return { first: perPage, after };
  }

  if (before) {
    return { last: perPage, before };
  }

  return { first: perPage };
}

/**
 * True when the request is asking for a page other than the first.
 *
 * Useful for suppressing things that should only appear on page 1 (intro copy,
 * a sticky post, a canonical pointing at the unpaginated URL), and for deciding
 * whether a response may be cached or statically generated — a request carrying
 * a cursor generally should not be.
 */
export function isPaginatedRequest(searchParams: SearchParams | undefined): boolean {
  return Boolean(first_(searchParams?.after) || first_(searchParams?.before));
}

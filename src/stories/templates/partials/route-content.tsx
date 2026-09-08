import { cache } from 'react';
import { notFound } from 'next/navigation';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_NODE_BY_URI, GET_READING_SETTINGS, GET_FRONT_PAGE_BY_ID } from '@/lib/wp/queries';
import { HomeTemplate } from '@/stories/templates/home';
import { DateArchiveTemplate } from '@/stories/templates/date-archive';
import { NodeRenderer } from '@/stories/templates/partials/node-renderer';
import type { SearchParams } from '@/lib/wp/utils/paginationArgs';

/**
 * Resolves a WordPress URI to a node and renders it.
 *
 * Extracted from the catch-all so one resolution can serve routes with
 * different rendering characteristics:
 *
 *   /[[...uri]]        prerenderable — passes no searchParams
 *   /paged/[[...uri]]  dynamic — passes cursors through for pagination
 *
 * The split exists because reading `searchParams` in a route makes it dynamic
 * for every request. Keeping cursors out of the main content route is what lets
 * `generateStaticParams` and `revalidate` actually take effect there; both were
 * previously present but inert.
 *
 * Takes no dynamic APIs of its own — `searchParams` is passed in, so a static
 * caller stays static.
 */

/**
 * Detect date archive patterns like /2024/, /2024/03/, /2024/03/15/.
 * Returns parsed date parts or null if not a date pattern.
 */
export function parseDateArchiveUri(segments: string[] | undefined): { year: number; month?: number; day?: number } | null {
  if (!segments || segments.length < 1 || segments.length > 3) return null;
  const year = parseInt(segments[0], 10);
  if (isNaN(year) || year < 1970 || year > 2100) return null;
  if (segments.length === 1) return { year };
  const month = parseInt(segments[1], 10);
  if (isNaN(month) || month < 1 || month > 12) return null;
  if (segments.length === 2) return { year, month };
  const day = parseInt(segments[2], 10);
  if (isNaN(day) || day < 1 || day > 31) return null;
  return { year, month, day };
}

/**
 * Fetch the node data for a given URI from WordPress.
 * Wrapped with React cache() so generateMetadata and the page component
 * share a single fetch per render rather than making duplicate requests.
 */
export const getNodeByUri = cache(async (uri: string) => {
  const { data, errors } = await fetchGraphQL<{ nodeByUri: any }>(
    print(GET_NODE_BY_URI),
    { uri },
    // Opt into caching so callers can prerender. Next 15+ leaves fetch
    // uncached by default, and one uncached fetch forces the whole route
    // dynamic — which is what kept generateStaticParams inert.
    { next: { revalidate: 60 } },
  );
  // Filter WPGraphQL schema validation warnings (e.g. reusableBlock type mismatch
  // after WP 6.3 renamed Reusable Blocks → Synced Patterns). These are schema
  // definition errors that WPGraphQL attaches to every response; they don't affect
  // the returned data and should be fixed by updating WPGraphQL on the WP side.
  const realErrors = errors?.filter(
    (e) => !e.message.includes('is a non-existent Type in the Schema'),
  );
  if (realErrors?.length) {
    console.error('[routing] GraphQL errors for URI:', uri, JSON.stringify(realErrors, null, 2));
  }
  return data?.nodeByUri ?? null;
});

/**
 * Fetch reading settings to determine homepage behavior.
 * Uses GET_READING_SETTINGS — the focused query — instead of the full allSettings.
 */
async function getReadingSettings() {
  const { data } = await fetchGraphQL<{ readingSettings: any }>(
    print(GET_READING_SETTINGS),
    undefined,
    { next: { revalidate: 60 } },
  );
  return {
    showOnFront: data?.readingSettings?.showOnFront ?? 'posts',
    pageOnFront: data?.readingSettings?.pageOnFront ?? 0,
    pageForPosts: data?.readingSettings?.pageForPosts ?? 0,
  };
}

/**
 * Determine which template to render based on the WP node's __typename.
 * Mirrors the WordPress template hierarchy — front-page vs home are separate
 * because their layouts differ fundamentally (static page vs posts listing).
 */
function resolveTemplate(node: any, isHomepage: boolean, isSearch: boolean) {
  if (isSearch) return 'search';

  switch (node?.__typename) {
    case 'Post':
      return 'single';
    case 'Page':
      // The homepage static page routes to front-page; all other pages to page.
      return isHomepage ? 'front-page' : 'page';
    case 'Category':
    case 'Tag':
      return 'archive';
    case 'User':
      return 'author';
    case 'MediaItem':
      return 'single';
    case 'ContentType':
      return 'archive'; // CPT archive pages
    default:
      // Generic ContentNode — check if it's a known CPT single
      if (node?.contentTypeName) return 'single';
      return null;
  }
}

export interface RouteContentProps {
  /** Path segments from the route. Undefined for the site root. */
  uriSegments?: string[];
  /**
   * Resolved searchParams, when the caller has them. Only pagination cursors
   * are read. A prerendered caller passes nothing.
   */
  searchParams?: SearchParams;
}

export async function RouteContent({ uriSegments, searchParams }: RouteContentProps) {
  const uri = uriSegments ? `/${uriSegments.join('/')}/` : '/';
  const isHomepage = uri === '/';

  // Date-based archives — detect /YYYY/, /YYYY/MM/, /YYYY/MM/DD/ patterns
  const dateArchive = parseDateArchiveUri(uriSegments);
  if (dateArchive) {
    return <DateArchiveTemplate {...dateArchive} searchParams={searchParams} />;
  }

  // Short-circuit paths that can never be WordPress content — static assets,
  // WP server paths, and browser auto-requests. Avoids expensive GraphQL calls
  // for things like /favicon.ico, /wp-content/uploads/..., /.well-known/...
  if (uriSegments) {
    const first = uriSegments[0];
    const last = uriSegments[uriSegments.length - 1];
    const staticPrefixes = ['wp-content', 'wp-admin', 'wp-includes', 'wp-json', 'wp-cron.php', '.well-known'];
    const staticExtension = /\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|map|txt|xml|json|woff|woff2|ttf|eot|pdf|zip)$/i;
    if (staticPrefixes.includes(first) || staticExtension.test(last)) {
      notFound();
    }
  }

  const wpBaseUrl = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL?.replace(/\/graphql$/, '') ?? '';

  // Homepage and non-homepage both parallelize their fetches to eliminate waterfalls.
  let node: any = null;
  if (isHomepage) {
    // Fetch settings and the root node simultaneously — settings decides which
    // we use, but the node is ISR-cached and cheap to fetch speculatively.
    const [settings, homeNode] = await Promise.all([
      getReadingSettings(),
      getNodeByUri(uri),
    ]);
    if (settings.showOnFront === 'page' && settings.pageOnFront) {
      // Static front page. nodeByUri('/') should return it, but WPGraphQL Smart Cache
      // can serve a stale null for '/' after the reading settings change. Fall back to
      // fetching the front page directly by database ID.
      if (homeNode) {
        node = homeNode;
      } else {
        const { data } = await fetchGraphQL<{ page: any }>(
          print(GET_FRONT_PAGE_BY_ID),
          { id: String(settings.pageOnFront) },
          { next: { revalidate: 60 } },
        );
        node = data?.page ?? null;
      }
    } else {
      // Blog posts index (showOnFront='posts') — home.php equivalent.
      return <HomeTemplate searchParams={searchParams} />;
    }
  } else {
    // Redirects are resolved in middleware now — see src/middleware.ts. Doing
    // it here would both duplicate that work and force dynamic rendering, since
    // it was an uncached fetch.
    node = await getNodeByUri(uri);
  }

  if (!node) {
    notFound();
  }

  // Rendering lives in NodeRenderer so the preview route can produce identical
  // markup without duplicating the manifest-tree logic. It takes no dynamic
  // APIs of its own, so a statically rendered caller stays static.
  return (
    <NodeRenderer node={node} isHomepage={isHomepage} searchParams={searchParams} />
  );
}

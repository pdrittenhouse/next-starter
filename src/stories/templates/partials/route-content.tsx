import { cache } from 'react';
import { notFound } from 'next/navigation';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_NODE_BY_URI, GET_READING_SETTINGS, GET_FRONT_PAGE_BY_ID } from '@/lib/wp/queries';
import { HomeTemplate } from '@/stories/templates/home';
import { DateArchiveTemplate } from '@/stories/templates/date-archive';
import { NodeRenderer } from '@/stories/templates/partials/node-renderer';
import type { SearchParams } from '@/lib/wp/utils/paginationArgs';
import { normalizeWpNode } from '@/lib/wp/utils/rewriteWpHtml';

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
 * Detect date archive patterns: /YYYY/, /YYYY/MM/, /YYYY/MM/DD/.
 * Returns the parsed parts, or null when the segments aren't a date.
 *
 * Matched with regexes, not `parseInt`. `parseInt` stops at the first
 * non-digit, so `parseInt('2025-2', 10)` is 2025 — which made `/2025-2/` parse
 * as a date archive. That is not a hypothetical slug: `wp_unique_post_slug()`
 * refuses a purely numeric slug for a page and appends a suffix, so `2025-2` is
 * exactly what WordPress hands out when someone names a page "2025".
 */
export function parseDateArchiveUri(segments: string[] | undefined): { year: number; month?: number; day?: number } | null {
  if (!segments || segments.length < 1 || segments.length > 3) return null;

  // WordPress date archives are all-digit segments: a 4-digit year, then a
  // 1-2 digit month and day (both /2024/03/ and /2024/3/ resolve in WP).
  const YEAR = /^\d{4}$/;
  const MONTH_OR_DAY = /^\d{1,2}$/;

  if (!YEAR.test(segments[0])) return null;
  const year = Number(segments[0]);
  if (year < 1970 || year > 2100) return null;
  if (segments.length === 1) return { year };

  if (!MONTH_OR_DAY.test(segments[1])) return null;
  const month = Number(segments[1]);
  if (month < 1 || month > 12) return null;
  if (segments.length === 2) return { year, month };

  if (!MONTH_OR_DAY.test(segments[2])) return null;
  const day = Number(segments[2]);
  if (day < 1 || day > 31) return null;
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
  // Normalised here rather than at the block components that inject
  // renderedHtml, so every render path gets identical treatment from one place.
  return normalizeWpNode(data?.nodeByUri ?? null);
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
 * NOTE: template resolution deliberately does NOT live here.
 *
 * There used to be a `resolveTemplate()` in this file as well as in
 * `node-renderer.tsx`. Only the node-renderer one was ever called; this copy
 * was dead from the moment rendering moved out, and the two had already
 * started to drift. One implementation, in the component that dispatches on it.
 */

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

  // Settings and node in parallel, for every URI rather than just the homepage.
  // The settings are needed off the homepage too, to recognise the Posts page
  // below, and both fetches are ISR-cached so the extra one is close to free.
  //
  // Redirects are resolved in the proxy — see src/proxy.ts. Doing it here
  // would duplicate that work and force dynamic rendering, since it was an
  // uncached fetch.
  let node: any = null;
  const [settings, resolvedNode] = await Promise.all([
    getReadingSettings(),
    getNodeByUri(uri),
  ]);

  if (isHomepage) {
    if (settings.showOnFront === 'page' && settings.pageOnFront) {
      // Static front page. nodeByUri('/') should return it, but WPGraphQL Smart Cache
      // can serve a stale null for '/' after the reading settings change. Fall back to
      // fetching the front page directly by database ID.
      if (resolvedNode) {
        node = resolvedNode;
      } else {
        const { data } = await fetchGraphQL<{ page: any }>(
          print(GET_FRONT_PAGE_BY_ID),
          { id: String(settings.pageOnFront) },
          { next: { revalidate: 60 } },
        );
        node = normalizeWpNode(data?.page ?? null);
      }
    } else {
      // Blog posts index (showOnFront='posts') — home.php equivalent.
      return <HomeTemplate searchParams={searchParams} />;
    }
  } else {
    node = resolvedNode;
  }

  // WordPress's "Posts page" is an ordinary Page node with its own URI, but
  // WordPress renders it with home.php — the blog loop — not the page
  // template. Without this it resolved as a plain page and rendered that page's
  // (almost always empty) content, silently losing the blog index. Returns the
  // same template the homepage uses when showOnFront is 'posts', so both routes
  // to the index render identically.
  if (node && settings.pageForPosts && Number(node.databaseId) === settings.pageForPosts) {
    return <HomeTemplate searchParams={searchParams} />;
  }

  // ─── Synthetic patterns come AFTER WordPress ────────────────────────────────
  //
  // Date archives used to be matched before the node lookup, on the reasoning
  // that a regex is cheaper than a round trip. That made a page slugged like a
  // year UNREACHABLE: `/2025/` matched the pattern, returned early, and
  // rendered an empty date archive over the real page with no error anywhere.
  //
  // Safe to test second because `nodeByUri` returns null for date archives at
  // every depth (verified for /2022/, /2022/01/ and /2022/01/10/) — WordPress
  // has no node for one.
  if (!node) {
    const dateArchive = parseDateArchiveUri(uriSegments);
    if (dateArchive) {
      return <DateArchiveTemplate {...dateArchive} searchParams={searchParams} />;
    }
    notFound();
  }

  // Rendering lives in NodeRenderer so the preview route can produce identical
  // markup without duplicating the manifest-tree logic. It takes no dynamic
  // APIs of its own, so a statically rendered caller stays static.
  return (
    <NodeRenderer node={node} isHomepage={isHomepage} searchParams={searchParams} />
  );
}

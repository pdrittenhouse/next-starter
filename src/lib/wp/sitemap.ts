/**
 * Sitemap generation from WordPress content.
 *
 * ─── Why not just proxy WordPress's own sitemap ──────────────────────────────
 *
 * WordPress core serves `/wp-sitemap.xml` and it works (verified: 200,
 * application/xml). It is also the wrong thing to serve from a headless front
 * end, because every `<loc>` in it is absolute against the WORDPRESS origin.
 * Handing that to a crawler points it at the WordPress install — a different
 * host in production, frequently not meant to be publicly reachable — which is
 * the same defect that made content links and nav menus wrong before
 * `rewriteWpHtml` and the menu `path` fix.
 *
 * So the sitemap is built here, from front-end URLs.
 *
 * ─── What goes in ────────────────────────────────────────────────────────────
 *
 *   - the site root
 *   - every published content node: posts, pages and CPT singles, from the same
 *     `listContentUris()` the prerender path uses, so the two cannot disagree
 *   - category and tag archives that actually have posts
 *   - author archives for users who actually have posts
 *   - date archives derived from post publish dates (year and month)
 *
 * What stays out:
 *
 *   - URIs that collide with this app's own routes (`isAppRoute`) — WordPress
 *     content only; the author archive is itself an app route and is exempt,
 *     see `add()`
 *   - URIs the redirect table matches — a URL that 301s does not belong in a
 *     sitemap, and the table is already cached for middleware
 *   - empty terms and authors with no posts, which would be thin pages
 *   - paginated views (`?after=`), which are `noindex` anyway
 *
 * Day archives (`/YYYY/MM/DD/`) are omitted: one URL per publishing day is a
 * lot of very thin pages, and they duplicate the month archive above them. The
 * routes still resolve if something links to them — `parseDateArchiveUri`
 * handles three segments — they are simply not advertised.
 *
 * Whether archive pages belong in a sitemap at all is a judgement call: they
 * duplicate the posts they list, and plenty of sites `noindex` them. These
 * starters do not (only cursor-paged views are noindex), so listing them is
 * consistent with what the site actually serves. If a project decides to
 * noindex archives, remove them here too — a sitemap should only advertise
 * indexable URLs.
 *
 * Mirrors astro-starter's lib/wp/sitemap.ts — the two starters should advertise
 * identical URL sets for identical content.
 */

import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import {
  GET_ALL_CATEGORY_URIS,
  GET_ALL_TAG_URIS,
  GET_AUTHOR_ARCHIVE_URIS,
  GET_POST_DATES,
} from '@/lib/wp/queries';
import { matchRedirect } from '@/lib/wp/redirectTable';
import { isAppRoute } from '@/lib/routes';
import { listContentUris } from '@/lib/wp/contentUris';

export interface SitemapEntry {
  /** Absolute front-end URL. */
  loc: string;
  /** ISO-8601 date, when WordPress knows one. */
  lastmod?: string;
}

interface TermEdge {
  node: { uri?: string | null; count?: number | null };
}

/** Terms with posts, as root-relative URIs. */
async function termUris(): Promise<string[]> {
  const [cats, tags] = await Promise.all([
    fetchGraphQL<{ categories: { edges: TermEdge[] } }>(print(GET_ALL_CATEGORY_URIS))
      .catch(() => ({ data: null })),
    fetchGraphQL<{ tags: { edges: TermEdge[] } }>(print(GET_ALL_TAG_URIS))
      .catch(() => ({ data: null })),
  ]);

  const edges = [
    ...(((cats as any)?.data?.categories?.edges ?? []) as TermEdge[]),
    ...(((tags as any)?.data?.tags?.edges ?? []) as TermEdge[]),
  ];

  // Terms are non-fatal, unlike the content listing: a sitemap missing archives
  // is degraded, one missing every post is broken. See listContentUris.
  return edges
    .filter((e) => e.node?.uri && (e.node.count ?? 0) > 0)
    .map((e) => e.node.uri as string);
}

/** Author archive URIs for users with published posts. */
async function authorUris(): Promise<string[]> {
  const res = await fetchGraphQL<{ users: { nodes: { uri?: string | null }[] } }>(
    print(GET_AUTHOR_ARCHIVE_URIS),
  ).catch(() => ({ data: null }));

  return (((res as any)?.data?.users?.nodes ?? []) as { uri?: string | null }[])
    .map((n) => n.uri)
    .filter((uri): uri is string => Boolean(uri));
}

/**
 * Date archive URIs derived from post publish dates: `/YYYY/` and `/YYYY/MM/`.
 *
 * Derived by slicing the date STRING, not by parsing it into a Date. WordPress
 * returns site-local time with no zone ("2022-01-10T17:45:12"), which is
 * already the value the archive URL uses. Parsing it and reading UTC parts
 * would shift a post published near midnight on the 1st into the previous
 * month, and advertise an archive URL that lists nothing.
 */
async function dateArchiveUris(): Promise<string[]> {
  const res = await fetchGraphQL<{ posts: { nodes: { date?: string | null }[] } }>(
    print(GET_POST_DATES),
  ).catch(() => ({ data: null }));

  const dates = (((res as any)?.data?.posts?.nodes ?? []) as { date?: string | null }[])
    .map((n) => n.date)
    .filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}/.test(d));

  const years = new Set<string>();
  const months = new Set<string>();
  for (const d of dates) {
    years.add(d.slice(0, 4));
    months.add(`${d.slice(0, 4)}/${d.slice(5, 7)}`);
  }

  // Years first, then months, each ascending — a stable, readable ordering.
  return [
    ...[...years].sort().map((y) => `/${y}/`),
    ...[...months].sort().map((ym) => `/${ym}/`),
  ];
}

/** WordPress dates arrive without a zone ("2026-03-15T00:41:53"). */
function toIsoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

/**
 * Collect every URL the sitemap should list.
 *
 * @param origin Absolute front-end origin, e.g. `https://example.com`, with no
 *               trailing slash. Taken from the request rather than config so a
 *               staging deploy does not advertise production URLs.
 */
export async function collectSitemapUrls(origin: string): Promise<SitemapEntry[]> {
  const [nodes, terms, authors, dateArchives] = await Promise.all([
    listContentUris(),
    termUris(),
    authorUris(),
    dateArchiveUris(),
  ]);

  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];

  const add = async (
    uri: string,
    lastmod?: string,
    opts: { isOwnRoute?: boolean } = {},
  ) => {
    if (!uri || seen.has(uri)) return;

    // `isAppRoute` exists to stop WordPress CONTENT shadowing this app's own
    // routes, so it must not be applied to the app's own routes. The author
    // archive is exactly that case: `/author/…` is an app route that renders
    // WordPress data, and checking it here silently dropped every author
    // archive from the sitemap on the first run.
    if (!opts.isOwnRoute && isAppRoute(uri)) return;

    if (await matchRedirect(uri).catch(() => null)) return;
    seen.add(uri);
    entries.push({ loc: `${origin}${uri}`, lastmod });
  };

  // The root first — the front page is the one URL guaranteed to exist, and
  // crawlers weight document order.
  const root = nodes.find((n) => n.uri === '/');
  await add('/', toIsoDate(root?.modified));

  for (const node of nodes) {
    await add(node.uri, toIsoDate(node.modified));
  }
  for (const uri of terms) {
    await add(uri);
  }
  for (const uri of authors) {
    await add(uri, undefined, { isOwnRoute: true });
  }
  for (const uri of dateArchives) {
    await add(uri);
  }

  return entries;
}

/** Serialise entries as a urlset. Escapes the five XML entities in `loc`. */
export function renderSitemapXml(entries: SitemapEntry[]): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const urls = entries
    .map(({ loc, lastmod }) => {
      const parts = [`    <loc>${escape(loc)}</loc>`];
      if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

import { print } from 'graphql';
import type { Metadata } from 'next';
import {
  RouteContent,
  parseDateArchiveUri,
  getNodeByUri,
} from '@/stories/templates/partials/route-content';
import { fetchGraphQL } from '@/lib/wp/client';
import { isAppRoute } from '@/lib/routes';
import {
  GET_NODE_BY_URI,
  GET_READING_SETTINGS,
} from '@/lib/wp/queries';
import { listContentUris } from '@/lib/wp/contentUris';

interface PageProps {
  params: Promise<{ uri?: string[] }>;
  // No searchParams. Declaring it would invite a future edit to await it, and a
  // single await here forces the whole route dynamic.
}

/**
 * ISR — revalidate every 60 seconds.
 *
 * This now actually takes effect. The route previously declared `revalidate`
 * and `generateStaticParams` but read `searchParams`, `cookies()` and
 * `draftMode()` on every request, which forced dynamic rendering and made both
 * inert — the build reported it as `f (Dynamic)`.
 *
 * Those concerns moved out:
 *   search      -> /search
 *   cursors     -> /paged/*
 *   preview     -> /preview/*
 * The first two are reached by a proxy rewrite (see src/proxy.ts), so public
 * URLs are unchanged; WordPress's own `/?s=query` links still work.
 */
export const revalidate = 60;

interface PageProps {
  params: Promise<{ uri?: string[] }>;
}

export default async function CatchAllPage({ params }: PageProps) {
  const { uri: uriSegments } = await params;

  // Deliberately no searchParams — that omission is what keeps this
  // prerenderable. Resolution and rendering live in RouteContent.
  return <RouteContent uriSegments={uriSegments} />;
}

/**
 * Generate static params for all known WordPress URIs.
 * This pre-renders posts and pages at build time.
 */
const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "2024" / "March 2024" / "March 15, 2024" — mirrors the date-archive heading. */
export function formatDateArchiveTitle(
  dateArchive: { year: number; month?: number; day?: number },
): string {
  if (dateArchive.month && MONTH_NAMES[dateArchive.month]) {
    return dateArchive.day
      ? `${MONTH_NAMES[dateArchive.month]} ${dateArchive.day}, ${dateArchive.year}`
      : `${MONTH_NAMES[dateArchive.month]} ${dateArchive.year}`;
  }
  return `${dateArchive.year}`;
}

export async function generateStaticParams() {
  // One query across every post type, rather than `posts` + `pages`. Those two
  // named the types explicitly, so a custom post type was never prerendered no
  // matter how much content it had — every CPT single fell to the ISR fallback
  // forever.
  //
  // The content listing is retried, then FATAL. It used to `.catch()` into
  // `{ data: null }` with no log at all, so a WordPress hiccup produced a build
  // that exited 0 having prerendered nothing but the front page. astro-starter
  // hit exactly that: a transient `405 Not Allowed` left a site with no posts,
  // no pages and no CPT singles, reported as success.
  //
  // A build must not silently ship a site missing all of its content. The
  // retries absorb the transient failures a local WordPress produces under the
  // build's own load; anything surviving three attempts stops the build.
  //
  // The reading settings stay non-fatal — they only decide whether to skip the
  // Posts page, and defaulting to "no Posts page" prerenders one extra URL
  // rather than losing the whole site.
  const [contentNodes, settingsResult] = await Promise.all([
    listContentUris(),
    fetchGraphQL<{ readingSettings: { pageForPosts: number } }>(
      print(GET_READING_SETTINGS),
    ).catch(() => ({ data: null })),
  ]);

  // WordPress's "Posts page" is an ordinary Page node, but WordPress renders it
  // with the blog loop — so it paginates, and a cursor arrives as `?after=`,
  // which the proxy rewrites to /paged/*. Prerendering it here is wasted work
  // at best; matched by database ID, which is why GET_ALL_PAGE_URIS selects it.
  const pageForPosts = Number((settingsResult as any)?.data?.readingSettings?.pageForPosts ?? 0);

  const uris: { uri: string[] }[] = [];

  // Add homepage
  uris.push({ uri: [] });

  const add = (uri: string | undefined, databaseId?: number) => {
    if (!uri) return;
    const segments = uri.replace(/^\/|\/$/g, '').split('/');
    if (!segments[0]) return;

    // A WordPress page slugged `search` or `data` would otherwise be prerendered
    // over one of this app's own routes. Next gives the real route priority, so
    // the entry is merely dead rather than harmful — but generating it hides a
    // genuine content collision that someone should know about.
    if (isAppRoute(uri)) {
      console.warn(`[build] skipping ${uri} — collides with an app route`);
      return;
    }

    if (pageForPosts && databaseId != null && Number(databaseId) === pageForPosts) {
      console.warn(`[build] skipping ${uri} — it is the Posts page, which paginates`);
      return;
    }

    uris.push({ uri: segments });
  };

  for (const node of contentNodes) {
    add(node?.uri, node?.databaseId);
  }

  return uris;
}

/**
 * Generate metadata (SEO) from the WordPress node's SEO fields.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uri: uriSegments } = await params;
  const uri = uriSegments ? `/${uriSegments.join('/')}/` : '/';

  // No searchParams here either. generateMetadata awaiting searchParams forces
  // the route dynamic exactly as the page component would — which is what kept
  // this route off the static path even after the component stopped reading it.
  // Search metadata belongs to /search, which owns its own generateMetadata.

  // Mirror the static-path early exit from the page component — avoids a slow
  // GraphQL call for paths that can never have WP metadata.
  if (uriSegments) {
    const first = uriSegments[0];
    const last = uriSegments[uriSegments.length - 1];
    const staticPrefixes = ['wp-content', 'wp-admin', 'wp-includes', 'wp-json', 'wp-cron.php', '.well-known'];
    const staticExtension = /\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|map|txt|xml|json|woff|woff2|ttf|eot|pdf|zip)$/i;
    if (staticPrefixes.includes(first) || staticExtension.test(last)) {
      return {};
    }
  }

  // WordPress before synthetic patterns, matching RouteContent. When these two
  // disagreed, the page rendered a post at /2025/ while the tab still said
  // "Archives: 2025" — the body was right and only the title was wrong, which
  // is exactly the kind of mismatch nobody notices.
  //
  // Free to do in this order: getNodeByUri is wrapped in React `cache()`, so
  // this shares the page component's fetch rather than adding one.
  const node = await getNodeByUri(uri);

  if (!node) {
    const dateArchive = parseDateArchiveUri(uriSegments);
    if (dateArchive) {
      return { title: `Archives: ${formatDateArchiveTitle(dateArchive)}` };
    }
    return { title: 'Page Not Found' };
  }

  const seo = node.seo;

  if (!seo) {
    return {
      title: node.title ?? node.name ?? 'Untitled',
    };
  }

  return {
    title: seo.title || node.title || node.name,
    description: seo.description || undefined,
    openGraph: {
      title: seo.ogTitle || seo.title || node.title,
      description: seo.ogDescription || seo.description || undefined,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      type: seo.ogType || 'website',
    },
    twitter: {
      card: seo.twitterCard || 'summary_large_image',
      title: seo.twitterTitle || seo.ogTitle || seo.title,
      description: seo.twitterDescription || seo.ogDescription || seo.description || undefined,
      images: seo.twitterImage ? [seo.twitterImage] : undefined,
    },
    alternates: {
      canonical: seo.canonicalUrl || undefined,
    },
  };
}

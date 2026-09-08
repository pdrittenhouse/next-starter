import { print } from 'graphql';
import type { Metadata } from 'next';
import {
  RouteContent,
  parseDateArchiveUri,
  getNodeByUri,
} from '@/stories/templates/partials/route-content';
import { fetchGraphQL } from '@/lib/wp/client';
import {
  GET_NODE_BY_URI,
  GET_ALL_POST_URIS,
  GET_ALL_PAGE_URIS,
  GET_READING_SETTINGS,
} from '@/lib/wp/queries';

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
 * The first two are reached by middleware rewrite, so public URLs are
 * unchanged; WordPress's own `/?s=query` links still work.
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
export async function generateStaticParams() {
  const [postsResult, pagesResult] = await Promise.all([
    fetchGraphQL<{ posts: { edges: { node: { uri: string } }[] } }>(
      print(GET_ALL_POST_URIS),
    ).catch(() => ({ data: null })),
    fetchGraphQL<{ pages: { edges: { node: { uri: string } }[] } }>(
      print(GET_ALL_PAGE_URIS),
    ).catch(() => ({ data: null })),
  ]);

  const uris: { uri: string[] }[] = [];

  // Add homepage
  uris.push({ uri: [] });

  // Add posts
  const posts = (postsResult as any)?.data?.posts?.edges ?? [];
  for (const { node } of posts) {
    if (node.uri) {
      const segments = node.uri.replace(/^\/|\/$/g, '').split('/');
      if (segments[0]) uris.push({ uri: segments });
    }
  }

  // Add pages
  const pages = (pagesResult as any)?.data?.pages?.edges ?? [];
  for (const { node } of pages) {
    if (node.uri) {
      const segments = node.uri.replace(/^\/|\/$/g, '').split('/');
      if (segments[0]) uris.push({ uri: segments });
    }
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

  const dateArchive = parseDateArchiveUri(uriSegments);
  if (dateArchive) {
    const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let title = `${dateArchive.year}`;
    if (dateArchive.month && MONTH_NAMES[dateArchive.month]) {
      title = dateArchive.day
        ? `${MONTH_NAMES[dateArchive.month]} ${dateArchive.day}, ${dateArchive.year}`
        : `${MONTH_NAMES[dateArchive.month]} ${dateArchive.year}`;
    }
    return { title: `Archives: ${title}` };
  }

  const node = await getNodeByUri(uri);

  if (!node) {
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

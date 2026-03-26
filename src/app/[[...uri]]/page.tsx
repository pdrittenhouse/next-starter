import { notFound, redirect } from 'next/navigation';
import { draftMode } from 'next/headers';
import { print } from 'graphql';
import type { Metadata } from 'next';
import { fetchGraphQL } from '@/lib/wp/client';
import {
  GET_NODE_BY_URI,
  GET_PREVIEW_POST,
  GET_POSTS_BY_DATE,
  GET_ALL_POST_URIS,
  GET_ALL_PAGE_URIS,
  GET_ALL_SETTINGS,
} from '@/lib/wp/queries';
import { checkRedirects } from '@/lib/wp/utils';
import { SingleTemplate } from '@/stories/templates/single';
import { PageTemplate } from '@/stories/templates/page';
import { FrontPageTemplate } from '@/stories/templates/front-page';
import { ArchiveTemplate } from '@/stories/templates/archive';
import { SearchTemplate } from '@/stories/templates/search';
import { DateArchiveTemplate } from '@/stories/templates/date-archive';

interface PageProps {
  params: Promise<{ uri?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Detect date archive patterns like /2024/, /2024/03/, /2024/03/15/.
 * Returns parsed date parts or null if not a date pattern.
 */
function parseDateArchiveUri(segments: string[] | undefined): { year: number; month?: number; day?: number } | null {
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
 */
async function getNodeByUri(uri: string) {
  const { data, errors } = await fetchGraphQL<{ nodeByUri: any }>(
    print(GET_NODE_BY_URI),
    { uri },
  );
  if (errors?.length) {
    console.error('[routing] GraphQL errors for URI:', uri, errors);
  }
  return data?.nodeByUri ?? null;
}

/**
 * Fetch reading settings to determine homepage behavior.
 */
async function getReadingSettings() {
  const { data } = await fetchGraphQL<{ allSettings: any }>(
    print(GET_ALL_SETTINGS),
  );
  return {
    showOnFront: data?.allSettings?.readingSettingsShowOnFront ?? 'posts',
    pageOnFront: data?.allSettings?.readingSettingsPageOnFront ?? 0,
    pageForPosts: data?.allSettings?.readingSettingsPageForPosts ?? 0,
  };
}

/**
 * Determine which template to render based on the WP node's __typename.
 */
function resolveTemplate(node: any, isHomepage: boolean, isSearch: boolean) {
  if (isSearch) return 'search';
  if (isHomepage) return 'front-page';

  switch (node?.__typename) {
    case 'Post':
      return 'single';
    case 'Page':
      return 'page';
    case 'Category':
    case 'Tag':
      return 'archive';
    case 'MediaItem':
      return 'single'; // media items render like singles
    case 'ContentType':
      return 'archive'; // CPT archive pages
    default:
      // Generic ContentNode — check if it's a known CPT single
      if (node?.contentTypeName) return 'single';
      return null;
  }
}

/** ISR — revalidate pages every 60 seconds. */
export const revalidate = 60;

export default async function CatchAllPage({ params, searchParams }: PageProps) {
  const { uri: uriSegments } = await params;
  const resolvedSearchParams = await searchParams;
  const uri = uriSegments ? `/${uriSegments.join('/')}/` : '/';
  const isHomepage = uri === '/';
  const isSearch = resolvedSearchParams?.s !== undefined;
  const { isEnabled: isPreview } = await draftMode();

  // Handle search
  if (isSearch) {
    const searchQuery = Array.isArray(resolvedSearchParams.s)
      ? resolvedSearchParams.s[0]
      : resolvedSearchParams.s;
    return <SearchTemplate query={searchQuery ?? ''} />;
  }

  // Preview mode — fetch draft content by ID
  if (isPreview && resolvedSearchParams?.preview_id) {
    const previewId = Array.isArray(resolvedSearchParams.preview_id)
      ? resolvedSearchParams.preview_id[0]
      : resolvedSearchParams.preview_id;
    const { data } = await fetchGraphQL<{ contentNode: any }>(
      print(GET_PREVIEW_POST),
      { id: previewId, idType: 'DATABASE_ID' },
      { useAuth: true },
    );
    const previewNode = data?.contentNode;
    if (!previewNode) {
      notFound();
    }
    const previewTemplate = resolveTemplate(previewNode, false, false);
    return previewTemplate === 'single'
      ? <SingleTemplate node={previewNode} />
      : <PageTemplate node={previewNode} />;
  }

  // Date-based archives — detect /YYYY/, /YYYY/MM/, /YYYY/MM/DD/ patterns
  const dateArchive = parseDateArchiveUri(uriSegments);
  if (dateArchive) {
    return <DateArchiveTemplate {...dateArchive} />;
  }

  // Check for redirects BEFORE resolving the node — redirects take priority
  // over existing content (e.g. /hello-world may be a real post but also
  // have a redirect configured in the Redirection plugin).
  if (!isHomepage) {
    const wpBaseUrl = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL?.replace(/\/graphql$/, '') ?? '';
    const match = await checkRedirects(uri, wpBaseUrl);
    if (match) {
      redirect(match.to);
    }
  }

  // Fetch reading settings for homepage logic
  let node: any = null;
  if (isHomepage) {
    const settings = await getReadingSettings();
    if (settings.showOnFront === 'page' && settings.pageOnFront) {
      // Static front page — fetch that page's data
      node = await getNodeByUri(uri);
    } else {
      // Blog listing homepage
      return <FrontPageTemplate type="posts" />;
    }
  } else {
    node = await getNodeByUri(uri);
  }

  if (!node) {
    notFound();
  }

  const template = resolveTemplate(node, isHomepage, false);

  switch (template) {
    case 'front-page':
      return <FrontPageTemplate type="page" node={node} />;
    case 'single':
      return <SingleTemplate node={node} />;
    case 'page':
      return <PageTemplate node={node} />;
    case 'archive':
      return <ArchiveTemplate node={node} />;
    default:
      // Fallback: render as page
      return <PageTemplate node={node} />;
  }
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
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { uri: uriSegments } = await params;
  const resolvedSearchParams = await searchParams;
  const uri = uriSegments ? `/${uriSegments.join('/')}/` : '/';
  const isSearch = resolvedSearchParams?.s !== undefined;

  if (isSearch) {
    const query = Array.isArray(resolvedSearchParams.s)
      ? resolvedSearchParams.s[0]
      : resolvedSearchParams.s;
    return {
      title: `Search results for "${query ?? ''}"`,
    };
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

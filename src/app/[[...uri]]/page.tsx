import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { draftMode } from 'next/headers';
import { print } from 'graphql';
import type { Metadata } from 'next';
import { fetchGraphQL, fetchWpRest } from '@/lib/wp/client';
import {
  GET_NODE_BY_URI,
  GET_PREVIEW_POST,
  GET_POSTS_BY_DATE,
  GET_ALL_POST_URIS,
  GET_ALL_PAGE_URIS,
  GET_READING_SETTINGS,
  GET_FRONT_PAGE_BY_ID,
} from '@/lib/wp/queries';
import type { TimberlandPatternManifest, TimberlandTreeNode } from '@/lib/wp/types/template-manifest';
import { checkRedirects } from '@/lib/wp/utils';
import { SingleTemplate } from '@/stories/templates/single';
import { PageTemplate } from '@/stories/templates/page';
import { FrontPageTemplate } from '@/stories/templates/front-page';
import { HomeTemplate } from '@/stories/templates/home';
import { ArchiveTemplate } from '@/stories/templates/archive';
import { AuthorTemplate } from '@/stories/templates/author';
import { SearchTemplate } from '@/stories/templates/search';
import { DateArchiveTemplate } from '@/stories/templates/date-archive';
import { TemplateRenderer } from '@/stories/templates/partials/template-renderer';
import { buildBlockTree } from '@/lib/wp/utils/blockTree';

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
 * Wrapped with React cache() so generateMetadata and the page component
 * share a single fetch per render rather than making duplicate requests.
 */
const getNodeByUri = cache(async (uri: string) => {
  const { data, errors } = await fetchGraphQL<{ nodeByUri: any }>(
    print(GET_NODE_BY_URI),
    { uri },
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

// Maps the resolved template name (from resolveTemplate()) to the manifest key
// used in the TemplateManifestPlugin output (webpack entry name).
const TEMPLATE_MANIFEST_KEYS: Record<string, string> = {
  'page': 'pages/page',
  'front-page': 'pages/front-page',
  'single': 'pages/single',
  'archive': 'pages/archive',
  'home': 'pages/home',
  'author': 'pages/author',
  'search': 'pages/search',
};

/**
 * Fetch the template patterns manifest (version, patterns, per-template trees).
 * Uses the WP REST endpoint instead of GraphQL to avoid the depth limit imposed
 * by manually nested `children` fields in a GraphQL query.
 * Cached per render via React cache() — no duplicate fetches within one render tree.
 */
const getTemplatePatterns = cache(async (): Promise<TimberlandPatternManifest | null> => {
  try {
    return await fetchWpRest<TimberlandPatternManifest>('/timberland/v1/template-patterns');
  } catch (err) {
    console.error('[template-patterns] REST fetch failed:', err);
    return null;
  }
});

/**
 * Fetch reading settings to determine homepage behavior.
 * Uses GET_READING_SETTINGS — the focused query — instead of the full allSettings.
 */
async function getReadingSettings() {
  const { data } = await fetchGraphQL<{ readingSettings: any }>(
    print(GET_READING_SETTINGS),
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
    const previewPerPostRCC = previewNode?.settingsPageOptions?.removeContentContainer === true ||
                              previewNode?.settingsPostOptions?.removeContentContainer === true;
    const previewTemplate = resolveTemplate(previewNode, false, false);
    if (previewTemplate === 'single') return <SingleTemplate node={previewNode} removeContentContainerPerPost={previewPerPostRCC} />;
    if (previewTemplate === 'archive') return <ArchiveTemplate node={previewNode} />;
    return <PageTemplate node={previewNode} removeContentContainerPerPost={previewPerPostRCC} />;
  }

  // Date-based archives — detect /YYYY/, /YYYY/MM/, /YYYY/MM/DD/ patterns
  const dateArchive = parseDateArchiveUri(uriSegments);
  if (dateArchive) {
    return <DateArchiveTemplate {...dateArchive} />;
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
        );
        node = data?.page ?? null;
      }
    } else {
      // Blog posts index (showOnFront='posts') — home.php equivalent.
      return <HomeTemplate />;
    }
  } else {
    // Redirect check and node fetch run concurrently. The redirect result is
    // evaluated first so it still takes priority over existing content.
    const [match, fetchedNode] = await Promise.all([
      checkRedirects(uri, wpBaseUrl),
      getNodeByUri(uri),
    ]);
    if (match) redirect(match.to);
    node = fetchedNode;
  }

  if (!node) {
    notFound();
  }

  const template = resolveTemplate(node, isHomepage, false);
  // Per-post container override — mirrors WP TemplateHelpers remove_content_container.
  const perPostRCC = node?.settingsPageOptions?.removeContentContainer === true ||
                     node?.settingsPostOptions?.removeContentContainer === true;

  // Attempt to resolve a manifest tree for this template so TemplateRenderer
  // can drive the layout. Falls back to the static template components when
  // no manifest entry exists (manifest not built, unknown template key, etc.).
  const manifestKey = template ? TEMPLATE_MANIFEST_KEYS[template] : undefined;
  const manifest = manifestKey ? await getTemplatePatterns() : null;
  const manifestEntry = manifest?.templates?.find(t => t.key === manifestKey);
  const tree = manifestEntry?.tree ?? null;

  // When a manifest tree is available, TemplateRenderer handles the layout.
  // It renders registered PATTERN_MAP components and places BlockRenderer at
  // the `content` slot. Classic post_content is passed as a fallback so pages
  // that haven't migrated to the block editor still render their content.
  if (tree?.length) {
    // The manifest tree is flat: pre-main patterns (skip-nav, header) come before
    // the named 'content' slot, and post-main patterns (footer, etc.) come after.
    // We insert the <main> structural wrapper only around the content + sidebar
    // slots so that header and footer render outside it — mirroring base.twig.
    const contentIdx = tree.findIndex(n => n.type === 'slot' && n.name === 'content');
    const sidebarIdx = tree.findIndex(n => n.type === 'slot' && n.name === 'sidebar');
    const lastMainIdx = sidebarIdx !== -1 && sidebarIdx === contentIdx + 1
      ? sidebarIdx
      : contentIdx;

    let structuredTree: TimberlandTreeNode[];
    if (contentIdx !== -1) {
      const preMain = tree.slice(0, contentIdx);
      const postMain = tree.slice(lastMainIdx + 1);
      const innerSlots = tree.slice(contentIdx, lastMainIdx + 1);

      // front-page.twig wraps its content slot in homepage-specific structural divs.
      // The manifest tree doesn't include those wrappers, so we inject them here
      // to match the WP output: homepage-content-wrapper > container > row > column.
      const contentSlotNodes = innerSlots.filter(n => n.type === 'slot' && n.name === 'content');
      const wrappedContent: TimberlandTreeNode[] = template === 'front-page'
        ? [{
            type: 'element',
            element: 'section',
            className: 'homepage-content-wrapper',
            children: [{
              type: 'element',
              element: 'div',
              className: 'homepage-content--container',
              children: [{
                type: 'element',
                element: 'div',
                className: 'homepage-content--row',
                children: [{
                  type: 'element',
                  element: 'div',
                  className: 'homepage-content--column',
                  children: contentSlotNodes,
                }],
              }],
            }],
          }]
        : contentSlotNodes;

      const mainChildren: TimberlandTreeNode[] = [
        {
          type: 'element',
          element: 'div',
          className: 'wrapper',
          style: node.contentWrapperStyle ?? null,
          children: wrappedContent,
        },
        // sidebar slot is a sibling of the wrapper, still inside <main>
        ...innerSlots.filter(n => n.type === 'slot' && n.name === 'sidebar'),
      ];

      structuredTree = [
        ...preMain,
        {
          type: 'element',
          element: 'main',
          id: 'content',
          className: node.mainClasses ?? 'content-wrapper',
          children: mainChildren,
        },
        ...postMain,
      ];
    } else {
      // No content slot found — fall back to wrapping the entire tree.
      structuredTree = tree;
    }

    return (
      <TemplateRenderer
        tree={structuredTree}
        editorBlocks={buildBlockTree(node.editorBlocks ?? [])}
        content={node.content ?? undefined}
        sidebarSlug={node.sidebarSlug ?? null}
        removeContentContainerPerPost={perPostRCC}
      />
    );
  }

  switch (template) {
    case 'front-page':
      return <FrontPageTemplate node={node} removeContentContainerPerPost={perPostRCC} />;
    case 'single':
      return <SingleTemplate node={node} removeContentContainerPerPost={perPostRCC} />;
    case 'page':
      return <PageTemplate node={node} removeContentContainerPerPost={perPostRCC} />;
    case 'archive':
      return <ArchiveTemplate node={node} />;
    case 'author':
      return <AuthorTemplate slug={node.slug} name={node.name} />;
    default:
      // Fallback: render as page
      return <PageTemplate node={node} removeContentContainerPerPost={perPostRCC} />;
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

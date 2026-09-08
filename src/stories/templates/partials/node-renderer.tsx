import { cache } from 'react';
import type { TimberlandPatternManifest, TimberlandTreeNode } from '@/lib/wp/types/template-manifest';
import { SingleTemplate } from '@/stories/templates/single';
import { PageTemplate } from '@/stories/templates/page';
import { FrontPageTemplate } from '@/stories/templates/front-page';
import { ArchiveTemplate } from '@/stories/templates/archive';
import { AuthorTemplate } from '@/stories/templates/author';
import { TemplateRenderer } from '@/stories/templates/partials/template-renderer';
import { buildBlockTree } from '@/lib/wp/utils/blockTree';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_TEMPLATE_PATTERNS } from '@/lib/wp/queries';
import type { SearchParams } from '@/lib/wp/utils/paginationArgs';

/**
 * Renders a resolved WordPress node.
 *
 * Extracted from the catch-all so more than one route can render content
 * without duplicating the manifest-tree logic. Preview needs a dynamic route
 * (it reads a cookie), while published content should be prerenderable — but
 * both have to produce identical markup, so the tree building, the structural
 * wrapper injection and the template dispatch all live here.
 *
 * Deliberately free of dynamic APIs: no cookies(), draftMode() or
 * searchParams access of its own. Anything request-scoped is passed in, so a
 * caller that is statically rendered stays that way.
 */

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
 * Fetch the template-patterns manifest from WordPress.
 * Cached per render via React cache() — no duplicate fetches within one request.
 */
const getTemplatePatterns = cache(async (): Promise<TimberlandPatternManifest | null> => {
  try {
    const { data } = await fetchGraphQL<{ templatePatterns: TimberlandPatternManifest }>(
      print(GET_TEMPLATE_PATTERNS),
      undefined,
      // Cached so a prerendering caller is not forced dynamic by this fetch.
      { next: { revalidate: 60 } },
    );
    return data?.templatePatterns ?? null;
  } catch {
    return null;
  }
});

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

export interface NodeRendererProps {
  /** Resolved WordPress node from nodeByUri / contentNode. */
  node: any;
  /** True when rendering the site front page. */
  isHomepage?: boolean;
  /**
   * Resolved searchParams, when the caller has them. Only the archive template
   * uses them, for pagination cursors. A prerendered caller passes nothing.
   */
  searchParams?: SearchParams;
}

export async function NodeRenderer({ node, isHomepage = false, searchParams }: NodeRendererProps) {
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

    const sidebarColClass = node.sidebarSlug
      ? `col col-${node.sidebarBp ?? 'lg'}-${node.sidebarCol ?? 3}`
      : null;

    let structuredTree: TimberlandTreeNode[];
    if (contentIdx !== -1) {
      const preMain = tree.slice(0, contentIdx);
      const postMain = tree.slice(lastMainIdx + 1);
      const innerSlots = tree.slice(contentIdx, lastMainIdx + 1);

      // front-page.twig wraps its content slot in homepage-specific structural divs.
      // The manifest tree doesn't include those wrappers, so we inject them here
      // to match the WP output. Per-template structures mirror the Twig templates:
      //   front-page → homepage-content-wrapper > container > row > column
      //   page/single → article.post-type-{type} > section.article-content >
      //                 article-content--container > row > column > article-body
      // The sidebar (when configured) is injected as a Bootstrap column sibling
      // inside the row — the manifest never includes a sidebar slot, so we add it here.
      const contentSlotNodes = innerSlots.filter(n => n.type === 'slot' && n.name === 'content');
      let wrappedContent: TimberlandTreeNode[];
      if (template === 'front-page') {
        wrappedContent = [{
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
              children: [
                {
                  type: 'element',
                  element: 'div',
                  className: 'homepage-content--column',
                  children: contentSlotNodes,
                },
                ...(node.sidebarSlug ? [{ type: 'slot' as const, name: 'sidebar' }] : []),
              ],
            }],
          }],
        }];
      } else if (template === 'page' || template === 'single') {
        const postTypeClass = `post-type-${node.contentTypeName ?? (template === 'page' ? 'page' : 'post')}`;
        wrappedContent = [{
          type: 'element',
          element: 'article',
          className: postTypeClass,
          children: [{
            type: 'element',
            element: 'section',
            className: 'article-content',
            children: [{
              type: 'element',
              element: 'div',
              className: 'article-content--container',
              children: [{
                type: 'element',
                element: 'div',
                className: 'article-content--row',
                children: [
                  {
                    type: 'element',
                    element: 'div',
                    className: 'article-content--column',
                    children: [{
                      type: 'element',
                      element: 'div',
                      className: 'article-body',
                      children: contentSlotNodes,
                    }],
                  },
                  ...(node.sidebarSlug ? [{ type: 'slot' as const, name: 'sidebar' }] : []),
                ],
              }],
            }],
          }],
        }];
      } else {
        wrappedContent = contentSlotNodes;
      }

      const mainChildren: TimberlandTreeNode[] = [
        {
          type: 'element',
          element: 'div',
          className: 'wrapper',
          style: node.contentWrapperStyle ?? null,
          children: wrappedContent,
        },
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
        sidebarColClass={sidebarColClass ?? undefined}
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
      return <ArchiveTemplate node={node} searchParams={searchParams} />;
    case 'author':
      return <AuthorTemplate slug={node.slug} name={node.name} />;
    default:
      // Fallback: render as page
      return <PageTemplate node={node} removeContentContainerPerPost={perPostRCC} />;
  }
}

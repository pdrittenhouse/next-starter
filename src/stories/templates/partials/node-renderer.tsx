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
 * Ordered manifest keys to try for a node, most specific first.
 *
 * Mirrors the fallback chains in the framework's TemplateDispatcher:
 *
 *   single  ->  pages/single-{id}  ->  pages/single-{post-type}  ->  pages/single
 *   archive ->  pages/archive-{term-id | post-type}  ->  pages/archive  ->  pages/index
 *
 * A single key lookup was enough while only post and page mattered. It is not
 * enough for a custom post type: the manifest can carry
 * `pages/single-{post-type}` for a CPT with its own template, and
 * `TEMPLATE_MANIFEST_KEYS['single']` could only ever find `pages/single`.
 *
 * NOTE on custom page templates: the framework's four shipped templates are
 * NOT mechanically derivable from `template.templateName` —
 * `Template_CenteredLogoHeaderLayout` corresponds to
 * `pages/page-template-centered`, and `Template_SideHeaderLayout` to
 * `pages/page-template-header-side`. The manifest key comes from the PHP
 * template's file name, which WPGraphQL does not expose; `templateName` is the
 * human label. Matching those needs a `templateSlug` field on the WordPress
 * side, so page-template candidates are deliberately not guessed at here.
 */
function templateCandidates(node: any, template: string | null): string[] {
  const base = template ? TEMPLATE_MANIFEST_KEYS[template] : undefined;

  switch (template) {
    case 'single': {
      const candidates: string[] = [];
      if (node?.databaseId) candidates.push(`pages/single-${node.databaseId}`);
      if (node?.contentTypeName) candidates.push(`pages/single-${node.contentTypeName}`);
      candidates.push('pages/single');
      return candidates;
    }

    case 'archive': {
      const candidates: string[] = [];
      // A ContentType node is a post-type archive and carries `name`; a
      // Category or Tag is a term archive and carries `databaseId`.
      if (node?.__typename === 'ContentType' && node?.name) {
        candidates.push(`pages/archive-${node.name}`);
      } else if (node?.databaseId) {
        candidates.push(`pages/archive-${node.databaseId}`);
      }
      candidates.push('pages/archive', 'pages/index');
      return candidates;
    }

    default:
      return base ? [base] : [];
  }
}


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
  //
  // A CHAIN, not a single key. Order matters and `Array.includes` would lose it —
  // `pages/single` would win over `pages/single-toasters` purely because it
  // appears earlier in the manifest. Walk the candidates, not the manifest.
  const candidates = templateCandidates(node, template);
  const manifest = candidates.length ? await getTemplatePatterns() : null;
  let manifestEntry: NonNullable<TimberlandPatternManifest['templates']>[number] | undefined;
  for (const key of candidates) {
    manifestEntry = manifest?.templates?.find(t => t.key === key);
    if (manifestEntry) break;
  }
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
      const rawContentSlotNodes = innerSlots.filter(n => n.type === 'slot' && n.name === 'content');

      // ── Hoist the nested `comments` slot ──────────────────────────────────
      //
      // pages/single.twig wraps its comment box in `{% block comments %}`, and
      // the manifest builder emits that as a CHILD of the `content` slot (a
      // Twig block nested inside the content block override). Verified in the
      // built manifest: [15] slot content children=1 -> slot comments
      //
      // It cannot stay there. The content slot renders inside
      // `div.article-body`, the block-content wrapper — comments belong beside
      // that wrapper, matching single.twig where `section.comment-box` is a
      // sibling of `section.article-content` within the article.
      const commentsSlots: TimberlandTreeNode[] = [];
      const contentSlotNodes = rawContentSlotNodes.map(n => {
        const kids = n.children ?? [];
        const found = kids.filter(c => c.type === 'slot' && c.name === 'comments');
        if (!found.length) return n;
        commentsSlots.push(...found);
        return { ...n, children: kids.filter(c => !(c.type === 'slot' && c.name === 'comments')) };
      });
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
          },
          // Sibling of section.article-content, inside the article — where
          // single.twig puts section.comment-box.
          ...commentsSlots,
          ],
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
      <>
        <TemplateRenderer
          tree={structuredTree}
          editorBlocks={buildBlockTree(node.editorBlocks ?? [])}
          content={node.content ?? undefined}
          sidebarSlug={node.sidebarSlug ?? null}
          sidebarColClass={sidebarColClass ?? undefined}
          removeContentContainerPerPost={perPostRCC}
          postDatabaseId={template === 'single' ? node.databaseId : null}
          commentStatus={node.commentStatus ?? null}
        />
      </>
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

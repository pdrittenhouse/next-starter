import type { EditorBlock } from '@/types/blocks';
import { buildBlockTree } from '@/lib/wp/utils/blockTree';
import { parseCssStyle } from '@/lib/wp/utils/parseCssStyle';
import { PageHeader } from './partials/page-header';
import { BlockRenderer } from './partials/block-renderer';

interface PageTemplateProps {
  node: {
    databaseId: number;
    title?: string;
    slug?: string;
    content?: string;
    date?: string;
    modified?: string;
    status?: string;
    menuOrder?: number;
    mainClasses?: string;
    contentWrapperStyle?: string;
    template?: {
      templateName?: string;
    } | null;
    parent?: {
      node: {
        id: string;
        slug: string;
        uri: string;
        title?: string;
      };
    } | null;
    children?: {
      edges: {
        node: {
          id: string;
          slug: string;
          uri: string;
          title?: string;
        };
      }[];
    } | null;
    author?: {
      node: {
        id: string;
        name: string;
        slug: string;
        avatar?: { url: string; height: number; width: number };
      };
    } | null;
    featuredImage?: {
      node: {
        id: string;
        sourceUrl: string;
        altText?: string;
        caption?: string;
        srcSet?: string;
        sizes?: string;
      };
    } | null;
    editorBlocks?: EditorBlock[];
  };
}

/**
 * Resolve WP template name to a layout variant class.
 * Mirrors the theme's base-*.twig layout variants.
 */
function getLayoutVariant(templateName?: string): string {
  switch (templateName) {
    case 'Simple Layout':
      return 'layout-simple';
    case 'Stacked Header Layout':
      return 'layout-stacked';
    case 'Centered Logo Header Layout':
      return 'layout-centered';
    case 'Header Side Layout':
      return 'layout-header-side';
    default:
      return 'layout-default';
  }
}

/**
 * Static page template.
 * Mirrors: templates/pages/page.twig
 *
 * Supports custom page templates via WP's template selector:
 * - Default → standard layout
 * - Simple Layout → minimal header/footer
 * - Stacked Header Layout → hero-style header
 * - Centered Logo Header Layout → centered header
 * - Header Side Layout → side-positioned header
 */
export function PageTemplate({ node }: PageTemplateProps) {
  const templateName = node.template?.templateName;
  const layoutVariant = getLayoutVariant(templateName);
  const mainClasses = `${node.mainClasses ?? 'content-wrapper'} ${layoutVariant}`.trim();
  const wrapperStyle = parseCssStyle(node.contentWrapperStyle);

  return (
    <main id="content" className={mainClasses}>
      <div className="wrapper" style={wrapperStyle}>
      <article className="post-type-page" id={`post-${node.databaseId}`}>
        <PageHeader
          title={node.title}
          thumbnail={node.featuredImage?.node}
        />

        {(node.editorBlocks?.length || node.content) && (
          <section className="article-content">
            <div className="article-content--container">
              <div className="article-content--row">
                <div className="article-content--column">
                  <div className="article-body">
                    {node.editorBlocks?.length
                      ? <BlockRenderer blocks={buildBlockTree(node.editorBlocks)} />
                      : <div dangerouslySetInnerHTML={{ __html: node.content ?? '' }} />
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </article>
      </div>
    </main>
  );
}

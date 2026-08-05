import { parseCssStyle } from '@/lib/wp/utils/parseCssStyle';
import type { EditorBlock } from '@/types/blocks';
import { buildBlockTree } from '@/lib/wp/utils/blockTree';
import { BlockRenderer } from './partials/block-renderer';
import { SidebarPattern } from '@/stories/templates/partials/wrapper/SidebarPattern';

interface FrontPageTemplateProps {
  node: {
    content?: string;
    mainClasses?: string;
    contentWrapperStyle?: string;
    editorBlocks?: EditorBlock[];
    sidebarSlug?: string | null;
    sidebarCol?: number | null;
    sidebarBp?: string | null;
  };
  /** Per-post container override — when true, blocks self-supply .container divs. */
  removeContentContainerPerPost?: boolean;
}

/**
 * Static front page template.
 * Mirrors: templates/pages/front-page.twig
 *
 * Used when Reading Settings → "Your homepage displays" is set to "A static page".
 * For the blog posts index (showOnFront='posts'), see home.tsx (HomeTemplate).
 */
export async function FrontPageTemplate({ node, removeContentContainerPerPost }: FrontPageTemplateProps) {
  const wrapperStyle = parseCssStyle(node.contentWrapperStyle);
  const blocks = node.editorBlocks?.length ? buildBlockTree(node.editorBlocks) : null;
  const sidebarColClass = node.sidebarSlug
    ? `col-${node.sidebarBp ?? 'lg'}-${node.sidebarCol ?? 3}`
    : undefined;

  return (
    <main id="content" className={node.mainClasses ?? 'content-wrapper'}>
      <div className="wrapper" style={wrapperStyle}>
        <section className="homepage-content-wrapper">
          <div className="homepage-content--container">
            <div className="homepage-content--row">
              <div className="homepage-content--column">
                {blocks
                  ? <BlockRenderer blocks={blocks} context={removeContentContainerPerPost ? { removeContentContainerPerPost } : undefined} />
                  : node.content && (
                    <div
                      className="homepage-content"
                      dangerouslySetInnerHTML={{ __html: node.content }}
                    />
                  )
                }
              </div>
              {node.sidebarSlug && (
                <SidebarPattern slug={node.sidebarSlug} className={sidebarColClass} />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

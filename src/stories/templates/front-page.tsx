import { parseCssStyle } from '@/lib/wp/utils/parseCssStyle';
import type { EditorBlock } from '@/types/blocks';
import { buildBlockTree } from '@/lib/wp/utils/blockTree';
import { BlockRenderer } from './partials/block-renderer';

interface FrontPageTemplateProps {
  node: {
    content?: string;
    mainClasses?: string;
    contentWrapperStyle?: string;
    editorBlocks?: EditorBlock[];
  };
}

/**
 * Static front page template.
 * Mirrors: templates/pages/front-page.twig
 *
 * Used when Reading Settings → "Your homepage displays" is set to "A static page".
 * For the blog posts index (showOnFront='posts'), see home.tsx (HomeTemplate).
 */
export async function FrontPageTemplate({ node }: FrontPageTemplateProps) {
  const wrapperStyle = parseCssStyle(node.contentWrapperStyle);
  const blocks = node.editorBlocks?.length ? buildBlockTree(node.editorBlocks) : null;

  return (
    <main id="content" className={node.mainClasses ?? 'content-wrapper'}>
      <div className="wrapper" style={wrapperStyle}>
        <section className="homepage-content-wrapper">
          <div className="homepage-content--container">
            <div className="homepage-content--row">
              <div className="homepage-content--column">
                {blocks
                  ? <BlockRenderer blocks={blocks} />
                  : node.content && (
                    <div
                      className="homepage-content"
                      dangerouslySetInnerHTML={{ __html: node.content }}
                    />
                  )
                }
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

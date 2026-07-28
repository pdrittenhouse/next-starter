import { parseCssStyle } from '@/lib/wp/utils/parseCssStyle';

interface FrontPageTemplateProps {
  node: {
    content?: string;
    mainClasses?: string;
    contentWrapperStyle?: string;
  };
}

/**
 * Static front page template.
 * Mirrors: templates/pages/front-page.twig
 *
 * Used when Reading Settings → "Your homepage displays" is set to "A static page".
 * For the blog posts index (showOnFront='posts'), see home.tsx (HomeTemplate).
 */
export function FrontPageTemplate({ node }: FrontPageTemplateProps) {
  const wrapperStyle = parseCssStyle(node.contentWrapperStyle);

  return (
    <main id="content" className={node.mainClasses ?? 'content-wrapper'}>
      <div className="wrapper" style={wrapperStyle}>
        <section className="homepage-content-wrapper">
          <div className="homepage-content--container">
            <div className="homepage-content--row">
              <div className="homepage-content--column">
                {node.content && (
                  <div
                    className="homepage-content"
                    dangerouslySetInnerHTML={{ __html: node.content }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

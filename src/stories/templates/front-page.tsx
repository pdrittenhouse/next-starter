interface FrontPageTemplateProps {
  node: any;
}

/**
 * Static front page template.
 * Mirrors: templates/pages/front-page.twig
 *
 * Used when Reading Settings → "Your homepage displays" is set to "A static page".
 * For the blog posts index (showOnFront='posts'), see home.tsx (HomeTemplate).
 */
export function FrontPageTemplate({ node }: FrontPageTemplateProps) {
  return (
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
  );
}

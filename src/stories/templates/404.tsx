import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_NODE_BY_URI } from '@/lib/wp/queries';

/**
 * 404 Not Found template.
 * Mirrors: templates/pages/404.twig
 *
 * The theme checks for an "error-404" page in WP and renders its content
 * if it exists, otherwise shows a default message.
 */
export async function NotFoundTemplate() {
  // Try to fetch a custom 404 page from WP (matching the theme's behavior)
  let errorPageContent: string | null = null;
  try {
    const { data } = await fetchGraphQL<{ nodeByUri: { content?: string } }>(
      print(GET_NODE_BY_URI),
      { uri: '/error-404/' },
    );
    errorPageContent = data?.nodeByUri?.content ?? null;
  } catch {
    // Silently fail — show default message
  }

  return (
    <section className="article-content">
      <div className="article-content--container">
        <div className="article-content--row">
          <div className="article-content--column">
            <div className="article-body">
              {errorPageContent ? (
                <div dangerouslySetInnerHTML={{ __html: errorPageContent }} />
              ) : (
                <p>Sorry, we couldn&apos;t find what you&apos;re looking for.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_POSTS_PAGINATED } from '@/lib/wp/queries';
import { Tease } from './partials/tease';
import { Pagination } from './partials/pagination';

interface FrontPageTemplateProps {
  /** 'page' = static front page, 'posts' = blog listing homepage */
  type: 'page' | 'posts';
  /** The front page node (when type='page') */
  node?: any;
}

/**
 * Front page template.
 * Mirrors: templates/pages/front-page.twig
 *
 * When Reading Settings → "Your homepage displays" is set to:
 *   - "A static page" → renders the page content (like page.twig)
 *   - "Your latest posts" → renders a blog listing (like index.twig)
 */
export async function FrontPageTemplate({ type, node }: FrontPageTemplateProps) {
  // Static front page — render page content
  if (type === 'page' && node) {
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

  // Blog listing homepage — fetch latest posts
  const { data } = await fetchGraphQL<{
    posts: {
      pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; endCursor: string; startCursor: string };
      edges: { node: any }[];
    };
  }>(print(GET_POSTS_PAGINATED), { first: 10 });

  const posts = data?.posts?.edges ?? [];
  const pageInfo = data?.posts?.pageInfo;

  return (
    <section className="content-wrapper">
      <div className="post-listing">
        <div className="container">
          <div className="row">
            <div className="col">
              {posts.map(({ node: post }) => (
                <Tease
                  key={post.id}
                  title={post.title}
                  uri={post.uri}
                  excerpt={post.excerpt}
                  postType="post"
                  featuredImage={post.featuredImage?.node}
                  id={`tease-${post.databaseId}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {pageInfo && (
        <Pagination
          hasNextPage={pageInfo.hasNextPage}
          hasPreviousPage={pageInfo.hasPreviousPage}
          endCursor={pageInfo.endCursor}
          startCursor={pageInfo.startCursor}
        />
      )}
    </section>
  );
}

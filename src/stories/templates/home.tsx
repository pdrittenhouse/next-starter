import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_POSTS_PAGINATED } from '@/lib/wp/queries';
import { Tease } from './partials/tease';
import { Pagination } from './partials/pagination';

/**
 * Blog posts index template.
 * Mirrors: templates/pages/home.twig (WP home.php)
 *
 * Used when Reading Settings → "Your homepage displays" is set to "Your latest posts",
 * or when a Posts Page is configured. For a static front page, see front-page.tsx.
 */
export async function HomeTemplate() {
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
              {posts.length > 0 ? (
                posts.map(({ node: post }) => (
                  <Tease
                    key={post.id}
                    title={post.title}
                    uri={post.uri}
                    excerpt={post.excerpt}
                    postType="post"
                    featuredImage={post.featuredImage?.node}
                    id={`tease-${post.databaseId}`}
                  />
                ))
              ) : (
                <p>No posts found.</p>
              )}
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

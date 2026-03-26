import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_POSTS_PAGINATED } from '@/lib/wp/queries';
import { PageHeader } from './partials/page-header';
import { Tease } from './partials/tease';
import { Pagination } from './partials/pagination';

interface AuthorTemplateProps {
  slug: string;
  name?: string;
}

/**
 * Author archive template.
 * Mirrors: templates/pages/author.twig → archive.twig
 */
export async function AuthorTemplate({ slug, name }: AuthorTemplateProps) {
  const { data } = await fetchGraphQL<{
    posts: {
      pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; endCursor: string; startCursor: string };
      edges: { node: any }[];
    };
  }>(print(GET_POSTS_PAGINATED), {
    first: 10,
    authorName: slug,
  });

  const posts = data?.posts?.edges ?? [];
  const pageInfo = data?.posts?.pageInfo;

  return (
    <section className="content-wrapper">
      <PageHeader title={name ?? slug} />

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
                <p>No posts found by this author.</p>
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

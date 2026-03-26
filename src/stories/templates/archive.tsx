import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_POSTS_PAGINATED } from '@/lib/wp/queries';
import { PageHeader } from './partials/page-header';
import { Tease } from './partials/tease';
import { Pagination } from './partials/pagination';

interface ArchiveTemplateProps {
  node: {
    __typename?: string;
    databaseId?: number;
    name?: string;
    slug?: string;
    description?: string;
    count?: number;
    uri?: string;
    label?: string;
    // ContentType archive fields
    graphqlPluralName?: string;
  };
}

/**
 * Archive template for categories, tags, CPT archives.
 * Mirrors: templates/pages/archive.twig + templates/pages/index.twig
 */
export async function ArchiveTemplate({ node }: ArchiveTemplateProps) {
  // Build the title based on archive type
  let title = 'Archive';
  const variables: Record<string, any> = { first: 10 };

  switch (node.__typename) {
    case 'Category':
      title = node.name ?? 'Category';
      variables.categoryId = node.databaseId;
      break;
    case 'Tag':
      title = node.name ?? 'Tag';
      variables.tagId = node.slug;
      break;
    case 'ContentType':
      title = node.label ?? node.name ?? 'Archive';
      break;
    default:
      title = node.name ?? 'Archive';
  }

  // Fetch posts for this archive
  const { data } = await fetchGraphQL<{
    posts: {
      pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; endCursor: string; startCursor: string };
      edges: { node: any }[];
    };
  }>(print(GET_POSTS_PAGINATED), variables);

  const posts = data?.posts?.edges ?? [];
  const pageInfo = data?.posts?.pageInfo;

  return (
    <section className="content-wrapper">
      <PageHeader title={title} />

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
                    postType={post.contentTypeName ?? 'post'}
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

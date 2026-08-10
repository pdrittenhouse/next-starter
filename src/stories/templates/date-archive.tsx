import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_POSTS_BY_DATE } from '@/lib/wp/queries';
import { getContentWrapperOptions } from '@/lib/wp/utils/getContentWrapperOptions';
import { PageHeader } from './partials/page-header';
import { Tease } from './partials/tease';
import { Pagination } from './partials/pagination';

interface DateArchiveTemplateProps {
  year: number;
  month?: number;
  day?: number;
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Date-based archive template.
 * Handles /date/YYYY/, /date/YYYY/MM/, and /date/YYYY/MM/DD/ routes.
 */
export async function DateArchiveTemplate({ year, month, day }: DateArchiveTemplateProps) {
  const variables: Record<string, any> = { first: 10, year };
  if (month) variables.month = month;
  if (day) variables.day = day;

  const [postsResult, { removePageHeaderContainers }] = await Promise.all([
    fetchGraphQL<{
      posts: {
        pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; endCursor: string; startCursor: string };
        edges: { node: any }[];
      };
    }>(print(GET_POSTS_BY_DATE), variables),
    getContentWrapperOptions(),
  ]);

  const posts = postsResult.data?.posts?.edges ?? [];
  const pageInfo = postsResult.data?.posts?.pageInfo;

  // Build title: "March 2024" or "March 15, 2024" or "2024"
  let title = `${year}`;
  if (month && MONTH_NAMES[month]) {
    title = day
      ? `${MONTH_NAMES[month]} ${day}, ${year}`
      : `${MONTH_NAMES[month]} ${year}`;
  }

  return (
    <main id="content" className="content-wrapper">
      <div className="wrapper">
      <PageHeader title={title} removeContainer={removePageHeaderContainers ?? false} />

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
      </div>
    </main>
  );
}

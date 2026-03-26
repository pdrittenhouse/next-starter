import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { SEARCH_CONTENT } from '@/lib/wp/queries';
import { Tease } from './partials/tease';
import { Pagination } from './partials/pagination';

interface SearchTemplateProps {
  query: string;
}

/**
 * Search results template.
 * Mirrors: templates/pages/search.twig
 */
export async function SearchTemplate({ query }: SearchTemplateProps) {
  const { data } = await fetchGraphQL<{
    contentNodes: {
      pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; endCursor: string; startCursor: string };
      edges: { node: any }[];
    };
  }>(print(SEARCH_CONTENT), {
    first: 10,
    search: query,
  });

  const results = data?.contentNodes?.edges ?? [];
  const pageInfo = data?.contentNodes?.pageInfo;

  return (
    <div className="content-wrapper">
      <div className="search-results">
        <div className="container">
          <div className="row">
            <div className="col">
              <h1>
                {query
                  ? `Search results for "${query}"`
                  : 'Search results'}
              </h1>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {results.length > 0 ? (
                results.map(({ node: item }) => (
                  <Tease
                    key={item.id}
                    title={item.title}
                    uri={item.uri}
                    excerpt={item.excerpt}
                    postType={item.contentType?.node?.name ?? 'post'}
                    featuredImage={item.featuredImage?.node}
                    id={`tease-${item.databaseId}`}
                  />
                ))
              ) : (
                <p>No results found for &ldquo;{query}&rdquo;.</p>
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
  );
}

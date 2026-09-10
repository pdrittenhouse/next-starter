import {gql} from "@apollo/client";

export const GET_ALL_CONTENT_TYPES = gql`
    query GetAllContentTypes {
      contentTypes {
        edges {
          node {
            id
            name
            label
            description
            graphqlPluralName
            graphqlSingleName
            showInAdminBar
            showInGraphql
            showInNavMenus
            showInRest
            showUi
            hierarchical
            hasArchive
            menuPosition
            menuIcon
          }
        }
      }
    }
`;

export const GET_ALL_CONTENT_NODES = gql`
    query GetAllContentNodes {
      contentNodes(first: 100) {
        edges {
          node {
            id
            databaseId
            slug
            uri
            status
            contentType {
              node {
                name
                label
              }
            }
            date
            modified
            ... on Post {
              title
              excerpt
            }
            ... on Page {
              title
            }
            ... on MediaItem {
              title
              sourceUrl
            }
          }
        }
      }
    }
`;

/**
 * Every published content URI, across all post types.
 *
 * Replaces GET_ALL_POST_URIS + GET_ALL_PAGE_URIS for static path generation.
 * Those two named `posts` and `pages` explicitly, so a custom post type was
 * never prerendered no matter how much content it had — every CPT single fell
 * to the on-demand fallback forever.
 *
 * `contentNodes` unfiltered spans every post type registered with
 * show_in_graphql and excludes attachments, so a newly registered CPT is
 * included with no query change. `databaseId` is selected so callers can skip
 * the reading settings' Posts page, which paginates.
 */
export const GET_ALL_CONTENT_URIS = gql`
  query GetAllContentUris {
    contentNodes(first: 1000, where: { status: PUBLISH, hasPassword: false }) {
      nodes {
        databaseId
        uri
        contentTypeName
        # For the sitemap's <lastmod>. Harmless for the prerender path, which
        # only reads uri and databaseId.
        modified
      }
    }
  }
`;

export const SEARCH_CONTENT = gql`
    query SearchContent($first: Int, $after: String, $last: Int, $before: String, $search: String!) {
      contentNodes(
        first: $first
        after: $after
        last: $last
        before: $before
        where: {
          search: $search
          status: PUBLISH
        }
      ) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          node {
            id
            databaseId
            uri
            contentType {
              node {
                name
              }
            }
            ... on Post {
              title
              excerpt
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
            }
            ... on Page {
              title
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
      }
    }
`;

export default GET_ALL_CONTENT_TYPES;

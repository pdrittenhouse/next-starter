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

export const SEARCH_CONTENT = gql`
    query SearchContent($first: Int = 10, $after: String, $search: String!) {
      contentNodes(
        first: $first
        after: $after
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

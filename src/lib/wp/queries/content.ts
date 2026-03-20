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

export default GET_ALL_CONTENT_TYPES;

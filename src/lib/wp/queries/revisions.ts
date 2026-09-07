import {gql} from "@apollo/client";

/**
 * `revisions` resolves to ContentNode, which carries only the fields common to
 * every content type. `title`, `author` and the `parent*` fields live on the
 * NodeWithTitle / NodeWithAuthor / HierarchicalContentNode interfaces, so they
 * have to be reached through inline fragments.
 */
export const GET_ALL_REVISIONS = gql`
    query GetAllRevisions {
      revisions(first: 100) {
        edges {
          node {
            id
            databaseId
            date
            slug
            status
            ... on NodeWithTitle {
              title
            }
            ... on HierarchicalContentNode {
              parentDatabaseId
              parentId
            }
            ... on NodeWithAuthor {
              author {
                node {
                  id
                  name
                  slug
                }
              }
            }
          }
        }
      }
    }
`;

export default GET_ALL_REVISIONS;

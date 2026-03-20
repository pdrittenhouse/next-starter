import {gql} from "@apollo/client";

export const GET_ALL_REVISIONS = gql`
    query GetAllRevisions {
      revisions(first: 100) {
        edges {
          node {
            id
            databaseId
            title
            date
            slug
            status
            parentDatabaseId
            parentId
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
`;

export default GET_ALL_REVISIONS;

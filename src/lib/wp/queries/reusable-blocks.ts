import {gql} from "@apollo/client";

export const GET_ALL_REUSABLE_BLOCKS = gql`
  query GetAllReusableBlocks {
    reusableBlocks(first: 100) {
      edges {
        node {
          id
          databaseId
          title
          content
          date
          modified
          status
          slug
        }
      }
    }
  }
`;

export const GET_REUSABLE_BLOCK_BY_ID = gql`
  query GetReusableBlockById($id: ID!) {
    reusableBlock(id: $id, idType: DATABASE_ID) {
      id
      databaseId
      title
      content
      date
      modified
      status
      slug
    }
  }
`;

export default GET_ALL_REUSABLE_BLOCKS;

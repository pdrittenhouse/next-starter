import {gql} from "@apollo/client";

export const GET_ALL_POST_FORMATS = gql`
    query GetAllPostFormats {
      postFormats(first: 100) {
        edges {
          node {
            id
            databaseId
            name
            slug
            description
            count
            uri
          }
        }
      }
    }
`;

export default GET_ALL_POST_FORMATS;

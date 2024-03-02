import {gql} from "@apollo/client";

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users(first: 10000) {
      edges {
        node {
          avatar {
            height
            width
            url
          }
          description
          id
          name
          roles {
            nodes {
              name
            }
          }
          slug
        }
      }
    }
  }
`;

export default GET_ALL_USERS;
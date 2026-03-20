import {gql} from "@apollo/client";

export const GET_ALL_USER_ROLES = gql`
    query GetAllUserRoles {
      userRoles {
        edges {
          node {
            id
            name
            displayName
            capabilities
          }
        }
      }
    }
`;

export default GET_ALL_USER_ROLES;

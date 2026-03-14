import {gql} from "@apollo/client";

export const GET_VIEWER = gql`
    query GetViewer {
      viewer {
        id
        databaseId
        name
        slug
        email
        firstName
        lastName
        nickname
        description
        username
        locale
        registeredDate
        url
        avatar {
          url
          height
          width
        }
        roles {
          nodes {
            name
          }
        }
        capabilities
      }
    }
`;

export default GET_VIEWER;

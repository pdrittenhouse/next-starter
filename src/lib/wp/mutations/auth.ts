import {gql} from "@apollo/client";

/**
 * Authenticate a user with username and password.
 * Requires WPGraphQL JWT Authentication plugin.
 * Returns a short-lived authToken (use in Authorization header) and a
 * long-lived refreshToken (store securely — httpOnly cookie recommended).
 */
export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: {
      username: $username
      password: $password
    }) {
      authToken
      refreshToken
      user {
        id
        databaseId
        name
        email
        slug
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
      }
    }
  }
`;

/**
 * Exchange a refresh token for a new short-lived auth token.
 * Call this when the authToken expires (typically after ~300 seconds).
 */
export const REFRESH_AUTH_TOKEN = gql`
  mutation RefreshAuthToken($refreshToken: String!) {
    refreshJwtAuthToken(input: {
      jwtRefreshToken: $refreshToken
    }) {
      authToken
    }
  }
`;

export default LOGIN;

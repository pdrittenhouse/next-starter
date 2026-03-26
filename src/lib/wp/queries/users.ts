import {gql} from "@apollo/client";

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users(first: 100) {
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

/**
 * Get a single user by slug.
 * Used by the author archive route.
 */
export const GET_USER_BY_SLUG = gql`
  query GetUserBySlug($slug: String!) {
    user(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      avatar {
        url
        height
        width
      }
    }
  }
`;

/**
 * Get all user slugs for static generation of author pages.
 */
export const GET_ALL_USER_SLUGS = gql`
  query GetAllUserSlugs {
    users(first: 100) {
      edges {
        node {
          slug
        }
      }
    }
  }
`;

export default GET_ALL_USERS;
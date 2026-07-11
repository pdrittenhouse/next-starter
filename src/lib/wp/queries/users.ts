import {gql} from "@apollo/client";

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users(first: 100) {
      edges {
        node {
          id
          databaseId
          name
          slug
          firstName
          lastName
          description
          url
          avatar {
            height
            width
            url
          }
          roles {
            nodes {
              name
            }
          }
          socialLinks {
            website
            twitter
            facebook
            instagram
            linkedin
            youtube
            pinterest
          }
          userMeta {
            key
            value
          }
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
      firstName
      lastName
      description
      url
      avatar {
        url
        height
        width
      }
      socialLinks {
        website
        twitter
        facebook
        instagram
        linkedin
        youtube
        pinterest
      }
      userMeta {
        key
        value
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
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
  query GetUserBySlug($slug: ID!) {
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

/**
 * Author archive URIs, for the sitemap.
 *
 * `hasPublishedPosts: [POST]` excludes users with no posts — otherwise every
 * subscriber account becomes an empty archive URL advertised to crawlers.
 *
 * Selects `uri` rather than building `/author/{slug}/` by hand: WordPress owns
 * the author base and a project can rename it.
 */
export const GET_AUTHOR_ARCHIVE_URIS = gql`
  query GetAuthorArchiveUris {
    users(first: 100, where: { hasPublishedPosts: [POST] }) {
      nodes {
        uri
        slug
      }
    }
  }
`;

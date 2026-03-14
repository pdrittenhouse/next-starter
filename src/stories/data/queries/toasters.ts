import {gql} from "@apollo/client";

export const GET_ALL_TOASTERS = gql`
    query GetAllToasters {
      toasters(first: 100) {
        edges {
          node {
            id
            databaseId
            title
            slug
            date
            modified
            status
            uri
            content
            featuredImage {
              node {
                id
                sourceUrl
                altText
              }
            }
          }
        }
      }
    }
`;

export const GET_TOASTER_BY_SLUG = gql`
    query GetToasterBySlug($slug: ID!) {
      toaster(id: $slug, idType: SLUG) {
        id
        databaseId
        title
        slug
        date
        modified
        status
        uri
        content
        featuredImage {
          node {
            id
            sourceUrl
            altText
          }
        }
      }
    }
`;

export default GET_ALL_TOASTERS;

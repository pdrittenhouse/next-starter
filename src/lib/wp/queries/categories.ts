import {gql} from "@apollo/client";

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories(first: 100) {
      edges {
        node {
            databaseId
            description
            id
            name
            slug
            isRestricted
            isContentNode
            isTermNode
            link
            count
            categoryId
            parentDatabaseId
            parentId
            taxonomyName
            termGroupId
            termTaxonomyId
            uri
            seo {
              title
              description
              canonicalUrl
              ogTitle
              ogDescription
              ogImage
              ogType
              twitterTitle
              twitterDescription
              twitterImage
              twitterCard
              robots
              schema
            }
        }
      }
    }
  }
`;

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      databaseId
      description
      id
      name
      slug
      count
      uri
      seo {
        title
        description
        canonicalUrl
        ogTitle
        ogDescription
        ogImage
        ogType
        twitterTitle
        twitterDescription
        twitterImage
        twitterCard
        robots
        schema
      }
    }
  }
`;

/**
 * Get all category URIs for static generation of taxonomy archive pages.
 */
export const GET_ALL_CATEGORY_URIS = gql`
  query GetAllCategoryUris {
    categories(first: 1000) {
      edges {
        node {
          uri
          slug
        }
      }
    }
  }
`;

export default GET_ALL_CATEGORIES;
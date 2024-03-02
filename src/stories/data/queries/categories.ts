import {gql} from "@apollo/client";

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories(first: 10000) {
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
    }
  }
`;

export default GET_ALL_CATEGORIES;
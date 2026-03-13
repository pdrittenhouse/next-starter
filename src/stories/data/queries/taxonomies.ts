import {gql} from "@apollo/client";

export const GET_ALL_TAXONOMIES = gql`
  query GetAllTaxonomies {
    taxonomies {
      edges {
        node {
          id
          label
          name
          description
        }
      }
    }
  }
`;

export const GET_TAXONOMY_BY_ID = gql`
  query GetTaxonomyById($taxonomyId: Int!) {
    taxonomy(id: $taxonomyId, idType: ID) {
      edges {
        node {
          id
          label
          name
          description
        }
      }
    }
  }
`;

export const GET_TERMS_BY_TAXONOMY = gql`
  query GetTermsByTaxonomy($taxonomy: ID!) {
    terms(where: {taxonomies: $taxonomy}) {
      edges {
        node {
          description
          id
          link
          name
          slug
          taxonomyName
          uri
        }
      }
    }
  }
`;

export default GET_ALL_TAXONOMIES;
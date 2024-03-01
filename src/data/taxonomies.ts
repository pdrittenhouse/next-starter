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
  query GetTaxonomyById($tasonomyId: Int!) {
    taxonomy(id: $tasonomyId, idType: ID) {
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
  query GetTermsByTaxonomy($tasonomy: ID!) {
    terms(where: {taxonomies: $tasonomy}) {
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
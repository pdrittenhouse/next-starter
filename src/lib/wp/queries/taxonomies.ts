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
          graphqlPluralName
          graphqlSingleName
        }
      }
    }
  }
`;

// `taxonomy` resolves to a single Taxonomy, not a connection — no edges/node.
export const GET_TAXONOMY_BY_ID = gql`
  query GetTaxonomyById($taxonomyId: ID!) {
    taxonomy(id: $taxonomyId, idType: ID) {
      id
      label
      name
      description
    }
  }
`;

// `taxonomies` takes a list of TaxonomyEnum values (CATEGORY, POST_TAG, ...).
export const GET_TERMS_BY_TAXONOMY = gql`
  query GetTermsByTaxonomy($taxonomies: [TaxonomyEnum]) {
    terms(where: {taxonomies: $taxonomies}) {
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
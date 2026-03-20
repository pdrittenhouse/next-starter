import { gql } from "@apollo/client";

/** Taxonomy term fields used in content queries. */
export const TERM_FIELDS = gql`
  fragment TermFields on TermNode {
    id
    name
    slug
    taxonomyName
    uri
  }
`;

/**
 * Inline terms connection selection string for use in dynamic query builders.
 */
export const TERMS_SELECTION = `
  terms {
    edges {
      node {
        id
        name
        slug
        taxonomyName
        uri
      }
    }
  }
`;

import {gql} from "@apollo/client";

export const GET_ALL_TAGS = gql`
  query GetAllTags {
    tags(first: 100) {
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
            tagId
            taxonomyName
            termGroupId
            termTaxonomyId
            uri
        }
      }
    }
  }
`;

export const GET_TAG_BY_SLUG = gql`
  query GetTagBySlug($slug: ID!) {
    tag(id: $slug, idType: SLUG) {
      databaseId
      description
      id
      name
      slug
      count
      uri
    }
  }
`;

/**
 * Get all tag URIs for static generation of taxonomy archive pages.
 */
export const GET_ALL_TAG_URIS = gql`
  query GetAllTagUris {
    tags(first: 1000) {
      edges {
        node {
          uri
          slug
        }
      }
    }
  }
`;

export default GET_ALL_TAGS;
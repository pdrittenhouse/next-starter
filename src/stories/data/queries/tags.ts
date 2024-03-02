import {gql} from "@apollo/client";

export const GET_ALL_TAGS = gql`
  query GetAllTags {
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
    }
  }
`;

export default GET_ALL_TAGS;
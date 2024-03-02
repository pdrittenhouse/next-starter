import {gql} from "@apollo/client";

export const PAGE_FIELDS = gql`
  fragment PageFields on Page {
    children {
      edges {
        node {
          id
          slug
          uri
          ... on Page {
            id
            title
          }
        }
      }
    }
    id
    menuOrder
    parent {
      node {
        id
        slug
        uri
        ... on Page {
          title
        }
      }
    }
    slug
    title
    uri
  }
`;

export const GET_ALL_PAGES = gql`
  ${PAGE_FIELDS}
  query GetAllPages {
    pages(first: 10000, where: { hasPassword: false }) {
      edges {
        node {
          ...PageFields
          author {
            node {
              avatar {
                height
                url
                width
              }
              id
              name
              slug
            }
          }
        }
      }
    }
  }
`;

export const GET_ALL_PAGES_WITH_CONTENT = gql`
  ${PAGE_FIELDS}
  query GetAllPagesWithContent {
    pages(first: 10000, where: { hasPassword: false }) {
      edges {
        node {
          ...PageFields
          content
          featuredImage {
            node {
              altText
              caption
              id
              sizes
              sourceUrl
              srcSet
            }
          }
          author {
            node {
              avatar {
                height
                url
                width
              }
              id
              name
              slug
            }
          }
        }
      }
    }
  }
`;

export const GET_PAGE_BY_URI = gql`
  query GetPageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      children {
        edges {
          node {
            id
            slug
            uri
            ... on Page {
              id
              title
            }
          }
        }
      }
      content
      featuredImage {
        node {
          altText
          caption
          id
          sizes
          sourceUrl
          srcSet
        }
      }
      id
      menuOrder
      parent {
        node {
          id
          slug
          uri
          ... on Page {
            title
          }
        }
      }
      slug
      title
      uri
    }
  }
`;

export default GET_ALL_PAGES;
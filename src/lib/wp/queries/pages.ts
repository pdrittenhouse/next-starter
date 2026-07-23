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
    template {
      templateName
    }
    title
    uri
  }
`;

export const GET_ALL_PAGES = gql`
  ${PAGE_FIELDS}
  query GetAllPages {
    pages(first: 100, where: { hasPassword: false }) {
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
          content
          date
          modified
          status
          databaseId
          featuredImage {
            node {
              altText
              caption
              sourceUrl
              srcSet
              sizes
              id
            }
          }
          editorBlocks {
            name
            clientId
            parentClientId
            renderedHtml
            attributesJSON
          }
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
            breadcrumbs {
              label
              url
              isCurrentPage
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
    pages(first: 100, where: { hasPassword: false }) {
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
      settingsPageOptions {
        headerPosition
        hidePageHeader
        hideFeaturedImage
        hidePageTitle
        hideSidebar
        leftSidebar
        hideTravelingCta
        headerAlertMessage
        removeHeaderContainer
        removeContentContainer
        removeFooterContainer
        pageClasses
        pageSeoDescription
        pageSeoOgImage {
          node {
            sourceUrl
            altText
          }
        }
        pageSeoNoindex
      }
    }
  }
`;

/**
 * Get all page URIs for static generation.
 * Lightweight — only fetches uri and slug.
 */
export const GET_ALL_PAGE_URIS = gql`
  query GetAllPageUris {
    pages(first: 1000, where: { hasPassword: false }) {
      edges {
        node {
          uri
          slug
        }
      }
    }
  }
`;

/**
 * Cursor-based paginated pages query.
 * Optionally filter by parent ID (for sub-page listings) or search term.
 */
export const GET_PAGES_PAGINATED = gql`
  ${PAGE_FIELDS}
  query GetPagesPaginated($first: Int = 10, $after: String, $parent: ID, $search: String) {
    pages(
      first: $first
      after: $after
      where: {
        hasPassword: false
        parent: $parent
        search: $search
      }
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          ...PageFields
          content
          date
          modified
          status
          databaseId
          author {
            node {
              id
              name
              slug
              avatar {
                height
                url
                width
              }
            }
          }
          featuredImage {
            node {
              altText
              caption
              sourceUrl
              srcSet
              sizes
              id
            }
          }
        }
      }
    }
  }
`;

export default GET_ALL_PAGES;
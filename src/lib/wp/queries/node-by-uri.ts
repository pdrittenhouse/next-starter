import { gql } from "@apollo/client";

/**
 * Resolve any WordPress URI to its content node.
 * This is the primary routing query for headless frontends —
 * given a path like "/toasters/my-toaster/", it returns the
 * content type and full data for that node.
 */
export const GET_NODE_BY_URI = gql`
  query GetNodeByUri($uri: String!) {
    nodeByUri(uri: $uri) {
      __typename
      id
      uri
      ... on ContentType {
        name
        label
        description
      }
      ... on Post {
        databaseId
        title
        slug
        date
        modified
        status
        content
        excerpt
        commentStatus
        author {
          node {
            id
            name
            slug
            avatar {
              url
              height
              width
            }
          }
        }
        featuredImage {
          node {
            id
            sourceUrl
            altText
            caption
            srcSet
            sizes
          }
        }
        categories {
          edges {
            node {
              id
              name
              slug
            }
          }
        }
        tags {
          edges {
            node {
              id
              name
              slug
            }
          }
        }
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
        settingsPostOptions {
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
          postSeoDescription
          postSeoOgImage {
            node {
              sourceUrl
              altText
            }
          }
          postSeoNoindex
        }
      }
      ... on Page {
        databaseId
        title
        slug
        date
        modified
        status
        content
        menuOrder
        template {
          templateName
        }
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
        children {
          edges {
            node {
              id
              slug
              uri
              ... on Page {
                title
              }
            }
          }
        }
        author {
          node {
            id
            name
            slug
            avatar {
              url
              height
              width
            }
          }
        }
        featuredImage {
          node {
            id
            sourceUrl
            altText
            caption
            srcSet
            sizes
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
      ... on Category {
        databaseId
        name
        slug
        description
        count
        uri
      }
      ... on Tag {
        databaseId
        name
        slug
        description
        count
        uri
      }
      ... on User {
        databaseId
        name
        slug
        description
        url
        avatar {
          url
          height
          width
        }
        socialLinks {
          website
          twitter
          facebook
          instagram
          linkedin
          youtube
          pinterest
        }
      }
      ... on MediaItem {
        databaseId
        title
        altText
        caption
        sourceUrl
        srcSet
        sizes
        mimeType
        mediaDetails {
          height
          width
          file
        }
      }
      ... on ContentNode {
        databaseId
        slug
        date
        modified
        status
        contentTypeName
      }
    }
  }
`;

/**
 * Lightweight URI resolution — just determines the content type.
 * Useful for routing decisions before fetching full content.
 */
export const RESOLVE_URI = gql`
  query ResolveUri($uri: String!) {
    nodeByUri(uri: $uri) {
      __typename
      id
      uri
      ... on ContentNode {
        databaseId
        slug
        contentTypeName
      }
      ... on TermNode {
        databaseId
        slug
        taxonomyName
      }
      ... on User {
        databaseId
        slug
      }
    }
  }
`;

export default GET_NODE_BY_URI;

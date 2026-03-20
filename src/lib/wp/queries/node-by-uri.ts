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
    }
  }
`;

export default GET_NODE_BY_URI;

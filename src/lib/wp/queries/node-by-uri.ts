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
        mainClasses
        contentWrapperStyle
        sidebarSlug
        sidebarCol
        sidebarBp
        settingsPostOptions {
          headerPosition
          hidePageHeader
          hideFeaturedImage
          hidePageTitle
          hideSidebar
          leftSidebar
          hideTravelingCta
          headerAlertMessage
          alertLayout
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
          pageSidebar
          removePageHeaderContainer
          fluidHeaderContainer
          fluidContentContainer
          fluidFooterContainer
          pageEnableAos
          pageEnableAnimateCss
          pageEnableSvgjs
          pageEnableWowjs
          pageEnableScrollMagic
          pageEnableScrollReveal
          pageEnableJarallax
          pageEnableParallaxjs
          pageEnableAnimejs
          pageEnableLottie
          pageEnableZdog
          pageEnableChartjs
          pageEnableD3
          siteHeaderLayout { headerLayout }
          siteFooterLayout { footerLayout }
          pageBackgroundColor { bgColor bgThemeColor bgCustomColor }
          bgImage { url alt width height }
          pageTextColor { color themeColor customColor }
          contentPadding { padding { top bottom left right } }
          pageHeaderBgColor { bgColor bgThemeColor bgCustomColor }
          pageHeaderBgImage { url alt width height }
          pageHeaderTextColor { color themeColor customColor }
          pageHeaderPadding { padding { top bottom left right } }
          pageHeaderMargin {
            margin {
              top { auto top }
              bottom { auto bottom }
              left { auto left }
              right { auto right }
            }
          }
          pageHeaderFontSize { fontSize { value unit } }
          sidebarBgColor { bgColor bgThemeColor bgCustomColor }
          sidebarBgImage { url alt width height }
          sidebarTextColor { color themeColor customColor }
          sidebarPadding { padding { top bottom left right } }
          sidebarWidth { value unit }
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
        mainClasses
        contentWrapperStyle
        sidebarSlug
        sidebarCol
        sidebarBp
        settingsPageOptions {
          headerPosition
          hidePageHeader
          hideFeaturedImage
          hidePageTitle
          hideSidebar
          leftSidebar
          hideTravelingCta
          headerAlertMessage
          alertLayout
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
          pageSidebar
          removePageHeaderContainer
          fluidHeaderContainer
          fluidContentContainer
          fluidFooterContainer
          pageEnableAos
          pageEnableAnimateCss
          pageEnableSvgjs
          pageEnableWowjs
          pageEnableScrollMagic
          pageEnableScrollReveal
          pageEnableJarallax
          pageEnableParallaxjs
          pageEnableAnimejs
          pageEnableLottie
          pageEnableZdog
          pageEnableChartjs
          pageEnableD3
          siteHeaderLayout { headerLayout }
          siteFooterLayout { footerLayout }
          pageBackgroundColor { bgColor bgThemeColor bgCustomColor }
          bgImage { url alt width height }
          pageTextColor { color themeColor customColor }
          contentPadding { padding { top bottom left right } }
          pageHeaderBgColor { bgColor bgThemeColor bgCustomColor }
          pageHeaderBgImage { url alt width height }
          pageHeaderTextColor { color themeColor customColor }
          pageHeaderPadding { padding { top bottom left right } }
          pageHeaderMargin {
            margin {
              top { auto top }
              bottom { auto bottom }
              left { auto left }
              right { auto right }
            }
          }
          pageHeaderFontSize { fontSize { value unit } }
          sidebarBgColor { bgColor bgThemeColor bgCustomColor }
          sidebarBgImage { url alt width height }
          sidebarTextColor { color themeColor customColor }
          sidebarPadding { padding { top bottom left right } }
          sidebarWidth { value unit }
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

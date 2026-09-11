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
          bgImage {
            bgImageType
            bgImage {
              node {
                sourceUrl
                altText
                mediaDetails { width height }
              }
            }
            bgImageUrl
            bgSize
            bgHorizontalPosition
            bgVerticalPosition
            bgRepeat
            bgAttachment
          }
          pageTextColor { color themeColor customColor }
          contentPadding { padding { top bottom left right } }
          pageHeaderBgColor { bgColor bgThemeColor bgCustomColor }
          pageHeaderBgImage {
            bgImageType
            bgImage {
              node {
                sourceUrl
                altText
                mediaDetails { width height }
              }
            }
            bgImageUrl
            bgSize
            bgHorizontalPosition
            bgVerticalPosition
            bgRepeat
            bgAttachment
          }
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
          sidebarBgImage {
            bgImageType
            bgImage {
              node {
                sourceUrl
                altText
                mediaDetails { width height }
              }
            }
            bgImageUrl
            bgSize
            bgHorizontalPosition
            bgVerticalPosition
            bgRepeat
            bgAttachment
          }
          sidebarTextColor { color themeColor customColor }
          sidebarPadding { padding { top bottom left right } }
          sidebarWidth
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
          bgImage {
            bgImageType
            bgImage {
              node {
                sourceUrl
                altText
                mediaDetails { width height }
              }
            }
            bgImageUrl
            bgSize
            bgHorizontalPosition
            bgVerticalPosition
            bgRepeat
            bgAttachment
          }
          pageTextColor { color themeColor customColor }
          contentPadding { padding { top bottom left right } }
          pageHeaderBgColor { bgColor bgThemeColor bgCustomColor }
          pageHeaderBgImage {
            bgImageType
            bgImage {
              node {
                sourceUrl
                altText
                mediaDetails { width height }
              }
            }
            bgImageUrl
            bgSize
            bgHorizontalPosition
            bgVerticalPosition
            bgRepeat
            bgAttachment
          }
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
          sidebarBgImage {
            bgImageType
            bgImage {
              node {
                sourceUrl
                altText
                mediaDetails { width height }
              }
            }
            bgImageUrl
            bgSize
            bgHorizontalPosition
            bgVerticalPosition
            bgRepeat
            bgAttachment
          }
          sidebarTextColor { color themeColor customColor }
          sidebarPadding { padding { top bottom left right } }
          sidebarWidth
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

      # ─── Generic content, resolved through interfaces ──────────────────────
      #
      # Everything above this point names a concrete type. That is fine for
      # post and page, which every install has, but a headless client resolving
      # an arbitrary URI cannot enumerate a site's custom post types — so a CPT
      # single fell through to the bare "... on ContentNode" branch below and
      # rendered a shell: correct body class, no title, no content, no blocks.
      # Both toasters on the test install produced byte-identical HTML.
      #
      # These fragments cover any content node, present and future, without
      # naming it. NodeWithTimberlandLayout is the framework's own interface
      # (see its docs/guides/graphql.md); the rest are WPGraphQL's.
      #
      # A type that does not implement one simply does not match — a CPT
      # registered without "supports: author" never resolves author, rather
      # than erroring.
      ... on NodeWithTitle {
        title
      }
      ... on NodeWithContentEditor {
        content
      }
      ... on NodeWithExcerpt {
        excerpt
      }
      ... on NodeWithFeaturedImage {
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
      }
      ... on NodeWithEditorBlocks {
        editorBlocks {
          name
          clientId
          parentClientId
          renderedHtml
          attributesJSON
        }
      }
      ... on NodeWithTemplate {
        template {
          templateName
        }
      }
      ... on NodeWithAuthor {
        author {
          node {
            id
            name
            slug
            avatar {
              url
            }
          }
        }
      }
      ... on NodeWithComments {
        commentStatus
      }
      ... on NodeWithTimberlandLayout {
        # Root-relative URLs. Feeds both the breadcrumb block and the
        # BreadcrumbList JSON-LD. A first-class field rather than part of the
        # seo field, because seo resolves to null without Yoast or RankMath.
        breadcrumbs {
          label
          url
          isCurrentPage
        }
        mainClasses
        contentWrapperStyle
        sidebarSlug
        sidebarCol
        sidebarBp
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
      # wpgraphql-acf registers a WithAcf* interface per field group, so these
      # need no per-type naming either. They resolve to null on a post type
      # whose location rules do not include the group — a manual step when a CPT
      # is created, documented in the framework's template-dispatching guide.
      ... on WithAcfSettingsPostOptions {
        settingsPostOptions {
          removeContentContainer
        }
      }
      ... on WithAcfSettingsPageOptions {
        settingsPageOptions {
          removeContentContainer
        }
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

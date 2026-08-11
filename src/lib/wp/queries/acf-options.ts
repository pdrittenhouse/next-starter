import { gql } from "@apollo/client";

/**
 * Fetch global theme settings: analytics, performance, security, layout, and style defaults.
 * Powered by the "Theme General Options" ACF options page.
 * Requires WPGraphQL for ACF with show_in_graphql enabled on this group.
 */
export const GET_THEME_GENERAL_OPTIONS = gql`
  query GetThemeGeneralOptions {
    themeGeneralOptions {
      settingsThemeGeneralOptions {
        enableGtm
        enableDirectGa
        googleSiteVerification
        bingSiteVerification
        facebookDomainVerification
        gtmConfiguration {
          gtmContainerId
          gtmRequireConsent
          gtmConsentCookieName
        }
        gaMeasurementId
        bodyClasses
        fluidContentContainers
        maxWidthFluidContainers
        removePageHeaderContainers
        postDisplay
        gridColumns
        disableGfLayout
        gfMobileNum {
          formId
          fieldId
        }
        enableServiceWorker
        enableAssetPreloading
        enableCsp
        cspConfiguration {
          xFrameOptions
          enableNonce
          connectSrc
          fontSrc
          mediaSrc
          styleSrc
          scriptSrc
          imgSrc
          frameSrc
          objectSrc
          prefetchSrc
          frameAncestors
          allowUnsafeInline
          allowUnsafeEval
          reportUri
        }
        enableAos
        enableAnimateCss
        enableSvgjs
        enableWowjs
        enableScrollMagic
        enableScrollReveal
        enableJarallax
        enableParallaxjs
        enableAnimejs
        enableLottie
        enableZdog
        enableChartjs
        enableD3
        hidePageHeaders
        hideFeaturedImages
        hidePageTitles
        hideSidebars
        leftSidebar
        defaultSidebar
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
        contentPadding {
          padding {
            top
            bottom
            left
            right
          }
        }
        pageHeaderBgColor {
          bgColor
          bgThemeColor
          bgCustomColor
        }
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
        pageHeaderTextColor {
          color
          themeColor
          customColor
        }
        pageHeaderPadding {
          padding {
            top
            bottom
            left
            right
          }
        }
        pageHeaderMargin {
          margin {
            top { auto top }
            bottom { auto bottom }
            left { auto left }
            right { auto right }
          }
        }
        pageHeaderFontSize {
          fontSize {
            value
            unit
          }
        }
        sidebarBgColor {
          bgColor
          bgThemeColor
          bgCustomColor
        }
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
        sidebarTextColor {
          color
          themeColor
          customColor
        }
        sidebarPadding {
          padding {
            top
            bottom
            left
            right
          }
        }
        sidebarWidth {
          width {
            value
            unit
            minWidth
            maxWidth
          }
        }
      }
    }
  }
`;

/**
 * Fetch global header behavior, alert bar content, and CTA buttons.
 * Powered by the "Header Options" ACF options page.
 *
 * headerPosition: "fixed" | "sticky" | "absolute" | "" (static)
 * navbarBreakpoint: Bootstrap expand breakpoint ("sm"|"md"|"lg"|"xl"|"xxl")
 * headerCta.headerCta — desktop CTA; headerCta.headerMobileCta — mobile CTA
 */
export const GET_HEADER_OPTIONS = gql`
  query GetHeaderOptions {
    themeHeaderOptions {
      settingsHeaderOptions {
        headerPosition
        hideHeader
        shrinkHeader
        hideHeaderContent
        headerAlertMessage
        alertLayout
        navbarBreakpoint
        hamburgerAnimation
        headerLogoUseOriginalColor
        brandHeight
        enableMegaMenus
        navItemRelative
        containerRelative
        hoverDropdown
        toggleMenus
        enableMenuIcons
        includeMenuOverlay
        removeHeaderContainers
        siteHeaderLayout {
          headerLayout
        }
        headerCta {
          headerCta {
            link { title url target }
            style
            placement
            size
            outline
            disabled
            element
            toggle
          }
          headerMobileCta {
            link { title url target }
            style
            placement
            size
            outline
            disabled
            element
            toggle
          }
        }
      }
    }
  }
`;

export const GET_HEADER_LAYOUT_OPTIONS = gql`
  query GetHeaderLayoutOptions {
    themeOptions {
      headerLayoutOptions {
        showMobileCtaButton
        hidePrimaryNav
        hideSecondaryNav
        hideSocialNav
        hideHeaderCta
        hideHeaderSearch
        fullWidthHeader
        centerHeaderContent
        desktopLogoRight
        alignMobileCtaButton
        fullHeightMobileCtaButton
        navToggleRelativeToContainer
        centerNavToggle
        inlineMobileNavToggle
        reverseMobileButtons
        mobileNavMenuPosition
        alignNavToContent
        fullScreenNav
        centerMobileNavContent
      }
    }
  }
`;

/**
 * Fetch global footer content: contact info, disclaimer, attribution.
 * Powered by the "Theme Footer Options" ACF sub-page.
 * WPGraphQL wraps ACF options fields: themeFooterOptions.settingsFooterOptions
 *
 * footerDisclaimer and footerAttribution are wysiwyg fields — render as HTML.
 */
export const GET_FOOTER_OPTIONS = gql`
  query GetFooterOptions {
    themeFooterOptions {
      settingsFooterOptions {
        hideFooterContent
        stickyFooter
        removeFooterContainers
        fluidFooterContainers
        footerLogoUseOriginalColor
        siteFooterLayout {
          footerLayout
        }
        footerContactPhone {
          phoneLabel
          phoneNumber
        }
        footerContactEmail {
          emailLabel
          emailAddress
        }
        footerContactAddress {
          addressLabel
          address
        }
        footerDisclaimer
        footerAttribution
        footerCta {
          link { title url target }
          style
          placement
          size
          outline
          disabled
          element
          toggle
        }
      }
    }
  }
`;

/**
 * Fetch traveling-CTA configuration from Theme Footer Options.
 * hideTravelingCta / style / toggle are returned as string arrays by WPGraphQL —
 * always take [0] or check with includes().
 */
export const GET_TRAVELING_CTA_OPTIONS = gql`
  query GetTravelingCtaOptions {
    themeFooterOptions {
      settingsFooterOptions {
        hideTravelingCta
        tctaAutoWidth
        includeTctaContainer
        tctaFullWidth
        tctaBgColor {
          bgColor
          bgThemeColor
          bgCustomColor
        }
        tctaBorder {
          top {
            width
            style
            color
            themeColor
            customColor
          }
        }
        tctaBorderRadius {
          topLeft
          topRight
        }
        tctaAlignment {
          horAlign {
            breakpoint
            alignment
          }
        }
        tctaPadding {
          padding {
            top
            bottom
            left
            right
          }
        }
        travelingCtas {
          link { title url target }
          style
          size
          outline
          fullWidth
          toggle
          active
          disabled
          element
          hideLabel
          classes
          display { display }
          textColor { color customColor }
        }
      }
    }
  }
`;

export const GET_FOOTER_LAYOUT_OPTIONS = gql`
  query GetFooterLayoutOptions {
    themeOptions {
      footerLayoutOptions {
        hideFooterBrand
        hideFooterCta
        hideFooterNav
        hideFooterSocialNav
        hideFooterSearch
        hideFooterContactInfo
        hideFooterDisclaimer
        hideFooterAttribution
        hideFooterUtilityNav
        hideFooterCopyright
        hideFooterCopyrightLabel
        hideFooterCopyrightIcon
        hideFooterCopyrightYear
        hideFooterCopyrightSiteName
        footerTwoColumnLayout
        footerReverseColumnLayout
        footerReverseMetaColumns
      }
    }
  }
`;

export const GET_CO_BRAND = gql`
  query GetCoBrand {
    themeGeneralOptions {
      settingsThemeGeneralOptions {
        coBrand {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

/**
 * Fetch the registered custom menu location and widget area slugs.
 * Use menuSlug values with GET_MENU_BY_LOCATION to resolve actual nav menus.
 * Powered by the "Menu & Widget Options" ACF options page.
 */
export const GET_MENU_WIDGET_OPTIONS = gql`
  query GetMenuWidgetOptions {
    menuWidgetOptions {
      settingsMenuWidgetOptions {
        customMenuLocations {
          menuLabel
          menuSlug
          enableMegaMenu
        }
        customWidgetAreas {
          widgetLabel
          widgetSlug
          widgetDescription
        }
      }
    }
  }
`;

/**
 * Fetch the content-wrapper container settings from Theme General Options.
 * Used by ContentWrapperPattern / page templates to determine container behavior
 * and by SectionBlock and RowBlock to decide whether to render their own .container div.
 *
 * removeContentContainers — when true, block-level containers are omitted
 *   (CSS no longer driven by body `include-content-containers` class).
 * removePageHeaderContainers — when true, the page-header element should
 *   receive `remove-page-header-containers` to opt out of container styling.
 */
export const GET_CONTENT_WRAPPER_OPTIONS = gql`
  query GetContentWrapperOptions {
    themeGeneralOptions {
      settingsThemeGeneralOptions {
        removeContentContainers
        removePageHeaderContainers
      }
    }
  }
`;

export default GET_THEME_GENERAL_OPTIONS;

import { gql } from "@apollo/client";

/**
 * Fetch global theme identity, analytics, and verification codes.
 * Powered by the "Theme General Options" ACF options page.
 * Requires WPGraphQL for ACF with show_in_graphql enabled on this group.
 *
 * Image fields (orgLogo, siteOgImage) return MediaItem — request subfields.
 * orgSameAs returns a textarea; parse as newline-delimited URLs for schema.org sameAs.
 */
export const GET_THEME_GENERAL_OPTIONS = gql`
  query GetThemeGeneralOptions {
    settingsThemeGeneralOptions {
      orgName
      orgLogo {
        node {
          sourceUrl
          altText
        }
      }
      siteOgImage {
        node {
          sourceUrl
          altText
        }
      }
      orgSameAs
      llmsEnabled
      llmsAbout
      enableGtm
      enableDirectGa
      enableOnetrust
      onetrustDomainScriptId
      googleSiteVerification
      bingSiteVerification
      facebookDomainVerification
      gtmConfiguration {
        gtmContainerId
        gtmRequireConsent
        gtmConsentCookieName
      }
      gaMeasurementId
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
        navbarBreakpoint
        headerCta {
          headerCta {
            link { title url target }
            style
            placement
            size
            outline
            disabled
          }
          headerMobileCta {
            link { title url target }
            style
            placement
            size
            outline
            disabled
          }
        }
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
`;

export default GET_THEME_GENERAL_OPTIONS;

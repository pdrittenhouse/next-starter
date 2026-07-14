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
 * Fetch global header behavior and alert bar content.
 * Powered by the "Header Options" ACF options page.
 *
 * headerPosition: "fixed" | "sticky" | "absolute" | "" (static)
 */
export const GET_HEADER_OPTIONS = gql`
  query GetHeaderOptions {
    settingsHeaderOptions {
      headerPosition
      hideHeader
      shrinkHeader
      hideHeaderContent
      headerAlertMessage
    }
  }
`;

/**
 * Fetch global footer content: contact info, disclaimer, attribution, traveling CTA toggle.
 * Powered by the "Footer Options" ACF options page.
 *
 * footerDisclaimer and footerAttribution are wysiwyg fields — render as HTML.
 * hideTravelingCta: "1" (hide) | "0" or "" (show)
 */
export const GET_FOOTER_OPTIONS = gql`
  query GetFooterOptions {
    settingsFooterOptions {
      stickyFooter
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
      hideTravelingCta
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

import {gql} from "@apollo/client";

export const GET_CUSTOMIZER_SETTINGS = gql`
    query GetCustomizerSettings {
      customizerSettings {
        customLogo {
          id
          sourceUrl
          altText
        }
        customLogoUrl
        siteIcon {
          id
          sourceUrl
          altText
        }
        siteIconUrl
        headerImage
        headerImageData {
          id
          sourceUrl
          altText
        }
        headerTextColor
        backgroundColor
        displayHeaderText
        backgroundImage
        backgroundRepeat
        backgroundPosition
        backgroundSize
        backgroundAttachment
        customCss
        menuLocations
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
      generalSettings {
        title
        description
      }
    }
`;

export default GET_CUSTOMIZER_SETTINGS;

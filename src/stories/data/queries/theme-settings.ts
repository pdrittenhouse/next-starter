import {gql} from "@apollo/client";

export const GET_THEME_SETTINGS = gql`
    query GetThemeSettings {
      themeSettings {
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
        headerTextColor
        backgroundColor
        displayHeaderText
        backgroundImage
        backgroundRepeat
        backgroundPosition
        backgroundSize
        backgroundAttachment
        customCss
        widgets
        menuLocations
      }
    }
`;

export default GET_THEME_SETTINGS;

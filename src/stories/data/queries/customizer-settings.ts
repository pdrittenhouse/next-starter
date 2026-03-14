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

export default GET_CUSTOMIZER_SETTINGS;

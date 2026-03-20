import {gql} from "@apollo/client";

export const GET_SITE_HEALTH = gql`
    query GetSiteHealth {
      siteHealth {
        wpVersion
        phpVersion
        mysqlVersion
        serverSoftware
        isMultisite
        siteUrl
        homeUrl
        wpDebug
        memoryLimit
        maxUploadSize
        timezone
        dateFormat
        timeFormat
        language
        isRtl
        activeTheme {
          name
          version
          themeUri
          textDomain
        }
      }
    }
`;

export default GET_SITE_HEALTH;

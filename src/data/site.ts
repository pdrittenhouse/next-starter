import { gql } from "@apollo/client";

export const GET_SITE_DATA = gql`
  query GetSiteData {
      generalSettings {
        description
        language
        timezone
        timeFormat
        title
        url
        dateFormat
        startOfWeek
      }
    }
`;

export default GET_SITE_DATA;

import {gql} from "@apollo/client";

export const GET_PERMALINK_SETTINGS = gql`
    query GetPermalinkSettings {
      permalinkSettings {
        structure
        categoryBase
        tagBase
        rewriteRules {
          pattern
          query
        }
      }
    }
`;

export default GET_PERMALINK_SETTINGS;

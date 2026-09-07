import {gql} from "@apollo/client";

export const GET_PERMALINK_SETTINGS = gql`
    query GetPermalinkSettings {
      permalinkSettings {
        id
        structure
        categoryBase
        tagBase
      }
    }
`;

export default GET_PERMALINK_SETTINGS;

import {gql} from "@apollo/client";

export const GET_ALL_THEMES = gql`
    query GetAllThemes {
      themes {
        edges {
          node {
            id
            name
            slug
            version
            description
            author
            authorUri
            themeUri
            screenshot
            tags
          }
        }
      }
    }
`;

export default GET_ALL_THEMES;

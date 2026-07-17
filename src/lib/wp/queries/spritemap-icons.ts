import { gql } from "@apollo/client";

export const GET_SPRITEMAP_ICONS = gql`
  query GetSpritemapIcons {
    spritemapIcons {
      url
    }
  }
`;

export default GET_SPRITEMAP_ICONS;

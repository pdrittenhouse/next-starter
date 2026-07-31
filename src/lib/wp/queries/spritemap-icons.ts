import { gql } from "@apollo/client";

export const GET_SPRITEMAP_ICONS = gql`
  query GetSpritemapIcons {
    spritemapIcons {
      spritemap
      url
      scss
    }
  }
`;

export default GET_SPRITEMAP_ICONS;

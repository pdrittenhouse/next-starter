import { gql } from "@apollo/client";

export const GET_FONT_OPTIONS_CSS = gql`
  query GetFontOptionsCss {
    fontOptionsCss
  }
`;

export default GET_FONT_OPTIONS_CSS;

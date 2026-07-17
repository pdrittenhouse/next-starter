import { gql } from "@apollo/client";

export const GET_CUSTOMIZER_CSS = gql`
  query GetCustomizerCss {
    customizerCss
  }
`;

export default GET_CUSTOMIZER_CSS;

import { gql } from "@apollo/client";

export const GET_GLOBAL_STYLES_CSS = gql`
  query GetGlobalStylesCss {
    globalStylesCss
  }
`;

export default GET_GLOBAL_STYLES_CSS;

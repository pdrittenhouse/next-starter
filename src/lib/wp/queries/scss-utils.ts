import { gql } from "@apollo/client";

export const GET_SCSS_UTILS = gql`
  query GetScssUtils {
    scssUtils {
      functions {
        name
        content
      }
      mixins {
        name
        content
      }
    }
  }
`;

export default GET_SCSS_UTILS;

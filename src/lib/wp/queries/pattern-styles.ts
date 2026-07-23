import { gql } from "@apollo/client";

export const GET_PATTERN_STYLES = gql`
  query GetPatternStyles {
    patternStyles {
      patterns {
        name
        level
        scss
      }
      blocks {
        block
        patterns
      }
    }
  }
`;

export default GET_PATTERN_STYLES;

import { gql } from "@apollo/client";

export const GET_TEMPLATE_PATTERNS = gql`
  query GetTemplatePatterns {
    templatePatterns {
      version
      patterns {
        slug
        base
        variant
        level
        source
      }
      templates {
        key
        file
        patterns {
          slug
          base
          variant
          level
          source
        }
      }
    }
  }
`;

export default GET_TEMPLATE_PATTERNS;

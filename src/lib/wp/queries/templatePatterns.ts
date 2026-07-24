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
        tree {
          type
          slug
          name
          source
          level
          file
          children {
            type
            slug
            name
            source
            level
            file
            children {
              type
              slug
              name
              source
              level
              file
              children {
                type
                slug
                name
                source
                level
                file
              }
            }
          }
        }
      }
    }
  }
`;

export default GET_TEMPLATE_PATTERNS;

import {gql} from "@apollo/client";

export const GET_BLOCK_PATTERNS = gql`
    query GetBlockPatterns {
      blockPatterns {
        name
        title
        description
        content
        categories
        keywords
        viewportWidth
        blockTypes
        source
      }
      blockPatternCategories {
        name
        label
      }
    }
`;

export default GET_BLOCK_PATTERNS;

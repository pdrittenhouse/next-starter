import { gql } from "@apollo/client";

export const GET_DESIGN_TOKENS = gql`
  query GetDesignTokens {
    designTokens {
      name
      value
    }
  }
`;

export default GET_DESIGN_TOKENS;

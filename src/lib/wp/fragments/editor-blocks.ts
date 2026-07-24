import { gql } from "@apollo/client";

/** Base editor block fields (WPGraphQL Content Blocks plugin). */
export const EDITOR_BLOCK_FIELDS = gql`
  fragment EditorBlockFields on EditorBlock {
    name
    clientId
    parentClientId
    renderedHtml
    attributesJSON
  }
`;

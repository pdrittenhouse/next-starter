import { gql } from "@apollo/client";

/** Editor block fields (WPGraphQL Content Blocks plugin). */
export const EDITOR_BLOCK_FIELDS = gql`
  fragment EditorBlockFields on EditorBlock {
    name
    clientId
    parentClientId
    renderedHtml
  }
`;

/**
 * Inline editor blocks selection string for use in dynamic query builders.
 */
export const EDITOR_BLOCKS_SELECTION = `
  editorBlocks {
    name
    clientId
    parentClientId
    renderedHtml
  }
`;

export interface EditorBlock {
  name: string;
  clientId: string;
  parentClientId: string | null;
  renderedHtml: string;
  attributesJSON?: string | null;
}

export type BlockAttributes = Record<string, unknown>;

export function parseBlockAttributes(block: EditorBlock): BlockAttributes {
  if (!block.attributesJSON) return {};
  try {
    return JSON.parse(block.attributesJSON) as BlockAttributes;
  } catch {
    return {};
  }
}

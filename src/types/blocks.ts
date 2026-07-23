export type { WpEditorBlock as EditorBlock } from '@/lib/wp/types/common';

export type BlockAttributes = Record<string, unknown>;

export function parseBlockAttributes(block: EditorBlock): BlockAttributes {
  if (!block.attributesJSON) return {};
  try {
    return JSON.parse(block.attributesJSON) as BlockAttributes;
  } catch {
    return {};
  }
}

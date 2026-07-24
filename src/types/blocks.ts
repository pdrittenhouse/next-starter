import type { WpEditorBlock } from '@/lib/wp/types/common';

export type { WpEditorBlock as EditorBlock };

export type BlockAttributes = Record<string, unknown>;

export function parseBlockAttributes(block: WpEditorBlock): BlockAttributes {
  if (!block.attributesJSON) return {};
  try {
    return JSON.parse(block.attributesJSON) as BlockAttributes;
  } catch {
    return {};
  }
}

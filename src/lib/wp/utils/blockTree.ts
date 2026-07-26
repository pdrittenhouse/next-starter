import type { WpEditorBlock } from '@/lib/wp/types/common';

/**
 * Converts the flat block array returned by WPGraphQL (each block has a
 * parentClientId but no innerBlocks) into a nested tree. Returns only the
 * root-level blocks; each block's innerBlocks is populated with its direct
 * children, in document order.
 *
 * Pass the result directly to BlockRenderer — it recurses using innerBlocks
 * and no longer needs to filter by parentClientId.
 */
export function buildBlockTree(flat: WpEditorBlock[]): WpEditorBlock[] {
  if (!flat?.length) return [];

  const map = new Map<string, WpEditorBlock>();
  const roots: WpEditorBlock[] = [];

  for (const block of flat) {
    map.set(block.clientId, { ...block, innerBlocks: [] });
  }

  for (const block of flat) {
    const node = map.get(block.clientId)!;
    if (block.parentClientId && map.has(block.parentClientId)) {
      map.get(block.parentClientId)!.innerBlocks!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

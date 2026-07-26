import type { EditorBlock } from '@/types/blocks';
import { BLOCK_MAP } from '@/lib/registries/BLOCK_MAP';

export type { EditorBlock };

interface BlockRendererProps {
  blocks: EditorBlock[];
}

// Renders a block tree built by buildBlockTree().
// For registered BLOCK_MAP components, inner blocks are rendered recursively
// and passed as children — container blocks render {children} instead of
// dangerouslySetInnerHTML. Unregistered blocks fall back to renderedHtml, which
// has WP-rendered inner content already baked in (no headless substitution).
export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map(block => {
        const Component = BLOCK_MAP[block.name];
        const innerBlocks: EditorBlock[] = block.innerBlocks ?? [];

        if (Component) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Comp = Component as any;
          const children = innerBlocks.length > 0
            ? <BlockRenderer blocks={innerBlocks} />
            : undefined;
          return <Comp key={block.clientId} block={block}>{children}</Comp>;
        }

        return (
          <div
            key={block.clientId}
            dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }}
          />
        );
      })}
    </>
  );
}

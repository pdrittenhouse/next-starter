import type { EditorBlock } from '@/types/blocks';
import { BLOCK_MAP } from '@/lib/registries/BLOCK_MAP';

export type { EditorBlock };

export interface BlockRenderContext {
  parentContainerSet?: boolean;
  /** Per-post/page override forwarded from the page template — activates block-level
   *  container rendering even when the global "Disable Content Containers" is off. */
  removeContentContainerPerPost?: boolean;
}

interface BlockRendererProps {
  blocks: EditorBlock[];
  context?: BlockRenderContext;
}

// Renders a block tree built by buildBlockTree().
// For registered BLOCK_MAP components, inner blocks are rendered recursively
// and passed as children — container blocks render {children} instead of
// dangerouslySetInnerHTML. Unregistered blocks fall back to renderedHtml, which
// has WP-rendered inner content already baked in (no headless substitution).
//
// The optional `context` prop is injected into each block as `_context` so child
// components can read parent state without prop drilling. Inner blocks always
// start with fresh context (not inherited from the parent level).
export function BlockRenderer({ blocks, context }: BlockRendererProps) {
  return (
    <>
      {blocks.map(block => {
        const Component = BLOCK_MAP[block.name];
        const innerBlocks: EditorBlock[] = block.innerBlocks ?? [];

        if (Component) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Comp = Component as any;
          const blockWithCtx = context ? { ...block, _context: context } : block;
          // Preserve removeContentContainerPerPost for nested blocks (parentContainerSet
          // is block-specific and must not cascade beyond where it was set).
          const childContext: BlockRenderContext | undefined = context?.removeContentContainerPerPost
            ? { removeContentContainerPerPost: context.removeContentContainerPerPost }
            : undefined;
          const children = innerBlocks.length > 0
            ? <BlockRenderer blocks={innerBlocks} context={childContext} />
            : undefined;
          return <Comp key={block.clientId} block={blockWithCtx}>{children}</Comp>;
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

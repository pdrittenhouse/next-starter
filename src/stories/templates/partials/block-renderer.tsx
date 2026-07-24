import type { ComponentType } from 'react';
import type { EditorBlock } from '@/types/blocks';
import { BLOCK_MAP } from '@/lib/registries/BLOCK_MAP';

export type { EditorBlock };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockComponent = ComponentType<{ block: any }>;

interface BlockRendererProps {
  blocks: EditorBlock[];
}

// Renders top-level blocks only — inner blocks are included in each parent's
// renderedHtml, so rendering them separately would duplicate content.
// When a headless component exists in BLOCK_MAP, it renders instead of the
// raw HTML; otherwise renderedHtml is injected directly (same as node.content).
export function BlockRenderer({ blocks }: BlockRendererProps) {
  const topLevel = blocks.filter(b => !b.parentClientId);

  return (
    <>
      {topLevel.map(block => {
        const Component = BLOCK_MAP[block.name];
        if (Component) {
          return <Component key={block.clientId} block={block} />;
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

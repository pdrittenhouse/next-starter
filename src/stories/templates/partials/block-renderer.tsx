import type { ComponentType } from 'react';

export interface EditorBlock {
  name: string;
  clientId: string;
  parentClientId: string | null;
  renderedHtml: string;
}

type BlockComponent = ComponentType<{ block: EditorBlock }>;

// Register headless components here as the component library grows.
// key: WP block name   e.g. 'core/image', 'acf/hero'
// value: React component that accepts { block: EditorBlock }
const BLOCK_MAP: Record<string, BlockComponent> = {
  // 'core/image': CoreImage,
  // 'acf/hero': Hero,
};

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
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
      })}
    </>
  );
}

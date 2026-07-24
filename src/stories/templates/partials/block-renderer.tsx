import type { ComponentType } from 'react';
import type { EditorBlock } from '@/types/blocks';

export type { EditorBlock };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockComponent = ComponentType<{ block: any }>;

// Register headless components here as the component library grows.
// key: WP block name   e.g. 'core/image', 'acf/hero'
// value: React component that accepts { block }
//
// core/* blocks not in this map fall through to dangerouslySetInnerHTML using
// renderedHtml — they pick up styles from @wordpress/block-library imported via
// src/scss/printing/wordpress/blocks/wp-core/_image.scss (and peer files).
const BLOCK_MAP: Record<string, BlockComponent> = {};

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

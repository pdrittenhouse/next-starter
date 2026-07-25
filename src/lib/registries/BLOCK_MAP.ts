import type { ReactNode } from 'react';
import { ImageBlock } from '@/stories/blocks/image/ImageBlock';

// Accepts both sync and async function components — Next.js App Router server
// components are async by nature and don't satisfy React's ComponentType.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockComponent = (props: { block: any }) => ReactNode | Promise<ReactNode>;

// Maps WordPress block names to headless React components.
// key: WP block name  e.g. 'acf/image', 'core/image'
// value: React component (sync or async) that accepts { block }
//
// Blocks not in this map fall through to dangerouslySetInnerHTML using
// renderedHtml — they pick up styles from @wordpress/block-library imported via
// src/scss/printing/wordpress/blocks/wp-core/_image.scss (and peer files).
export const BLOCK_MAP: Record<string, BlockComponent> = {
  'acf/image': ImageBlock,
};

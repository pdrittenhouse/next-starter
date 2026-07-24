import type { ComponentType } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockComponent = ComponentType<{ block: any }>;

// Maps WordPress block names to headless React components.
// key: WP block name  e.g. 'core/image', 'acf/hero'
// value: React component that accepts { block }
//
// Blocks not in this map fall through to dangerouslySetInnerHTML using
// renderedHtml — they pick up styles from @wordpress/block-library imported via
// src/scss/printing/wordpress/blocks/wp-core/_image.scss (and peer files).
export const BLOCK_MAP: Record<string, BlockComponent> = {};

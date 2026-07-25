import type { ReactNode } from 'react';
import { AccordionBlock } from '@/stories/blocks/accordion/AccordionBlock';
import { AlertBlock } from '@/stories/blocks/alert/AlertBlock';
import { BreadcrumbBlock } from '@/stories/blocks/breadcrumb/BreadcrumbBlock';
import { ButtonBlock } from '@/stories/blocks/button/ButtonBlock';
import { ButtonGroupBlock } from '@/stories/blocks/button-group/ButtonGroupBlock';
import { CardBlock } from '@/stories/blocks/card/CardBlock';
import { CardGridBlock } from '@/stories/blocks/card-grid/CardGridBlock';
import { ImageBlock } from '@/stories/blocks/image/ImageBlock';
import { JumbotronBlock } from '@/stories/blocks/jumbotron/JumbotronBlock';
import { ModalBlock } from '@/stories/blocks/modal/ModalBlock';
import { TableBlock } from '@/stories/blocks/table/TableBlock';
import { TabsBlock } from '@/stories/blocks/tabs/TabsBlock';
import { VideoBlock } from '@/stories/blocks/video/VideoBlock';

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
  'acf/accordion': AccordionBlock,
  'acf/alert': AlertBlock,
  'acf/breadcrumb': BreadcrumbBlock,
  'acf/button': ButtonBlock,
  'acf/button-group': ButtonGroupBlock,
  'acf/card': CardBlock,
  'acf/card-grid': CardGridBlock,
  'acf/image': ImageBlock,
  'acf/jumbotron': JumbotronBlock,
  'acf/modal': ModalBlock,
  'acf/table': TableBlock,
  'acf/tabs': TabsBlock,
  'acf/video': VideoBlock,
};

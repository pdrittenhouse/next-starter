import type { ReactNode } from 'react';
import { AccordionBlock } from '@/stories/blocks/accordion/AccordionBlock';
import { AccordionItemBlock } from '@/stories/blocks/accordion-item/AccordionItemBlock';
import { AlertBlock } from '@/stories/blocks/alert/AlertBlock';
import { BrandingBlock } from '@/stories/blocks/branding/BrandingBlock';
import { BreadcrumbBlock } from '@/stories/blocks/breadcrumb/BreadcrumbBlock';
import { ButtonBlock } from '@/stories/blocks/button/ButtonBlock';
import { ButtonGroupBlock } from '@/stories/blocks/button-group/ButtonGroupBlock';
import { ButtonTextBlock } from '@/stories/blocks/button-text/ButtonTextBlock';
import { CardBlock } from '@/stories/blocks/card/CardBlock';
import { CardGridBlock } from '@/stories/blocks/card-grid/CardGridBlock';
import { ColumnBlock } from '@/stories/blocks/column/ColumnBlock';
import { CopyrightBlock } from '@/stories/blocks/copyright/CopyrightBlock';
import { GroupBlock } from '@/stories/blocks/group/GroupBlock';
import { HeroUnitBlock } from '@/stories/blocks/hero-unit/HeroUnitBlock';
import { IconsBlock } from '@/stories/blocks/icons/IconsBlock';
import { ImageBlock } from '@/stories/blocks/image/ImageBlock';
import { JumbotronBlock } from '@/stories/blocks/jumbotron/JumbotronBlock';
import { LinkGroupBlock } from '@/stories/blocks/link-group/LinkGroupBlock';
import { MenuBlock } from '@/stories/blocks/menu/MenuBlock';
import { ModalBlock } from '@/stories/blocks/modal/ModalBlock';
import { OffcanvasBlock } from '@/stories/blocks/offcanvas/OffcanvasBlock';
import { PatternBlock } from '@/stories/blocks/pattern/PatternBlock';
import { PostMetaBlock } from '@/stories/blocks/post-meta/PostMetaBlock';
import { PostsLoopBlock } from '@/stories/blocks/posts-loop/PostsLoopBlock';
import { QuoteBlock } from '@/stories/blocks/quote/QuoteBlock';
import { RowBlock } from '@/stories/blocks/row/RowBlock';
import { SearchBarBlock } from '@/stories/blocks/search-bar/SearchBarBlock';
import { SectionBlock } from '@/stories/blocks/section/SectionBlock';
import { SidebarBlock } from '@/stories/blocks/sidebar/SidebarBlock';
import { SlideBlock } from '@/stories/blocks/slide/SlideBlock';
import { SliderBlock } from '@/stories/blocks/slider/SliderBlock';
import { SocialShareBlock } from '@/stories/blocks/social-share/SocialShareBlock';
import { TabBlock } from '@/stories/blocks/tab/TabBlock';
import { TableBlock } from '@/stories/blocks/table/TableBlock';
import { TableBodyBlock } from '@/stories/blocks/table-body/TableBodyBlock';
import { TableCellBlock } from '@/stories/blocks/table-cell/TableCellBlock';
import { TableFootBlock } from '@/stories/blocks/table-foot/TableFootBlock';
import { TableHeadBlock } from '@/stories/blocks/table-head/TableHeadBlock';
import { TableRowBlock } from '@/stories/blocks/table-row/TableRowBlock';
import { TabsBlock } from '@/stories/blocks/tabs/TabsBlock';
import { VideoBlock } from '@/stories/blocks/video/VideoBlock';

// Accepts both sync and async function components — Next.js App Router server
// components are async by nature and don't satisfy React's ComponentType.
// children is passed by BlockRenderer when the block has inner blocks; container
// components render it instead of dangerouslySetInnerHTML. Leaf blocks ignore it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockComponent = (props: { block: any; children?: ReactNode }) => ReactNode | Promise<ReactNode>;

// Maps WordPress block names to headless React components.
// key: WP block name  e.g. 'acf/image', 'core/image'
// value: React component (sync or async) that accepts { block }
//
// Blocks not in this map fall through to dangerouslySetInnerHTML using
// renderedHtml — they pick up styles from @wordpress/block-library imported via
// src/scss/printing/wordpress/blocks/wp-core/_image.scss (and peer files).
export const BLOCK_MAP: Record<string, BlockComponent> = {
  'acf/accordion': AccordionBlock,
  'acf/accordion-item': AccordionItemBlock,
  'acf/alert': AlertBlock,
  'acf/branding': BrandingBlock,
  'acf/breadcrumb': BreadcrumbBlock,
  'acf/button': ButtonBlock,
  'acf/button-group': ButtonGroupBlock,
  'acf/button-text': ButtonTextBlock,
  'acf/card': CardBlock,
  'acf/card-grid': CardGridBlock,
  'acf/column': ColumnBlock,
  'acf/copyright': CopyrightBlock,
  'acf/group': GroupBlock,
  'acf/hero-unit': HeroUnitBlock,
  'acf/icons': IconsBlock,
  'acf/image': ImageBlock,
  'acf/jumbotron': JumbotronBlock,
  'acf/link-group': LinkGroupBlock,
  'acf/menu': MenuBlock,
  'acf/modal': ModalBlock,
  'acf/offcanvas': OffcanvasBlock,
  'acf/pattern': PatternBlock,
  'acf/post-meta': PostMetaBlock,
  'acf/posts-loop': PostsLoopBlock,
  'acf/quote': QuoteBlock,
  'acf/row': RowBlock,
  'acf/search-bar': SearchBarBlock,
  'acf/section': SectionBlock,
  'acf/sidebar': SidebarBlock,
  'acf/slide': SlideBlock,
  'acf/slider': SliderBlock,
  'acf/social-share': SocialShareBlock,
  'acf/tab': TabBlock,
  'acf/table': TableBlock,
  'acf/table-body': TableBodyBlock,
  'acf/table-cell': TableCellBlock,
  'acf/table-foot': TableFootBlock,
  'acf/table-head': TableHeadBlock,
  'acf/table-row': TableRowBlock,
  'acf/tabs': TabsBlock,
  'acf/video': VideoBlock,
};

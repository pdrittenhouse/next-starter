import { Accordion } from '@/stories/molecules/accordion/Accordion';
import type { AccordionItem } from '@/stories/molecules/accordion/Accordion';
import type { ButtonVariant } from '@/stories/atoms/button/Button';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { buildAcfBlockStyle } from '@/lib/wp/utils/buildAcfBlockStyle';
import styles from './accordion.module.scss';
import { cx } from '@/lib/cx';

/**
 * ACF field values for the acf/accordion wrapper block.
 *
 * Field mapping from accordion.twig:
 *   fields.id['id']                        → id.id        (explicit HTML id)
 *   fields.id['id_gen']                    → id.id_gen    (generated id suffix)
 *   fields.flush                           → flush
 *   fields.always_open                     → always_open
 *   fields.layout.accordion_layout         → layout.accordion_layout
 *   fields.margin['margin']['top']['top']  → margin.margin.top.top  (px value)
 *   fields.margin['margin']['top']['auto'] → margin.margin.top.auto (auto flag)
 *   (same pattern for bottom, left, right)
 */
interface AccordionBlockData {
  id?: {
    id?: string | null;
    id_gen?: string | number | null;
    show_ids?: boolean;
  };
  flush?: boolean;
  always_open?: boolean;
  layout?: {
    accordion_layout?: string | null;
  };
  margin?: {
    margin?: {
      top?: { top?: number | null; auto?: boolean };
      bottom?: { bottom?: number | null; auto?: boolean };
      left?: { left?: number | null; auto?: boolean };
      right?: { right?: number | null; auto?: boolean };
    };
  };
}

/**
 * ACF field values for each acf/accordion-item inner block.
 *
 * Field mapping from accordion-item.twig:
 *   fields.header                → button label text
 *   fields.active                → item starts open
 *   fields.header_element        → accordion header element (h2, h3, etc.)
 *   fields.button.style          → color variant (non-custom) or 'custom'
 *   fields.button.size           → sm | lg
 *   fields.button.outline        → outline variant
 *   fields.button.element        → HTML element (button | a | input)
 *   fields.button.disabled       → disabled state
 *   fields.button.value          → value attribute
 *   fields.button.nowrap         → text-nowrap
 *   fields.button.classes        → extra CSS classes
 *   fields.id.id                 → explicit item HTML id
 *   fields.id.id_gen             → generated item id suffix
 *   fields.accordion_item_classes → extra accordion-item wrapper classes (array)
 */
interface AccordionItemBlockData {
  header?: string | null;
  active?: boolean;
  header_element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | null;
  button?: {
    style?: string | null;
    size?: 'sm' | 'lg' | null;
    outline?: boolean;
    element?: 'button' | 'a' | 'input' | null;
    disabled?: boolean;
    value?: string | null;
    nowrap?: boolean;
    classes?: string | null;
  };
  id?: {
    id?: string | null;
    id_gen?: string | number | null;
  };
  accordion_item_classes?: string[] | null;
}

interface AccordionBlockProps {
  block: EditorBlock;
}


/**
 * Accordion block — mirrors `src/templates/blocks/accordion/accordion.twig`.
 *
 * Maps the acf/accordion wrapper block's ACF fields to the Accordion molecule:
 *   - Wrapper props: id, flush, alwaysOpen, layout classes, margin inline styles.
 *   - Items: each acf/accordion-item inner block maps to an AccordionItem.
 *     Header text and button settings come from the item's attributesJSON;
 *     body content is built from the item's own inner blocks' renderedHtml.
 *
 * WPGraphQL may return blocks as a flat list (parentClientId) or as nested
 * innerBlocks. When no nested acf/accordion-item blocks are found on the
 * block object, the component falls back to the block's fully-rendered
 * renderedHtml so the accordion is never silently swallowed.
 *
 * Registered in BLOCK_MAP as 'acf/accordion'.
 */
export async function AccordionBlock({ block }: AccordionBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: AccordionBlockData; className?: string };
  const data: AccordionBlockData = attrs?.data ?? {};

  // Accordion wrapper HTML id — mirrors accordion.twig's accordion_id logic
  const accordionId = data.id?.id
    ? data.id.id
    : data.id?.id_gen
    ? `accordion${data.id.id_gen}`
    : undefined;

  // Layout modifier class — mirrors accordion.twig's accordion_classes logic:
  //   layout != 'default' → 'accordion-{layout}'
  const layoutModifier =
    data.layout?.accordion_layout && data.layout.accordion_layout !== 'default'
      ? `accordion-${data.layout.accordion_layout}`
      : null;

  const blockClasses = [attrs.className, layoutModifier].filter(Boolean) as string[];

  // Inline styles — mirrors accordion.twig's accordion_styles / accordion_attributes.
  // Applied via a wrapper div (otherAttributes is Record<string, string>, can't carry CSSProperties).
  const { style: wrapperStyle } = buildAcfBlockStyle({ margin: data.margin });
  const hasStyle = !!wrapperStyle;

  // Access inner blocks — WPGraphQL nested queries surface acf/accordion-item
  // blocks here even though WpEditorBlock doesn't model the field (flat-list
  // queries use parentClientId instead and omit it).
  const rawInner = (block as unknown as Record<string, unknown>).innerBlocks;
  const innerBlocks: EditorBlock[] = Array.isArray(rawInner) ? (rawInner as EditorBlock[]) : [];
  const itemBlocks = innerBlocks.filter(b => b.name === 'acf/accordion-item');

  // Fallback: no nested block data available — use the fully-rendered WP HTML.
  // This preserves accordion output in flat-list WPGraphQL responses and keeps
  // the block from being silently dropped.
  if (itemBlocks.length === 0) {
    if (!block.renderedHtml) return null;
    return hasStyle ? (
      <div style={wrapperStyle} dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />
    ) : (
      <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />
    );
  }

  // Build AccordionItem[] from inner block data
  const items: AccordionItem[] = itemBlocks.map((itemBlock): AccordionItem => {
    const itemAttrs = parseBlockAttributes(itemBlock) as {
      data?: AccordionItemBlockData;
      className?: string;
    };
    const itemData: AccordionItemBlockData = itemAttrs?.data ?? {};

    // Item HTML id — mirrors accordion-item.twig's accordion_item_id logic
    const itemId = itemData.id?.id
      ? itemData.id.id
      : itemData.id?.id_gen
      ? `accordion-item${itemData.id.id_gen}`
      : undefined;

    // Button color variant — non-custom styles map directly to ButtonVariant.
    // 'custom' falls back to 'link'; custom inline styles are not ported headlessly.
    const buttonVariant: ButtonVariant =
      itemData.button?.style && itemData.button.style !== 'custom'
        ? (itemData.button.style as ButtonVariant)
        : 'link';

    // Item body content: concatenate the item's own inner blocks' renderedHtml.
    // These are the acf/accordion-item block's InnerBlocks (paragraphs, headings, etc.).
    const rawItemInner = (itemBlock as unknown as Record<string, unknown>).innerBlocks;
    const itemBodyBlocks: EditorBlock[] = Array.isArray(rawItemInner)
      ? (rawItemInner as EditorBlock[])
      : [];
    const bodyHtml = itemBodyBlocks.map(b => b.renderedHtml ?? '').join('');

    return {
      button: {
        label: itemData.header ?? undefined,
        variant: buttonVariant,
        size: itemData.button?.size ?? undefined,
        outline: itemData.button?.outline ?? false,
        as: itemData.button?.element ?? undefined,
        disabled: itemData.button?.disabled ?? false,
        value: itemData.button?.value ?? undefined,
        nowrap: itemData.button?.nowrap ?? false,
        className: itemData.button?.classes ?? undefined,
      },
      active: itemData.active ?? false,
      // Mirrors block_context['acf/fields']['always_open'] in accordion-item.twig:
      // the parent accordion's always_open value propagates to each item's
      // data-bs-parent binding (omitted when true, present when false).
      alwaysOpen: data.always_open ?? false,
      headerElement: itemData.header_element ?? 'h2',
      itemId,
      itemClasses: itemData.accordion_item_classes ?? undefined,
      itemOtherClasses: itemAttrs.className ?? undefined,
      // Body content rendered by WP — injected as raw HTML inside the accordion panel.
      content: bodyHtml ? (
        <div
          className={cx(styles, 'inner-blocks-wrapper')}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : null,
    };
  });

  // Drop items without a button label — unusable accordion triggers
  const validItems = items.filter(item => item.button.label);
  if (validItems.length === 0) return null;

  const accordion = (
    <Accordion
      items={validItems}
      flush={data.flush ?? false}
      id={accordionId}
      classes={blockClasses.length > 0 ? blockClasses : undefined}
    />
  );

  // Wrap in a div when margin styles are present — the Accordion component's
  // otherAttributes is Record<string, string> and cannot carry a CSSProperties
  // object, so a wrapper div is the cleanest alternative.
  return hasStyle ? <div style={wrapperStyle}>{accordion}</div> : accordion;
}

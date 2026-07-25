'use client';

import React, { useId } from 'react';
import { Button } from '@/stories/atoms/button/Button';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import styles from './accordion.module.scss';

/**
 * A single accordion item.
 *
 * Maps to the per-item variables in `_accordion.tpl.twig`:
 *   - item.button.*                → button
 *   - item.item_active             → active
 *   - item.always_open             → alwaysOpen
 *   - item.accordion_header_element → headerElement
 *   - item.accordion_item_classes  → itemClasses
 *   - item.accordion_item_other_classes → itemOtherClasses
 *   - item.accordion_item_id       → itemId
 *   - item.accordion_item_other_attributes → itemOtherAttributes
 *   - item.content                 → content
 */
export interface AccordionItem {
  /** Accordion button props (label, variant, etc.). `toggle` and collapse wiring are set automatically. */
  button: Omit<ButtonProps, 'toggle' | 'target' | 'expanded' | 'controls'>;
  /** Whether this item starts open. Maps to `item_active`. */
  active?: boolean;
  /** When true, the panel stays open regardless of the parent accordion. Maps to `always_open`. */
  alwaysOpen?: boolean;
  /** HTML element for the accordion header. Defaults to `h2`. */
  headerElement?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Panel body content. Supports JSX. Maps to `item.content`. */
  content: React.ReactNode;
  /** Additional CSS classes for the accordion-item wrapper. */
  itemClasses?: string[];
  /** Additional plain-string classes for the accordion-item wrapper. */
  itemOtherClasses?: string;
  /** Explicit HTML id for the accordion-item wrapper. Auto-generated when omitted. */
  itemId?: string;
}

/**
 * Accordion molecule props — mirrors `_accordion.tpl.twig`.
 *
 * Available variables:
 *   - accordion_classes            → classes
 *   - accordion_other_classes      → otherClasses
 *   - accordion_id                 → id
 *   - accordion_flush              → flush
 *   - accordion_items              → items
 *   - accordion_attributes (data-pattern, id) are set automatically
 */
export interface AccordionProps {
  /** Array of accordion item objects. */
  items: AccordionItem[];
  /** Remove default background-color, some borders, and rounded corners (Bootstrap accordion-flush). */
  flush?: boolean;
  /** Explicit HTML id for the accordion wrapper. Auto-generated when omitted. */
  id?: string;
  /** Additional CSS class names for the accordion wrapper. */
  classes?: string[];
  /** Additional plain-string classes for the accordion wrapper. */
  otherClasses?: string;
  /** Additional HTML attributes for the accordion wrapper (key-value pairs). */
  otherAttributes?: Record<string, string>;
}

/**
 * A single accordion item — internal sub-component.
 *
 * Each item generates its own stable React key-based IDs via useId() so that
 * the collapse/header pair is always connected correctly, even when rendered
 * inside a list or conditional block.
 */
function AccordionItemComponent({
  item,
  accordionId,
}: {
  item: AccordionItem;
  accordionId: string;
}) {
  const uid = useId().replace(/:/g, '');
  const collapseId = `collapse_${uid}`;
  const headerId = `accordionHeader_${uid}`;

  const HeaderTag = (item.headerElement ?? 'h2') as React.ElementType;

  const itemClasses = [
    'accordion-item',
    ...(item.itemClasses ?? []),
    item.itemOtherClasses ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const collapseClasses = [
    'accordion-collapse',
    'collapse',
    item.active ? 'show' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Determine the data-bs-parent binding:
  // - omit when alwaysOpen is true
  // - otherwise bind to the parent accordion id so only one panel is open at a time
  const dataBsParent =
    item.alwaysOpen ? undefined : `#${accordionId}`;

  return (
    <div
      className={itemClasses}
      {...(item.itemId ? { id: item.itemId } : {})}
    >
      <HeaderTag className="accordion-header" id={headerId}>
        <Button
          {...item.button}
          className={[
            'accordion-button',
            item.active ? '' : 'collapsed',
            item.button.className ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
          toggle="collapse"
          target={`#${collapseId}`}
          expanded={item.active === true}
          controls={collapseId}
          active={item.active}
        />
      </HeaderTag>

      <div
        id={collapseId}
        className={collapseClasses}
        aria-labelledby={headerId}
        {...(dataBsParent ? { 'data-bs-parent': dataBsParent } : {})}
      >
        <div className="accordion-body">{item.content}</div>
      </div>
    </div>
  );
}

/**
 * Accordion molecule — mirrors `src/design-system/patterns/02-molecules/accordion/_accordion.tpl.twig`.
 *
 * Composes the Button atom for each accordion trigger. Bootstrap JS handles
 * show/hide via `data-bs-*` attributes; no client-side JS import is needed.
 *
 * @example
 * ```tsx
 * <Accordion
 *   items={[
 *     { button: { label: 'What is this?' }, content: 'An accordion.' },
 *     { button: { label: 'How does it work?' }, content: 'Bootstrap collapse.', active: true },
 *   ]}
 * />
 * ```
 */
export function Accordion({
  items,
  flush = false,
  id,
  classes = [],
  otherClasses,
  otherAttributes,
}: AccordionProps) {
  const generatedId = useId().replace(/:/g, '');
  const accordionId = id ?? `accordion_${generatedId}`;

  const accordionClasses = [
    'accordion',
    flush ? 'accordion-flush' : '',
    ...classes,
    otherClasses ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={accordionClasses}
      id={accordionId}
      data-pattern="timberland/accordion"
      {...otherAttributes}
    >
      {items.map((item, index) => (
        <AccordionItemComponent
          key={item.itemId ?? index}
          item={item}
          accordionId={accordionId}
        />
      ))}
    </div>
  );
}

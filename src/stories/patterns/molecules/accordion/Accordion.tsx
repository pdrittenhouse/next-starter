'use client';

import React, { useId, useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { Button } from '@/stories/patterns/atoms/button/Button';
import type { ButtonProps } from '@/stories/patterns/atoms/button/Button';
import styles from './accordion.module.scss';
import { cx } from '@/lib/cx';

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

// ---------------------------------------------------------------------------
// Internal sub-component: single accordion item
// ---------------------------------------------------------------------------

function AccordionItemComponent({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const uid = useId().replace(/:/g, '');
  const collapseId = `collapse_${uid}`;
  const headerId = `accordionHeader_${uid}`;

  const HeaderTag = (item.headerElement ?? 'h2') as React.ElementType;

  const itemClasses = cx(
    styles,
    'accordion-item',
    ...(item.itemClasses ?? []),
    item.itemOtherClasses,
  );

  return (
    <div
      className={itemClasses}
      {...(item.itemId ? { id: item.itemId } : {})}
    >
      <HeaderTag className={cx(styles, 'accordion-header')} id={headerId}>
        <Button
          {...(item.button as ButtonProps)}
          className={cx(
            styles,
            'accordion-button',
            !isOpen && 'collapsed',
            item.button.className,
          )}
          onClick={onToggle}
          expanded={isOpen}
          controls={collapseId}
          active={isOpen}
        />
      </HeaderTag>

      <Collapse in={isOpen}>
        <div
          id={collapseId}
          className={cx(styles, 'accordion-collapse')}
          aria-labelledby={headerId}
        >
          <div className={cx(styles, 'accordion-body')}>{item.content}</div>
        </div>
      </Collapse>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Accordion molecule
// ---------------------------------------------------------------------------

/**
 * Accordion molecule — mirrors `src/design-system/patterns/02-molecules/accordion/_accordion.tpl.twig`.
 *
 * Open/close state is managed via React state and React Bootstrap's `Collapse`
 * component — no Bootstrap JS bundle required. By default only one panel is open
 * at a time; set `alwaysOpen: true` on individual items to make them toggle
 * independently.
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

  // Initialize open set from items that have active: true.
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(
      items
        .map((item, i) => (item.active ? String(i) : null))
        .filter(Boolean) as string[]
    )
  );

  const handleToggle = (key: string, alwaysOpen: boolean) => {
    setOpenKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (!alwaysOpen) {
          // Close all non-alwaysOpen items before opening this one.
          items.forEach((item, idx) => {
            if (!item.alwaysOpen) next.delete(String(idx));
          });
        }
        next.add(key);
      }
      return next;
    });
  };

  const accordionClasses = cx(
    styles,
    'accordion',
    flush && 'accordion-flush',
    ...classes,
    otherClasses,
  );

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
          isOpen={openKeys.has(String(index))}
          onToggle={() => handleToggle(String(index), item.alwaysOpen ?? false)}
        />
      ))}
    </div>
  );
}

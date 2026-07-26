import React, { useId } from 'react';
import { Button } from '@/stories/atoms/button/Button';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import styles from './dropdown.module.scss';

export type DropdownDirection = 'up' | 'down' | 'left' | 'right';
export type DropdownAutoClose = 'true' | 'false' | 'inside' | 'outside';
export type DropdownItemElement =
  | 'a'
  | 'button'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'hr';

/**
 * A single item in the dropdown menu.
 * Maps to one entry in the dropdown_items array in the Twig template.
 */
export interface DropdownItem {
  /**
   * Element to render for this menu item.
   * - 'a' (default) → dropdown-item anchor
   * - 'button'       → dropdown-item button (type="button" added automatically)
   * - 'h1'–'h6'     → dropdown-header heading
   * - 'hr'          → dropdown-divider rule
   * Maps to dropdown_item_element.
   */
  element?: DropdownItemElement;
  /**
   * Link URL applied as href when element is 'a'.
   * Maps to dropdown_item_link.
   */
  link?: string;
  /**
   * Visible text (or React node) for the item.
   * Not applied to <hr> dividers.
   * Maps to dropdown_item_text.
   */
  text?: React.ReactNode;
  /**
   * Optional id attribute.
   * Maps to dropdown_item_id.
   */
  id?: string;
  /**
   * Additional CSS class names for the item element.
   * Maps to dropdown_item_other_classes.
   */
  className?: string;
}

/**
 * Dropdown organism props — mirrors all Twig template variables at
 * `03-organisms/dropdown/_dropdown.tpl.twig`.
 */
export interface DropdownProps {
  /**
   * Props for the dropdown toggle button.
   * `toggle` is forced to 'dropdown' by the component; pass all other
   * Button props here (variant, size, label, disabled, etc.).
   * Maps to the button object in the Twig template.
   */
  button: ButtonProps;
  /**
   * Direction the menu opens relative to the toggle button.
   * - 'down'  (default) → standard dropdown
   * - 'up'              → dropup
   * - 'left'            → dropstart
   * - 'right'           → dropend
   * Maps to direction.
   */
  direction?: DropdownDirection;
  /**
   * Additional CSS class names for the dropdown wrapper element.
   * Maps to dropdown_other_classes.
   */
  className?: string;
  /**
   * Additional CSS class names for the <ul> dropdown menu element.
   * Maps to dropdown_menu_other_classes.
   */
  menuClassName?: string;
  /**
   * Apply Bootstrap's dark dropdown-menu variant (dropdown-menu-dark).
   * Maps to dark.
   */
  dark?: boolean;
  /**
   * Bootstrap background color utility (bg-*) applied to the menu.
   * E.g. 'primary' → 'bg-primary'.
   * Maps to background_color.
   */
  backgroundColor?: string;
  /**
   * Bootstrap text color utility (text-*) applied to the menu.
   * E.g. 'white' → 'text-white'.
   * Maps to text_color.
   */
  textColor?: string;
  /**
   * Alignment of the dropdown menu.
   * 'start' = left-aligned (default), 'end' = right-aligned → dropdown-menu-end.
   * Maps to dropdown_menu_align ('right' in Twig → 'end' here).
   */
  menuAlign?: 'start' | 'end';
  /**
   * Horizontal pixel offset of the dropdown menu.
   * Maps to offset_x.
   */
  offsetX?: number;
  /**
   * Vertical pixel offset of the dropdown menu.
   * Maps to offset_y.
   */
  offsetY?: number;
  /**
   * Add data-bs-reference="parent" to the toggle button.
   * Maps to reference.
   */
  reference?: boolean;
  /**
   * Auto-close behavior passed as data-bs-auto-close on the toggle button.
   * Maps to auto_close.
   */
  autoClose?: DropdownAutoClose;
  /**
   * Wrap the button and menu inside a Bootstrap btn-group element instead
   * of a plain <div class="dropdown">. Use for action/split button dropdowns.
   * Maps to button_group.
   */
  buttonGroup?: boolean;
  /**
   * Bootstrap display utility (d-*) applied to the btn-group wrapper.
   * Only applies when buttonGroup is true.
   * Maps to button_group_display.
   */
  buttonGroupDisplay?: 'inline' | 'inline-block' | 'grid' | 'block' | 'flex' | 'inline-flex';
  /**
   * Size variant for the btn-group (btn-group-sm / btn-group-lg).
   * Only applies when buttonGroup is true.
   * Maps to button_group_size.
   */
  buttonGroupSize?: 'sm' | 'lg';
  /**
   * Items to render inside the dropdown menu.
   * Maps to dropdown_items.
   */
  items: DropdownItem[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const HEADING_ELEMENTS = new Set<string>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const WRAPPER_DISPLAY_CLASS: Record<string, string> = {
  inline: 'd-inline',
  'inline-block': 'd-inline-block',
  grid: 'd-grid',
  block: 'd-block',
  flex: 'd-flex',
  'inline-flex': 'd-inline-flex',
};

function resolveItemClass(element: DropdownItemElement, extra?: string): string {
  let base: string;
  if (HEADING_ELEMENTS.has(element)) {
    base = 'dropdown-header';
  } else if (element === 'hr') {
    base = 'dropdown-divider';
  } else {
    base = 'dropdown-item';
  }
  return [base, extra].filter(Boolean).join(' ');
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Dropdown organism — mirrors
 * `src/design-system/patterns/03-organisms/dropdown/_dropdown.tpl.twig`.
 *
 * Renders a Bootstrap 5 dropdown: a toggle button plus a positioned menu of
 * items. Supports all four open directions, dark mode, background/text color
 * utilities, positional offsets, auto-close behaviour, menu-end alignment,
 * and an optional btn-group wrapper mode for action-button dropdowns.
 *
 * Items may be anchors (default), buttons, section headings (h1–h6), or
 * horizontal-rule dividers — matching the full Twig item loop.
 */
export function Dropdown({
  button,
  direction = 'down',
  className,
  menuClassName,
  dark = false,
  backgroundColor,
  textColor,
  menuAlign,
  offsetX = 0,
  offsetY = 0,
  reference = false,
  autoClose,
  buttonGroup = false,
  buttonGroupDisplay = 'inline-block',
  buttonGroupSize,
  items,
}: DropdownProps) {
  const rawId = useId();
  // useId returns strings like ':r0:' — strip colons for a valid HTML id.
  const generatedId = rawId.replace(/:/g, '');
  const dropdownId = button.id ?? `dropdown_${generatedId}`;

  // ── Wrapper classes ──────────────────────────────────────────────────────
  const directionClass =
    direction === 'up'
      ? 'dropup'
      : direction === 'left'
      ? 'dropstart'
      : direction === 'right'
      ? 'dropend'
      : '';

  const wrapperClasses = [
    buttonGroup ? 'btn-group' : 'dropdown',
    directionClass,
    buttonGroup && buttonGroupSize ? `btn-group-${buttonGroupSize}` : '',
    buttonGroup && buttonGroupDisplay ? WRAPPER_DISPLAY_CLASS[buttonGroupDisplay] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ── Menu classes ─────────────────────────────────────────────────────────
  const menuClasses = [
    'dropdown-menu',
    dark ? 'dropdown-menu-dark' : '',
    backgroundColor ? `bg-${backgroundColor}` : '',
    textColor ? `text-${textColor}` : '',
    menuAlign === 'end' ? 'dropdown-menu-end' : '',
    button.active ? 'show' : '',
    menuClassName,
  ]
    .filter(Boolean)
    .join(' ');

  // ── Toggle button extra data-bs-* attributes ─────────────────────────────
  const extraAttrs: Record<string, string> = {
    'data-bs-offset': `${offsetX},${offsetY}`,
  };
  if (reference) {
    extraAttrs['data-bs-reference'] = 'parent';
  }
  if (autoClose) {
    extraAttrs['data-bs-auto-close'] = autoClose;
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={wrapperClasses} data-pattern="timberland/dropdown">
      {/* Toggle button — toggle="dropdown" is always forced */}
      <Button
        {...button}
        id={dropdownId}
        toggle="dropdown"
        expanded={button.active ?? false}
        {...extraAttrs}
      />

      {/* Dropdown menu */}
      <ul className={menuClasses} aria-labelledby={dropdownId}>
        {items.map((item, index) => {
          const element = item.element ?? 'a';
          const itemClass = resolveItemClass(element, item.className);

          // Horizontal rule divider
          if (element === 'hr') {
            return (
              <li key={index}>
                <hr className={itemClass} id={item.id} />
              </li>
            );
          }

          // Section heading (dropdown-header)
          if (HEADING_ELEMENTS.has(element)) {
            const HeadingEl = element as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
            return (
              <li key={index}>
                <HeadingEl className={itemClass} id={item.id}>
                  {item.text}
                </HeadingEl>
              </li>
            );
          }

          // Button item
          if (element === 'button') {
            return (
              <li key={index}>
                <button type="button" className={itemClass} id={item.id}>
                  {item.text}
                </button>
              </li>
            );
          }

          // Default: anchor
          return (
            <li key={index}>
              <a className={itemClass} href={item.link ?? '#'} id={item.id}>
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

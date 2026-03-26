import React from 'react';
import {
  Button as BootstrapButton,
  CloseButton,
  OverlayTrigger,
  Tooltip,
  Popover,
} from 'react-bootstrap';
import type { ButtonProps as BsButtonProps } from 'react-bootstrap/Button';
import type { Placement } from 'react-bootstrap/types';
import styles from './button.module.scss';

/**
 * Color variants matching the theme's extended Bootstrap palette.
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'quinary'
  | 'senary'
  | 'septenary'
  | 'octonary'
  | 'nonary'
  | 'denary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'light'
  | 'dark'
  | 'link';

/**
 * Toggle types that map to Bootstrap's data-bs-toggle attribute.
 */
export type ButtonToggle = 'button' | 'collapse' | 'dropdown' | 'modal' | 'tab';

/**
 * Button atom props — mirrors the theme's Pattern Lab button atom.
 *
 * Supports all Bootstrap 5 button features: variants, outlines, sizes,
 * element types, toggles, tooltips, popovers, close button, and ARIA.
 */
export interface ButtonProps {
  /** Color variant. */
  variant?: ButtonVariant;
  /** Render as outline button. */
  outline?: boolean;
  /** Button size. */
  size?: 'sm' | 'lg';
  /** Render as full-width block button. */
  block?: boolean;
  /** HTML element to render: button, anchor, or input. */
  as?: 'button' | 'a' | 'input';
  /** HTML type attribute (button, submit, reset). Only applies to button/input. */
  type?: 'button' | 'submit' | 'reset';
  /** URL for anchor buttons (sets as="a" automatically). */
  href?: string;
  /** Link target (_blank, _self, etc.) for anchor buttons. When `toggle` is set, maps to data-bs-target instead. */
  target?: string;
  /** Button text. Use `children` for richer content (icons, etc.). */
  label?: string;
  /** Rich button content — takes precedence over `label`. */
  children?: React.ReactNode;
  /** Show button in active/pressed state. */
  active?: boolean;
  /** Disable the button. */
  disabled?: boolean;
  /** Bootstrap toggle behavior (collapse, dropdown, modal, tab). */
  toggle?: ButtonToggle;
  /** Value attribute (for input buttons). */
  value?: string;
  /** HTML id attribute. */
  id?: string;
  /** aria-expanded attribute. */
  expanded?: boolean;
  /** aria-controls attribute. */
  controls?: string;
  /** ARIA role (defaults to "button"). */
  role?: string;
  /** Prevent text wrapping. */
  nowrap?: boolean;
  /** Render as a close button (Bootstrap CloseButton). */
  closeButton?: boolean | 'white';
  /** Hide the label text visually (useful for close/icon-only buttons). */
  hideLabel?: boolean;
  /** Show a tooltip on hover. */
  tooltip?: string;
  /** Popover title. */
  popoverTitle?: string;
  /** Popover body content. */
  popoverContent?: string;
  /** Placement for tooltip or popover. */
  placement?: Placement;
  /** Additional CSS class names. */
  className?: string;
  /** Click handler. */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Button atom — mirrors the theme's Pattern Lab button.
 *
 * Wraps React Bootstrap's Button with the full set of features from
 * the Pattern Lab atom: variants, outlines, sizes, element types,
 * toggles, contextual overlays, close button, and ARIA attributes.
 */
export const Button = ({
  variant = 'primary',
  outline = false,
  size,
  block = false,
  as: elementType,
  type,
  href,
  target,
  label,
  children,
  active = false,
  disabled = false,
  toggle,
  value,
  id,
  expanded,
  controls,
  role = 'button',
  nowrap = false,
  closeButton = false,
  hideLabel = false,
  tooltip,
  popoverTitle,
  popoverContent,
  placement = 'top',
  className,
  onClick,
  ...rest
}: ButtonProps) => {
  // Close button variant
  if (closeButton) {
    return (
      <CloseButton
        variant={closeButton === 'white' ? 'white' : undefined}
        disabled={disabled}
        onClick={onClick}
        aria-label="Close"
        {...rest}
      />
    );
  }

  // Resolve variant string (outline prefix)
  const resolvedVariant = outline ? `outline-${variant}` : variant;

  // Resolve element type
  const resolvedAs = elementType || (href ? 'a' : undefined);

  // Build extra class names
  const classNames = [
    'button',
    block ? styles.btnBlock : '',
    nowrap ? 'text-nowrap' : '',
    className || '',
  ].filter(Boolean).join(' ');

  // Build data attributes for toggle
  const dataAttrs: Record<string, string> = {};
  if (toggle) {
    dataAttrs['data-bs-toggle'] = toggle;
  }
  if (target && toggle) {
    dataAttrs['data-bs-target'] = target;
  }

  // Build ARIA attributes
  const ariaAttrs: Record<string, string | boolean> = {};
  if (active) {
    ariaAttrs['aria-pressed'] = 'true';
  }
  if (expanded !== undefined) {
    ariaAttrs['aria-expanded'] = String(expanded);
  }
  if (controls) {
    ariaAttrs['aria-controls'] = controls;
  }

  // Input elements are void — they can't have children.
  // Render a plain <input> with Bootstrap classes instead.
  if (resolvedAs === 'input') {
    const inputClasses = [
      'button',
      'btn',
      outline ? `btn-outline-${variant}` : `btn-${variant}`,
      size ? `btn-${size}` : '',
      block ? styles.btnBlock : '',
      active ? 'active' : '',
      nowrap ? 'text-nowrap' : '',
      className || '',
    ].filter(Boolean).join(' ');

    return (
      <input
        type={type || 'button'}
        className={inputClasses}
        value={value || label}
        disabled={disabled}
        id={id}
        role={role}
        onClick={onClick}
        {...dataAttrs}
        {...ariaAttrs}
        {...rest}
      />
    );
  }

  // Build the button content
  const content = children || (
    hideLabel ? null : <span className="button--label">{label}</span>
  );

  // Assemble the button
  const button = (
    <BootstrapButton
      variant={resolvedVariant as BsButtonProps['variant']}
      size={size}
      as={resolvedAs as any}
      type={!resolvedAs || resolvedAs === 'button' ? (type || 'button') : undefined}
      href={href}
      target={!toggle && href ? target : undefined}
      active={active}
      disabled={disabled}
      value={value}
      id={id}
      role={role}
      className={classNames}
      onClick={onClick}
      {...dataAttrs}
      {...ariaAttrs}
      {...rest}
    >
      {content}
    </BootstrapButton>
  );

  // Wrap with tooltip
  if (tooltip) {
    return (
      <OverlayTrigger
        placement={placement}
        overlay={
          <Tooltip>
            <span dangerouslySetInnerHTML={{ __html: tooltip }} />
          </Tooltip>
        }
      >
        {button}
      </OverlayTrigger>
    );
  }

  // Wrap with popover
  if (popoverContent) {
    return (
      <OverlayTrigger
        trigger="click"
        placement={placement}
        overlay={
          <Popover>
            {popoverTitle && <Popover.Header>{popoverTitle}</Popover.Header>}
            <Popover.Body>{popoverContent}</Popover.Body>
          </Popover>
        }
      >
        {button}
      </OverlayTrigger>
    );
  }

  return button;
};

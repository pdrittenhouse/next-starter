'use client';

import React, { useId } from 'react';
import { Button, type ButtonProps } from '@/stories/atoms/button/Button';

// ---------------------------------------------------------------------------
// Type extensions
// Bootstrap's offcanvas toggle requires data-bs-* attributes that are not in
// ButtonProps. These local cast types let us spread them onto the Button atom
// without losing the base prop types. At runtime Button's ...rest forwards
// every unknown key to the underlying react-bootstrap element.
// ---------------------------------------------------------------------------
type TriggerButtonProps = ButtonProps & {
  'data-bs-toggle'?: string;
  'data-bs-target'?: string;
  'aria-controls'?: string;
};

type CloseButtonExtraProps = ButtonProps & {
  'data-bs-dismiss'?: string;
};

const TriggerButton = Button as React.ComponentType<TriggerButtonProps>;
const PanelCloseButton = Button as React.ComponentType<CloseButtonExtraProps>;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Which edge the offcanvas panel slides in from. */
export type OffcanvasPlacement = 'top' | 'bottom' | 'left' | 'right';

/** Responsive breakpoint above which the offcanvas panel is always visible. */
export type OffcanvasBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Offcanvas molecule props — mirrors the variables documented at the top of
 * `02-molecules/offcanvas/_offcanvas.tpl.twig`.
 */
export interface OffcanvasProps {
  /** Explicit ID for the offcanvas panel. Auto-generated when omitted. */
  offcanvasId?: string;
  /** Extra CSS class names appended to the outer wrapper `<div>`. */
  wrapperClasses?: string;
  /** Extra CSS class names appended to the offcanvas panel `<div>`. */
  offcanvasClasses?: string;
  /** Props forwarded to the trigger `<Button>`. Omit to hide the trigger. */
  button?: ButtonProps;
  /**
   * Responsive breakpoint. At or above this width the offcanvas panel is
   * displayed inline and the trigger is hidden (`d-{breakpoint}-none`).
   */
  breakpoint?: OffcanvasBreakpoint;
  /**
   * Which edge the panel enters from.
   * - `left`   → Bootstrap `offcanvas-start` (default)
   * - `right`  → Bootstrap `offcanvas-end`
   * - `top`    → Bootstrap `offcanvas-top`
   * - `bottom` → Bootstrap `offcanvas-bottom`
   */
  placement?: OffcanvasPlacement;
  /** Show a background backdrop behind the panel. Defaults to `true`. */
  backdrop?: boolean;
  /** Allow page scroll while the panel is open. Defaults to `false`. */
  scroll?: boolean;
  /** Heading text rendered in the panel header. */
  title?: string;
  /** Body content for the panel. Accepts any React node. */
  content?: React.ReactNode;
  /** Bootstrap color utility name applied as `bg-{value}` (e.g. `'dark'`). */
  backgroundColor?: string;
  /** Bootstrap color utility name applied as `text-{value}` (e.g. `'white'`). */
  textColor?: string;
  /**
   * Render a close button inside the panel header.
   * - `'close'` — default close icon
   * - `'white'` — inverted close icon for dark backgrounds
   */
  closeButton?: 'close' | 'white';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolvePlacementClass(placement?: OffcanvasPlacement): string {
  if (placement === 'top') return 'offcanvas-top';
  if (placement === 'bottom') return 'offcanvas-bottom';
  if (placement === 'right') return 'offcanvas-end';
  return 'offcanvas-start'; // 'left' or default
}

function buildClasses(parts: (string | undefined | false)[]): string {
  return parts.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Offcanvas molecule — Bootstrap 5 off-canvas panel with a toggle trigger.
 *
 * Mirrors `02-molecules/offcanvas/_offcanvas.tpl.twig`. Bootstrap JS is
 * loaded globally in the theme; this component only renders the required
 * static markup and `data-bs-*` attributes.
 *
 * ```tsx
 * <Offcanvas
 *   button={{ variant: 'primary', label: 'Open Menu' }}
 *   title="Navigation"
 *   content={<nav>…</nav>}
 *   closeButton="close"
 * />
 * ```
 */
export function Offcanvas({
  offcanvasId: providedId,
  wrapperClasses,
  offcanvasClasses,
  button,
  breakpoint,
  placement,
  backdrop = true,
  scroll = false,
  title,
  content,
  backgroundColor,
  textColor,
  closeButton,
}: OffcanvasProps) {
  // useId generates a stable, unique string scoped to this component instance.
  // Replace the colons React uses internally so the value is a valid HTML id.
  const reactId = useId().replace(/:/g, '_');
  const panelId = providedId ?? `offcanvas_${reactId}`;
  const labelId = `${panelId}_label`;

  const wrapperCls = buildClasses([
    'offcanvas-wrapper',
    breakpoint && `d-${breakpoint}-none`,
    wrapperClasses,
  ]);

  const panelCls = buildClasses([
    'offcanvas',
    breakpoint && `offcanvas-${breakpoint}`,
    backgroundColor && `bg-${backgroundColor}`,
    textColor && `text-${textColor}`,
    resolvePlacementClass(placement),
    breakpoint && `d-${breakpoint}-none`,
    offcanvasClasses,
  ]);

  const showHeader = Boolean(title) || Boolean(closeButton);
  const headerCls = buildClasses([
    'offcanvas-header',
    !title && closeButton ? 'justify-content-end' : undefined,
  ]);

  return (
    <div className={wrapperCls} data-pattern="timberland/offcanvas">

      {/* Trigger button — data-bs-toggle wires Bootstrap JS automatically */}
      {button && (
        <TriggerButton
          {...button}
          data-bs-toggle="offcanvas"
          data-bs-target={`#${panelId}`}
          aria-controls={panelId}
        />
      )}

      {/* Offcanvas panel */}
      <div
        className={panelCls}
        id={panelId}
        aria-labelledby={labelId}
        data-bs-backdrop={backdrop ? 'true' : 'false'}
        data-bs-scroll={scroll ? 'true' : 'false'}
        tabIndex={-1}
      >
        {showHeader && (
          <div className={headerCls}>
            {title && (
              <h5 className="offcanvas-title" id={labelId}>
                {title}
              </h5>
            )}
            {closeButton && (
              <PanelCloseButton
                closeButton={closeButton === 'white' ? 'white' : true}
                className="text-reset"
                data-bs-dismiss="offcanvas"
              />
            )}
          </div>
        )}

        <div className="offcanvas-body">
          {content}
        </div>
      </div>

    </div>
  );
}

'use client';

import React, { useId, useState } from 'react';
import { Offcanvas as BsOffcanvas } from 'react-bootstrap';
import { Button, type ButtonProps } from '@/stories/atoms/button/Button';
import styles from './offcanvas.module.scss';

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

type BsPlacement = 'start' | 'end' | 'top' | 'bottom';

function resolveBsPlacement(placement?: OffcanvasPlacement): BsPlacement {
  if (placement === 'right') return 'end';
  if (placement === 'top') return 'top';
  if (placement === 'bottom') return 'bottom';
  return 'start'; // 'left' or default
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
 * Mirrors `02-molecules/offcanvas/_offcanvas.tpl.twig`. Open/close state is
 * managed via React state and React Bootstrap's `Offcanvas` component —
 * no Bootstrap JS bundle required.
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
  const [show, setShow] = useState(false);

  const reactId = useId().replace(/:/g, '_');
  const panelId = providedId ?? `offcanvas_${reactId}`;
  const labelId = `${panelId}_label`;

  const wrapperCls = buildClasses([
    'offcanvas-wrapper',
    breakpoint && `d-${breakpoint}-none`,
    wrapperClasses,
  ]);

  const extraPanelCls = buildClasses([
    backgroundColor && `bg-${backgroundColor}`,
    textColor && `text-${textColor}`,
    offcanvasClasses,
  ]);

  const showHeader = Boolean(title) || Boolean(closeButton);
  const headerCls = buildClasses([
    'offcanvas-header',
    !title && closeButton ? 'justify-content-end' : undefined,
  ]);

  return (
    <div className={wrapperCls} data-pattern="timberland/offcanvas">

      {/* Trigger button */}
      {button && (
        <Button {...button} onClick={() => setShow(true)} />
      )}

      {/* Offcanvas panel */}
      <BsOffcanvas
        show={show}
        onHide={() => setShow(false)}
        placement={resolveBsPlacement(placement)}
        scroll={scroll}
        backdrop={backdrop}
        responsive={breakpoint}
        id={panelId}
        aria-labelledby={labelId}
        className={extraPanelCls || undefined}
        tabIndex={-1}
      >
        {showHeader && (
          <BsOffcanvas.Header
            closeButton={!!closeButton}
            closeVariant={closeButton === 'white' ? 'white' : undefined}
            className={headerCls}
          >
            {title && (
              <BsOffcanvas.Title id={labelId}>{title}</BsOffcanvas.Title>
            )}
          </BsOffcanvas.Header>
        )}

        <BsOffcanvas.Body>{content}</BsOffcanvas.Body>
      </BsOffcanvas>

    </div>
  );
}

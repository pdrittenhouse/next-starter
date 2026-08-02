'use client';

import React, { useId, useState } from 'react';
import { Toast as BsToast, ToastContainer } from 'react-bootstrap';
import { Button } from '@/stories/atoms/button/Button';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import { Image } from '@/stories/atoms/image/Image';
import type { ImageProps } from '@/stories/atoms/image/Image';
import { ButtonGroup } from '@/stories/molecules/button-group/ButtonGroup';
import type { WrapperDisplay } from '@/stories/molecules/button-group/ButtonGroup';
import styles from './toast.module.scss';
import { cx } from '@/lib/cx';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Vertical placement of the toast container. */
export type ToastVerticalPosition = 'top' | 'bottom' | 'middle';

/** Horizontal placement of the toast container. */
export type ToastHorizontalPosition = 'left' | 'right' | 'center';

/** Initial visibility class applied to the toast element. */
export type ToastDisplay = 'show' | 'hide';

/** Close-button style variant. */
export type ToastCloseButton = 'close' | 'white';

/**
 * Icon descriptor for the toast header.
 * Rendered as a Bootstrap Icon `<i>` element.
 */
export interface ToastIconProps {
  /** Bootstrap Icon name, e.g. `'info-circle'`. */
  name: string;
  /** Additional classes for the icon element. */
  className?: string;
}

/**
 * Props for a single toast notification.
 * Maps 1:1 to the `toast.*` variables in the Twig template.
 */
export interface ToastItem {
  /**
   * Explicit `id` for this toast element. When omitted a stable React-
   * generated id is used internally (via `useId`).
   */
  toastId?: string;
  /** Auto-hide the toast after `delay` ms. Defaults to `true`. */
  autohide?: boolean;
  /** Apply a CSS fade transition. Defaults to `true`. */
  animation?: boolean;
  /** Delay (ms) before auto-hiding. Bootstrap default is 5000. */
  delay?: number;
  /** Initial visibility (`'show'` starts visible; `'hide'` starts hidden). */
  toastDisplay?: ToastDisplay;
  /** Extra CSS classes for the toast element. */
  toastClassName?: string;
  /** Bootstrap background-color utility suffix, e.g. `'primary'`. */
  backgroundColor?: string;
  /** Bootstrap text-color utility suffix, e.g. `'white'`. */
  textColor?: string;
  /** Bootstrap background-color utility suffix for the header. */
  headerBackgroundColor?: string;
  /** Bootstrap text-color utility suffix for the header. */
  headerTextColor?: string;
  /** Optional icon displayed in the toast header. */
  icon?: ToastIconProps;
  /** Optional image displayed in the toast header. */
  image?: ImageProps & { imageOtherClasses?: string };
  /** Bold title text in the toast header. */
  title?: string;
  /** Small meta text (e.g. timestamp) in the toast header. */
  meta?: string;
  /** Render a close button in the header. `'white'` uses the inverted variant. */
  toastCloseButton?: ToastCloseButton;
  /** Body content of the toast. Accepts a React node. */
  toastContent?: React.ReactNode;
  /**
   * Button props for the trigger button rendered in the controls area.
   * Clicking the trigger shows this toast.
   */
  button?: ButtonProps;
}

/**
 * Toast organism props — mirrors all Twig template variables.
 */
export interface ToastProps {
  /** `id` applied to the outer wrapper element. */
  toastWrapperId?: string;
  /** Extra CSS classes for the outer wrapper. */
  toastWrapperClassName?: string;
  /** Extra CSS classes for the inner `toast-container` div. */
  toastContainerClassName?: string;
  /** Vertical position of the toast container. Defaults to `'bottom'`. */
  verticalPosition?: ToastVerticalPosition;
  /** Horizontal position of the toast container. Defaults to `'right'`. */
  horizontalPosition?: ToastHorizontalPosition;
  /** Bootstrap display utility for the ButtonGroup wrapper. */
  buttonGroupDisplay?: WrapperDisplay;
  /** Size variant for the controls ButtonGroup. */
  buttonGroupSize?: 'sm' | 'lg';
  /** Render controls ButtonGroup in grid layout. */
  buttonGroupDisplayGrid?: boolean;
  /** `aria-label` for the controls ButtonGroup. */
  buttonGroupLabel?: string;
  /** Gap spacer for the controls ButtonGroup. */
  buttonGroupGap?: string | number;
  /** Extra classes for the controls ButtonGroup. */
  buttonGroupClassName?: string;
  /** Array of toast notification objects to render. */
  toasts?: ToastItem[];
  /** Extra CSS class for the root wrapper element. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ContainerPosition =
  | 'top-start' | 'top-center' | 'top-end'
  | 'middle-start' | 'middle-center' | 'middle-end'
  | 'bottom-start' | 'bottom-center' | 'bottom-end';

function resolveContainerPosition(
  vertical: ToastVerticalPosition,
  horizontal: ToastHorizontalPosition,
): ContainerPosition {
  const v = vertical === 'top' ? 'top' : vertical === 'bottom' ? 'bottom' : 'middle';
  const h = horizontal === 'left' ? 'start' : horizontal === 'right' ? 'end' : 'center';
  return `${v}-${h}` as ContainerPosition;
}

// ---------------------------------------------------------------------------
// Sub-component: single toast
// ---------------------------------------------------------------------------

interface SingleToastProps {
  toast: ToastItem;
  fallbackId: string;
  show: boolean;
  onClose: () => void;
}

function SingleToast({ toast, fallbackId, show, onClose }: SingleToastProps) {
  const resolvedId = toast.toastId ?? fallbackId;

  const toastClassName = cx(
    styles,
    toast.backgroundColor ? `bg-${toast.backgroundColor}` : null,
    toast.textColor ? `text-${toast.textColor}` : null,
    toast.toastClassName,
  ) || undefined;

  const headerClasses = cx(
    styles,
    'toast-header',
    toast.headerBackgroundColor ? `bg-${toast.headerBackgroundColor}` : null,
    toast.headerTextColor ? `text-${toast.headerTextColor}` : null,
  );

  return (
    <BsToast
      show={show}
      onClose={onClose}
      autohide={toast.autohide !== false}
      delay={toast.delay ?? 5000}
      animation={toast.animation !== false}
      id={resolvedId}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={toastClassName}
    >
      <div className={headerClasses}>
        {toast.icon && (
          <i
            className={cx(
              styles,
              'toast-icon',
              'me-2',
              `bi bi-${toast.icon.name}`,
              toast.icon.className,
            )}
            aria-hidden="true"
          />
        )}

        {toast.image && (
          <Image
            {...toast.image}
            className={cx(
              styles,
              'toast--image',
              'me-2',
              toast.image.imageOtherClasses,
            )}
          />
        )}

        {toast.title && (
          <strong className={cx(styles, 'toast--title', 'me-auto')}>{toast.title}</strong>
        )}

        {toast.meta && (
          <small className={cx(styles, 'toast--meta')}>{toast.meta}</small>
        )}

        {toast.toastCloseButton && (
          <Button
            closeButton={toast.toastCloseButton === 'white' ? 'white' : true}
            onClick={onClose}
          />
        )}
      </div>

      {toast.toastContent && (
        <BsToast.Body>{toast.toastContent}</BsToast.Body>
      )}
    </BsToast>
  );
}

// ---------------------------------------------------------------------------
// Toast organism
// ---------------------------------------------------------------------------

/**
 * Toast organism — mirrors
 * `src/design-system/patterns/03-organisms/toast/_toast.tpl.twig`.
 *
 * Renders a positioned toast container with optional trigger buttons.
 * Per-toast show/hide state is managed via React state and React Bootstrap's
 * `Toast` component — no Bootstrap JS bundle required. Trigger buttons click
 * to show their associated toast; autohide and the close button hide it.
 */
export function Toast({
  toastWrapperId,
  toastWrapperClassName,
  toastContainerClassName,
  verticalPosition = 'bottom',
  horizontalPosition = 'right',
  buttonGroupDisplay = 'inline-block',
  buttonGroupSize,
  buttonGroupDisplayGrid,
  buttonGroupLabel,
  buttonGroupGap,
  buttonGroupClassName,
  toasts = [],
  className,
}: ToastProps) {
  const idPrefix = useId();

  // Track per-toast visibility. Initialize from toastDisplay prop.
  const [showStates, setShowStates] = useState<boolean[]>(() =>
    toasts.map(t => t.toastDisplay === 'show')
  );

  const showToast = (index: number) => {
    setShowStates(prev => prev.map((s, i) => (i === index ? true : s)));
  };

  const hideToast = (index: number) => {
    setShowStates(prev => prev.map((s, i) => (i === index ? false : s)));
  };

  const wrapperClasses = cx(styles, 'toast-wrapper', toastWrapperClassName, className);

  // Build controls buttons — onClick shows the corresponding toast.
  const toastsWithButtons = toasts
    .map((toast, i) => ({ toast, index: i }))
    .filter(({ toast }) => toast.button);

  const controlButtons: ButtonProps[] = toastsWithButtons.map(({ toast, index }) => ({
    ...toast.button!,
    onClick: () => showToast(index),
  }));

  const hasControls = controlButtons.length > 0;

  return (
    <div
      className={wrapperClasses}
      data-pattern="timberland/toast"
      id={toastWrapperId}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* controls: trigger buttons */}
      {hasControls && (
        <div className={cx(styles, 'toast--controls')}>
          <ButtonGroup
            wrapperDisplay={buttonGroupDisplay}
            size={buttonGroupSize}
            wrapperClassName={buttonGroupClassName}
            groups={[
              {
                displayGrid: buttonGroupDisplayGrid,
                label: buttonGroupLabel,
                gap: buttonGroupGap,
                buttons: controlButtons,
              },
            ]}
          />
        </div>
      )}

      {/* toast container */}
      <ToastContainer
        position={resolveContainerPosition(verticalPosition, horizontalPosition)}
        className={cx(styles, 'p-3', toastContainerClassName) || undefined}
      >
        {toasts.map((toast, i) => (
          <SingleToast
            key={toast.toastId ?? i}
            toast={toast}
            fallbackId={`${idPrefix}-${i}`}
            show={showStates[i] ?? false}
            onClose={() => hideToast(i)}
          />
        ))}
      </ToastContainer>
    </div>
  );
}

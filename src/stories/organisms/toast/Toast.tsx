import React, { useId } from 'react';
import { Button } from '@/stories/atoms/button/Button';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import { Image } from '@/stories/atoms/image/Image';
import type { ImageProps } from '@/stories/atoms/image/Image';
import { ButtonGroup } from '@/stories/molecules/button-group/ButtonGroup';
import type { WrapperDisplay } from '@/stories/molecules/button-group/ButtonGroup';
import styles from './toast.module.scss';

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
  /** Initial visibility class (`'show'` or `'hide'`). */
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
   * The component automatically injects `toggle`, `target`, and `controls`
   * to wire the button to this toast.
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

function resolveContainerClasses(
  vertical: ToastVerticalPosition,
  horizontal: ToastHorizontalPosition,
  extra?: string,
): string {
  const verticalClass =
    vertical === 'top' ? 'top-0' :
    vertical === 'bottom' ? 'bottom-0' :
    'top-50'; // middle

  const horizontalClass =
    horizontal === 'left' ? 'start-0' :
    horizontal === 'right' ? 'end-0' :
    'start-50'; // center

  let translateClass = '';
  if (vertical === 'middle' && horizontal !== 'center') {
    translateClass = 'translate-middle-y';
  } else if (vertical !== 'middle' && horizontal === 'center') {
    translateClass = 'translate-middle-x';
  } else if (vertical === 'middle' && horizontal === 'center') {
    translateClass = 'translate-middle';
  }

  return [
    'toast-container',
    'position-fixed',
    'p-3',
    verticalClass,
    horizontalClass,
    translateClass,
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

// ---------------------------------------------------------------------------
// Sub-component: single toast
// ---------------------------------------------------------------------------

interface SingleToastProps {
  toast: ToastItem;
  /** Fallback id generated by the parent via useId(). */
  fallbackId: string;
}

function SingleToast({ toast, fallbackId }: SingleToastProps) {
  const resolvedId = toast.toastId ?? fallbackId;

  // Build toast element classes
  const toastClasses = [
    'toast',
    toast.toastDisplay === 'show' || toast.toastDisplay === 'hide'
      ? toast.toastDisplay
      : null,
    toast.backgroundColor ? `bg-${toast.backgroundColor}` : null,
    toast.textColor ? `text-${toast.textColor}` : null,
    toast.toastClassName,
  ]
    .filter(Boolean)
    .join(' ');

  // Build header classes
  const headerClasses = [
    'toast-header',
    toast.headerBackgroundColor ? `bg-${toast.headerBackgroundColor}` : null,
    toast.headerTextColor ? `text-${toast.headerTextColor}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  // data-bs-autohide="false" only when explicitly set to false (mirrors Twig: autohide != true)
  const autohideAttr = toast.autohide === false ? { 'data-bs-autohide': 'false' } : {};
  // data-bs-animation="false" only when explicitly set to false
  const animationAttr = toast.animation === false ? { 'data-bs-animation': 'false' } : {};
  const delayAttr = toast.delay != null ? { 'data-bs-delay': String(toast.delay) } : {};

  return (
    <div
      className={toastClasses}
      id={resolvedId}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      {...autohideAttr}
      {...animationAttr}
      {...delayAttr}
    >
      {/* toast-header */}
      <div className={headerClasses}>
        {toast.icon && (
          <i
            className={[
              'toast-icon',
              'me-2',
              `bi bi-${toast.icon.name}`,
              toast.icon.className,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          />
        )}

        {toast.image && (
          <Image
            {...toast.image}
            className={[
              'toast--image',
              'me-2',
              toast.image.imageOtherClasses,
            ]
              .filter(Boolean)
              .join(' ')}
          />
        )}

        {toast.title && (
          <strong className="toast--title me-auto">{toast.title}</strong>
        )}

        {toast.meta && (
          <small className="toast--meta">{toast.meta}</small>
        )}

        {toast.toastCloseButton && (
          <Button
            closeButton={toast.toastCloseButton === 'white' ? 'white' : true}
            data-bs-dismiss="toast"
          />
        )}
      </div>

      {/* toast-body */}
      {toast.toastContent && (
        <div className="toast-body">{toast.toastContent}</div>
      )}
    </div>
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
 * Each toast can be individually configured with autohide, animation,
 * delay, background/text colors, icon, image, title, meta, and body content.
 *
 * The controls ButtonGroup is only rendered when at least one toast in
 * the `toasts` array supplies a `button` object.
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
  // Generate stable fallback ids for toasts that omit toastId.
  // useId returns a single prefix; we append an index for each toast.
  const idPrefix = useId();

  // Build wrapper classes
  const wrapperClasses = [
    'toast-wrapper',
    toastWrapperClassName,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Build container classes
  const containerClasses = resolveContainerClasses(
    verticalPosition,
    horizontalPosition,
    toastContainerClassName,
  );

  // Build controls buttons from toasts that supply a button.
  // `toggle: 'toast'` is not in ButtonToggle so we pass the Bootstrap
  // data attributes and aria-controls via ...rest spread on the Button atom.
  const controlButtons: ButtonProps[] = toasts
    .filter((t) => t.button)
    .map((t, i) => {
      const resolvedId = t.toastId ?? `${idPrefix}-${i}`;
      return {
        ...t.button!,
        // Pass as raw HTML attributes via the ...rest spread in Button.tsx
        'data-bs-toggle': 'toast',
        'data-bs-target': `#${resolvedId}`,
        'aria-controls': resolvedId,
      } as ButtonProps;
    });

  const hasControls = controlButtons.length > 0;

  return (
    <div
      className={[wrapperClasses, styles.toastWrapper].filter(Boolean).join(' ')}
      data-pattern="timberland/toast"
      id={toastWrapperId}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* controls: trigger buttons */}
      {hasControls && (
        <div className="toast--controls">
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
      <div className={containerClasses}>
        {toasts.map((toast, i) => (
          <SingleToast
            key={toast.toastId ?? i}
            toast={toast}
            fallbackId={`${idPrefix}-${i}`}
          />
        ))}
      </div>
    </div>
  );
}

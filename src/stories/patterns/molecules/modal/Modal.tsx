'use client';

import React, { useId, useState } from 'react';
import { Modal as BsModal } from 'react-bootstrap';
import { Button } from '@/stories/patterns/atoms/button/Button';
import type { ButtonVariant } from '@/stories/patterns/atoms/button/Button';
import styles from './modal.module.scss';
import { cx } from '@/lib/cx';

export type ModalSize = 'sm' | 'lg';
export type ModalFullscreenBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Configuration for the modal trigger button rendered outside the modal element.
 * Maps to the Twig `modal_button` object.
 */
export interface ModalTriggerButtonConfig {
  /** Button label text. Defaults to 'Open Modal'. */
  label?: string;
  /** Bootstrap color variant. */
  variant?: ButtonVariant;
  /** Button size. */
  size?: 'sm' | 'lg';
  /** Render as outline button. */
  outline?: boolean;
  /** Full-width block button. */
  block?: boolean;
  /** Disable the button. */
  disabled?: boolean;
  /** HTML id attribute. */
  id?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Prevent text wrapping. */
  nowrap?: boolean;
}

/**
 * Configuration for a close button inside the modal (header or footer).
 * Maps to the Twig `modal_close_header_button` / `modal_close_footer` objects.
 */
export interface ModalCloseButtonConfig {
  /**
   * Button label text.
   * Header close button defaults to Bootstrap btn-close (X icon); ignored when `whiteClose` is used.
   * Footer close button defaults to 'Close'.
   */
  label?: string;
  /** Bootstrap color variant for the footer close button. Defaults to 'secondary'. */
  variant?: ButtonVariant;
  /** Button size. */
  size?: 'sm' | 'lg';
  /** Render as outline button (footer close only). */
  outline?: boolean;
  /** Disable the button. */
  disabled?: boolean;
  /** Use the white variant of the Bootstrap btn-close icon (header close only). */
  whiteClose?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Props for the Modal molecule.
 *
 * Mirrors the Twig `timberland/modal` pattern. Open/close state is managed via
 * React state and React Bootstrap's `Modal` component — no Bootstrap JS required.
 */
export interface ModalProps {
  /**
   * Unique modal identifier.
   * Auto-generated with React 18's `useId()` when not provided.
   * Maps to the Twig `modal_id` variable.
   */
  modalId?: string;
  /**
   * Show the CSS fade transition when the modal opens.
   * Defaults to `true` (adds `fade` class). Set to `false` to disable animation.
   * Maps to the Twig `animate` variable.
   */
  animate?: boolean;
  /**
   * Render a backdrop overlay behind the modal.
   * Defaults to `true`.
   * Maps to the Twig `backdrop` variable.
   */
  backdrop?: boolean;
  /**
   * Prevent the modal from closing when the user clicks the backdrop.
   * Requires `backdrop=true`. Maps to the Twig `backdrop_static` variable.
   */
  backdropStatic?: boolean;
  /**
   * Bootstrap color utility applied to the modal element (bg-{color}).
   * Maps to the Twig `backdrop_color` variable.
   */
  backdropColor?: string;
  /**
   * Bootstrap background color utility for the modal-content element (bg-{color}).
   * Maps to the Twig `background_color` variable.
   */
  backgroundColor?: string;
  /**
   * Bootstrap text color utility applied to the title, body, and header (text-{color}).
   * Maps to the Twig `text_color` variable.
   */
  textColor?: string;
  /**
   * Vertically center the modal in the viewport.
   * Adds `modal-dialog-centered`. Maps to the Twig `modal_center` variable.
   */
  modalCenter?: boolean;
  /**
   * Modal dialog size variant.
   * `sm` → 300 px max-width; `lg` → 800 px max-width.
   * Maps to the Twig `modal_size` variable.
   */
  modalSize?: ModalSize;
  /**
   * Render the modal as a full-screen overlay.
   * Maps to the Twig `modal_fullscreen` variable.
   */
  modalFullscreen?: boolean;
  /**
   * Breakpoint below which the modal becomes full-screen.
   * Only applied when `modalFullscreen=true`.
   * Maps to the Twig `modal_fullscreen_breakpoint` variable.
   */
  modalFullscreenBreakpoint?: ModalFullscreenBreakpoint;
  /**
   * Modal window title rendered in the header as an `<h5>`.
   * Also used as the accessible label (`aria-labelledby`).
   * Maps to the Twig `modal_title` variable.
   */
  modalTitle?: string;
  /**
   * Show a close button (X icon) in the modal header.
   * Defaults to `true`. Maps to the Twig `modal_close_header` variable.
   */
  modalCloseHeader?: boolean;
  /**
   * Configuration for the header close button.
   * Maps to the Twig `modal_close_header_button` object.
   */
  modalCloseHeaderButton?: ModalCloseButtonConfig;
  /**
   * Content rendered in the modal body.
   * Maps to the Twig `modal_content` variable.
   */
  modalContent?: React.ReactNode;
  /**
   * Content rendered in the modal footer (before the footer close button).
   * Maps to the Twig `modal_footer` variable.
   */
  modalFooter?: React.ReactNode;
  /**
   * Show a dismiss button in the modal footer.
   * Maps to the Twig `show_modal_footer_close` variable.
   */
  showModalFooterClose?: boolean;
  /**
   * Configuration for the footer close/dismiss button.
   * Maps to the Twig `modal_close_footer` object.
   */
  modalCloseFooter?: ModalCloseButtonConfig;
  /**
   * Render a trigger button before the modal element.
   * Defaults to `true`. Maps to the Twig `show_modal_button` variable.
   */
  showModalButton?: boolean;
  /**
   * Configuration for the modal trigger button.
   * Maps to the Twig `modal_button` object.
   */
  modalButton?: ModalTriggerButtonConfig;
  /** Additional CSS class names for the `.modal` element. */
  className?: string;
  /** Additional CSS class names for the `.modal-dialog` element. */
  modalDialogClassName?: string;
  /** Additional CSS class names for the `.modal-content` element. */
  modalContentClassName?: string;
  /** Additional CSS class names for the `.modal-title` element. */
  modalTitleClassName?: string;
  /** Additional CSS class names for the `.modal-body` element. */
  modalBodyClassName?: string;
}

/**
 * Modal molecule — mirrors `src/design-system/patterns/02-molecules/modal/_modal.tpl.twig`.
 *
 * Open/close state is managed via React state and React Bootstrap's `Modal`
 * component — no Bootstrap JS bundle required. The trigger button sets show=true;
 * the header/footer close buttons and backdrop click set show=false.
 */
export function Modal({
  modalId: propModalId,
  animate = true,
  backdrop = true,
  backdropStatic = false,
  backdropColor,
  backgroundColor,
  textColor,
  modalCenter = false,
  modalSize,
  modalFullscreen = false,
  modalFullscreenBreakpoint,
  modalTitle,
  modalCloseHeader = true,
  modalCloseHeaderButton,
  modalContent,
  modalFooter,
  showModalFooterClose = false,
  modalCloseFooter,
  showModalButton = true,
  modalButton,
  className,
  modalDialogClassName,
  modalContentClassName,
  modalTitleClassName,
  modalBodyClassName,
}: ModalProps) {
  const [show, setShow] = useState(false);

  const generated = useId().replace(/:/g, '');
  const modalId = propModalId || `modal_${generated}`;
  const labelId = `${modalId}Label`;

  // Resolve React Bootstrap backdrop prop
  const resolvedBackdrop: boolean | 'static' = backdrop && backdropStatic
    ? 'static'
    : backdrop;

  // Resolve React Bootstrap fullscreen prop
  const resolvedFullscreen = modalFullscreen && modalFullscreenBreakpoint
    ? (`${modalFullscreenBreakpoint}-down` as const)
    : modalFullscreen
    ? true
    : undefined;

  // --- Class assembly ---

  const modalExtraClasses =
    cx(styles, backdropColor ? `bg-${backdropColor}` : null, className) || undefined;

  const contentClasses =
    cx(
      styles,
      backgroundColor ? `bg-${backgroundColor}` : null,
      textColor ? `text-${textColor}` : null,
      modalContentClassName,
    ) || undefined;

  const titleClasses = cx(
    styles,
    'modal-title',
    textColor ? `text-${textColor}` : null,
    modalTitleClassName,
  );

  const bodyClasses = cx(
    styles,
    'modal-body',
    textColor ? `text-${textColor}` : null,
    modalBodyClassName,
  );

  const showHeader = !!modalTitle || modalCloseHeader;
  const showFooter = !!modalFooter || showModalFooterClose;

  const headerCloseClasses = cx(
    styles,
    'btn-close',
    'modal--close',
    modalCloseHeaderButton?.whiteClose && 'btn-close-white',
    modalCloseHeaderButton?.className,
  );

  const footerCloseVariant = modalCloseFooter?.variant || 'secondary';
  const footerCloseClasses = cx(
    styles,
    'btn',
    modalCloseFooter?.outline
      ? `btn-outline-${footerCloseVariant}`
      : `btn-${footerCloseVariant}`,
    modalCloseFooter?.size ? `btn-${modalCloseFooter.size}` : null,
    'modal--close',
    modalCloseFooter?.className,
  );

  return (
    <div className={cx(styles, 'modal-pattern-wrapper')} data-pattern="timberland/modal">

      {/* --- Trigger Button --- */}
      {showModalButton && (
        <Button
          variant={modalButton?.variant ?? 'primary'}
          size={modalButton?.size}
          outline={modalButton?.outline}
          block={modalButton?.block}
          label={modalButton?.label ?? 'Open Modal'}
          disabled={modalButton?.disabled}
          id={modalButton?.id}
          className={cx(styles, 'modal--trigger', modalButton?.className)}
          nowrap={modalButton?.nowrap}
          onClick={() => setShow(true)}
        />
      )}

      {/* --- Modal --- */}
      <BsModal
        show={show}
        onHide={() => setShow(false)}
        centered={modalCenter}
        size={modalSize}
        animation={animate}
        backdrop={resolvedBackdrop}
        fullscreen={resolvedFullscreen}
        id={modalId}
        aria-labelledby={labelId}
        className={modalExtraClasses}
        dialogClassName={modalDialogClassName}
        contentClassName={contentClasses}
      >
        {/* Header */}
        {showHeader && (
          <div className={cx(styles, 'modal-header')}>
            {modalTitle && (
              <h5 className={titleClasses} id={labelId}>
                {modalTitle}
              </h5>
            )}
            {modalCloseHeader && (
              <button
                type="button"
                className={headerCloseClasses}
                onClick={() => setShow(false)}
                aria-label={modalCloseHeaderButton?.label ?? 'Close'}
                disabled={modalCloseHeaderButton?.disabled}
              />
            )}
          </div>
        )}

        {/* Body */}
        <div className={bodyClasses}>
          {modalContent}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className={cx(styles, 'modal-footer')}>
            {modalFooter && (
              <div className={cx(styles, 'modal-footer-content')}>
                {modalFooter}
              </div>
            )}
            {showModalFooterClose && (
              <div className={cx(styles, 'modal-actions')}>
                <button
                  type="button"
                  className={footerCloseClasses}
                  onClick={() => setShow(false)}
                  aria-label="Close"
                  disabled={modalCloseFooter?.disabled}
                >
                  {modalCloseFooter?.label ?? 'Close'}
                </button>
              </div>
            )}
          </div>
        )}
      </BsModal>

    </div>
  );
}

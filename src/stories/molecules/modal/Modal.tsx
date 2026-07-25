'use client';

import React, { useId } from 'react';
import { Button } from '@/stories/atoms/button/Button';
import type { ButtonVariant } from '@/stories/atoms/button/Button';

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
 * Mirrors the Twig `timberland/modal` pattern. All structural Bootstrap 5
 * data attributes are rendered as static HTML; Bootstrap JS is loaded globally
 * by the theme and handles modal open/close behaviour.
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
   * Defaults to `true` → `data-bs-backdrop="true"`.
   * Set to `false` → `data-bs-backdrop="false"`.
   * Maps to the Twig `backdrop` variable.
   */
  backdrop?: boolean;
  /**
   * Prevent the modal from closing when the user clicks the backdrop.
   * Requires `backdrop=true`. Maps to the Twig `backdrop_static` variable.
   */
  backdropStatic?: boolean;
  /**
   * Bootstrap color utility applied to the backdrop element (bg-{color}).
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
 * Renders a Bootstrap 5 modal with an optional trigger button. Bootstrap JS
 * (loaded globally in the theme) handles open/close via `data-bs-*` attributes.
 * A unique modal ID is generated with React 18's `useId()` when not supplied.
 *
 * @example
 * <Modal
 *   modalTitle="Confirm action"
 *   modalContent={<p>Are you sure you want to proceed?</p>}
 *   showModalFooterClose
 *   modalButton={{ label: 'Open dialog', variant: 'primary' }}
 * />
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
  // Generate a stable unique ID; strip colons which are invalid in CSS selectors.
  const generated = useId().replace(/:/g, '');
  const modalId = propModalId || `modal_${generated}`;
  const labelId = `${modalId}Label`;

  // Resolve data-bs-backdrop attribute value to match Twig logic.
  const backdropAttr = backdrop && backdropStatic
    ? 'static'
    : backdrop
    ? 'true'
    : 'false';

  // --- Class assembly ---

  const modalClasses = [
    'modal',
    animate !== false ? 'fade' : null,
    backdropColor ? `bg-${backdropColor}` : null,
    className || null,
  ].filter(Boolean).join(' ');

  const dialogClasses = [
    'modal-dialog',
    modalCenter ? 'modal-dialog-centered' : null,
    modalSize ? `modal-${modalSize}` : null,
    modalFullscreen && modalFullscreenBreakpoint
      ? `modal-fullscreen-${modalFullscreenBreakpoint}-down`
      : modalFullscreen
      ? 'modal-fullscreen'
      : null,
    modalDialogClassName || null,
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'modal-content',
    backgroundColor ? `bg-${backgroundColor}` : null,
    textColor ? `text-${textColor}` : null,
    modalContentClassName || null,
  ].filter(Boolean).join(' ');

  const titleClasses = [
    'modal-title',
    textColor ? `text-${textColor}` : null,
    modalTitleClassName || null,
  ].filter(Boolean).join(' ');

  const bodyClasses = [
    'modal-body',
    textColor ? `text-${textColor}` : null,
    modalBodyClassName || null,
  ].filter(Boolean).join(' ');

  // Render the header when a title is present OR a header close button is requested.
  const showHeader = !!modalTitle || modalCloseHeader;
  // Render the footer when footer content is present OR a footer close button is requested.
  const showFooter = !!modalFooter || showModalFooterClose;

  // Close button icon classes (Bootstrap btn-close).
  const headerCloseClasses = [
    'btn-close',
    'modal--close',
    modalCloseHeaderButton?.whiteClose ? 'btn-close-white' : null,
    modalCloseHeaderButton?.className || null,
  ].filter(Boolean).join(' ');

  // Footer dismiss button classes (regular Bootstrap btn).
  const footerCloseVariant = modalCloseFooter?.variant || 'secondary';
  const footerCloseClasses = [
    'btn',
    modalCloseFooter?.outline
      ? `btn-outline-${footerCloseVariant}`
      : `btn-${footerCloseVariant}`,
    modalCloseFooter?.size ? `btn-${modalCloseFooter.size}` : null,
    'modal--close',
    modalCloseFooter?.className || null,
  ].filter(Boolean).join(' ');

  return (
    <div className="modal-pattern-wrapper" data-pattern="timberland/modal">

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
          toggle="modal"
          target={`#${modalId}`}
          controls={modalId}
          className={['modal--trigger', modalButton?.className].filter(Boolean).join(' ')}
          nowrap={modalButton?.nowrap}
        />
      )}

      {/* --- Modal --- */}
      <div
        className={modalClasses}
        id={modalId}
        tabIndex={-1}
        role="dialog"
        aria-labelledby={labelId}
        data-bs-backdrop={backdropAttr}
      >
        <div className={dialogClasses} role="document">
          <div className={contentClasses}>

            {/* Header */}
            {showHeader && (
              <div className="modal-header">
                {modalTitle && (
                  <h5 className={titleClasses} id={labelId}>
                    {modalTitle}
                  </h5>
                )}
                {modalCloseHeader && (
                  <button
                    type="button"
                    className={headerCloseClasses}
                    data-bs-dismiss="modal"
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
              <div className="modal-footer">
                {modalFooter && (
                  <div className="modal-footer-content">
                    {modalFooter}
                  </div>
                )}
                {showModalFooterClose && (
                  <div className="modal-actions">
                    <button
                      type="button"
                      className={footerCloseClasses}
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      disabled={modalCloseFooter?.disabled}
                    >
                      {modalCloseFooter?.label ?? 'Close'}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}

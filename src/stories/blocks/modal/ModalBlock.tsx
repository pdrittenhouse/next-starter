import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { Modal } from '@/stories/molecules/modal/Modal';
import type { ModalSize, ModalFullscreenBreakpoint } from '@/stories/molecules/modal/Modal';
import type { ButtonVariant } from '@/stories/atoms/button/Button';
import styles from './modal.module.scss';
import { cx } from '@/lib/cx';

/**
 * ACF colour sub-object — reused by backdrop, modal bg, and modal text colour fields.
 */
interface AcfColorField {
  bg_color?: string;
  bg_theme_color?: string;
  bg_custom_color?: string;
  color?: string;
  theme_color?: string;
  custom_color?: string;
}

/**
 * ACF modal_id group — stores either a custom string ID or an auto-generated suffix.
 */
interface AcfModalIdField {
  id?: string | null;
  id_gen?: string | null;
  show_ids?: boolean;
}

/**
 * ACF fullscreen_breakpoint group.
 */
interface AcfFullscreenBreakpointField {
  breakpoint?: ModalFullscreenBreakpoint;
}

/**
 * Shared shape for the three button clone groups used in the modal block:
 * trigger_button, header_close_button, footer_button.
 *
 * Only the subset of sub-fields consumed by the Modal pattern props is typed here;
 * the many inline-style fields (border, shadow, padding, etc.) are intentionally
 * omitted — the headless pattern component does not accept raw inline-style props.
 */
interface AcfButtonField {
  element?: string;
  style?: string;
  size?: 'sm' | 'lg';
  outline?: boolean;
  full_width?: boolean;
  disabled?: boolean;
  nowrap?: boolean;
  hide_label?: boolean;
  aria_label?: string;
  classes?: string;
  close?: string;
  background_color?: AcfColorField;
  text_color?: AcfColorField;
}

/**
 * ACF field values for the modal block, as they appear in `attributesJSON.data`.
 *
 * Field names follow ACF's export conventions verbatim so they can be matched
 * directly against the parsed JSON — no transformation at the interface level.
 */
interface ModalBlockData {
  /** Group field: custom / generated modal ID and admin preview toggle. */
  modal_id?: AcfModalIdField;
  /** Modal window title (shown in the header `<h5>`). */
  title?: string | null;

  // --- Trigger button ---
  /** Show the trigger button before the modal element. */
  trigger?: boolean;
  /** Trigger button label text. */
  trigger_text?: string | null;
  /** Trigger button style/variant clone group. */
  trigger_button?: AcfButtonField;

  // --- Modal behaviour ---
  modal_size?: ModalSize;
  center_modal?: boolean;
  animate?: boolean;
  backdrop?: boolean;
  static_backdrop?: boolean;
  backdrop_color?: AcfColorField;
  full_screen?: boolean;
  fullscreen_breakpoint?: AcfFullscreenBreakpointField;

  // --- Modal colours ---
  modal_bg_color?: AcfColorField;
  modal_text_color?: AcfColorField;

  // --- Header close button ---
  /** Show the close (X) button in the modal header. */
  header_close?: boolean;
  /** Header close button text (separate field, not part of header_close_button clone group). */
  header_close_button_text?: string | null;
  /** Header close button style clone group. */
  header_close_button?: AcfButtonField;

  // --- Body & footer content ---
  /** HTML content for the modal body. */
  content?: string | null;
  /** HTML content displayed in the modal footer area before the footer action button. */
  footer_content?: string | null;

  // --- Footer close button ---
  /** Show the dismiss button in the modal footer. */
  footer_close?: boolean;
  /** Footer close button label text (separate field, not part of footer_button clone group). */
  footer_button_text?: string | null;
  /** Footer close button style clone group. */
  footer_button?: AcfButtonField;

  // --- Layout ---
  layout?: { modal_layout?: string };
}

interface ModalBlockProps {
  block: EditorBlock;
}

/**
 * Resolve a ButtonVariant from an ACF button style string.
 *
 * ACF stores the selected Bootstrap colour key (e.g. 'primary', 'secondary').
 * When the field is 'custom', 'black', or 'white' the variant is not a simple
 * Bootstrap utility token, so we return undefined and let the pattern fall back
 * to its default.
 */
function resolveButtonVariant(style?: string): ButtonVariant | undefined {
  if (!style || style === 'custom' || style === 'black' || style === 'white') {
    return undefined;
  }
  return style as ButtonVariant;
}

/**
 * Resolve a palette colour token from an ACF colour sub-object.
 * Returns the `bg_theme_color` / `theme_color` value only when the colour
 * mode is 'palette' — custom inline colours are not surfaced as class names.
 */
function resolvePaletteColor(field?: AcfColorField): string | undefined {
  if (!field) return undefined;
  // Backdrop / background fields use `bg_color` + `bg_theme_color`
  if (field.bg_color === 'palette' && field.bg_theme_color) {
    return field.bg_theme_color;
  }
  // Text / generic colour fields use `color` + `theme_color`
  if (field.color === 'palette' && field.theme_color) {
    return field.theme_color;
  }
  return undefined;
}

/**
 * Modal block — mirrors `src/templates/blocks/modal/modal.twig`.
 *
 * Maps ACF `attributesJSON` field values to the Modal pattern component. The
 * three button clone groups (trigger, header close, footer close) are flattened
 * onto the relevant `ModalTriggerButtonConfig` / `ModalCloseButtonConfig` shapes.
 * Custom inline styles (border, shadow, padding, etc.) from the ACF button
 * sub-groups are intentionally not forwarded — the headless pattern does not
 * accept raw CSS string props.
 *
 * Registered in BLOCK_MAP as 'acf/modal'.
 */
export async function ModalBlock({ block }: ModalBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: ModalBlockData; className?: string };
  const data: ModalBlockData = attrs?.data ?? {};

  // Resolve modal ID — prefer the editor-set custom ID, fall back to the
  // auto-generated suffix that ACF appended as an integer (mirroring the Twig
  // logic: `fields.modal_id['id'] ?: 'modal' ~ fields.modal_id['id_gen']`).
  const modalId = data.modal_id?.id
    ? data.modal_id.id
    : data.modal_id?.id_gen
    ? `modal${data.modal_id.id_gen}`
    : undefined;

  // --- Modal colours (palette tokens only) ---
  const backdropColor = resolvePaletteColor(data.backdrop_color);
  const backgroundColor = resolvePaletteColor(data.modal_bg_color);
  const textColor = resolvePaletteColor(data.modal_text_color);

  // --- Trigger button ---
  const triggerBtn = data.trigger_button;
  const modalButton = triggerBtn
    ? {
        label: data.trigger_text ?? undefined,
        variant: resolveButtonVariant(triggerBtn.style),
        size: triggerBtn.size,
        outline: triggerBtn.outline,
        block: triggerBtn.full_width,
        disabled: triggerBtn.disabled,
        nowrap: triggerBtn.nowrap,
        className: triggerBtn.classes,
      }
    : data.trigger_text
    ? { label: data.trigger_text }
    : undefined;

  // --- Header close button ---
  const headerCloseBtn = data.header_close_button;
  const headerClose = data.header_close ?? true;
  const modalCloseHeaderButton = headerCloseBtn
    ? {
        label: data.header_close_button_text ?? undefined,
        variant: resolveButtonVariant(headerCloseBtn.style),
        size: headerCloseBtn.size,
        outline: headerCloseBtn.outline,
        disabled: headerCloseBtn.disabled,
        // 'white' close → Bootstrap btn-close-white variant
        whiteClose: headerCloseBtn.close === 'white',
        className: headerCloseBtn.classes,
      }
    : undefined;

  // --- Footer close button ---
  const footerBtn = data.footer_button;
  const modalCloseFooter = footerBtn
    ? {
        label: data.footer_button_text ?? undefined,
        variant: resolveButtonVariant(footerBtn.style),
        size: footerBtn.size,
        outline: footerBtn.outline,
        disabled: footerBtn.disabled,
        // 'white' close icon variant (footer is a regular btn, not btn-close, but keep parity)
        whiteClose: footerBtn.close === 'white',
        className: footerBtn.classes,
      }
    : data.footer_button_text
    ? { label: data.footer_button_text }
    : undefined;

  // --- Body / footer HTML content ---
  // Modal.modalContent / modalFooter are React.ReactNode; wrap raw HTML strings
  // in a div so they are rendered without escaping.
  const modalContent = data.content ? (
    <div dangerouslySetInnerHTML={{ __html: data.content }} />
  ) : undefined;

  const modalFooter = data.footer_content ? (
    <div dangerouslySetInnerHTML={{ __html: data.footer_content }} />
  ) : undefined;

  // --- Block-level CSS classes (mirrors Twig modal_classes array) ---
  const layout = data.layout?.modal_layout;
  const blockClasses = cx(
    styles,
    'block-modal',
    layout && layout !== 'default' ? `modal-${layout}` : null,
    attrs.className || null,
  );

  return (
    <Modal
      modalId={modalId}
      animate={data.animate}
      backdrop={data.backdrop}
      backdropStatic={data.static_backdrop}
      backdropColor={backdropColor}
      backgroundColor={backgroundColor}
      textColor={textColor}
      modalCenter={data.center_modal}
      modalSize={data.modal_size}
      modalFullscreen={data.full_screen}
      modalFullscreenBreakpoint={data.fullscreen_breakpoint?.breakpoint}
      modalTitle={data.title ?? undefined}
      modalCloseHeader={headerClose}
      modalCloseHeaderButton={modalCloseHeaderButton}
      modalContent={modalContent}
      modalFooter={modalFooter}
      showModalFooterClose={data.footer_close}
      modalCloseFooter={modalCloseFooter}
      showModalButton={data.trigger}
      modalButton={modalButton}
      className={blockClasses}
    />
  );
}

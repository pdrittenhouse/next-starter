import { Button } from '@/stories/atoms/button/Button';
import type { ButtonToggle, ButtonVariant } from '@/stories/atoms/button/Button';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import type { Placement } from 'react-bootstrap/types';

/**
 * ACF field values for the button block, as they appear in attributesJSON.data.
 *
 * Fields mirror those set in button.twig's embed call — link, style, size,
 * toggle, id, contextual overlay, close button, icon flags, and layout helpers.
 * The `style` field maps to the Button atom's `variant`; 'custom' is skipped
 * (inline-style overrides from the Twig are not supported in the headless layer).
 */
interface ButtonBlockData {
  /** ACF link field — provides button text (title), href (url), and target. */
  link?: {
    title?: string;
    url?: string;
    target?: string;
  } | null;
  /** HTML element to render: button, anchor, or input. Maps to `as`. */
  element?: 'button' | 'a' | 'input';
  /** Color variant (Bootstrap variant name) or 'custom'. Maps to `variant`. */
  style?: string;
  /** Button size. */
  size?: 'sm' | 'lg';
  /** Render as outline button. */
  outline?: boolean;
  /** Render as full-width block button. Maps to `block`. */
  full_width?: boolean;
  /**
   * Toggle type — Bootstrap toggles ('button' | 'collapse' | 'dropdown' | 'modal' | 'tab')
   * or contextual overlays ('tooltip' | 'popover').
   */
  toggle?: string;
  /** Button ID fields — `id` for manual ID, `id_gen` for ACF-generated suffix. */
  id?: {
    id?: string;
    id_gen?: string;
  } | null;
  /** Show button in active/pressed state. Also maps to `expanded`. */
  active?: boolean;
  /** Disable the button. */
  disabled?: boolean;
  /** Value attribute for input buttons. */
  value?: string;
  /** Close button variant: 'black' → CloseButton default, 'white' → CloseButton white. */
  close?: string;
  /** Hide the label text visually. */
  hide_label?: boolean;
  /** ARIA label string (handled via wrapper when set). */
  aria_label?: string;
  /** Prevent text wrapping. */
  nowrap?: boolean;
  /** Contextual overlay data for tooltip/popover toggles. */
  context?: {
    title?: string;
    content?: string;
    placement?: string;
    container?: string;
  } | null;
  /** Whether to render a dropdown variant (layout hint — no separate component needed). */
  dropdown?: boolean;
}

interface ButtonBlockProps {
  block: EditorBlock;
}

/**
 * Button block — mirrors `src/templates/blocks/button/button.twig`.
 *
 * Maps ACF block data to the Button atom. The Twig block embeds the button
 * pattern; this component renders it directly. Close buttons, Bootstrap
 * toggles, and contextual overlays (tooltip/popover) are all supported.
 * Custom inline styles from the Twig 'custom' style path are not carried over.
 *
 * Registered in BLOCK_MAP as 'acf/button'.
 */
export async function ButtonBlock({ block }: ButtonBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: ButtonBlockData; className?: string };
  const data: ButtonBlockData = attrs?.data ?? {};

  const link = data.link;
  const label = link?.title || undefined;
  const href = link?.url || undefined;

  // Resolve close button variant — 'black' → true, 'white' → 'white', absent → undefined
  const closeButton: boolean | 'white' | undefined =
    data.close === 'white' ? 'white' : data.close === 'black' ? true : undefined;

  // Resolve color variant — 'custom' style uses inline overrides in Twig (unsupported here);
  // fall back to 'primary'. Skip variant entirely when rendering a close button.
  const rawStyle = data.style && data.style !== 'custom' ? data.style : 'primary';
  const variant: ButtonVariant | undefined = !closeButton
    ? (rawStyle as ButtonVariant)
    : undefined;

  // Distinguish Bootstrap toggle types from contextual overlay keywords.
  // 'tooltip' and 'popover' become overlay props on the Button atom, not data-bs-toggle.
  const toggleStr = data.toggle ?? '';
  const isContextual = toggleStr === 'tooltip' || toggleStr === 'popover';
  const toggle: ButtonToggle | undefined =
    !isContextual && toggleStr ? (toggleStr as ButtonToggle) : undefined;

  // When a toggle is active, the link URL doubles as the data-bs-target selector
  // (mirrors: button_target: fields.toggle == true ? fields.link['url'] : fields.link['target'])
  const resolvedTarget = toggle
    ? (href ?? undefined)
    : (link?.target ?? undefined);

  // aria-controls strips the leading '#' from the selector
  const resolvedControls = toggle
    ? (href?.replace(/^#/, '') ?? undefined)
    : undefined;

  // Resolve button ID from manual id or ACF-generated suffix
  const buttonId = data.id?.id
    ? data.id.id
    : data.id?.id_gen
      ? `button${data.id.id_gen}`
      : undefined;

  // Contextual overlay props — only populated for the matching toggle keyword
  const tooltip =
    toggleStr === 'tooltip' ? (data.context?.title ?? undefined) : undefined;
  const popoverTitle =
    toggleStr === 'popover' ? (data.context?.title ?? undefined) : undefined;
  const popoverContent =
    toggleStr === 'popover' ? (data.context?.content ?? undefined) : undefined;
  const placement = data.context?.placement as Placement | undefined;

  // Guard: nothing meaningful to render (no text, no close variant, no input value)
  if (!label && !closeButton && !data.value) {
    return null;
  }

  const blockClasses = ['button-block', attrs.className].filter(Boolean).join(' ');

  return (
    <div className={blockClasses}>
      <Button
        variant={variant}
        outline={data.outline ?? false}
        size={data.size}
        block={data.full_width ?? false}
        as={data.element}
        href={href}
        target={resolvedTarget}
        label={label}
        active={data.active ?? false}
        disabled={data.disabled ?? false}
        toggle={toggle}
        value={data.value}
        id={buttonId}
        expanded={data.active ?? false}
        controls={resolvedControls}
        nowrap={data.nowrap ?? false}
        closeButton={closeButton}
        hideLabel={data.hide_label ?? false}
        tooltip={tooltip}
        popoverTitle={popoverTitle}
        popoverContent={popoverContent}
        placement={placement}
      />
    </div>
  );
}

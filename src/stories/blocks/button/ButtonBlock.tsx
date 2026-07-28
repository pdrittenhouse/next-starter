import type { ReactNode } from 'react';
import { Button } from '@/stories/atoms/button/Button';
import type { ButtonToggle, ButtonVariant } from '@/stories/atoms/button/Button';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { acfBool } from '@/lib/wp/utils/parseAcfRepeater';
import type { Placement } from 'react-bootstrap/types';

interface ButtonBlockData {
  link?: { title?: string; url?: string; target?: string } | null;
  element?: 'button' | 'a' | 'input';
  /** Color variant (Bootstrap variant name) or 'custom'. Maps to Button `variant`. */
  style?: string;
  size?: 'sm' | 'lg';
  outline?: unknown;
  full_width?: unknown;
  toggle?: string;
  id?: { id?: string; id_gen?: string } | null;
  active?: unknown;
  disabled?: unknown;
  value?: string;
  close?: string;
  hide_label?: unknown;
  aria_label?: string;
  nowrap?: unknown;
  context?: { title?: string; content?: string; placement?: string; container?: string } | null;
  dropdown?: unknown;
  /** Palette or custom background color — generates `bg-{theme_color}` class. */
  background_color?: { bg_color?: string; bg_theme_color?: string; bg_custom_color?: string } | null;
  /** Palette or custom text color — generates `text-{theme_color}` class. */
  text_color?: { color?: string; theme_color?: string; custom_color?: string } | null;
  /** Display/alignment utility class (only applied when not full-width). */
  display?: { display?: string | null } | null;
}

interface ButtonBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

export async function ButtonBlock({ block, children }: ButtonBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: ButtonBlockData; className?: string };
  const data: ButtonBlockData = attrs?.data ?? {};

  const link = data.link;
  const label = link?.title || undefined;
  const href = link?.url || undefined;

  // Resolve close button variant
  const closeButton: boolean | 'white' | undefined =
    data.close === 'white' ? 'white' : data.close === 'black' ? true : undefined;

  // Resolve color variant. Twig defaults to 'default' (not 'primary') when style is absent.
  const rawStyle =
    !closeButton && data.style && data.style !== 'custom' ? data.style : 'default';
  const variant = rawStyle as ButtonVariant;

  // Distinguish Bootstrap toggle types from contextual overlay keywords
  const toggleStr = data.toggle ?? '';
  const isContextual = toggleStr === 'tooltip' || toggleStr === 'popover';
  const toggle: ButtonToggle | undefined =
    !isContextual && toggleStr ? (toggleStr as ButtonToggle) : undefined;

  // When a toggle is active the link URL doubles as data-bs-target
  const resolvedTarget = toggle
    ? (href || undefined)
    : (link?.target || undefined);  // || treats empty string the same as absent

  const resolvedControls = toggle ? (href?.replace(/^#/, '') || undefined) : undefined;

  const buttonId = data.id?.id
    ? data.id.id
    : data.id?.id_gen
      ? `button${data.id.id_gen}`
      : undefined;

  const tooltip =
    toggleStr === 'tooltip' ? (data.context?.title || undefined) : undefined;
  const popoverTitle =
    toggleStr === 'popover' ? (data.context?.title || undefined) : undefined;
  const popoverContent =
    toggleStr === 'popover' ? (data.context?.content || undefined) : undefined;
  const placement = data.context?.placement as Placement | undefined;

  // button_classes from Twig: bg color, text color, display utility
  const isClose = data.close === 'black' || data.close === 'white';
  const bgClass =
    !isClose && data.background_color?.bg_color === 'palette' && data.background_color.bg_theme_color
      ? `bg-${data.background_color.bg_theme_color}`
      : null;
  const textClass =
    !isClose && data.text_color?.color === 'palette' && data.text_color.theme_color
      ? `text-${data.text_color.theme_color}`
      : null;
  const displayClass =
    !acfBool(data.full_width) && data.display?.display ? data.display.display : null;

  // button_other_classes = block['className'] from WP editor "Additional CSS class(es)"
  const buttonClassName = [bgClass, textClass, displayClass, attrs.className]
    .filter(Boolean)
    .join(' ') || undefined;

  if (!label && !closeButton && !data.value && !children) return null;

  return (
    <div className="button-block">
      <Button
        variant={variant}
        outline={acfBool(data.outline)}
        size={data.size}
        block={acfBool(data.full_width)}
        as={data.element}
        href={href}
        target={resolvedTarget}
        label={label}
        active={acfBool(data.active)}
        disabled={acfBool(data.disabled)}
        toggle={toggle}
        value={data.value || undefined}
        id={buttonId}
        // aria-expanded is only meaningful on toggle buttons; omit for plain links/buttons
        expanded={toggle ? acfBool(data.active) : undefined}
        controls={resolvedControls}
        nowrap={acfBool(data.nowrap)}
        closeButton={closeButton}
        hideLabel={acfBool(data.hide_label)}
        tooltip={tooltip}
        popoverTitle={popoverTitle}
        popoverContent={popoverContent}
        placement={placement}
        className={buttonClassName}
      >
        {children}
      </Button>
    </div>
  );
}

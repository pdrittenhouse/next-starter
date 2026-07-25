import { ButtonGroup } from '@/stories/molecules/button-group/ButtonGroup';
import type { ButtonGroupItem, WrapperDisplay } from '@/stories/molecules/button-group/ButtonGroup';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import type React from 'react';

// ---------------------------------------------------------------------------
// ACF field shapes — mirrors the nested ACF group/repeater fields stored in
// attributesJSON.data for the acf/button-group block.
// ---------------------------------------------------------------------------

/** ACF width value sub-field (value + unit). */
interface AcfWidthValue {
  value?: number;
  unit?: string;
}

/** ACF width container — button_group_wrapper_width.width */
interface AcfWidthContainer {
  width?: AcfWidthValue;
  min_width?: number;
  max_width?: number;
}

/**
 * ACF margin side sub-field.
 * The "value" key matches the side name (top → top, bottom → bottom, etc.).
 */
interface AcfMarginSide {
  auto?: boolean;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/** ACF margin container — button_group_wrapper_margin.margin */
interface AcfMargin {
  top?: AcfMarginSide;
  bottom?: AcfMarginSide;
  left?: AcfMarginSide;
  right?: AcfMarginSide;
}

/** ACF button repeater row — one item inside a group's `buttons` sub-repeater. */
interface AcfButtonData {
  button_label?: string;
  button_variant?: string;
  button_outline?: boolean;
  button_size?: 'sm' | 'lg';
  /** Plain href OR resolved from an ACF link field. */
  button_href?: string;
  button_target?: string;
  button_type?: 'button' | 'submit' | 'reset';
  button_disabled?: boolean;
  button_classes?: string;
}

/** ACF button_groups repeater row — one group of buttons. */
interface AcfButtonGroupItem {
  /**
   * Whether to render this group as d-grid + display-grid.
   * Mirrors button_group_display_grid per group.
   */
  display_grid?: boolean | null;
  /**
   * Responsive breakpoint display classes.
   * Keys: Bootstrap breakpoint (sm, md, lg, xl, xxl).
   * Values: Bootstrap display utility (flex, block, none, etc.).
   */
  breakpoints?: Record<string, string>;
  /** Bootstrap gap spacer applied to the group (gap-{n}). */
  gap?: string | number;
  /** aria-label for this group's role="group" div. */
  label?: string;
  /** Additional CSS classes for this group div. */
  classes?: string;
  /** Buttons inside this group. */
  buttons?: AcfButtonData[];
}

/**
 * ACF field values for the button-group block, as they appear in
 * attributesJSON.data.
 *
 * Wrapper width + margin fields are nested ACF group fields:
 *   button_group_wrapper_width.width.width.value / .unit
 *   button_group_wrapper_width.width.min_width
 *   button_group_wrapper_width.width.max_width
 *   button_group_wrapper_margin.margin.top.auto / .top
 *   (identical pattern for bottom / left / right)
 *
 * Mirrors the Twig template's fields.* references in button-group.twig.
 */
interface ButtonGroupBlockData {
  /** Optional heading above the group(s). Maps to button_group_title. */
  title?: string;
  /** Optional description below the title. Maps to button_group_description. */
  description?: string;
  /** Bootstrap size variant (sm / lg). Maps to button_group_size. */
  size?: 'sm' | 'lg';
  /** Render all groups vertically. Maps to button_group_vertical. */
  vertical?: boolean;
  /** Wrap groups in a Bootstrap btn-toolbar. Maps to button_group_toolbar. */
  toolbar?: boolean;
  /** aria-label for the toolbar. Maps to button_group_toolbar_label. */
  toolbar_label?: string;
  /** Additional classes for the toolbar div. Maps to button_group_toolbar_other_classes. */
  toolbar_classes?: string;
  /**
   * Wrapper display utility.
   * Maps to button_group_wrapper_display via fields.btn_grp_display.display.
   */
  btn_grp_display?: { display?: string };
  /**
   * Wrapper width — complex ACF group field.
   * Maps to fields.button_group_wrapper_width.
   */
  button_group_wrapper_width?: { width?: AcfWidthContainer };
  /**
   * Wrapper margin — complex ACF group field.
   * Maps to fields.button_group_wrapper_margin.
   */
  button_group_wrapper_margin?: { margin?: AcfMargin };
  /**
   * Text alignment for the wrapper.
   * Maps to fields.alignment.text_align.
   */
  alignment?: { text_align?: string };
  /**
   * Button groups repeater — each item becomes one ButtonGroupItem.
   * Maps to fields.button_groups (the btn_groups PHP variable).
   */
  button_groups?: AcfButtonGroupItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build an inline React.CSSProperties object from the ACF wrapper width,
 * margin, and alignment fields.  Mirrors the Twig button_group_wrapper_styles
 * variable construction.  Returns undefined when no values are set.
 */
function buildWrapperStyle(data: ButtonGroupBlockData): React.CSSProperties | undefined {
  const style: React.CSSProperties = {};

  // Width
  const widthContainer = data.button_group_wrapper_width?.width;
  const widthValue = widthContainer?.width;
  if (widthValue != null && widthValue.value != null && widthValue.value >= 0) {
    style.width = `${widthValue.value}${widthValue.unit ?? 'px'}`;
  }
  if (widthContainer?.min_width != null && widthContainer.min_width >= 0) {
    style.minWidth = `${widthContainer.min_width}px`;
  }
  if (widthContainer?.max_width != null && widthContainer.max_width >= 0) {
    style.maxWidth = `${widthContainer.max_width}px`;
  }

  // Text alignment
  if (data.alignment?.text_align) {
    style.textAlign = data.alignment.text_align as React.CSSProperties['textAlign'];
  }

  // Margins — each side uses auto OR a numeric value (mirrors Twig ternary logic)
  const margin = data.button_group_wrapper_margin?.margin;
  if (margin?.top?.auto) {
    style.marginTop = 'auto';
  } else if (margin?.top?.top != null && margin.top.top >= 0) {
    style.marginTop = `${margin.top.top}px`;
  }
  if (margin?.bottom?.auto) {
    style.marginBottom = 'auto';
  } else if (margin?.bottom?.bottom != null && margin.bottom.bottom >= 0) {
    style.marginBottom = `${margin.bottom.bottom}px`;
  }
  if (margin?.left?.auto) {
    style.marginLeft = 'auto';
  } else if (margin?.left?.left != null && margin.left.left >= 0) {
    style.marginLeft = `${margin.left.left}px`;
  }
  if (margin?.right?.auto) {
    style.marginRight = 'auto';
  } else if (margin?.right?.right != null && margin.right.right >= 0) {
    style.marginRight = `${margin.right.right}px`;
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

/**
 * Map ACF button_groups repeater rows to ButtonGroupItem[].
 * Each AcfButtonGroupItem becomes one ButtonGroupItem whose buttons array is
 * mapped from the nested AcfButtonData rows.
 */
function mapGroups(acfGroups: AcfButtonGroupItem[] | undefined): ButtonGroupItem[] {
  if (!acfGroups?.length) return [];

  return acfGroups.map((group): ButtonGroupItem => ({
    displayGrid: group.display_grid ?? null,
    breakpoints: group.breakpoints,
    gap: group.gap,
    label: group.label,
    className: group.classes,
    buttons: (group.buttons ?? []).map((btn): ButtonProps => ({
      variant: btn.button_variant as ButtonProps['variant'],
      outline: btn.button_outline,
      size: btn.button_size,
      label: btn.button_label,
      href: btn.button_href,
      // When toggle is absent, href+target renders as anchor target; when there
      // is no href the target maps to data-bs-target (toggle scenario).
      target: btn.button_target,
      type: btn.button_type,
      disabled: btn.button_disabled,
      className: btn.button_classes,
      // Promote to anchor element when an href is provided.
      as: btn.button_href ? 'a' : undefined,
    })),
  }));
}

// ---------------------------------------------------------------------------
// Block component
// ---------------------------------------------------------------------------

interface ButtonGroupBlockProps {
  block: EditorBlock;
}

/**
 * ButtonGroup block — mirrors `src/templates/blocks/button-group/button-group.twig`.
 *
 * Mirrors the Twig block's relationship with the button-group molecule: just as
 * the Twig block embeds `@molecules/button-group/_button-group.tpl.twig`, this
 * component renders the ButtonGroup molecule.  Wrapper width, margin, and
 * alignment styles are derived from ACF group fields and applied as inline
 * styles on the block wrapper div.
 *
 * Registered in BLOCK_MAP as 'acf/button-group'.
 */
export async function ButtonGroupBlock({ block }: ButtonGroupBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: ButtonGroupBlockData; className?: string };
  const data: ButtonGroupBlockData = attrs?.data ?? {};

  const groups = mapGroups(data.button_groups);

  // Nothing to render without at least one group containing buttons.
  if (groups.length === 0) return null;

  const wrapperDisplay =
    (data.btn_grp_display?.display as WrapperDisplay | undefined) ?? 'inline-block';
  const wrapperStyle = buildWrapperStyle(data);
  const blockClasses = ['button-group-block', attrs.className].filter(Boolean).join(' ') || undefined;

  return (
    <div className={blockClasses} style={wrapperStyle}>
      <ButtonGroup
        wrapperDisplay={wrapperDisplay}
        title={data.title}
        description={data.description}
        toolbar={data.toolbar ?? false}
        toolbarLabel={data.toolbar_label}
        toolbarClassName={data.toolbar_classes}
        size={data.size}
        vertical={data.vertical ?? false}
        groups={groups}
      />
    </div>
  );
}

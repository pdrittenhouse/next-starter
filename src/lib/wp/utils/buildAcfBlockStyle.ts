import type { CSSProperties } from 'react';

/**
 * Shared ACF block style builder — mirrors the inline-style construction in
 * Timberland block Twig templates (width, height, margin, padding, border,
 * border_radius, box_shadow, bg_color).
 *
 * Returns { style, bgClass } where:
 *   style   — React CSSProperties for the block wrapper's style prop (or undefined)
 *   bgClass — Bootstrap bg-{token} class when bg_color uses a palette token (or undefined)
 *
 * Field shapes match the nested ACF group values returned by get_fields() after
 * the acf_setup_meta expansion in RestApi::flatten_block() and GraphQL.php.
 */

// ─── ACF group field type shapes ────────────────────────────────────────────

interface AcfSizeValue {
  value?: number | string | null;
  unit?: string | null;
}

interface AcfWidthContainer {
  width?: AcfSizeValue | null;
  min_width?: number | null;
  max_width?: number | null;
}

interface AcfHeightContainer {
  height?: AcfSizeValue | null;
  min_height?: number | null;
  max_height?: number | null;
}

interface AcfPaddingContainer {
  top?: number | null;
  bottom?: number | null;
  left?: number | null;
  right?: number | null;
}

interface AcfMarginSide {
  auto?: boolean | null;
  top?: number | null;
  bottom?: number | null;
  left?: number | null;
  right?: number | null;
}

interface AcfMarginContainer {
  top?: AcfMarginSide | null;
  bottom?: AcfMarginSide | null;
  left?: AcfMarginSide | null;
  right?: AcfMarginSide | null;
}

interface AcfBorderSide {
  width?: number | null;
  style?: string | null;
  color?: string | null;
  theme_color?: string | null;
  custom_color?: string | null;
}

interface AcfBorderContainer {
  top?: AcfBorderSide | null;
  bottom?: AcfBorderSide | null;
  left?: AcfBorderSide | null;
  right?: AcfBorderSide | null;
}

interface AcfBorderRadiusContainer {
  top_left?: number | null;
  top_right?: number | null;
  bottom_left?: number | null;
  bottom_right?: number | null;
}

interface AcfBoxShadowColor {
  color?: string | null;
  theme_color?: string | null;
  custom_color?: string | null;
}

interface AcfBoxShadowContainer {
  horizontal_offset?: number | null;
  vertical_offset?: number | null;
  blur?: number | null;
  spread?: number | null;
  color?: AcfBoxShadowColor | null;
  inset?: boolean | null;
}

interface AcfBgColorContainer {
  bg_color?: string | null;
  bg_theme_color?: string | null;
  bg_custom_color?: string | null;
}

/**
 * Subset of block data fields used by the style builder.
 * Blocks pass their full `data` object — only these keys are read.
 */
export interface AcfBlockStyleData {
  /** Outer group: fields.width — contains { width: { width: {value, unit}, min_width, max_width } } */
  width?: { width?: AcfWidthContainer | null } | null;
  /** Outer group: fields.height — contains { height: { height: {value, unit}, min_height, max_height } } */
  height?: { height?: AcfHeightContainer | null } | null;
  /** Outer group: fields.padding — contains { padding: { top, bottom, left, right } } */
  padding?: { padding?: AcfPaddingContainer | null } | null;
  /** Outer group: fields.margin — contains { margin: { top: {auto, top}, bottom: {auto, bottom}, ... } } */
  margin?: { margin?: AcfMarginContainer | null } | null;
  /** Outer group: fields.border — contains { top, bottom, left, right } each with width/style/color */
  border?: AcfBorderContainer | null;
  /** Outer group: fields.border_radius — contains { top_left, top_right, bottom_left, bottom_right } */
  border_radius?: AcfBorderRadiusContainer | null;
  /** Outer group: fields.box_shadow — contains { horizontal_offset, vertical_offset, blur, spread, color, inset } */
  box_shadow?: AcfBoxShadowContainer | null;
  /** Outer group: fields.bg_color — contains { bg_color, bg_theme_color, bg_custom_color } */
  bg_color?: AcfBgColorContainer | null;
}

// ─── Main builder ────────────────────────────────────────────────────────────

function px(v: number | null | undefined): string | undefined {
  return v != null && v >= 0 ? `${v}px` : undefined;
}

function sizeStr(v: AcfSizeValue | null | undefined): string | undefined {
  if (v?.value == null || v.value === '') return undefined;
  const n = Number(v.value);
  if (isNaN(n) || n < 0) return undefined;
  return `${n}${v.unit ?? 'px'}`;
}

/**
 * Build React CSSProperties and an optional Bootstrap bg class from the
 * standard Timberland ACF block style fields.
 *
 * Mirrors the inline-style construction in the Twig templates:
 *   width / min-width / max-width
 *   height / min-height / max-height
 *   padding (top / right / bottom / left)
 *   margin (top / right / bottom / left — supports auto)
 *   border (width / style / color per side — palette → CSS var, custom → hex/rgba)
 *   border-radius (per corner, px)
 *   box-shadow (offset / blur / spread / color / inset)
 *   background-color (palette → class, custom → inline style)
 */
export function buildAcfBlockStyle(data: AcfBlockStyleData): {
  style: CSSProperties | undefined;
  bgClass: string | undefined;
} {
  const css: CSSProperties = {};

  // ── Width ──────────────────────────────────────────────────────────────────
  const wc = data.width?.width;
  const w = sizeStr(wc?.width);
  if (w) css.width = w;
  const minW = px(wc?.min_width);
  if (minW) css.minWidth = minW;
  const maxW = px(wc?.max_width);
  if (maxW) css.maxWidth = maxW;

  // ── Height ─────────────────────────────────────────────────────────────────
  const hc = data.height?.height;
  const h = sizeStr(hc?.height);
  if (h) css.height = h;
  const minH = px(hc?.min_height);
  if (minH) css.minHeight = minH;
  const maxH = px(hc?.max_height);
  if (maxH) css.maxHeight = maxH;

  // ── Padding ────────────────────────────────────────────────────────────────
  const pad = data.padding?.padding;
  const pt = px(pad?.top);    if (pt) css.paddingTop    = pt;
  const pb = px(pad?.bottom); if (pb) css.paddingBottom = pb;
  const pl = px(pad?.left);   if (pl) css.paddingLeft   = pl;
  const pr = px(pad?.right);  if (pr) css.paddingRight  = pr;

  // ── Margin ─────────────────────────────────────────────────────────────────
  const mar = data.margin?.margin;
  if (mar?.top?.auto)         css.marginTop    = 'auto';
  else { const v = px(mar?.top?.top);       if (v) css.marginTop    = v; }
  if (mar?.bottom?.auto)      css.marginBottom = 'auto';
  else { const v = px(mar?.bottom?.bottom); if (v) css.marginBottom = v; }
  if (mar?.left?.auto)        css.marginLeft   = 'auto';
  else { const v = px(mar?.left?.left);     if (v) css.marginLeft   = v; }
  if (mar?.right?.auto)       css.marginRight  = 'auto';
  else { const v = px(mar?.right?.right);   if (v) css.marginRight  = v; }

  // ── Border (per side) ──────────────────────────────────────────────────────
  const SIDES = ['top', 'bottom', 'left', 'right'] as const;
  for (const side of SIDES) {
    const b = data.border?.[side];
    if (!b) continue;
    const cap = (side.charAt(0).toUpperCase() + side.slice(1)) as 'Top' | 'Bottom' | 'Left' | 'Right';

    if (b.width != null && b.width > 0) css[`border${cap}Width`] = `${b.width}px`;
    if (b.style)                         css[`border${cap}Style`] = b.style as CSSProperties['borderTopStyle'];

    if (b.color === 'custom' && b.custom_color) {
      css[`border${cap}Color`] = b.custom_color;
    } else if (b.color === 'palette' && b.theme_color) {
      css[`border${cap}Color`] = `var(--${b.theme_color})`;
    }
  }

  // ── Border radius ──────────────────────────────────────────────────────────
  const br = data.border_radius;
  if (br?.top_left    != null && br.top_left    > 0) css.borderTopLeftRadius    = `${br.top_left}px`;
  if (br?.top_right   != null && br.top_right   > 0) css.borderTopRightRadius   = `${br.top_right}px`;
  if (br?.bottom_left != null && br.bottom_left > 0) css.borderBottomLeftRadius = `${br.bottom_left}px`;
  if (br?.bottom_right!= null && br.bottom_right> 0) css.borderBottomRightRadius= `${br.bottom_right}px`;

  // ── Box shadow ─────────────────────────────────────────────────────────────
  const bs = data.box_shadow;
  if (bs) {
    const hasAny =
      bs.horizontal_offset != null || bs.vertical_offset != null ||
      bs.blur != null || bs.spread != null ||
      (bs.color?.color === 'custom' && bs.color.custom_color) ||
      (bs.color?.color === 'palette' && bs.color.theme_color);

    if (hasAny) {
      let shadowColor = '';
      if (bs.color?.color === 'palette' && bs.color.theme_color) {
        shadowColor = `var(--${bs.color.theme_color})`;
      } else if (bs.color?.color === 'custom' && bs.color.custom_color) {
        shadowColor = bs.color.custom_color;
      }
      const inset  = bs.inset ? 'inset ' : '';
      const parts  = [
        `${bs.horizontal_offset ?? 0}px`,
        `${bs.vertical_offset   ?? 0}px`,
        `${bs.blur              ?? 0}px`,
        `${bs.spread            ?? 0}px`,
        shadowColor,
      ].filter(Boolean);
      css.boxShadow = `${inset}${parts.join(' ')}`;
    }
  }

  // ── Background color ───────────────────────────────────────────────────────
  let bgClass: string | undefined;
  if (data.bg_color?.bg_color === 'palette' && data.bg_color.bg_theme_color) {
    bgClass = `bg-${data.bg_color.bg_theme_color}`;
  } else if (data.bg_color?.bg_color === 'custom' && data.bg_color.bg_custom_color) {
    css.backgroundColor = data.bg_color.bg_custom_color;
  }

  return {
    style:   Object.keys(css).length > 0 ? css : undefined,
    bgClass,
  };
}

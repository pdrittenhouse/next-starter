import type { CSSProperties, ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { parseAcfRepeater, acfBool } from '@/lib/wp/utils/parseAcfRepeater';

interface ColWidthEntry  { breakpoint?: string | null; width?: string | null }
interface ColAlignEntry  { breakpoint?: string | null; alignment?: string | null }
interface ColOrderEntry  { breakpoint?: string | null; order?: string | null }
interface ColOffsetEntry { breakpoint?: string | null; offset?: string | null }

interface BorderSide {
  width?: number | string | null;
  style?: string | null;
  color?: string | null;
  theme_color?: string | null;
  custom_color?: string | null;
}

interface BoxShadowData {
  horizontal_offset?: number | string | null;
  vertical_offset?: number | string | null;
  blur?: number | string | null;
  spread?: number | string | null;
  color?: string | null;
  theme_color?: string | null;
  custom_color?: string | null;
  inset?: boolean | null;
}

interface ColumnBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

function bpClass(
  prefix: string,
  bp: string | null | undefined,
  value: string | null | undefined,
): string | null {
  // Mirrors Twig `is not empty`: skip null, undefined, '', and falsy 0
  if (!value) return null;
  return `${prefix}${bp ? `-${bp}` : ''}-${value}`;
}

function borderSideColor(side: BorderSide | undefined): string | undefined {
  if (!side) return undefined;
  if (side.color === 'custom' && side.custom_color) return side.custom_color;
  if (side.color === 'palette' && side.theme_color) return `var(--${side.theme_color})`;
  return undefined;
}

function applyBorderSide(
  s: CSSProperties,
  side: 'Top' | 'Bottom' | 'Left' | 'Right',
  bs: BorderSide,
): void {
  if (bs.width != null && bs.width !== '') {
    (s as Record<string, string>)[`border${side}Width`] = `${bs.width}px`;
  }
  if (bs.style) {
    (s as Record<string, string>)[`border${side}Style`] = bs.style;
  }
  const color = borderSideColor(bs);
  if (color) {
    (s as Record<string, string>)[`border${side}Color`] = color;
  }
}

export async function ColumnBlock({ block, children }: ColumnBlockProps) {
  const attrs = parseBlockAttributes(block) as {
    data?: Record<string, unknown>;
    className?: string;
    backgroundColor?: string;
    style?: { color?: { gradient?: string } };
  };
  const d = attrs?.data ?? {};

  // ── Breakpoint repeaters ────────────────────────────────────────────
  const colWidths  = parseAcfRepeater<ColWidthEntry>(d, 'col_width')
    .map(e => bpClass('col', e.breakpoint, e.width)).filter(Boolean) as string[];
  const colAligns  = parseAcfRepeater<ColAlignEntry>(d, 'col_align')
    .map(e => bpClass('align-self', e.breakpoint, e.alignment)).filter(Boolean) as string[];
  const colOrders  = parseAcfRepeater<ColOrderEntry>(d, 'col_order')
    .map(e => bpClass('order', e.breakpoint, e.order)).filter(Boolean) as string[];
  const colOffsets = parseAcfRepeater<ColOffsetEntry>(d, 'col_offset')
    .map(e => bpClass('offset', e.breakpoint, e.offset)).filter(Boolean) as string[];

  // ── Width — col_break overrides col_width ───────────────────────────
  const widthClass = acfBool(d.col_break)
    ? 'w-100'
    : colWidths.length > 0
      ? colWidths.join(' ')
      : 'col';

  // ── Color utility classes ────────────────────────────────────────────
  const bgClass = d.bg_color === 'palette' && d.bg_theme_color
    ? `bg-${d.bg_theme_color}`
    : attrs.backgroundColor
      ? `bg-${attrs.backgroundColor}`
      : null;
  const textClass = d.color === 'palette' && d.theme_color
    ? `text-${d.theme_color}`
    : null;

  // ── Final class string ───────────────────────────────────────────────
  const colClasses = [
    attrs.className,
    widthClass,
    ...colAligns,
    ...colOrders,
    ...colOffsets,
    bgClass,
    textClass,
    d.col_classes as string | null | undefined,
  ].filter(Boolean).join(' ');

  // ── Inline styles ─────────────────────────────────────────────────
  const s: CSSProperties = {};

  if (d.bg_color === 'custom' && d.bg_custom_color)
    s.backgroundColor = d.bg_custom_color as string;
  if (attrs.style?.color?.gradient)
    s.background = attrs.style.color.gradient;
  if (d.color === 'custom' && d.custom_color)
    s.color = d.custom_color as string;

  const pad = (d.padding as { padding?: Record<string, number | string> } | undefined)?.padding;
  if (pad?.top    != null && pad.top    !== '') s.paddingTop    = `${pad.top}px`;
  if (pad?.bottom != null && pad.bottom !== '') s.paddingBottom = `${pad.bottom}px`;
  if (pad?.left   != null && pad.left   !== '') s.paddingLeft   = `${pad.left}px`;
  if (pad?.right  != null && pad.right  !== '') s.paddingRight  = `${pad.right}px`;

  const border = d.border as Record<string, BorderSide> | undefined;
  if (border?.top)    applyBorderSide(s, 'Top',    border.top);
  if (border?.bottom) applyBorderSide(s, 'Bottom', border.bottom);
  if (border?.left)   applyBorderSide(s, 'Left',   border.left);
  if (border?.right)  applyBorderSide(s, 'Right',  border.right);

  const br = d.border_radius as Record<string, number | string> | undefined;
  if (br?.top_left     != null && br.top_left     !== '') s.borderTopLeftRadius     = `${br.top_left}px`;
  if (br?.top_right    != null && br.top_right    !== '') s.borderTopRightRadius    = `${br.top_right}px`;
  if (br?.bottom_left  != null && br.bottom_left  !== '') s.borderBottomLeftRadius  = `${br.bottom_left}px`;
  if (br?.bottom_right != null && br.bottom_right !== '') s.borderBottomRightRadius = `${br.bottom_right}px`;

  const bs = d.box_shadow as BoxShadowData | undefined;
  if (bs && [bs.horizontal_offset, bs.vertical_offset, bs.blur, bs.spread].some(v => v != null && v !== '')) {
    const shadowColor = bs.color === 'custom' ? (bs.custom_color ?? '') :
      bs.color === 'palette' ? `var(--${bs.theme_color})` : '';
    const inset = bs.inset ? ' inset' : '';
    s.boxShadow = `${bs.horizontal_offset ?? 0}px ${bs.vertical_offset ?? 0}px ${bs.blur ?? 0}px ${bs.spread ?? 0}px ${shadowColor}${inset}`.trim();
  }

  const fallbackHtml = block.renderedHtml ?? '';
  if (!children && !fallbackHtml) return null;

  return (
    <div
      className={colClasses || 'col'}
      style={Object.keys(s).length > 0 ? s : undefined}
    >
      {children ?? <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />}
    </div>
  );
}

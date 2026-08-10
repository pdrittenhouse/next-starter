import type { CSSProperties, ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { parseAcfRepeater, acfBool } from '@/lib/wp/utils/parseAcfRepeater';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';
import styles from './column.module.scss';

interface ColWidthEntry  { breakpoint?: string | null; width?: string | null;     [k: string]: unknown }
interface ColAlignEntry  { breakpoint?: string | null; alignment?: string | null; [k: string]: unknown }
interface ColOrderEntry  { breakpoint?: string | null; order?: string | null;     [k: string]: unknown }
interface ColOffsetEntry { breakpoint?: string | null; offset?: string | null;    [k: string]: unknown }

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
  const colAligns  = parseAcfRepeater<ColAlignEntry>(d, 'vert_align')
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

  // ACF inline styles via shared utility (border, box_shadow, etc.)
  // bg_color in ColumnBlock uses flat fields (d.bg_color === 'palette'), not the nested
  // group structure used by other blocks, so it is handled separately below.
  const { style: acfStyle } = buildAcfBlockStyle(d as AcfBlockStyleData);

  const bgColorType  = d.bg_color       as string | null | undefined;
  const bgThemeColor = d.bg_theme_color  as string | null | undefined;
  const bgCustomColor = d.bg_custom_color as string | null | undefined;

  const acfBgClass = bgColorType === 'palette' && bgThemeColor ? `bg-${bgThemeColor}` : undefined;
  const bgClass = acfBgClass ?? (attrs.backgroundColor ? `bg-${attrs.backgroundColor}` : null);
  const textClass = d.color === 'palette' && d.theme_color ? `text-${d.theme_color}` : null;

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

  // Merge ACF styles with Gutenberg gradient and text-color overrides
  const s: CSSProperties = { ...acfStyle };
  if (bgColorType === 'custom' && bgCustomColor) s.backgroundColor = bgCustomColor;
  if (attrs.style?.color?.gradient) s.background = attrs.style.color.gradient;
  if (d.color === 'custom' && d.custom_color) s.color = d.custom_color as string;

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

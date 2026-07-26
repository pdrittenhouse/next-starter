import type { CSSProperties, ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './table-cell.module.scss';

interface TableCellBlockData {
  element?: 'td' | 'th' | null;
  cell_variant?: {
    color?: string | null;
    theme_color?: string | null;
    custom_color?: string | null;
  };
  cell_padding?: {
    padding?: {
      top?: string | number;
      bottom?: string | number;
      left?: string | number;
      right?: string | number;
    };
  };
  cell_width?: {
    width?: {
      width?: { value?: string | number; unit?: string };
      min_width?: string | number;
      max_width?: string | number;
    };
  };
  cell_text_align?: { text_align?: string | null };
}

interface TableCellBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

export async function TableCellBlock({ block, children }: TableCellBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: TableCellBlockData; className?: string };
  const data: TableCellBlockData = attrs?.data ?? {};

  const Element = data.element === 'th' ? 'th' : 'td';

  const colorClass =
    data.cell_variant?.color === 'palette' && data.cell_variant.theme_color
      ? `table-${data.cell_variant.theme_color}`
      : null;

  const cellClasses = [colorClass, attrs.className].filter(Boolean).join(' ') || undefined;

  const inlineStyle: CSSProperties = {};
  if (data.cell_variant?.color === 'custom' && data.cell_variant.custom_color) {
    inlineStyle.backgroundColor = data.cell_variant.custom_color;
  }
  const padding = data.cell_padding?.padding;
  if (padding?.top != null && padding.top !== '') inlineStyle.paddingTop = `${padding.top}px`;
  if (padding?.bottom != null && padding.bottom !== '') inlineStyle.paddingBottom = `${padding.bottom}px`;
  if (padding?.left != null && padding.left !== '') inlineStyle.paddingLeft = `${padding.left}px`;
  if (padding?.right != null && padding.right !== '') inlineStyle.paddingRight = `${padding.right}px`;

  const widthData = data.cell_width?.width;
  if (widthData?.width?.value != null && widthData.width.value !== '') {
    inlineStyle.width = `${widthData.width.value}${widthData.width.unit ?? 'px'}`;
  }
  if (widthData?.min_width != null && widthData.min_width !== '') {
    inlineStyle.minWidth = `${widthData.min_width}px`;
  }
  if (widthData?.max_width != null && widthData.max_width !== '') {
    inlineStyle.maxWidth = `${widthData.max_width}px`;
  }
  if (data.cell_text_align?.text_align) {
    inlineStyle.textAlign = data.cell_text_align.text_align as CSSProperties['textAlign'];
  }

  const cellProps = {
    className: cellClasses,
    style: Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined,
  };

  if (children) {
    return <Element {...cellProps}>{children}</Element>;
  }

  const fallbackHtml = block.renderedHtml ?? '';
  if (!fallbackHtml) return null;

  return <Element {...cellProps} dangerouslySetInnerHTML={{ __html: fallbackHtml }} />;
}

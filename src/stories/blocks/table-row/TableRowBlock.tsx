import type { CSSProperties, ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './table-row.module.scss';

interface TableRowBlockData {
  row_variant?: {
    color?: string | null;
    theme_color?: string | null;
    custom_color?: string | null;
  };
  row_active?: boolean;
}

interface TableRowBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

export async function TableRowBlock({ block, children }: TableRowBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: TableRowBlockData; className?: string };
  const data: TableRowBlockData = attrs?.data ?? {};

  const colorClass =
    data.row_variant?.color === 'palette' && data.row_variant.theme_color
      ? `table-${data.row_variant.theme_color}`
      : null;

  const rowClasses = [colorClass, data.row_active ? 'table-active' : null, attrs.className]
    .filter(Boolean)
    .join(' ') || undefined;

  const bgStyle: CSSProperties =
    data.row_variant?.color === 'custom' && data.row_variant.custom_color
      ? { backgroundColor: data.row_variant.custom_color }
      : {};

  const trProps = {
    className: rowClasses,
    style: Object.keys(bgStyle).length > 0 ? bgStyle : undefined,
  };

  if (children) {
    return <tr {...trProps}>{children}</tr>;
  }

  const fallbackHtml = block.renderedHtml ?? '';
  if (!fallbackHtml) return null;

  return <tr {...trProps} dangerouslySetInnerHTML={{ __html: fallbackHtml }} />;
}

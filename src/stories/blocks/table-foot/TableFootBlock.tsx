import type { CSSProperties, ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './table-foot.module.scss';

interface TableSectionBlockData {
  section_variant?: {
    color?: string | null;
    theme_color?: string | null;
    custom_color?: string | null;
  };
}

interface TableFootBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

export async function TableFootBlock({ block, children }: TableFootBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: TableSectionBlockData; className?: string };
  const data: TableSectionBlockData = attrs?.data ?? {};

  const colorClass =
    data.section_variant?.color === 'palette' && data.section_variant.theme_color
      ? `table-${data.section_variant.theme_color}`
      : null;

  const footClasses = [colorClass, attrs.className].filter(Boolean).join(' ') || undefined;

  const bgStyle: CSSProperties =
    data.section_variant?.color === 'custom' && data.section_variant.custom_color
      ? { backgroundColor: data.section_variant.custom_color }
      : {};

  const fallbackHtml = block.renderedHtml ?? '';

  if (!children && !fallbackHtml) return null;

  return (
    <tfoot
      className={footClasses}
      style={Object.keys(bgStyle).length > 0 ? bgStyle : undefined}
    >
      {children ?? <tr dangerouslySetInnerHTML={{ __html: fallbackHtml }} />}
    </tfoot>
  );
}

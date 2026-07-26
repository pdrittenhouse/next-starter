import type { ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './column.module.scss';

interface ColWidthEntry {
  breakpoint?: string | null;
  width?: string | null;
}

interface ColumnBlockData {
  col_width?: ColWidthEntry[];
}

interface ColumnBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

function buildColClasses(colWidth: ColWidthEntry[] | undefined): string[] {
  if (!colWidth || colWidth.length === 0) return ['col'];
  const classes = colWidth
    .filter(c => c.width)
    .map(c => {
      const bp = c.breakpoint ? `-${c.breakpoint}` : '';
      return `col${bp}-${c.width}`;
    });
  return classes.length > 0 ? classes : ['col'];
}

export async function ColumnBlock({ block, children }: ColumnBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: ColumnBlockData; className?: string };
  const data: ColumnBlockData = attrs?.data ?? {};

  const colClasses = [...buildColClasses(data.col_width), attrs.className]
    .filter(Boolean)
    .join(' ');

  const fallbackHtml = block.renderedHtml ?? '';

  if (!children && !fallbackHtml) return null;

  return (
    <div className={colClasses || 'col'}>
      {children ?? <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />}
    </div>
  );
}

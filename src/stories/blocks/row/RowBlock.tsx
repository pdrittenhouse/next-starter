import type { ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './row.module.scss';

interface GutterEntry {
  breakpoint?: string | null;
  value?: string | null;
}

interface AlignEntry {
  breakpoint?: string | null;
  alignment?: string | null;
}

interface RowBlockData {
  vert_gutters?: { gutters?: GutterEntry[] };
  hor_gutters?: { gutters?: GutterEntry[] };
  vertical_alignment?: { vert_align?: AlignEntry[] };
  horizontal_alignment?: { hor_align?: AlignEntry[] };
}

interface RowBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

function buildGutterClasses(gutters: GutterEntry[] | undefined, prefix: 'gy' | 'gx'): string[] {
  if (!gutters) return [];
  return gutters
    .filter(g => g.value)
    .map(g => {
      const bp = g.breakpoint ? `-${g.breakpoint}` : '';
      return `${prefix}${bp}-${g.value}`;
    });
}

function buildAlignClasses(aligns: AlignEntry[] | undefined, cssPrefix: string): string[] {
  if (!aligns) return [];
  return aligns
    .filter(a => a.alignment)
    .map(a => {
      const bp = a.breakpoint ? `-${a.breakpoint}` : '';
      return `${cssPrefix}${bp}-${a.alignment}`;
    });
}

export async function RowBlock({ block, children }: RowBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: RowBlockData; className?: string };
  const data: RowBlockData = attrs?.data ?? {};

  const vertGutters = buildGutterClasses(data.vert_gutters?.gutters, 'gy');
  const horGutters = buildGutterClasses(data.hor_gutters?.gutters, 'gx');
  const vertAlign = buildAlignClasses(data.vertical_alignment?.vert_align, 'align-items');
  const horAlign = buildAlignClasses(data.horizontal_alignment?.hor_align, 'justify-content');

  const rowClasses = ['row', ...vertGutters, ...horGutters, ...vertAlign, ...horAlign, attrs.className]
    .filter(Boolean)
    .join(' ');

  const fallbackHtml = block.renderedHtml ?? '';

  if (!children && !fallbackHtml) return null;

  return (
    <div className={rowClasses}>
      {children ?? <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />}
    </div>
  );
}

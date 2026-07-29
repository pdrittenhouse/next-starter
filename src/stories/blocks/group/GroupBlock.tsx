import type { ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './group.module.scss';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';

interface GroupBlockData extends AcfBlockStyleData {
  [key: string]: unknown;
}

interface GroupBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

export async function GroupBlock({ block, children }: GroupBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: GroupBlockData; className?: string };
  const data = (attrs?.data ?? {}) as GroupBlockData;

  const { style: blockStyle, bgClass } = buildAcfBlockStyle(data);
  const blockClasses = ['block-group', bgClass, attrs.className].filter(Boolean).join(' ');

  const fallbackHtml = block.renderedHtml ?? '';
  if (!children && !fallbackHtml) return null;

  return (
    <div className={blockClasses || undefined} style={blockStyle}>
      {children ?? <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />}
    </div>
  );
}

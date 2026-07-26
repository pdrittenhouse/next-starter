import type { ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './group.module.scss';

interface GroupBlockData {
  [key: string]: unknown;
}

interface GroupBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

export async function GroupBlock({ block, children }: GroupBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: GroupBlockData; className?: string };

  const fallbackHtml = block.renderedHtml ?? '';

  if (!children && !fallbackHtml) return null;

  const blockClasses = ['block-group', attrs.className].filter(Boolean).join(' ');

  return (
    <div className={blockClasses || undefined}>
      {children ?? <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />}
    </div>
  );
}

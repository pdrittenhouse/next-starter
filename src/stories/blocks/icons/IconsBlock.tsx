import type { CSSProperties } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './icons.module.scss';

interface IconsBlockData {
  display?: { display?: string | null };
  text_align?: string | null;
}

interface IconsBlockProps {
  block: EditorBlock;
}

export async function IconsBlock({ block }: IconsBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: IconsBlockData; className?: string };
  const data: IconsBlockData = attrs?.data ?? {};

  const displayClass = data.display?.display ?? null;
  const wrapperClasses = ['icon-group', displayClass, attrs.className]
    .filter(Boolean)
    .join(' ');

  const wrapperStyle: CSSProperties = data.text_align
    ? { textAlign: data.text_align as CSSProperties['textAlign'] }
    : {};

  if (!block.renderedHtml) return null;
  return (
    <div
      className={wrapperClasses || undefined}
      style={Object.keys(wrapperStyle).length > 0 ? wrapperStyle : undefined}
      dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
    />
  );
}

import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';
import styles from './slide.module.scss';

interface SlideBlockData extends AcfBlockStyleData {
  [key: string]: unknown;
}

interface SlideBlockProps {
  block: EditorBlock;
  children?: import('react').ReactNode;
}

export async function SlideBlock({ block, children }: SlideBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: SlideBlockData; className?: string };
  const data: SlideBlockData = (attrs?.data ?? {}) as SlideBlockData;

  const { style: wrapperStyle, bgClass } = buildAcfBlockStyle(data);
  const cellClasses = ['carousel-cell', bgClass, attrs.className].filter(Boolean).join(' ');

  if (children) {
    return (
      <div className={cellClasses || 'carousel-cell'} style={wrapperStyle}>
        {children}
      </div>
    );
  }

  if (!block.renderedHtml) return null;
  return (
    <div
      className={cellClasses || 'carousel-cell'}
      style={wrapperStyle}
      dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
    />
  );
}

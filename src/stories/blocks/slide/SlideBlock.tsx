import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';
import styles from './slide.module.scss';
import { cx } from '@/lib/cx';

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
  const cellClasses = cx(styles, 'carousel-cell', bgClass, attrs.className);

  if (children) {
    return (
      <div className={cellClasses} style={wrapperStyle}>
        {children}
      </div>
    );
  }

  if (!block.renderedHtml) return null;
  return (
    <div
      className={cellClasses}
      style={wrapperStyle}
      dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
    />
  );
}

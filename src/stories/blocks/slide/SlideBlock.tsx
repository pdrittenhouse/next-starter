import type React from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';
import styles from './slide.module.scss';
import { cx } from '@/lib/cx';

interface SlideBlockData extends AcfBlockStyleData {
  /** Whether this slide is the active/default slide (Bootstrap carousel). */
  active?: boolean;
  /** Background image object for the slide. */
  bg_image?: {
    url?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  /**
   * Slide layout selector — comes from a seamless ACF clone
   * (slide_layout group, slide_layout sub-field → prefixed key).
   */
  slide_layout_slide_layout?: string | null;
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

  const bgImageStyle = data.bg_image?.url
    ? `background-image:url('${data.bg_image.url}')`
    : undefined;
  const combinedStyle = [wrapperStyle, bgImageStyle].filter(Boolean).join(';') || undefined;

  const layoutClass = data.slide_layout_slide_layout && data.slide_layout_slide_layout !== 'default'
    ? `slide-${data.slide_layout_slide_layout}`
    : null;
  const cellClasses = cx(styles, 'carousel-cell', bgClass, layoutClass, data.active && 'active', attrs.className);

  if (children) {
    return (
      <div className={cellClasses} style={combinedStyle as React.CSSProperties | undefined}>
        {children}
      </div>
    );
  }

  if (!block.renderedHtml) return null;
  return (
    <div
      className={cellClasses}
      style={combinedStyle as React.CSSProperties | undefined}
      dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
    />
  );
}

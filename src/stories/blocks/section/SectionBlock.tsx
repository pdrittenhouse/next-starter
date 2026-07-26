import type { CSSProperties, ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './section.module.scss';

interface SectionBlockData {
  section_layout?: { section_layout?: string | null };
  section_bg_color?: {
    bg_color?: string | null;
    bg_theme_color?: string | null;
    bg_custom_color?: string | null;
  };
  color?: string | null;
  theme_color?: string | null;
  margin?: {
    top?: { top?: number | null; auto?: boolean };
    bottom?: { bottom?: number | null; auto?: boolean };
  };
}

interface SectionBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

function resolveMarginStyle(margin: SectionBlockData['margin']): CSSProperties {
  if (!margin) return {};
  const style: CSSProperties = {};

  if (margin.top?.auto) {
    style.marginTop = 'auto';
  } else if (margin.top?.top != null && margin.top.top >= 0) {
    style.marginTop = `${margin.top.top}px`;
  }
  if (margin.bottom?.auto) {
    style.marginBottom = 'auto';
  } else if (margin.bottom?.bottom != null && margin.bottom.bottom >= 0) {
    style.marginBottom = `${margin.bottom.bottom}px`;
  }

  return style;
}

export async function SectionBlock({ block, children }: SectionBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: SectionBlockData; className?: string };
  const data: SectionBlockData = attrs?.data ?? {};

  const layoutMod =
    data.section_layout?.section_layout && data.section_layout.section_layout !== 'default'
      ? `section-layout-${data.section_layout.section_layout}`
      : null;
  const bgClass =
    data.section_bg_color?.bg_color === 'palette' && data.section_bg_color.bg_theme_color
      ? `bg-${data.section_bg_color.bg_theme_color}`
      : null;
  const textClass =
    data.color === 'palette' && data.theme_color ? `text-${data.theme_color}` : null;

  const sectionClasses = ['block-section', layoutMod, bgClass, textClass, attrs.className]
    .filter(Boolean)
    .join(' ');

  const marginStyle = resolveMarginStyle(data.margin);

  const fallbackHtml = block.renderedHtml ?? '';

  if (!children && !fallbackHtml) return null;

  return (
    <section
      className={sectionClasses || undefined}
      style={Object.keys(marginStyle).length > 0 ? marginStyle : undefined}
    >
      {children ?? <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />}
    </section>
  );
}

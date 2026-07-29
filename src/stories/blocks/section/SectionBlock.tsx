import type { CSSProperties, ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './section.module.scss';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';

/**
 * The section block's margin field uses a shallower nesting than the standard
 * margin clone used by other blocks (fields.margin.top / fields.margin.bottom
 * rather than fields.margin.margin.top / fields.margin.margin.bottom), and only
 * exposes top + bottom.
 */
interface SectionMargin {
  top?: { top?: number | null; auto?: boolean };
  bottom?: { bottom?: number | null; auto?: boolean };
}

interface SectionBlockData {
  section_layout?: { section_layout?: string | null };
  section_bg_color?: AcfBlockStyleData['bg_color'];
  section_border?: AcfBlockStyleData['border'];
  section_border_radius?: AcfBlockStyleData['border_radius'];
  section_box_shadow?: AcfBlockStyleData['box_shadow'];
  height?: AcfBlockStyleData['height'];
  padding?: AcfBlockStyleData['padding'];
  margin?: SectionMargin | null;
  color?: string | null;
  theme_color?: string | null;
  custom_color?: string | null;
}

interface SectionBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

function resolveSectionMargin(margin: SectionMargin | null | undefined): CSSProperties {
  if (!margin) return {};
  const style: CSSProperties = {};
  if (margin.top?.auto) style.marginTop = 'auto';
  else if (margin.top?.top != null && margin.top.top >= 0) style.marginTop = `${margin.top.top}px`;
  if (margin.bottom?.auto) style.marginBottom = 'auto';
  else if (margin.bottom?.bottom != null && margin.bottom.bottom >= 0) style.marginBottom = `${margin.bottom.bottom}px`;
  return style;
}

export async function SectionBlock({ block, children }: SectionBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: SectionBlockData; className?: string };
  const data: SectionBlockData = attrs?.data ?? {};

  const layoutMod =
    data.section_layout?.section_layout && data.section_layout.section_layout !== 'default'
      ? `section-layout-${data.section_layout.section_layout}`
      : null;

  // Remap section-specific field names to standard AcfBlockStyleData shape
  const { style: acfStyle, bgClass } = buildAcfBlockStyle({
    height:        data.height,
    padding:       data.padding,
    border:        data.section_border,
    border_radius: data.section_border_radius,
    box_shadow:    data.section_box_shadow,
    bg_color:      data.section_bg_color,
  });

  // Section uses a shallower margin structure (top/bottom only, no inner margin wrapper)
  const marginStyle = resolveSectionMargin(data.margin);

  const textClass =
    data.color === 'palette' && data.theme_color ? `text-${data.theme_color}` : null;

  const sectionClasses = ['block-section', layoutMod, bgClass, textClass, attrs.className]
    .filter(Boolean)
    .join(' ');

  const sectionStyle: CSSProperties = {
    ...acfStyle,
    ...marginStyle,
    ...(data.color === 'custom' && data.custom_color ? { color: data.custom_color } : {}),
  };

  const fallbackHtml = block.renderedHtml ?? '';
  if (!children && !fallbackHtml) return null;

  return (
    <section
      className={sectionClasses || undefined}
      style={Object.keys(sectionStyle).length > 0 ? sectionStyle : undefined}
    >
      {children ?? <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />}
    </section>
  );
}

import type { CSSProperties } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './icons.module.scss';
import { cx } from '@/lib/cx';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';

interface IconsBlockData extends Pick<AcfBlockStyleData, 'width' | 'margin'> {
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
  const wrapperClasses = cx(styles, 'icon-group', displayClass, attrs.className);

  const { style: acfStyle } = buildAcfBlockStyle({ width: data.width, margin: data.margin });
  const wrapperStyle: CSSProperties = {
    ...acfStyle,
    ...(data.text_align ? { textAlign: data.text_align as CSSProperties['textAlign'] } : {}),
  };

  if (!block.renderedHtml) return null;
  const rewrittenHtml = block.renderedHtml.replace(
    /href="[^"]*spritemap\.svg#sprite-([^"]+)"/g,
    'href="#sprite-$1"',
  );
  return (
    <div
      className={wrapperClasses || undefined}
      style={Object.keys(wrapperStyle).length > 0 ? wrapperStyle : undefined}
      dangerouslySetInnerHTML={{ __html: rewrittenHtml }}
    />
  );
}

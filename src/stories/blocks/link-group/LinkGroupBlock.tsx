import { Button } from '@/stories/patterns/atoms/button/Button';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './link-group.module.scss';
import { cx } from '@/lib/cx';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';

interface LinkItem {
  link?: {
    link?: {
      title?: string | null;
      url?: string | null;
      target?: string | null;
    } | null;
    style?: string | null;
    size?: string | null;
    outline?: boolean;
    background_color?: {
      bg_color?: string | null;
      bg_theme_color?: string | null;
    };
    text_color?: {
      color?: string | null;
      theme_color?: string | null;
    };
  };
}

interface LinkGroupBlockData extends Pick<AcfBlockStyleData, 'padding' | 'margin' | 'border' | 'border_radius' | 'box_shadow' | 'bg_color'> {
  links?: LinkItem[];
  color?: {
    color?: string | null;
    theme_color?: string | null;
    custom_color?: string | null;
  };
}

interface LinkGroupBlockProps {
  block: EditorBlock;
}

export async function LinkGroupBlock({ block }: LinkGroupBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: LinkGroupBlockData; className?: string };
  const data: LinkGroupBlockData = attrs?.data ?? {};

  // Fall back to renderedHtml when no link data is available
  if (!data.links?.length) {
    if (!block.renderedHtml) return null;
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
  }

  const { style: acfStyle, bgClass } = buildAcfBlockStyle(data);
  const textClass =
    data.color?.color === 'palette' && data.color.theme_color
      ? `text-${data.color.theme_color}`
      : null;

  const wrapperClasses = cx(styles, 'link-group-block', bgClass, textClass, attrs.className);

  // Merge ACF styles with text-color override
  const wrapperStyle = {
    ...acfStyle,
    ...(data.color?.color === 'custom' && data.color.custom_color
      ? { color: data.color.custom_color }
      : {}),
  };

  return (
    <div
      className={wrapperClasses || undefined}
      style={wrapperStyle && Object.keys(wrapperStyle).length > 0 ? wrapperStyle : undefined}
    >
      {data.links.map((item, i) => {
        const link = item.link;
        if (!link?.link?.title && !link?.link?.url) return null;

        const btnBgClass =
          link.background_color?.bg_color === 'palette' && link.background_color.bg_theme_color
            ? `bg-${link.background_color.bg_theme_color}`
            : undefined;
        const btnTextClass =
          link.text_color?.color === 'palette' && link.text_color.theme_color
            ? `text-${link.text_color.theme_color}`
            : undefined;
        const btnClassName = [btnBgClass, btnTextClass].filter(Boolean).join(' ') || undefined;

        return (
          <Button
            key={i}
            label={link.link.title ?? undefined}
            href={link.link.url ?? undefined}
            target={link.link.target ?? undefined}
            variant={(link.style && link.style !== 'custom' ? link.style : undefined) as any}
            size={link.size as any}
            outline={link.outline}
            className={btnClassName}
          />
        );
      })}
    </div>
  );
}

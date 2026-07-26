import { Jumbotron } from '@/stories/molecules/jumbotron/Jumbotron';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './hero-unit.module.scss';

interface HeroUnitImage {
  image_type?: 'file' | 'url' | null;
  image?: {
    url?: string | null;
    alt?: string | null;
    sizes?: Record<string, string | number> | null;
    width?: number | null;
    height?: number | null;
  } | null;
  image_url?: string | null;
}

interface HeroUnitBlockData {
  label?: string | null;
  title?: string | null;
  subtitle?: string | null;
  text?: string | null;
  full_width?: boolean;
  include_container?: boolean;
  container_breakpoint?: {
    breakpoint?: string | null;
  };
  max_width_fluid_container?: boolean;
  vertical_center?: boolean;
  image_left?: boolean;
  innerblocks_location?: 'content' | 'image' | null;
  bg_image?: {
    image_type?: string | null;
    image?: { url?: string | null } | null;
    image_url?: string | null;
  } | null;
  bg_color?: {
    bg_color?: string | null;
    bg_theme_color?: string | null;
    bg_custom_color?: string | null;
  };
  color?: {
    color?: string | null;
    theme_color?: string | null;
  };
  image?: HeroUnitImage | null;
  button?: {
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

interface HeroUnitBlockProps {
  block: EditorBlock;
}

export async function HeroUnitBlock({ block }: HeroUnitBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: HeroUnitBlockData; className?: string };
  const data: HeroUnitBlockData = attrs?.data ?? {};

  // Inner blocks rendered HTML for content injection
  const rawInner = (block as unknown as Record<string, unknown>).innerBlocks;
  const innerBlocks: EditorBlock[] = Array.isArray(rawInner) ? (rawInner as EditorBlock[]) : [];
  const innerHtml = innerBlocks.map((b) => b.renderedHtml ?? '').join('');

  // Background image URL
  const bgImageSrc =
    data.bg_image?.image_type === 'file'
      ? (data.bg_image?.image?.url ?? undefined)
      : (data.bg_image?.image_url ?? undefined);

  // Background color class/style
  const bgClass =
    data.bg_color?.bg_color === 'palette' && data.bg_color.bg_theme_color
      ? `bg-${data.bg_color.bg_theme_color}`
      : null;
  const textClass =
    data.color?.color === 'palette' && data.color.theme_color
      ? `text-${data.color.theme_color}`
      : null;

  const className = ['block-hero-unit', bgClass, textClass, attrs.className]
    .filter(Boolean)
    .join(' ');

  // Inline side image
  const imageSrc =
    data.image?.image_type === 'file'
      ? (data.image?.image?.sizes?.['featured-widescreen'] as string | undefined) ?? data.image?.image?.url ?? undefined
      : (data.image?.image_url ?? undefined);

  const imageProps = imageSrc
    ? {
        variant: 'primary' as const,
        src: imageSrc,
        alt: data.image?.image?.alt ?? '',
        width: data.image?.image?.width ?? undefined,
        height: data.image?.image?.height ?? undefined,
        loading: 'lazy' as const,
      }
    : undefined;

  // CTA button — only rendered when a link title or URL is present
  const ctaProps =
    data.button?.link?.title || data.button?.link?.url
      ? {
          label: data.button.link.title ?? undefined,
          href: data.button.link.url ?? undefined,
          target: data.button.link.target ?? undefined,
          variant: (data.button.style && data.button.style !== 'custom' ? data.button.style : undefined) as any,
          size: data.button.size as any,
          outline: data.button.outline,
        }
      : undefined;

  // Text content: explicit ACF text + inner blocks HTML (when location is content area)
  const textContent = [
    data.text ?? '',
    data.innerblocks_location !== 'image' ? innerHtml : '',
  ]
    .filter(Boolean)
    .join('');

  if (!data.label && !data.title && !data.subtitle && !textContent && !imageProps && !bgImageSrc) {
    if (!block.renderedHtml) return null;
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
  }

  return (
    <Jumbotron
      fluid={data.full_width}
      removeContainer={true}
      containerBreakpoint={data.container_breakpoint?.breakpoint ?? undefined}
      maxWidthFluidContainer={data.max_width_fluid_container}
      verticalCenter={data.vertical_center}
      imageLeft={data.image_left}
      label={data.label ?? undefined}
      title={data.title ?? undefined}
      subtitle={data.subtitle ?? undefined}
      text={textContent || undefined}
      bgImage={bgImageSrc}
      image={imageProps}
      cta={ctaProps}
      className={className || undefined}
    />
  );
}

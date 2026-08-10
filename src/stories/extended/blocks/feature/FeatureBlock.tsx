import React from 'react';
import { Feature } from '@/stories/extended/patterns/molecules/Feature';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './feature.module.scss';
import { cx } from '@/lib/cx';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';

interface FeatureImage {
  image_type?: 'file' | 'url' | null;
  image?: {
    url?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  image_url?: string | null;
}

interface FeatureBlockData extends Pick<AcfBlockStyleData, 'height' | 'padding' | 'margin' | 'border' | 'border_radius' | 'box_shadow'> {
  heading?: string | null;
  label?: string | null;
  title?: string | null;
  subtitle?: string | null;
  text?: string | null;
  image?: FeatureImage | null;
  image_right?: boolean;
  caption?: string | null;
  caption_position?: 'before' | 'after' | null;
  vertical?: boolean;
  vertical_center?: boolean;
  linked?: boolean;
  link?: { url?: string | null; target?: string | null } | null;
  show_button?: boolean;
  button?: {
    link?: { title?: string | null; url?: string | null; target?: string | null } | null;
    style?: string | null;
    size?: string | null;
    outline?: boolean;
  } | null;
  include_container?: boolean;
  full_width?: boolean;
  max_width_fluid_container?: boolean;
  container_breakpoint?: { breakpoint?: string | null } | null;
  bg_color?: { bg_color?: string | null; bg_theme_color?: string | null; bg_custom_color?: string | null } | null;
  text_color?: { color?: string | null; theme_color?: string | null } | null;
  inherit_color?: boolean;
  layout?: { feature_layout?: string | null } | null;
  bg_image?: {
    bg_image_type?: 'file' | 'url' | null;
    bg_image?: { url?: string | null } | null;
    bg_image_url?: string | null;
    bg_horizontal_position?: string | null;
    custom_bg_horizontal_position?: string | null;
    bg_vertical_position?: string | null;
    custom_bg_vertical_position?: string | null;
    bg_size?: string | null;
    custom_bg_size?: string | null;
    bg_repeat?: string | null;
    bg_attachment?: string | null;
  };
  id?: { id?: string | null; id_gen?: string | null };
  innerblocks_location?: 'image' | 'content' | null;
}

function buildFeatureBgImageStyle(bgImage: FeatureBlockData['bg_image']): React.CSSProperties {
  if (!bgImage) return {};
  const style: React.CSSProperties = {};
  const url =
    bgImage.bg_image_type === 'file' && bgImage.bg_image?.url
      ? bgImage.bg_image.url
      : bgImage.bg_image_type === 'url' && bgImage.bg_image_url
        ? bgImage.bg_image_url
        : null;
  if (url) style.backgroundImage = `url('${url}')`;
  const size = bgImage.bg_size === 'custom' && bgImage.custom_bg_size
    ? bgImage.custom_bg_size : bgImage.bg_size ?? null;
  if (size) style.backgroundSize = size;
  const hPos = bgImage.bg_horizontal_position === 'custom' && bgImage.custom_bg_horizontal_position
    ? bgImage.custom_bg_horizontal_position : bgImage.bg_horizontal_position ?? null;
  const vPos = bgImage.bg_vertical_position === 'custom' && bgImage.custom_bg_vertical_position
    ? bgImage.custom_bg_vertical_position : bgImage.bg_vertical_position ?? null;
  if (hPos || vPos) style.backgroundPosition = `${hPos ?? ''} ${vPos ?? ''}`.trim();
  if (bgImage.bg_repeat) style.backgroundRepeat = bgImage.bg_repeat;
  if (bgImage.bg_attachment) style.backgroundAttachment = bgImage.bg_attachment;
  return style;
}

export async function FeatureBlock({ block }: { block: EditorBlock }) {
  const attrs = parseBlockAttributes(block) as { data?: FeatureBlockData; className?: string };
  const data: FeatureBlockData = attrs?.data ?? {};

  if (!data.title && !data.heading && !data.text && !data.image) {
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />;
  }

  const featureId = data.id?.id ?? (data.id?.id_gen ? `feature${data.id.id_gen}` : undefined);
  const featureBgStyle = buildFeatureBgImageStyle(data.bg_image);
  const hasBgStyle = Object.keys(featureBgStyle).length > 0;

  const { style: blockStyle } = buildAcfBlockStyle(data);

  const bgClass =
    data.bg_color?.bg_color === 'palette' && data.bg_color.bg_theme_color
      ? `bg-${data.bg_color.bg_theme_color}`
      : null;
  const textClass =
    data.text_color?.color === 'palette' && data.text_color.theme_color
      ? `text-${data.text_color.theme_color}`
      : null;
  const inheritColorClass = data.inherit_color ? 'inherit-color' : null;
  const layoutClass =
    data.layout?.feature_layout && data.layout.feature_layout !== 'default'
      ? `feature-${data.layout.feature_layout}`
      : null;
  const className = cx(styles, 'block-feature', bgClass, textClass, inheritColorClass, layoutClass, attrs.className);

  const imageSrc =
    data.image?.image_type === 'file'
      ? (data.image?.image?.url ?? undefined)
      : (data.image?.image_url ?? undefined);

  const imageProps = imageSrc
    ? {
        src: imageSrc,
        alt: data.image?.image?.alt ?? '',
        width: data.image?.image?.width ?? undefined,
        height: data.image?.image?.height ?? undefined,
        loading: 'lazy' as const,
      }
    : undefined;

  const buttonProps =
    data.show_button && (data.button?.link?.title || data.button?.link?.url)
      ? {
          label: data.button!.link?.title ?? undefined,
          href: data.button!.link?.url ?? undefined,
          target: data.button!.link?.target ?? undefined,
          variant: (data.button!.style && data.button!.style !== 'custom' ? data.button!.style : undefined) as any,
          size: data.button!.size as any,
          outline: data.button!.outline,
        }
      : undefined;

  const feature = (
    <Feature
      id={featureId}
      includeContainer={data.include_container}
      fullWidth={data.full_width}
      containerBreakpoint={data.container_breakpoint?.breakpoint ?? undefined}
      maxWidthFluidContainer={data.max_width_fluid_container}
      vertical={data.vertical}
      verticalCenter={data.vertical_center}
      imageRight={data.image_right}
      image={imageProps}
      caption={data.caption ?? undefined}
      captionPosition={data.caption_position ?? undefined}
      heading={data.heading ?? undefined}
      label={data.label ?? undefined}
      title={data.title ?? undefined}
      subtitle={data.subtitle ?? undefined}
      description={data.text ?? undefined}
      linked={data.linked}
      link={data.link?.url ?? undefined}
      target={data.link?.target ?? undefined}
      button={buttonProps}
      className={className || undefined}
      customStyle={hasBgStyle ? featureBgStyle : undefined}
    />
  );

  if (blockStyle) return <div style={blockStyle}>{feature}</div>;
  return feature;
}

import React from 'react';
import { Jumbotron } from '@/stories/patterns/molecules/jumbotron/Jumbotron';
import { Feature } from '@/stories/extended/patterns/molecules/Feature';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './hero-unit.module.scss';
import { cx } from '@/lib/cx';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';

/**
 * ACF hero-unit block — dispatches on `hero_type` to render one of three modes:
 *   - `jumbotron` (default): Jumbotron molecule
 *   - `section`: bare <section> wrapper with InnerBlocks HTML (mirrors SectionBlock)
 *   - `feature`: Feature molecule (timberland-extended)
 *
 * Added in this revision: hero_type dispatch, linked, overlay fields
 * (include_overlay, gradient_overlay, overlay_opacity, overlay_bg), bg_video group
 * (bg_video, bg_mp4, bg_webm, bg_ogv, bg_autoplay, bg_loop, bg_muted,
 * bg_auto_resize, bg_vertical_position, bg_horizontal_position, bg_video_classes),
 * and feature-mode specific fields (heading, image_right, caption, caption_position,
 * vertical). bg_image interface corrected to use proper ACF field names
 * (bg_image_type / bg_image.url / bg_image_url).
 */

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

/** Matches ACF bg_image clone group (group_636871db82c48) with prefix_name:1 */
interface HeroBgImage {
  bg_image_type?: 'file' | 'url' | null;
  bg_image?: { url?: string | null } | null;
  bg_image_url?: string | null;
  bg_size?: string | null;
  custom_bg_size?: string | null;
  bg_horizontal_position?: string | null;
  custom_bg_horizontal_position?: string | null;
  bg_vertical_position?: string | null;
  custom_bg_vertical_position?: string | null;
  bg_repeat?: string | null;
  bg_attachment?: string | null;
}

interface HeroBgColor {
  bg_color?: string | null;
  bg_theme_color?: string | null;
  bg_custom_color?: string | null;
}

interface HeroUnitBlockData extends Pick<AcfBlockStyleData, 'height' | 'padding' | 'margin' | 'border' | 'border_radius' | 'box_shadow'> {
  // Dispatch
  hero_type?: 'section' | 'jumbotron' | 'feature' | null;
  hero_layout?: {
    section_layout?: { section_layout?: string | null } | null;
    jumbotron_layout?: { jumbotron_layout?: string | null; gradient?: string | null } | null;
    feature_layout?: { feature_layout?: string | null } | null;
  } | null;
  // Common content fields
  label?: string | null;
  title?: string | null;
  subtitle?: string | null;
  text?: string | null;
  // Layout
  full_width?: boolean;
  include_container?: boolean;
  container_breakpoint?: { breakpoint?: string | null };
  max_width_fluid_container?: boolean;
  vertical_center?: boolean;
  innerblocks_location?: 'content' | 'image' | null;
  // Linked (section + jumbotron modes only in admin, but passed to feature too)
  linked?: boolean;
  // Jumbotron-specific
  image_left?: boolean;
  // Feature-specific
  heading?: string | null;
  image_right?: boolean;
  caption?: string | null;
  caption_position?: 'before' | 'after' | null;
  vertical?: boolean;
  // Section-specific
  col_gap?: { value?: number | string | null; unit?: string | null };
  vert_align_child?: boolean;
  vertical_alignment?: {
    vert_align?: Array<{ breakpoint?: string | null; alignment?: string | null }>;
  };
  container_bg_color?: HeroBgColor | null;
  // Background
  bg_image?: HeroBgImage | null;
  bg_color?: HeroBgColor | null;
  color?: {
    color?: string | null;
    theme_color?: string | null;
    custom_color?: string | null;
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
  // Overlay
  include_overlay?: boolean;
  gradient_overlay?: boolean;
  overlay_opacity?: number | null;
  overlay_bg?: HeroBgColor | null;
  // Background video (not available in feature mode)
  bg_video?: boolean;
  bg_mp4?: string | null;
  bg_webm?: string | null;
  bg_ogv?: string | null;
  bg_autoplay?: boolean;
  bg_loop?: boolean;
  bg_muted?: boolean;
  bg_auto_resize?: boolean;
  bg_vertical_position?: number | null;
  bg_horizontal_position?: number | null;
  bg_video_classes?: string | null;
}

interface HeroUnitBlockProps {
  block: EditorBlock;
}

/** Build background-image CSSProperties from the bg_image clone group. */
function buildBgImageStyle(
  bgImage: HeroBgImage | null | undefined,
  isBgVideo: boolean,
): React.CSSProperties {
  if (isBgVideo || !bgImage) return {};
  const style: React.CSSProperties = {};
  const url =
    bgImage.bg_image_type === 'file' && bgImage.bg_image?.url
      ? bgImage.bg_image.url
      : bgImage.bg_image_type === 'url' && bgImage.bg_image_url
        ? bgImage.bg_image_url
        : null;
  if (url) style.backgroundImage = `url('${url}')`;
  const size =
    bgImage.bg_size === 'custom' && bgImage.custom_bg_size
      ? bgImage.custom_bg_size
      : bgImage.bg_size ?? undefined;
  if (size) style.backgroundSize = size;
  const hPos =
    bgImage.bg_horizontal_position === 'custom' && bgImage.custom_bg_horizontal_position
      ? bgImage.custom_bg_horizontal_position
      : bgImage.bg_horizontal_position ?? undefined;
  const vPos =
    bgImage.bg_vertical_position === 'custom' && bgImage.custom_bg_vertical_position
      ? bgImage.custom_bg_vertical_position
      : bgImage.bg_vertical_position ?? undefined;
  if (hPos || vPos) style.backgroundPosition = `${hPos ?? ''} ${vPos ?? ''}`.trim();
  if (bgImage.bg_repeat) style.backgroundRepeat = bgImage.bg_repeat;
  if (bgImage.bg_attachment) style.backgroundAttachment = bgImage.bg_attachment;
  return style;
}

/** Build data-* attribute props for the bg_video player (Jarallax/bgVideo pattern). */
function buildBgVideoProps(data: HeroUnitBlockData): Record<string, string> {
  if (!data.bg_video) return {};
  const props: Record<string, string> = {};
  if (data.bg_mp4) props['data-mp4'] = data.bg_mp4;
  if (data.bg_webm) props['data-webm'] = data.bg_webm;
  if (data.bg_ogv) props['data-ogv'] = data.bg_ogv;
  // Poster frame comes from bg_image when bg_video is on
  const poster =
    data.bg_image?.bg_image_type === 'file' && data.bg_image?.bg_image?.url
      ? data.bg_image.bg_image.url
      : data.bg_image?.bg_image_type === 'url' && data.bg_image?.bg_image_url
        ? data.bg_image.bg_image_url
        : null;
  if (poster) props['data-poster'] = poster;
  props['data-loop'] = data.bg_loop === true ? 'true' : 'false';
  props['data-muted'] = data.bg_muted === true ? 'true' : 'false';
  props['data-autoplay'] = data.bg_autoplay === true ? 'true' : 'false';
  props['data-resizing'] = data.bg_auto_resize === true ? 'true' : 'false';
  const hpos = data.bg_horizontal_position ?? 0;
  const vpos = data.bg_vertical_position ?? 0;
  props['data-position'] = `${hpos}% ${vpos}%`;
  const bgColor =
    data.bg_color?.bg_color === 'custom' && data.bg_color.bg_custom_color
      ? data.bg_color.bg_custom_color
      : data.bg_color?.bg_color === 'palette' && data.bg_color.bg_theme_color
        ? `var(--${data.bg_color.bg_theme_color})`
        : 'transparent';
  props['data-bg-color'] = bgColor;
  if (data.bg_video_classes) props['data-video-classes'] = data.bg_video_classes;
  return props;
}

/** Build overlay CSS class string. */
function buildOverlayClass(
  data: HeroUnitBlockData,
  blockGradient: string | null,
): string {
  const bgCls =
    data.overlay_bg?.bg_color === 'palette' && data.overlay_bg?.bg_theme_color
      ? `bg-${data.overlay_bg.bg_theme_color}`
      : null;
  const gradientCls =
    data.gradient_overlay === true && blockGradient ? `gradient-${blockGradient}` : null;
  return ['overlay', bgCls, gradientCls].filter(Boolean).join(' ');
}

/** Build overlay CSSProperties. */
function buildOverlayStyle(
  data: HeroUnitBlockData,
  blockStyleGradient: string | null,
): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (data.overlay_bg?.bg_color === 'custom' && data.overlay_bg?.bg_custom_color)
    style.backgroundColor = data.overlay_bg.bg_custom_color;
  if (data.gradient_overlay === true && blockStyleGradient)
    style.background = blockStyleGradient;
  if (data.overlay_opacity != null) style.opacity = data.overlay_opacity;
  return style;
}

/** Build vertical-alignment CSS class names for section wrapper. */
function buildVAClasses(va: HeroUnitBlockData['vertical_alignment']): string[] {
  if (!va?.vert_align?.length) return [];
  return va.vert_align
    .filter(item => item.alignment)
    .map(item => {
      const bp = item.breakpoint ? `-${item.breakpoint}` : '';
      return `align-items${bp}-${item.alignment}`;
    });
}

export async function HeroUnitBlock({ block }: HeroUnitBlockProps) {
  const attrs = parseBlockAttributes(block) as {
    data?: HeroUnitBlockData;
    className?: string;
    gradient?: string | null;
    style?: { color?: { gradient?: string | null } };
  };
  const data: HeroUnitBlockData = attrs?.data ?? {};
  const blockGradient = attrs.gradient ?? null;
  const blockStyleGradient = attrs.style?.color?.gradient ?? null;

  const heroType = data.hero_type ?? 'jumbotron';

  // Inner blocks rendered HTML for content injection
  const rawInner = (block as unknown as Record<string, unknown>).innerBlocks;
  const innerBlocks: EditorBlock[] = Array.isArray(rawInner) ? (rawInner as EditorBlock[]) : [];
  const innerHtml = innerBlocks.map((b) => b.renderedHtml ?? '').join('');

  // Block-level inline styles (height, padding, margin, border, border-radius, box-shadow)
  const { style: blockStyle } = buildAcfBlockStyle(data);

  // Overlay
  const overlayClassName = buildOverlayClass(data, blockGradient);
  const overlayStyle = buildOverlayStyle(data, blockStyleGradient);
  const overlayStyleFinal = Object.keys(overlayStyle).length > 0 ? overlayStyle : undefined;

  // bg_video data-* props
  const bgVideoProps = buildBgVideoProps(data);

  // Background and text color classes (suppressed during bg_video)
  const bgClass =
    !data.bg_video && data.bg_color?.bg_color === 'palette' && data.bg_color.bg_theme_color
      ? `bg-${data.bg_color.bg_theme_color}`
      : null;
  const textClass =
    data.color?.color === 'palette' && data.color.theme_color
      ? `text-${data.color.theme_color}`
      : null;

  // Layout-variant modifier classes
  const jumbotronLayoutMod =
    heroType === 'jumbotron' &&
    data.hero_layout?.jumbotron_layout?.jumbotron_layout &&
    data.hero_layout.jumbotron_layout.jumbotron_layout !== 'default'
      ? `jumbotron-${data.hero_layout.jumbotron_layout.jumbotron_layout}`
      : null;
  const jumbotronGradientMod =
    heroType === 'jumbotron' &&
    (data.hero_layout?.jumbotron_layout?.jumbotron_layout === 'gradient-overlay-left' ||
      data.hero_layout?.jumbotron_layout?.jumbotron_layout === 'gradient-overlay-right') &&
    data.hero_layout?.jumbotron_layout?.gradient
      ? `gradient-${data.hero_layout.jumbotron_layout.gradient}`
      : null;
  const featureLayoutMod =
    heroType === 'feature' &&
    data.hero_layout?.feature_layout?.feature_layout &&
    data.hero_layout.feature_layout.feature_layout !== 'default'
      ? `feature-${data.hero_layout.feature_layout.feature_layout}`
      : null;
  const sectionLayoutMod =
    heroType === 'section' &&
    data.hero_layout?.section_layout?.section_layout &&
    data.hero_layout.section_layout.section_layout !== 'default'
      ? `section-layout-${data.hero_layout.section_layout.section_layout}`
      : null;

  const heroTypeCls =
    heroType === 'section' ? 'hero-section'
    : heroType === 'jumbotron' ? 'hero-jumbotron'
    : heroType === 'feature' ? 'hero-feature'
    : null;

  const blockClassName = cx(
    styles,
    'hero-unit', heroTypeCls, bgClass, textClass,
    jumbotronLayoutMod, jumbotronGradientMod, featureLayoutMod, sectionLayoutMod,
    attrs.className,
  );

  // ─── Section mode ────────────────────────────────────────────────────────

  if (heroType === 'section') {
    const bgImageStyle = buildBgImageStyle(data.bg_image, data.bg_video ?? false);
    const sectionStyle: React.CSSProperties = {
      ...blockStyle,
      ...bgImageStyle,
      ...(!data.bg_video && data.bg_color?.bg_color === 'custom' && data.bg_color.bg_custom_color
        ? { backgroundColor: data.bg_color.bg_custom_color } : {}),
      ...(data.color?.color === 'custom' && data.color.custom_color
        ? { color: data.color.custom_color } : {}),
    };
    const sectionStyleFinal = Object.keys(sectionStyle).length > 0 ? sectionStyle : undefined;

    const vaClasses = buildVAClasses(data.vertical_alignment);
    const colGapStyle: React.CSSProperties = data.col_gap?.value != null
      ? { columnGap: `${data.col_gap.value}${data.col_gap.unit ?? ''}` }
      : {};
    const wrapperClassName = cx(styles, 'hero-section--wrapper', ...vaClasses);
    const wrapperStyleFinal = Object.keys(colGapStyle).length > 0 ? colGapStyle : undefined;

    const sectionContent = (
      <>
        {data.include_overlay && (
          <span className={overlayClassName} style={overlayStyleFinal} />
        )}
        <div className={wrapperClassName || undefined} style={wrapperStyleFinal}>
          {innerHtml
            ? <div dangerouslySetInnerHTML={{ __html: innerHtml }} />
            : null}
        </div>
      </>
    );

    if (data.linked && data.button?.link?.url) {
      return (
        <a
          href={data.button.link.url}
          target={data.button.link.target ?? '_self'}
          className={blockClassName || undefined}
          style={sectionStyleFinal}
          {...bgVideoProps}
        >
          {sectionContent}
        </a>
      );
    }

    return (
      <section
        className={blockClassName || undefined}
        style={sectionStyleFinal}
        {...bgVideoProps}
      >
        {sectionContent}
      </section>
    );
  }

  // ─── Feature mode ─────────────────────────────────────────────────────────

  if (heroType === 'feature') {
    if (!data.title && !data.heading && !data.text && !data.image) {
      if (!block.renderedHtml) return null;
      return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
    }

    const featureImageSrc =
      data.image?.image_type === 'file'
        ? (data.image?.image?.url ?? undefined)
        : (data.image?.image_url ?? undefined);

    const featureImageProps = featureImageSrc
      ? {
          src: featureImageSrc,
          alt: data.image?.image?.alt ?? '',
          width: data.image?.image?.width ?? undefined,
          height: data.image?.image?.height ?? undefined,
          loading: 'lazy' as const,
        }
      : undefined;

    const featureButtonProps =
      data.button?.link?.title || data.button?.link?.url
        ? {
            label: data.button!.link?.title ?? undefined,
            href: data.button!.link?.url ?? undefined,
            target: data.button!.link?.target ?? undefined,
            variant: (data.button!.style && data.button!.style !== 'custom'
              ? data.button!.style : undefined) as any,
            size: data.button!.size as any,
            outline: data.button!.outline,
          }
        : undefined;

    const featureEl = (
      <Feature
        includeContainer={data.include_container}
        fullWidth={data.full_width}
        containerBreakpoint={data.container_breakpoint?.breakpoint ?? undefined}
        maxWidthFluidContainer={data.max_width_fluid_container}
        vertical={data.vertical}
        verticalCenter={data.vertical_center}
        imageRight={data.image_right}
        image={featureImageProps}
        caption={data.caption ?? undefined}
        captionPosition={data.caption_position ?? undefined}
        heading={data.heading ?? undefined}
        label={data.label ?? undefined}
        title={data.title ?? undefined}
        subtitle={data.subtitle ?? undefined}
        description={data.text ?? undefined}
        linked={data.linked}
        link={data.button?.link?.url ?? undefined}
        target={data.button?.link?.target ?? undefined}
        button={featureButtonProps}
        className={!data.include_overlay ? (blockClassName || undefined) : undefined}
      />
    );

    // Overlay requires a relative wrapper since Feature has no overlay slot
    if (data.include_overlay) {
      const wrapperCls = [blockClassName, 'position-relative'].filter(Boolean).join(' ') || undefined;
      const wrapper = (
        <div className={wrapperCls}>
          <span className={overlayClassName} style={overlayStyleFinal} />
          {featureEl}
        </div>
      );
      if (blockStyle) return <div style={blockStyle}>{wrapper}</div>;
      return wrapper;
    }

    if (blockStyle) return <div style={blockStyle}>{featureEl}</div>;
    return featureEl;
  }

  // ─── Jumbotron mode (default) ─────────────────────────────────────────────

  // Background image URL (suppressed when bg_video is on — poster is passed via data-poster)
  const bgImageSrc = !data.bg_video
    ? (data.bg_image?.bg_image_type === 'file'
        ? (data.bg_image?.bg_image?.url ?? undefined)
        : (data.bg_image?.bg_image_url ?? undefined))
    : undefined;

  // Custom inline styles for the Jumbotron root (bg_color, text color, bg_image)
  const bgImageStyleObj = buildBgImageStyle(data.bg_image, data.bg_video ?? false);
  const jumbotronCustomStyle: React.CSSProperties = {
    ...bgImageStyleObj,
    ...(!data.bg_video && data.bg_color?.bg_color === 'custom' && data.bg_color.bg_custom_color
      ? { backgroundColor: data.bg_color.bg_custom_color } : {}),
    ...(data.color?.color === 'custom' && data.color.custom_color
      ? { color: data.color.custom_color } : {}),
  };
  const jumbotronCustomStyleFinal = Object.keys(jumbotronCustomStyle).length > 0
    ? jumbotronCustomStyle : undefined;

  // Inline side image
  const jumbotronImageSrc =
    data.image?.image_type === 'file'
      ? ((data.image?.image?.sizes?.['featured-widescreen'] as string | undefined) ?? data.image?.image?.url ?? undefined)
      : (data.image?.image_url ?? undefined);

  const jumbotronImageProps = jumbotronImageSrc
    ? {
        variant: 'primary' as const,
        src: jumbotronImageSrc,
        alt: data.image?.image?.alt ?? '',
        width: data.image?.image?.width ?? undefined,
        height: data.image?.image?.height ?? undefined,
        loading: 'lazy' as const,
      }
    : undefined;

  // CTA button
  const ctaProps =
    data.button?.link?.title || data.button?.link?.url
      ? {
          label: data.button.link.title ?? undefined,
          href: data.button.link.url ?? undefined,
          target: data.button.link.target ?? undefined,
          variant: (data.button.style && data.button.style !== 'custom'
            ? data.button.style : undefined) as any,
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

  if (!data.label && !data.title && !data.subtitle && !textContent && !jumbotronImageProps && !bgImageSrc) {
    if (!block.renderedHtml) return null;
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
  }

  const jumbotron = (
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
      image={jumbotronImageProps}
      cta={ctaProps}
      className={blockClassName || undefined}
      customStyle={jumbotronCustomStyleFinal}
      customAttributes={Object.keys(bgVideoProps).length > 0 ? bgVideoProps : undefined}
      overlayClass={data.include_overlay ? overlayClassName : undefined}
      overlayStyle={data.include_overlay ? overlayStyleFinal : undefined}
    />
  );

  const wrapped = blockStyle ? <div style={blockStyle}>{jumbotron}</div> : jumbotron;

  if (data.linked && data.button?.link?.url) {
    return (
      <a href={data.button.link.url} target={data.button.link.target ?? '_self'}>
        {wrapped}
      </a>
    );
  }

  return wrapped;
}

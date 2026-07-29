import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_MEDIA_ITEM_BY_ID } from '@/lib/wp/queries';
import { Jumbotron } from '@/stories/molecules/jumbotron/Jumbotron';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import type { ImageProps } from '@/stories/atoms/image/Image';
import type { ButtonProps, ButtonVariant } from '@/stories/atoms/button/Button';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';

// ─── ACF sub-field interfaces ─────────────────────────────────────────────────

interface JumbotronBgImageData {
  /** 'file' — attachment ID; 'url' — direct URL string. */
  bg_image_type?: 'file' | 'url';
  /** Attachment ID (file type) or null. */
  bg_image?: number | string | null;
  /** Direct URL (url type). */
  bg_image_url?: string | null;
  bg_size?: string;
  custom_bg_size?: string;
  bg_horizontal_position?: string;
  custom_bg_horizontal_position?: string;
  bg_vertical_position?: string;
  custom_bg_vertical_position?: string;
  bg_repeat?: string;
  bg_attachment?: string;
}

interface JumbotronSideImageData {
  /** 'file' — attachment ID; 'url' — direct URL string. */
  image_type?: 'file' | 'url';
  /** Attachment ID (file type) or null. */
  image?: number | string | null;
  /** Direct URL (url type). */
  image_url?: string | null;
}

interface JumbotronButtonLinkData {
  title?: string;
  url?: string;
  target?: string;
}

interface JumbotronButtonData {
  link?: JumbotronButtonLinkData;
  /** Bootstrap variant name, e.g. 'primary', 'secondary', or 'custom'. */
  style?: string;
  size?: 'sm' | 'lg';
  outline?: boolean;
  /** Render as full-width block button. */
  full_width?: boolean;
  element?: 'button' | 'a' | 'input';
  /** Bootstrap toggle type (collapse, dropdown, modal, tab). */
  toggle?: string;
  id?: { id?: string; id_gen?: string };
  active?: boolean;
  disabled?: boolean;
  value?: string;
  /** Extra CSS classes string. */
  classes?: string;
  aria_label?: string;
  /** Close button variant: 'black' | 'white'. */
  close?: string;
}

interface JumbotronIdData {
  id?: string;
  id_gen?: string;
}

interface JumbotronContainerBreakpointData {
  breakpoint?: string;
}

// ─── Main block data interface ────────────────────────────────────────────────

/**
 * ACF field values for the jumbotron block, as they appear in attributesJSON.data.
 *
 * Field names mirror the ACF field keys from the Timberland jumbotron block
 * (see src/templates/blocks/jumbotron/jumbotron.twig). Nested group/sub-field
 * objects are typed as their own interfaces above.
 */
interface JumbotronBlockData {
  /** Eyebrow label rendered above the title. Twig: `fields['label']`. */
  label?: string;
  /** Primary heading. Twig: `fields['jumbotron_title']`. */
  jumbotron_title?: string;
  /** Secondary heading. Twig: `fields['jumbotron_subtitle']`. */
  jumbotron_subtitle?: string;
  /** Body copy (HTML). Twig: `fields['jumbotron_text']`. */
  jumbotron_text?: string;
  /** Remove rounded corners; full-width. Twig: `fields['jumbotron_fluid']`. */
  jumbotron_fluid?: boolean;
  /** Vertically center content. Twig: `fields.vertical_center`. */
  vertical_center?: boolean;
  /** Position inline image to the left. Twig: `fields.image_left`. */
  image_left?: boolean;
  /**
   * When true the block keeps its Bootstrap container instead of going full-width.
   * Twig: `fields.jumbotron_container` (inverts to `remove_container` in the embed).
   */
  jumbotron_container?: boolean;
  /** Container responsive breakpoint. Twig: `fields.container_breakpoint.breakpoint`. */
  container_breakpoint?: JumbotronContainerBreakpointData;
  /** Add max-width class to a fluid container. Twig: `fields.max_width_fluid_container`. */
  max_width_fluid_container?: boolean;
  /** HTML id for the root element. Twig: `fields.id`. */
  id?: JumbotronIdData;
  /** Background image (CSS). Twig: `fields.jumbotron_bg_image`. */
  jumbotron_bg_image?: JumbotronBgImageData;
  /** Inline side image. Twig: `fields.jumbotron_image`. */
  jumbotron_image?: JumbotronSideImageData;
  /** CTA button. Twig: `fields.jumbotron_button`. */
  jumbotron_button?: JumbotronButtonData;
  /** Render the overlay span. Twig: `fields.include_overlay`. */
  include_overlay?: boolean;
  /** Background video mode — suppresses the bg image URL. Twig: `fields.bg_video`. */
  bg_video?: boolean;
  /** Block-level height (standard AcfBlockStyleData shape). */
  height?: AcfBlockStyleData['height'];
  /** Block-level border (standard AcfBlockStyleData shape). */
  border?: AcfBlockStyleData['border'];
  border_radius?: AcfBlockStyleData['border_radius'];
  box_shadow?: AcfBlockStyleData['box_shadow'];
  /** Custom-prefixed padding field — same ACF group structure as standard padding. */
  jumbotron_padding?: AcfBlockStyleData['padding'];
  /** Custom-prefixed margin field — same ACF group structure as standard margin. */
  jumbotron_margin?: AcfBlockStyleData['margin'];
  /** Custom-prefixed bg_color field — same ACF group structure as standard bg_color. */
  jumbotron_bg_color?: AcfBlockStyleData['bg_color'];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MediaItem = {
  sourceUrl: string;
  altText?: string;
  mediaDetails?: { width?: number; height?: number };
};

interface JumbotronBlockProps {
  block: EditorBlock;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Jumbotron block — mirrors `src/templates/blocks/jumbotron/jumbotron.twig`.
 *
 * Maps WordPress ACF block data (from WPGraphQL attributesJSON) to the
 * Jumbotron pattern component. File-sourced images resolve the attachment ID
 * via GET_MEDIA_ITEM_BY_ID (same data WP resolves before the Twig render).
 * Both the background image and the inline side image are fetched in parallel
 * when present.
 *
 * Registered in BLOCK_MAP as 'acf/jumbotron'.
 */
export async function JumbotronBlock({ block }: JumbotronBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: JumbotronBlockData; className?: string };
  const data: JumbotronBlockData = attrs?.data ?? {};

  const bgImgData = data.jumbotron_bg_image;
  const sideImgData = data.jumbotron_image;

  // Attachment IDs for file-type images — only when not in bg-video mode.
  const bgImageId =
    !data.bg_video && bgImgData?.bg_image_type === 'file' && bgImgData.bg_image
      ? String(bgImgData.bg_image)
      : null;

  const sideImageId =
    sideImgData?.image_type === 'file' && sideImgData.image
      ? String(sideImgData.image)
      : null;

  // Parallel GraphQL media fetches — mirrors ImageBlock pattern.
  const [bgMediaResult, sideMediaResult] = await Promise.all([
    bgImageId
      ? fetchGraphQL<{ mediaItem: MediaItem | null }>(
          print(GET_MEDIA_ITEM_BY_ID),
          { id: bgImageId },
        )
      : Promise.resolve(null),
    sideImageId
      ? fetchGraphQL<{ mediaItem: MediaItem | null }>(
          print(GET_MEDIA_ITEM_BY_ID),
          { id: sideImageId },
        )
      : Promise.resolve(null),
  ]);

  // Resolve CSS background image URL.
  // bg_video mode: WP still uses jumbotron_bg_image as a poster; in the headless
  // context we skip the background URL in that case (video rendering is out of scope).
  let bgImage: string | undefined;
  if (!data.bg_video) {
    if (bgImgData?.bg_image_type === 'url' && bgImgData.bg_image_url) {
      bgImage = bgImgData.bg_image_url;
    } else if (bgImageId && bgMediaResult?.data?.mediaItem) {
      bgImage = bgMediaResult.data.mediaItem.sourceUrl;
    }
  }

  // Resolve inline side image props.
  let image: ImageProps | undefined;
  if (sideImgData?.image_type === 'url' && sideImgData.image_url) {
    image = {
      src: sideImgData.image_url,
      alt: '',
      variant: 'picture',
      loading: 'lazy',
    };
  } else if (sideImageId && sideMediaResult?.data?.mediaItem) {
    const media = sideMediaResult.data.mediaItem;
    image = {
      src: media.sourceUrl,
      alt: media.altText ?? '',
      width: media.mediaDetails?.width,
      height: media.mediaDetails?.height,
      variant: 'picture',
      loading: 'lazy',
    };
  }

  // Resolve CTA button — mirrors Twig: {% if jumbotron_button.link.title or link.url %}.
  let cta: ButtonProps | undefined;
  const btnData = data.jumbotron_button;
  if (btnData?.link?.title || btnData?.link?.url) {
    const isCloseBtn: ButtonProps['closeButton'] =
      btnData.close === 'white' ? 'white' : btnData.close === 'black' ? true : undefined;

    // Variant only applies when not rendering as a close button.
    const variant: ButtonVariant =
      !isCloseBtn && btnData.style && btnData.style !== 'custom'
        ? (btnData.style as ButtonVariant)
        : 'primary';

    const btnId = btnData.id?.id
      ? btnData.id.id
      : btnData.id?.id_gen
      ? `button${btnData.id.id_gen}`
      : undefined;

    cta = {
      label: btnData.link?.title,
      href: btnData.link?.url,
      target: btnData.link?.target,
      variant,
      size: btnData.size,
      outline: btnData.outline ?? false,
      block: btnData.full_width ?? false,
      active: btnData.active ?? false,
      disabled: btnData.disabled ?? false,
      value: btnData.value,
      id: btnId,
      className: btnData.classes,
      closeButton: isCloseBtn,
    };
  }

  // Graceful null guard — return nothing when there is no meaningful content.
  if (
    !data.jumbotron_title &&
    !data.label &&
    !data.jumbotron_text &&
    !bgImage &&
    !image
  ) {
    return null;
  }

  // Resolve jumbotron id.
  const id = data.id?.id
    ? data.id.id
    : data.id?.id_gen
    ? `jumbotron${data.id.id_gen}`
    : undefined;

  // removeContainer: true when jumbotron_container is falsy (full-width default).
  // Mirrors Twig logic: remove_container defaults to true unless jumbotron_container
  // is enabled (the global remove_content_containers option is not available in the
  // headless context, so container presence is driven solely by the block field).
  const removeContainer = !data.jumbotron_container;

  const className = ['block-jumbotron', attrs.className].filter(Boolean).join(' ') || undefined;

  // Block-level styles — remap jumbotron_* fields to standard AcfBlockStyleData names
  const { style: blockStyle, bgClass } = buildAcfBlockStyle({
    height:        data.height,
    border:        data.border,
    border_radius: data.border_radius,
    box_shadow:    data.box_shadow,
    padding:       data.jumbotron_padding,
    margin:        data.jumbotron_margin,
    bg_color:      data.jumbotron_bg_color,
  });

  const jumbotronEl = (
    <Jumbotron
      id={id}
      fluid={data.jumbotron_fluid ?? false}
      removeContainer={removeContainer}
      verticalCenter={data.vertical_center ?? false}
      imageLeft={data.image_left ?? false}
      containerBreakpoint={data.container_breakpoint?.breakpoint}
      maxWidthFluidContainer={data.max_width_fluid_container ?? false}
      label={data.label}
      title={data.jumbotron_title}
      subtitle={data.jumbotron_subtitle}
      text={data.jumbotron_text}
      bgImage={bgImage}
      image={image}
      cta={cta}
      className={className}
    />
  );

  if (blockStyle || bgClass) {
    return (
      <div className={bgClass || undefined} style={blockStyle}>
        {jumbotronEl}
      </div>
    );
  }
  return jumbotronEl;
}

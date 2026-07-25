import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_MEDIA_ITEM_BY_ID } from '@/lib/wp/queries';
import { Card } from '@/stories/organisms/card/Card';
import type {
  CardBackground,
  CardBorder,
  CardTextColor,
  CardImageLocation,
  CardLinkTarget,
  CardIconProps,
} from '@/stories/organisms/card/Card';
import type { ButtonProps, ButtonVariant } from '@/stories/atoms/button/Button';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';

// ─── ACF field interfaces ──────────────────────────────────────────────────────

/**
 * A color group sub-field as serialised by ACF into attributesJSON.
 */
interface AcfColorField {
  color?: 'palette' | 'custom' | 'none' | string;
  theme_color?: string;
  custom_color?: string;
}

/**
 * A background-color group sub-field.
 */
interface AcfBgColorField {
  bg_color?: 'palette' | 'custom' | 'none' | string;
  bg_theme_color?: string;
  bg_custom_color?: string;
}

/**
 * The card_bg_image / back_bg_image group sub-field.
 */
interface AcfBgImageField {
  bg_image_type?: 'file' | 'url';
  /** Attachment ID when bg_image_type === 'file'. */
  bg_image?: number | string | null;
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

/**
 * The image group field on the card block.
 */
interface AcfCardImageField {
  image_type?: 'file' | 'url';
  /** Attachment ID when image_type === 'file'. */
  image?: number | string | null;
  image_url?: string | null;
}

/**
 * ACF field values for the card block, as they appear inside attributesJSON.data.
 *
 * Field names mirror the ACF field keys registered in the Timberland theme.
 * Group sub-fields are represented as nested objects exactly as ACF serialises
 * them (e.g. `card_bg_color.bg_theme_color`).
 */
export interface CardBlockData {
  // ─── Content ────────────────────────────────────────────────────────────────
  card_title?: string | null;
  subtitle?: string | null;
  /** Rich HTML body content rendered inside .card-text. */
  body?: string | null;
  label?: string | null;
  /** Rich HTML footer content. */
  card_footer?: string | null;
  /** Rich HTML content for the flip-card back face. */
  card_back_content?: string | null;
  heading_level?: string;

  // ─── Link ───────────────────────────────────────────────────────────────────
  link?: { url?: string; title?: string; target?: string } | null;
  /** Wrap the entire card in an anchor tag. */
  link_card?: boolean;
  trigger_modal?: boolean;
  modal_id?: string | null;
  /** Show a button atom in the card body instead of a plain inline link. */
  show_button?: boolean;

  // ─── Button (group field) ───────────────────────────────────────────────────
  button?: {
    style?: string;
    size?: '' | 'sm' | 'lg';
    outline?: boolean;
    full_width?: boolean;
    element?: 'button' | 'a' | 'input';
    disabled?: boolean;
    toggle?: string;
    classes?: string | null;
    close?: 'black' | 'white' | false | null;
    hide_label?: boolean;
    aria_label?: string | null;
    nowrap?: boolean;
    value?: string | null;
  };

  // ─── Card image ─────────────────────────────────────────────────────────────
  image?: AcfCardImageField | null;
  image_position?: 'top' | 'bottom';
  image_overlay?: boolean;
  image_overlay_text?: string | null;

  // ─── Layout ─────────────────────────────────────────────────────────────────
  horizontal?: boolean;
  layout?: { card_layout?: string };
  horizontal_layout?: { horizontal_card_layout?: string };
  text_align?: string | null;
  vertically_center_content?: boolean;
  featured?: boolean;
  flip_card?: boolean;

  // ─── Appearance ─────────────────────────────────────────────────────────────
  card_bg_color?: AcfBgColorField | null;
  card_text_color?: AcfColorField | null;
  card_border_color?: AcfColorField | null;
  remove_card_border?: boolean;
  remove_card_header_padding?: boolean;
  remove_card_body_padding?: boolean;
  remove_card_footer_padding?: boolean;
  inherit_text_color?: boolean;

  // ─── Background images ──────────────────────────────────────────────────────
  card_bg_image?: AcfBgImageField | null;
  back_bg_image?: AcfBgImageField | null;

  // ─── Flip-card back face colors ─────────────────────────────────────────────
  back_bg_color?: AcfBgColorField | null;
  back_text_color?: AcfColorField | null;
  back_border_color?: AcfColorField | null;

  // ─── Card icon ──────────────────────────────────────────────────────────────
  card_icon?: {
    type?: 'custom' | 'font-awesome' | 'none' | string;
    icon?: string | null;
    fa_icon?: string | null;
    fa_icon_style?: string | null;
    icon_color?: AcfColorField | null;
    size?: number | string | null;
    vertical_offset?: number | string | null;
    horizontal_offset?: number | string | null;
  } | null;
}

interface CardBlockProps {
  block: EditorBlock;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** WPGraphQL media item shape returned by GET_MEDIA_ITEM_BY_ID. */
interface MediaItem {
  sourceUrl: string;
  altText?: string;
  mediaDetails?: { width?: number; height?: number };
}

/** Fetch a single media item by its WordPress attachment ID. */
async function fetchMediaItem(id: number | string): Promise<MediaItem | null> {
  const { data } = await fetchGraphQL<{ mediaItem: MediaItem | null }>(
    print(GET_MEDIA_ITEM_BY_ID),
    { id: String(id) },
  );
  return data?.mediaItem ?? null;
}

/**
 * Resolve a background-image field to a plain URL string.
 * File fields fetch the attachment; URL fields return the stored URL directly.
 */
async function resolveBgImageUrl(field: AcfBgImageField | null | undefined): Promise<string | null> {
  if (!field) return null;
  if (field.bg_image_type === 'url' && field.bg_image_url) return field.bg_image_url;
  if (field.bg_image_type === 'file' && field.bg_image) {
    const media = await fetchMediaItem(field.bg_image);
    return media?.sourceUrl ?? null;
  }
  return null;
}

/**
 * Map an ACF text-align value to a Card textAlignment prop value.
 * ACF stores 'left'/'right'; the Card prop expects Bootstrap suffixes.
 */
function resolveTextAlignment(
  textAlign: string | null | undefined,
): 'center' | 'start' | 'end' | 'justify' | undefined {
  if (!textAlign || textAlign === 'null') return undefined;
  if (textAlign === 'left') return 'start';
  if (textAlign === 'right') return 'end';
  if (textAlign === 'center' || textAlign === 'justify') return textAlign;
  return undefined;
}

/**
 * Build a CardIconProps or plain class-string from the card_icon ACF group.
 * Mirrors the card.twig card_icon block logic:
 *   - type === 'custom'       → CardIconProps (SVG)
 *   - type === 'font-awesome' → class string
 */
function resolveIcon(
  field: CardBlockData['card_icon'],
): CardIconProps | string | undefined {
  if (!field || field.type === 'none' || !field.type) return undefined;

  if (field.type === 'custom' && field.icon) {
    return {
      name: field.icon,
      fill:
        field.icon_color?.color === 'palette' && field.icon_color.theme_color
          ? field.icon_color.theme_color
          : undefined,
      width: field.size ? Number(field.size) : undefined,
      height: field.size ? Number(field.size) : undefined,
    };
  }

  if (field.type === 'font-awesome' && field.fa_icon) {
    const parts = [field.fa_icon_style, field.fa_icon].filter(Boolean);
    return parts.join(' ');
  }

  return undefined;
}

/**
 * Build ButtonProps when show_button is true.
 * Mirrors the card.twig button include logic.
 */
function resolveButton(data: CardBlockData): ButtonProps | undefined {
  if (!data.show_button) return undefined;

  const btn = data.button ?? {};
  const link = data.link;

  const variant: ButtonVariant | undefined =
    btn.close !== 'black' &&
    btn.close !== 'white' &&
    btn.style &&
    btn.style !== 'custom'
      ? (btn.style as ButtonVariant)
      : undefined;

  const size = btn.size === 'sm' || btn.size === 'lg' ? btn.size : undefined;

  const href =
    data.link_card !== true && data.trigger_modal !== true && link?.url
      ? link.url
      : undefined;

  const target =
    data.trigger_modal !== true && link?.target ? link.target : undefined;

  return {
    ...(variant ? { variant } : {}),
    ...(size ? { size } : {}),
    outline: btn.outline ?? false,
    block: btn.full_width ?? false,
    as: btn.element ?? undefined,
    disabled: btn.disabled ?? false,
    href,
    target,
    label: link?.title,
    nowrap: btn.nowrap ?? false,
    className: 'card-button',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Card block — mirrors `src/templates/blocks/card/card.twig`.
 *
 * Parses ACF block attributes from `attributesJSON`, resolves file-based
 * image attachments via GET_MEDIA_ITEM_BY_ID, then renders the Card organism.
 *
 * Registered in BLOCK_MAP as 'acf/card'.
 */
export async function CardBlock({ block }: CardBlockProps) {
  const attrs = parseBlockAttributes(block) as {
    data?: CardBlockData;
    className?: string;
    anchor?: string;
  };
  const data: CardBlockData = attrs?.data ?? {};

  // ─── Resolve image attachments (parallel) ───────────────────────────────────
  const imageField = data.image ?? null;
  const cardBgImageField = data.card_bg_image ?? null;
  const backBgImageField = data.back_bg_image ?? null;

  const [cardMediaItem, backgroundImage, backBackgroundImage] = await Promise.all([
    // Card <img> — file type resolves attachment ID to full media item
    (async (): Promise<MediaItem | null> => {
      if (imageField?.image_type === 'file' && imageField.image) {
        return fetchMediaItem(imageField.image);
      }
      return null;
    })(),
    resolveBgImageUrl(cardBgImageField),
    resolveBgImageUrl(backBgImageField),
  ]);

  // ─── Card image props ────────────────────────────────────────────────────────
  let cardImageSrc: string | null = null;
  let cardImageAlt = '';
  let cardImageWidth: number | undefined;
  let cardImageHeight: number | undefined;

  if (imageField?.image_type === 'url' && imageField.image_url) {
    cardImageSrc = imageField.image_url;
  } else if (imageField?.image_type === 'file' && cardMediaItem) {
    cardImageSrc = cardMediaItem.sourceUrl;
    cardImageAlt = cardMediaItem.altText ?? '';
    cardImageWidth = cardMediaItem.mediaDetails?.width;
    cardImageHeight = cardMediaItem.mediaDetails?.height;
  }

  // ─── Appearance mapping ──────────────────────────────────────────────────────
  const bgColor = data.card_bg_color;
  const background: CardBackground | undefined =
    bgColor?.bg_color === 'palette' && bgColor.bg_theme_color
      ? (bgColor.bg_theme_color as CardBackground)
      : undefined;

  const textColorField = data.card_text_color;
  const textColor: CardTextColor | undefined =
    textColorField?.color === 'palette' && textColorField.theme_color
      ? (textColorField.theme_color as CardTextColor)
      : undefined;

  const borderColorField = data.card_border_color;
  const border: CardBorder | undefined =
    borderColorField?.color === 'palette' && borderColorField.theme_color
      ? (borderColorField.theme_color as CardBorder)
      : undefined;

  const inheritColor =
    ((textColorField?.color === 'palette' && !!textColorField.theme_color) ||
      (textColorField?.color === 'custom' && !!textColorField.custom_color)) &&
    !!data.inherit_text_color;

  // ─── Image location — only relevant when an image source was resolved ────────
  const imageLocation =
    cardImageSrc && data.image_position
      ? (data.image_position as CardImageLocation)
      : undefined;

  // ─── Text alignment ──────────────────────────────────────────────────────────
  const textAlignment = resolveTextAlignment(data.text_align);

  // ─── Extra className for the card wrapper ────────────────────────────────────
  // Mirrors card_classes array: block-card, layout variant, WordPress className.
  const layoutClass =
    !data.horizontal && data.layout?.card_layout && data.layout.card_layout !== 'default'
      ? `card-${data.layout.card_layout}`
      : data.horizontal && data.horizontal_layout?.horizontal_card_layout &&
          data.horizontal_layout.horizontal_card_layout !== 'default'
        ? `card-${data.horizontal_layout.horizontal_card_layout}`
        : null;

  const extraClasses = [
    'block-card',
    layoutClass,
    data.vertically_center_content ? 'vertically-center-content' : null,
    attrs.className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  // ─── Icon ───────────────────────────────────────────────────────────────────
  const icon = resolveIcon(data.card_icon);

  // ─── Button ─────────────────────────────────────────────────────────────────
  const button = resolveButton(data);

  // ─── Link ───────────────────────────────────────────────────────────────────
  const link = data.link?.url ?? undefined;
  const linkText = data.link?.title ?? undefined;
  const linkTarget = data.link?.target
    ? (data.link.target as CardLinkTarget)
    : undefined;

  // ─── HTML content fields ─────────────────────────────────────────────────────
  const bodyContent = data.body ? (
    <div dangerouslySetInnerHTML={{ __html: data.body }} />
  ) : undefined;

  const footerContent = data.card_footer ? (
    <span dangerouslySetInnerHTML={{ __html: data.card_footer }} />
  ) : undefined;

  const backContent = data.card_back_content ? (
    <div dangerouslySetInnerHTML={{ __html: data.card_back_content }} />
  ) : undefined;

  return (
    <Card
      id={attrs.anchor ?? undefined}
      title={data.card_title ?? undefined}
      subtitle={data.subtitle ?? undefined}
      text={bodyContent}
      label={data.label ?? undefined}
      footer={footerContent}
      background={background}
      textColor={textColor}
      border={border}
      noBorder={data.remove_card_border ?? false}
      noHeaderPadding={data.remove_card_header_padding ?? false}
      noBodyPadding={data.remove_card_body_padding ?? false}
      noFooterPadding={data.remove_card_footer_padding ?? false}
      inheritColor={inheritColor}
      textAlignment={textAlignment}
      linked={data.link_card ?? false}
      link={link}
      linkText={linkText}
      linkTarget={linkTarget}
      flipCard={data.flip_card ?? false}
      backContent={backContent}
      backgroundImage={backgroundImage ?? undefined}
      backBackgroundImage={backBackgroundImage ?? undefined}
      imageLocation={imageLocation}
      imageOverlay={data.image_overlay ?? false}
      imageOverlayText={data.image_overlay_text ?? undefined}
      image={
        cardImageSrc
          ? {
              variant: 'picture',
              src: cardImageSrc,
              alt: cardImageAlt,
              width: cardImageWidth,
              height: cardImageHeight,
              sizes: '(max-width: 768px) 100vw, 960px',
              loading: 'lazy',
            }
          : undefined
      }
      icon={icon}
      button={button}
      className={extraClasses}
    />
  );
}

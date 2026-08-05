import type { CSSProperties } from 'react';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_MEDIA_ITEM_BY_ID } from '@/lib/wp/queries';
import { Image, type ImageVariant } from '@/stories/patterns/atoms/image/Image';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';
import styles from './image.module.scss';
import { cx } from '@/lib/cx';

/**
 * ACF field values for the image block, as they appear in attributesJSON.data.
 *
 * The `image` field is an ACF clone of module-image with prefix_name: 1, so
 * its sub-fields are stored with the clone name as prefix:
 *   image_image_type  (not image_type)
 *   image_image       (not image)   — attachment ID
 *   image_image_url   (not image_url)
 *
 * When get_fields() is used to expand block attrs, ACF may instead return the
 * clone sub-fields grouped under the clone name as data.image.{image_type, image, image_url}.
 * Both formats are handled. The nested format includes the full WP attachment
 * object (url, width, height, alt) so no secondary GraphQL fetch is needed.
 *
 * All other fields (image_size, image_variant, loading, etc.) are top-level
 * on the block and have no prefix.
 */

interface AcfAttachmentObject {
  ID?: number;
  id?: number;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface ImageBlockData extends AcfBlockStyleData {
  image_image_type?: 'file' | 'url';
  image_image?: number | string | null;
  image_image_url?: string | null;
  /** Nested clone format from get_fields(): sub-fields grouped under the clone field name. */
  image?: {
    image_type?: 'file' | 'url';
    image?: AcfAttachmentObject | number | null;
    image_url?: string | null;
  } | null;
  image_size?: string;
  image_variant?: string;
  aspect_ratio?: string;
  custom_aspect_width?: number | string;
  custom_aspect_height?: number | string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  alt_text?: string | null;
  caption?: string | null;
  overlay_text?: string | null;
  link?: { url?: string; title?: string; target?: string } | null;
  object_fit?: string | null;
}

interface ImageBlockProps {
  block: EditorBlock;
}

/** Parse preset/custom aspect ratio into width + height units. */
function resolveAspectRatio(data: ImageBlockData): { width: number; height: number } | null {
  if (!data.aspect_ratio || data.aspect_ratio === 'none') return null;
  if (data.aspect_ratio === 'custom') {
    return {
      width: Number(data.custom_aspect_width) || 16,
      height: Number(data.custom_aspect_height) || 9,
    };
  }
  const parts = data.aspect_ratio.split('-');
  if (parts.length === 2) {
    return { width: Number(parts[0]) || 16, height: Number(parts[1]) || 9 };
  }
  return null;
}

/**
 * Image block — mirrors `src/templates/blocks/image/image.twig`.
 *
 * Mirrors the Twig block's relationship with the image pattern: just as the
 * Twig block includes `@atoms/image/_image.tpl.twig`, this component renders
 * the Image atom. File-sourced images resolve the attachment ID via
 * GET_MEDIA_ITEM_BY_ID (same data WP resolves before the Twig render).
 *
 * Registered in BLOCK_MAP as 'acf/image'.
 */
export async function ImageBlock({ block }: ImageBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: ImageBlockData; className?: string; align?: string };
  const data: ImageBlockData = attrs?.data ?? {};

  // Handle both flat format (image_image_type) and nested clone format (image.image_type)
  const imageType = data.image_image_type ?? data.image?.image_type ?? 'file';
  const variant = (data.image_variant as ImageVariant | undefined) ?? 'picture';
  const loading = data.loading ?? 'lazy';
  const sizesAttr = data.sizes ?? '(max-width: 768px) 100vw, 50vw';
  const aspectRatio = variant === 'aspect-ratio' ? resolveAspectRatio(data) : null;

  let src: string | null = null;
  let alt: string = data.alt_text ?? '';
  let width: number | undefined;
  let height: number | undefined;

  const urlSource = data.image_image_url ?? data.image?.image_url ?? null;

  if (imageType === 'url' && urlSource) {
    src = urlSource;
  } else if (imageType === 'file') {
    const nestedImage = data.image?.image;

    if (nestedImage && typeof nestedImage === 'object' && 'url' in nestedImage) {
      // Nested format: get_fields() returned the full WP attachment array
      const attachment = nestedImage as AcfAttachmentObject;
      src = attachment.url ?? null;
      if (!data.alt_text) alt = attachment.alt ?? '';
      width = attachment.width;
      height = attachment.height;
    } else {
      // Flat format: attachment ID (original format) or nested numeric ID
      const imageId = data.image_image ?? (typeof nestedImage === 'number' ? nestedImage : null);
      if (imageId) {
        const { data: mediaData } = await fetchGraphQL<{
          mediaItem: {
            sourceUrl: string;
            altText?: string;
            mediaDetails?: { width?: number; height?: number };
          } | null;
        }>(print(GET_MEDIA_ITEM_BY_ID), { id: String(imageId) });

        const media = mediaData?.mediaItem;
        if (media) {
          src = media.sourceUrl;
          alt = data.alt_text || media.altText || '';
          width = media.mediaDetails?.width;
          height = media.mediaDetails?.height;
        }
      }
    }
  }

  if (!src) {
    return null;
  }

  // For aspect-ratio variant, width/height are the ratio units, not pixel dimensions
  const imageWidth = aspectRatio ? aspectRatio.width : width;
  const imageHeight = aspectRatio ? aspectRatio.height : height;

  // ACF inline style fields — mirrors the Twig template's style="" construction
  const { style: wrapperStyle, bgClass } = buildAcfBlockStyle(data);
  const alignClass = attrs.align ? `align-${attrs.align}` : undefined;
  const imgStyle: CSSProperties | undefined = data.object_fit
    ? { objectFit: data.object_fit as CSSProperties['objectFit'] }
    : undefined;

  const imageEl = (
    <Image
      variant={variant}
      src={src}
      alt={alt}
      width={imageWidth}
      height={imageHeight}
      sizes={sizesAttr}
      loading={loading}
      imgStyle={imgStyle}
    />
  );

  // Optional link wrapper — mirrors {% if link and link.url %}
  const linkedImage = data.link?.url ? (
    <a
      href={data.link.url}
      target={data.link.target ?? undefined}
      title={data.link.title ?? undefined}
      rel={data.link.target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      {imageEl}
    </a>
  ) : imageEl;

  // Optional overlay text — mirrors {% if overlay_text %}
  const withOverlay = data.overlay_text ? (
    <div className={cx(styles, 'image-overlay-wrapper', 'position-relative')}>
      {linkedImage}
      <div className={cx(styles, 'image-overlay', 'image-overlay--text', 'position-absolute', 'top-0', 'start-0', 'w-100', 'h-100', 'd-flex', 'align-items-center', 'justify-content-center')}>
        <div
          className={cx(styles, 'overlay-text-content', 'p-3', 'text-center')}
          dangerouslySetInnerHTML={{ __html: data.overlay_text }}
        />
      </div>
    </div>
  ) : linkedImage;

  const blockClasses = cx(styles, 'image-block', alignClass, bgClass, attrs.className);

  return (
    <div className={blockClasses} style={wrapperStyle}>
      {withOverlay}
      {data.caption && (
        <figcaption className={cx(styles, 'image-caption')}>{data.caption}</figcaption>
      )}
    </div>
  );
}

import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_MEDIA_ITEM_BY_ID } from '@/lib/wp/queries';
import { Image, type ImageVariant } from '@/stories/atoms/image/Image';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';

/**
 * ACF field values for the image block, as they appear in attributesJSON.data.
 *
 * ACF stores the image field (return_format: 'array') as an attachment ID in
 * block post meta. The ID is resolved here via GET_MEDIA_ITEM_BY_ID so the
 * Image atom gets a proper sourceUrl, dimensions, and alt text — mirroring
 * how the Twig block resolves the image server-side before passing it to
 * the image pattern.
 */
interface ImageBlockData {
  image_type?: 'file' | 'url';
  image?: number | string | null;
  image_url?: string | null;
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
  const attrs = parseBlockAttributes(block) as { data?: ImageBlockData; className?: string };
  const data: ImageBlockData = attrs?.data ?? {};

  const imageType = data.image_type ?? 'file';
  const variant = (data.image_variant as ImageVariant | undefined) ?? 'picture';
  const loading = data.loading ?? 'lazy';
  const sizesAttr = data.sizes ?? '(max-width: 768px) 100vw, 50vw';
  const aspectRatio = variant === 'aspect-ratio' ? resolveAspectRatio(data) : null;

  // Resolve image source — file type fetches the full media object by attachment ID
  let src: string | null = null;
  let alt: string = data.alt_text ?? '';
  let width: number | undefined;
  let height: number | undefined;

  if (imageType === 'url' && data.image_url) {
    src = data.image_url;
  } else if (imageType === 'file' && data.image) {
    const { data: mediaData } = await fetchGraphQL<{
      mediaItem: {
        sourceUrl: string;
        altText?: string;
        mediaDetails?: { width?: number; height?: number };
      } | null;
    }>(print(GET_MEDIA_ITEM_BY_ID), { id: String(data.image) });

    const media = mediaData?.mediaItem;
    if (media) {
      src = media.sourceUrl;
      alt = data.alt_text || media.altText || '';
      width = media.mediaDetails?.width;
      height = media.mediaDetails?.height;
    }
  }

  if (!src) {
    return null;
  }

  // For aspect-ratio variant, width/height are the ratio units, not pixel dimensions
  const imageWidth = aspectRatio ? aspectRatio.width : width;
  const imageHeight = aspectRatio ? aspectRatio.height : height;

  const imageEl = (
    <Image
      variant={variant}
      src={src}
      alt={alt}
      width={imageWidth}
      height={imageHeight}
      sizes={sizesAttr}
      loading={loading}
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
    <div className="image-overlay-wrapper position-relative">
      {linkedImage}
      <div className="image-overlay image-overlay--text position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
        <div
          className="overlay-text-content p-3 text-center"
          dangerouslySetInnerHTML={{ __html: data.overlay_text }}
        />
      </div>
    </div>
  ) : linkedImage;

  const blockClasses = ['image-block', attrs.className].filter(Boolean).join(' ');

  return (
    <div className={blockClasses}>
      {withOverlay}
      {data.caption && (
        <figcaption className="image-caption">{data.caption}</figcaption>
      )}
    </div>
  );
}

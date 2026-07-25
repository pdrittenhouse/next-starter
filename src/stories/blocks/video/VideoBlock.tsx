import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_MEDIA_ITEM_BY_ID } from '@/lib/wp/queries';
import { Video, type VideoFormat, type VideoPreload, type VideoQuality } from '@/stories/atoms/video/Video';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';

/**
 * ACF field values for the video block, as they appear in attributesJSON.data.
 *
 * Mirrors `src/templates/blocks/video/video.twig` field access patterns.
 *
 * Notable nested shapes:
 *   video_id.id_type / video_id.id_gen / video_id.id  — element ID strategy
 *   video_width.width.width.value + .unit              — CSS width string
 *   video_width.width.min_width / .max_width           — block-level constraints
 *   poster.image_type / poster.image / poster.image_url — poster source
 *   color.color_type / color.hex_color                 — player accent color
 *   margin.margin.{top,bottom,left,right}              — block-level margins
 */
interface VideoBlockData {
  video_id?: {
    id_type?: 'generated' | 'custom' | string;
    id_gen?: string | number;
    id?: string;
    show_ids?: boolean;
  };
  title?: string;
  format?: VideoFormat;
  source?: string;
  ogg_source?: string;
  webm_source?: string;
  /** ACF field key uses _src suffix, not _source. */
  flv_src?: string;
  /** ACF field key uses _src suffix, not _source. */
  threegp_src?: string;
  start?: number;
  end?: number;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsinline?: boolean;
  fullscreen?: boolean;
  controls?: boolean;
  aspect_ratio?: string;
  preload?: VideoPreload;
  /** Maps to `closedCaptions` on the Video atom. */
  captions?: boolean;
  /** Maps to `ccSrc` on the Video atom. */
  cc_source?: string;
  cc_label?: string;
  cc_lang?: string;
  cc_default?: boolean;
  video_width?: {
    width?: {
      width?: { value?: string | number; unit?: string };
      min_width?: string | number;
      max_width?: string | number;
    };
  };
  poster?: {
    image_type?: 'file' | 'url';
    /** Full ACF image object (with .url) or a bare attachment ID. */
    image?: { url?: string; id?: number | string } | number | string | null;
    image_url?: string;
  };
  color?: {
    color_type?: 'red' | 'white' | 'custom' | string;
    hex_color?: string;
  };
  info?: boolean;
  related?: boolean;
  suggested?: boolean;
  disable_keyboard?: boolean;
  /** Maps to `modestbranding` on the Video atom. */
  modest_branding?: boolean;
  /** Maps to `ivLoadPolicy` (YouTube iv_load_policy) on the Video atom. */
  annotations?: boolean;
  playlist?: string;
  list?: string;
  list_type?: 'playlist' | 'user_uploads';
  origin?: string;
  background?: boolean;
  quality?: VideoQuality;
  byline?: boolean;
  dnt?: boolean;
  portrait?: boolean;
  speed?: boolean;
  /** Maps to `showTitle` on the Video atom. */
  video_title?: boolean;
  transparent?: boolean;
  margin?: {
    margin?: {
      top?: { top?: number; auto?: boolean };
      bottom?: { bottom?: number; auto?: boolean };
      left?: { left?: number; auto?: boolean };
      right?: { right?: number; auto?: boolean };
    };
  };
}

interface VideoBlockProps {
  block: EditorBlock;
}

/**
 * Video block — mirrors `src/templates/blocks/video/video.twig`.
 *
 * Renders the Video atom with all parameters sourced from ACF attributesJSON.
 * The poster image resolves either from a direct ACF image object URL or, when
 * only an attachment ID is stored, via GET_MEDIA_ITEM_BY_ID (same lookup WP
 * performs before the Twig render).
 *
 * Block-level min-width, max-width, and margin constraints (from the
 * video_width and margin clone fields) are applied on an outer wrapper div
 * since the Video atom's wrapperStyle only handles the CSS width prop.
 *
 * Registered in BLOCK_MAP as 'acf/video'.
 */
export async function VideoBlock({ block }: VideoBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: VideoBlockData; className?: string };
  const data: VideoBlockData = attrs?.data ?? {};

  // ── Element ID ──────────────────────────────────────────────────────────────
  let videoId: string | undefined;
  const vidIdField = data.video_id;
  if (vidIdField?.id_type === 'generated' && vidIdField.id_gen != null) {
    videoId = `video${vidIdField.id_gen}`;
  } else if (vidIdField?.id_type === 'custom' && vidIdField.id) {
    videoId = vidIdField.id;
  }

  // ── CSS width ────────────────────────────────────────────────────────────────
  let widthValue: string | undefined;
  const vwWidth = data.video_width?.width?.width;
  if (vwWidth?.value != null && vwWidth?.unit) {
    widthValue = `${vwWidth.value}${vwWidth.unit}`;
  }

  // ── Player accent color ──────────────────────────────────────────────────────
  let color: string | undefined;
  if (data.color?.color_type === 'red' || data.color?.color_type === 'white') {
    color = data.color.color_type;
  } else if (data.color?.color_type === 'custom' && data.color.hex_color) {
    color = data.color.hex_color;
  }

  // ── Poster image ─────────────────────────────────────────────────────────────
  let poster: string | undefined;
  if (data.poster?.image_type === 'file') {
    const img = data.poster.image;
    if (img && typeof img === 'object' && 'url' in img && img.url) {
      // ACF returned the full image object; URL is already present.
      poster = img.url;
    } else if (img && (typeof img === 'number' || typeof img === 'string')) {
      // ACF returned only an attachment ID — resolve via WPGraphQL.
      const { data: mediaData } = await fetchGraphQL<{
        mediaItem: { sourceUrl: string } | null;
      }>(print(GET_MEDIA_ITEM_BY_ID), { id: String(img) });
      poster = mediaData?.mediaItem?.sourceUrl ?? undefined;
    }
  } else if (data.poster?.image_type === 'url' && data.poster.image_url) {
    poster = data.poster.image_url;
  }

  // ── Block-level wrapper styles (min-width, max-width, margins) ───────────────
  const wrapperStyle: React.CSSProperties = {};
  const vw = data.video_width?.width;
  if (vw?.min_width != null) wrapperStyle.minWidth = `${vw.min_width}px`;
  if (vw?.max_width != null) wrapperStyle.maxWidth = `${vw.max_width}px`;

  const m = data.margin?.margin;
  if (m) {
    if (m.top?.auto) {
      wrapperStyle.marginTop = 'auto';
    } else if (m.top?.top != null && m.top.top >= 0) {
      wrapperStyle.marginTop = `${m.top.top}px`;
    }
    if (m.bottom?.auto) {
      wrapperStyle.marginBottom = 'auto';
    } else if (m.bottom?.bottom != null && m.bottom.bottom >= 0) {
      wrapperStyle.marginBottom = `${m.bottom.bottom}px`;
    }
    if (m.left?.auto) {
      wrapperStyle.marginLeft = 'auto';
    } else if (m.left?.left != null && m.left.left >= 0) {
      wrapperStyle.marginLeft = `${m.left.left}px`;
    }
    if (m.right?.auto) {
      wrapperStyle.marginRight = 'auto';
    } else if (m.right?.right != null && m.right.right >= 0) {
      wrapperStyle.marginRight = `${m.right.right}px`;
    }
  }

  const hasWrapperStyle = Object.keys(wrapperStyle).length > 0;
  const blockClassName = ['video-block', attrs.className].filter(Boolean).join(' ');

  const videoEl = (
    <Video
      id={videoId}
      title={data.title}
      format={data.format}
      source={data.source}
      oggSource={data.ogg_source}
      webmSource={data.webm_source}
      flvSource={data.flv_src}
      threegpSource={data.threegp_src}
      start={data.start}
      end={data.end}
      autoplay={data.autoplay}
      loop={data.loop}
      muted={data.muted}
      playsinline={data.playsinline}
      fullscreen={data.fullscreen}
      controls={data.controls}
      aspectRatio={data.aspect_ratio}
      width={widthValue}
      poster={poster}
      color={color}
      info={data.info}
      related={data.related}
      suggested={data.suggested}
      closedCaptions={data.captions}
      ccSrc={data.cc_source}
      ccLabel={data.cc_label}
      ccLang={data.cc_lang}
      ccDefault={data.cc_default}
      preload={data.preload}
      disableKeyboard={data.disable_keyboard}
      modestbranding={data.modest_branding}
      ivLoadPolicy={data.annotations}
      playlist={data.playlist}
      list={data.list}
      listType={data.list_type}
      origin={data.origin}
      background={data.background}
      quality={data.quality}
      byline={data.byline}
      dnt={data.dnt}
      portrait={data.portrait}
      speed={data.speed}
      showTitle={data.video_title}
      transparent={data.transparent}
      className={blockClassName}
    />
  );

  if (hasWrapperStyle) {
    return <div style={wrapperStyle}>{videoEl}</div>;
  }

  return videoEl;
}

import React from 'react';
import styles from './video.module.scss';

export type VideoFormat = 'youtube' | 'vimeo' | 'iframe';
export type VideoPreload = 'none' | 'auto' | 'meta';
export type VideoQuality = 'auto' | '240p' | '360p' | '540p' | '720p' | '1080p' | '2k' | '4k';

export interface VideoProps {
  /** Wrapper element id attribute. */
  id?: string;
  /** Heading rendered above the video (.video-title). */
  title?: string;
  /** Embed format — omit for a native HTML5 video element. */
  format?: VideoFormat;
  /**
   * Video URL.
   * youtube: any watch/embed/youtu.be URL — the component extracts the ID.
   * vimeo: player.vimeo.com embed URL (https://player.vimeo.com/video/{id}).
   * iframe: raw URL passed to the iframe src.
   * HTML5: mp4 URL; ogg/webm/flv/3gp fallbacks via additional source props.
   */
  source?: string;
  /** OGG source URL (HTML5 fallback). */
  oggSource?: string;
  /** WebM source URL (HTML5 fallback). */
  webmSource?: string;
  /** FLV source URL (legacy HTML5 fallback object/embed). */
  flvSource?: string;
  /** 3GP source URL (mobile HTML5 fallback). */
  threegpSource?: string;
  /** Autoplay. Adds has-autoplay class and sets the autoplay embed param. */
  autoplay?: boolean;
  /** Loop playback. */
  loop?: boolean;
  /** Mute audio. */
  muted?: boolean;
  /** Play inline without going fullscreen on mobile. */
  playsinline?: boolean;
  /** Allow fullscreen (embed). Adds allowFullScreen to the iframe. */
  fullscreen?: boolean;
  /** Show player controls. Adds has-controls class. */
  controls?: boolean;
  /** Show video info bar (YouTube showinfo param). */
  info?: boolean;
  /**
   * Aspect ratio class modifier.
   * 'wide' → applies class 'wide' (16:9 SCSS mixin).
   * Any other string → applies class 'aspect-ratio--{value}'.
   */
  aspectRatio?: string;
  /** CSS width value for the wrapper element (e.g. '100%', '640px'). */
  width?: string;
  /** Poster image URL (HTML5 video only). */
  poster?: string;
  /**
   * Show suggested / related videos after playback (YouTube rel param).
   * Defaults to false — the 'hide-suggested' class is applied when false/undefined.
   */
  suggested?: boolean;
  /**
   * Show related videos restricted to the same channel (YouTube rel=1).
   * When false YouTube hides all related videos entirely.
   */
  related?: boolean;
  /**
   * Player control color.
   * YouTube: 'red' or 'white'.
   * Vimeo: hex value without '#' (e.g. '00adef').
   */
  color?: string;
  /** Enable closed captions. */
  closedCaptions?: boolean;
  /** Captions track URL — used in the HTML5 video track element. */
  ccSrc?: string;
  /** Captions track label. Defaults to 'English'. */
  ccLabel?: string;
  /** BCP 47 language code for the caption track (e.g. 'en-us'). */
  ccLang?: string;
  /** Mark the caption track as default. */
  ccDefault?: boolean;
  /** Background video mode (Vimeo). */
  background?: boolean;
  /** Disable keyboard shortcuts in the player. */
  disableKeyboard?: boolean;
  /** Preload hint for the HTML5 video element. */
  preload?: VideoPreload;
  /** Reduce YouTube branding in the player chrome. */
  modestbranding?: boolean;
  /** Comma-separated video IDs to play after the main video (YouTube). */
  playlist?: string;
  /** YouTube playlist ID. */
  list?: string;
  /** YouTube playlist type. */
  listType?: 'playlist' | 'user_uploads';
  /** Site origin domain forwarded to YouTube for JS API postMessage. */
  origin?: string;
  /** Vimeo video quality. */
  quality?: VideoQuality;
  /** Show the author byline in the Vimeo player. */
  byline?: boolean;
  /** Opt out of Vimeo analytics tracking (Do Not Track). */
  dnt?: boolean;
  /** Show the author portrait in the Vimeo player. */
  portrait?: boolean;
  /** Expose the speed controls in the Vimeo preferences menu. */
  speed?: boolean;
  /** Show the video title in the Vimeo player chrome. */
  showTitle?: boolean;
  /** Enable player transparency (Vimeo). */
  transparent?: boolean;
  /** Start time offset in seconds. */
  start?: number;
  /** End time in seconds (YouTube only; HTML5 uses the media fragment #t= syntax). */
  end?: number;
  /** Show video annotations (YouTube iv_load_policy=1). */
  ivLoadPolicy?: boolean;
  /** Additional CSS class names — appended to the wrapper div. */
  className?: string;
  /** Slotted content rendered after the .video-responsive wrapper. */
  children?: React.ReactNode;
}

function extractYouTubeId(url: string): string {
  const last = url.split('/').at(-1) ?? '';
  return last.replace('watch?v=', '').split('&')[0].split('?')[0];
}

function buildEmbedSrc(
  format: VideoFormat,
  source: string,
  props: VideoProps,
): { src: string; ytId: string } {
  let baseUrl = source;
  let ytId = '';

  if (format === 'youtube') {
    ytId = extractYouTubeId(source);
    if (ytId) baseUrl = `https://www.youtube.com/embed/${ytId}`;
  }

  const {
    autoplay, loop, controls, muted, playsinline, fullscreen, info, related,
    color, closedCaptions, ccLang, disableKeyboard, modestbranding, ivLoadPolicy,
    playlist, list, listType, origin, background, quality, byline, dnt, portrait,
    speed, showTitle, transparent, start, end,
  } = props;

  const p: string[] = [];
  let hash = '';

  if (format === 'youtube') p.push(`rel=${related ? '1' : '0'}`);

  if (autoplay) p.push('autoplay=1');

  p.push(`controls=${controls ? '1' : '0'}`);

  if (format === 'youtube') p.push(`showinfo=${info ? '1' : '0'}`);

  p.push(`loop=${loop ? '1' : '0'}`);

  // YouTube uses `mute`; Vimeo uses `muted`; both are sent so each platform picks its param.
  p.push(`mute=${muted ? '1' : '0'}`);
  p.push(`muted=${muted ? '1' : '0'}`);

  if (format === 'youtube') p.push(`fs=${fullscreen ? '1' : '0'}`);

  if (closedCaptions) {
    if (format === 'youtube') {
      p.push('cc_load_policy=1');
      if (ccLang) {
        p.push(`cc_lang_pref=${ccLang}`);
        p.push(`hl=${ccLang}`);
      }
    } else if (format === 'vimeo') {
      p.push(ccLang ? `texttrack=${ccLang}` : 'texttrack=en-x-autogen');
    }
  }

  if (format === 'youtube') {
    p.push(`modestbranding=${modestbranding ? '1' : '0'}`);
    p.push(`iv_load_policy=${ivLoadPolicy ? '1' : '0'}`);
    if (playlist) p.push(`playlist=${playlist}`);
    if (list) p.push(`list=${list}`);
    if (listType === 'playlist' || listType === 'user_uploads') p.push(`listType=${listType}`);
    if (origin) p.push(`origin=${origin}`);
  }

  if (format === 'vimeo') {
    p.push(`background=${background ? '1' : '0'}`);
    p.push('autopause=1');
  }

  if (
    (format === 'youtube' && (color === 'red' || color === 'white')) ||
    (format === 'vimeo' && color)
  ) {
    p.push(`color=${color}`);
  }

  if (format === 'vimeo') {
    const validQ: VideoQuality[] = ['240p', '360p', '540p', '720p', '1080p', '2k', '4k'];
    p.push(`quality=${quality && validQ.includes(quality) ? quality : 'auto'}`);
    p.push(`byline=${byline ? '1' : '0'}`);
    p.push(`dnt=${dnt ? '1' : '0'}`);
    p.push(`portrait=${portrait ? '1' : '0'}`);
    p.push(`speed=${speed ? '1' : '0'}`);
    p.push(`title=${showTitle ? '1' : '0'}`);
    p.push(`transparent=${transparent ? '1' : '0'}`);
  }

  p.push(`playsinline=${playsinline ? '1' : '0'}`);

  if (format === 'youtube') {
    p.push(`disablekb=${disableKeyboard ? '1' : '0'}`);
  } else if (format === 'vimeo') {
    // Vimeo inverts the param name: keyboard=0 means disabled.
    p.push(`keyboard=${disableKeyboard ? '0' : '1'}`);
  }

  if (start != null) {
    if (format === 'youtube') p.push(`start=${start}`);
    hash = `#t=${start}s`;
  }

  if (end != null && format === 'youtube') {
    p.push(`end=${end}`);
  }

  const query = `?enablejsapi=1&version=3${p.length ? '&' + p.join('&') : ''}`;
  return { src: `${baseUrl}${query}${hash}`, ytId };
}

function buildSrcdoc(embedSrc: string, ytId: string, title?: string): string {
  const thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  const safeTitle = (title ?? '').replace(/'/g, '&#39;');
  return (
    `<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}` +
    `img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}` +
    `span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}` +
    `</style>` +
    `<a href='${embedSrc}'><img src='${thumb}' alt='${safeTitle}'><span>&#9654;</span></a>`
  );
}

export function Video({
  id,
  title,
  format,
  source,
  oggSource,
  webmSource,
  flvSource,
  threegpSource,
  autoplay,
  loop,
  muted,
  playsinline,
  fullscreen,
  controls,
  aspectRatio,
  width,
  poster,
  suggested,
  closedCaptions,
  ccSrc,
  ccLabel = 'English',
  ccLang = 'en-us',
  ccDefault,
  preload,
  start,
  end,
  className,
  children,
  ...embedProps
}: VideoProps) {
  const wrapperClasses = [
    'video',
    format ? `video-format--${format}` : null,
    aspectRatio === 'wide'
      ? 'wide'
      : aspectRatio
      ? `aspect-ratio--${aspectRatio}`
      : null,
    controls ? 'has-controls' : null,
    format === 'youtube' && !suggested ? 'hide-suggested' : null,
    autoplay ? 'has-autoplay' : null,
    className ?? null,
  ].filter(Boolean).join(' ');

  const wrapperStyle: React.CSSProperties = width ? { width } : {};

  const isEmbed = format === 'youtube' || format === 'vimeo' || format === 'iframe';

  let embedSrc = '';
  let ytId = '';

  if (isEmbed && source) {
    const built = buildEmbedSrc(format!, source, {
      autoplay, loop, controls, muted, playsinline, fullscreen, suggested,
      closedCaptions, ccLang, start, end, ...embedProps,
    });
    embedSrc = built.src;
    ytId = built.ytId;
  }

  const allowParts = [
    'accelerometer',
    autoplay ? 'autoplay' : null,
    'encrypted-media',
    'gyroscope',
    'picture-in-picture',
    fullscreen ? 'fullscreen' : null,
  ].filter(Boolean).join('; ');

  const dataYtId = format === 'youtube' && ytId ? ytId : undefined;

  // HTML5 media fragment for start/end timestamps
  const timeFragment =
    start != null || end != null
      ? `#t=${start ?? ''},${end ?? ''}`
      : '';

  return (
    <div
      data-pattern="timberland/video"
      id={id}
      className={wrapperClasses}
      style={wrapperStyle || undefined}
      data-yt-id={dataYtId}
    >
      {title && <h2 className="video-title">{title}</h2>}

      <div className="video-responsive">
        {isEmbed && embedSrc ? (
          <iframe
            width="100%"
            height="100%"
            src={embedSrc}
            srcDoc={
              format === 'youtube' && !autoplay && ytId
                ? buildSrcdoc(embedSrc, ytId, title)
                : undefined
            }
            frameBorder="0"
            allow={allowParts}
            allowFullScreen={fullscreen}
            title={title ?? 'Video player'}
          />
        ) : (
          <video
            width="100%"
            height="100%"
            controls={controls}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            playsInline={playsinline}
            poster={poster}
            preload={preload}
          >
            {source && (
              <source src={`${source}${timeFragment}`} type="video/mp4" />
            )}
            {oggSource && (
              <source src={`${oggSource}${timeFragment}`} type="video/ogg" />
            )}
            {webmSource && (
              <source src={`${webmSource}${timeFragment}`} type="video/webm" />
            )}
            {threegpSource && (
              <source src={`${threegpSource}${timeFragment}`} type="video/3gp" />
            )}
            {source && (
              <object data={`${source}${timeFragment}`} width="100%" height="100%">
                {flvSource && (
                  <embed
                    src={`${flvSource}${timeFragment}`}
                    width="100%"
                    height="100%"
                  />
                )}
              </object>
            )}
            {closedCaptions && ccSrc && (
              <track
                src={ccSrc}
                label={ccLabel}
                kind="captions"
                srcLang={ccLang}
                default={ccDefault}
              />
            )}
          </video>
        )}
      </div>

      {children}
    </div>
  );
}

'use client';

import React, { useRef, useEffect } from 'react';
import { Video } from '@/stories/patterns/atoms/video/Video';
import { Button } from '@/stories/patterns/atoms/button/Button';
import type { VideoProps } from '@/stories/patterns/atoms/video/Video';
import type { ButtonProps } from '@/stories/patterns/atoms/button/Button';
import styles from './video-promo.module.scss';
import { cx } from '@/lib/cx';

// ── Inline SVG helpers ────────────────────────────────────────────────────────

/** Play icon — mirrors the @atoms/svg/_svg~icon.tpl.twig name="play" include. */
const PlayIcon = () => (
  <svg
    width="30px"
    height="30px"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    fill="#fff"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

/** Arrow-right icon — mirrors the @atoms/svg/_svg~icon.tpl.twig name="arrow-right" include. */
const ArrowRightIcon = () => (
  <svg
    width="30px"
    height="30px"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    fill="#fff"
  >
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  </svg>
);

// ── Props ─────────────────────────────────────────────────────────────────────

/**
 * Props for the VideoPromo molecule — mirrors the Twig pattern at
 * patterns/02-molecules/video-promo/_video-promo.tpl.twig.
 *
 * All prop names are camelCase equivalents of the Twig template variables.
 */
export interface VideoPromoProps {
  /**
   * Extra CSS class names appended to the root element.
   * Twig: `video_promo_other_classes`.
   */
  className?: string;
  /**
   * Bootstrap background-color utility applied to the header and body wrappers
   * (e.g. `'primary'` → `bg-primary`, `'dark'` → `bg-dark`).
   * Twig: `video_promo_bg_color`.
   */
  bgColor?: string;
  /**
   * Section heading rendered as `<h2 class="video-promo--title">`.
   * Twig: `video_promo_title`.
   */
  title?: string;
  /**
   * Bootstrap text-color utility for the title (e.g. `'white'` → `text-white`).
   * Twig: `video_promo_title_color`.
   */
  titleColor?: string;
  /**
   * Section sub-heading rendered as `<h3 class="video-promo--subtitle">`.
   * Twig: `video_promo_subtitle`.
   */
  subtitle?: string;
  /**
   * Bootstrap text-color utility for the subtitle.
   * Twig: `video_promo_subtitle_color`.
   */
  subtitleColor?: string;
  /**
   * Intro/body copy rendered as raw HTML inside `<div class="video-promo--intro">`.
   * Twig: `video_promo_intro`.
   */
  intro?: string;
  /**
   * Bootstrap text-color utility for the intro block.
   * Twig: `video_promo_intro_color`.
   */
  introColor?: string;
  /**
   * Video atom props. Pass at minimum `source`.
   *
   * When `format` is omitted or `undefined` (HTML5 native video), a circular
   * play-button overlay is rendered over the video poster frame — mirroring
   * the Twig `{% if video_promo_video_format == false %}` branch.
   * Pass `format: 'youtube' | 'vimeo' | 'iframe'` to render an embedded
   * player without the overlay.
   *
   * `aspectRatio` defaults to `'wide'` (16:9); override via `video.aspectRatio`.
   * `width` defaults to `''` (100% of parent); override via `video.width`.
   *
   * Twig: `video_promo_video`, `video_promo_video_format`, `video_promo_poster`,
   *       `video_promo_autoplay`, `video_promo_loop`, `video_promo_fullscreen`,
   *       `video_promo_controls`, `video_promo_info`, `video_promo_muted`,
   *       `video_promo_playsinline`.
   */
  video?: VideoProps;
  /**
   * Array of CTA Button atoms rendered in the promo strip below the video.
   * Each button automatically receives an arrow-right SVG icon appended as
   * `children`, matching the Twig `{% block right %}` embed block.
   * Twig: `video_promo_ctas`.
   */
  ctas?: ButtonProps[];
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * VideoPromo molecule — promotional section combining an optional text header,
 * a video (HTML5 or embedded), and an array of CTA buttons.
 *
 * Produces identical HTML/class structure to the Pattern Lab Twig template.
 * Bootstrap JS is loaded globally — only `data-bs-*` attributes are needed here.
 */
export const VideoPromo = ({
  className,
  bgColor,
  title,
  titleColor,
  subtitle,
  subtitleColor,
  intro,
  introColor,
  video,
  ctas,
}: VideoPromoProps) => {
  const promoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const promo = promoRef.current;
    if (!promo) return;
    const btn     = promo.querySelector<HTMLElement>('.video-promo--play');
    const share   = promo.querySelector<HTMLElement>('.share-button');
    const vid     = promo.querySelector<HTMLVideoElement>('video');
    const youtube = promo.querySelector<HTMLIFrameElement>('.image-format--youtube iframe');
    const vimeo   = promo.querySelector<HTMLIFrameElement>('.image-format--vimeo iframe');

    btn?.addEventListener('click', () => {
      vid?.play();
      youtube?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      vimeo?.contentWindow?.postMessage('{"method":"play"}', '*');
    });

    if (vid) {
      vid.addEventListener('play',  () => { btn?.classList.add('hide');    share?.classList.add('video-playing'); });
      vid.addEventListener('pause', () => { btn?.classList.remove('hide'); share?.classList.remove('video-playing'); });
      vid.addEventListener('ended', () => { btn?.classList.remove('hide'); share?.classList.remove('video-playing'); });

      let played = false;
      vid.removeAttribute('controls');
      vid.addEventListener('play',  () => { played = true; });
      vid.addEventListener('ended', () => { played = false; vid.removeAttribute('controls'); });
      vid.addEventListener('mouseenter', () => { if (played && !vid.hasAttribute('controls')) vid.setAttribute('controls', ''); });
      vid.addEventListener('mouseleave', () => { if (played) vid.removeAttribute('controls'); });

      const poster = vid.getAttribute('poster') ?? '';
      vid.addEventListener('ended', () => {
        if (!vid.hasAttribute('loop')) vid.removeAttribute('autoplay');
        vid.load();
        if (poster) vid.setAttribute('poster', poster);
      });
      vid.addEventListener('play',  () => vid.removeAttribute('poster'));
      vid.addEventListener('pause', () => { if (poster) vid.setAttribute('poster', poster); });
    }
  }, []);

  // ── Root classes (mirrors Twig video_promo_classes merge + sort + trim) ──────
  const rootClasses = cx(styles, 'video-promo', className);

  // ── Background color class helper ──────────────────────────────────────────
  const bgClass = bgColor ? `bg-${bgColor}` : '';

  // ── Header visibility guard ────────────────────────────────────────────────
  const hasHeader = !!(title || subtitle || intro);

  // ── Body visibility guard ─────────────────────────────────────────────────
  const hasBody = !!(video?.source || (ctas && ctas.length > 0));

  // ── Play-button overlay shown for HTML5 (non-embed) video ─────────────────
  // Mirrors: {% if video_promo_video_format == false %} (i.e. no embed format)
  const showPlayButton = !!(video?.source && !video.format);

  // ── Merge Twig hard-coded defaults into video props ───────────────────────
  const resolvedVideoProps: VideoProps = {
    aspectRatio: 'wide',
    width: '',
    ...video,
  };

  return (
    <div
      ref={promoRef}
      className={rootClasses}
      data-pattern="timberland/video-promo"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      {hasHeader && (
        <div className={cx(styles, 'video-promo--header', bgClass)}>
          <div className={cx(styles, 'video-promo--container')}>
            <div className={cx(styles, 'video-promo--row')}>
              <div className={cx(styles, 'video-promo--content')}>
                {title && (
                  <h2
                    className={cx(
                      styles,
                      'video-promo--title',
                      titleColor ? `text-${titleColor}` : null,
                    )}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <h3
                    className={cx(
                      styles,
                      'video-promo--subtitle',
                      subtitleColor ? `text-${subtitleColor}` : null,
                    )}
                  >
                    {subtitle}
                  </h3>
                )}
                {intro && (
                  // Twig renders {{ video_promo_intro }} unescaped.
                  // eslint-disable-next-line react/no-danger
                  <div
                    className={cx(
                      styles,
                      'video-promo--intro',
                      introColor ? `text-${introColor}` : null,
                    )}
                    dangerouslySetInnerHTML={{ __html: intro }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      {hasBody && (
        <div className={cx(styles, 'video-promo--body', bgClass)}>
          {/* ── Video ──────────────────────────────────────────────────────── */}
          {video?.source && (
            <div className={cx(styles, 'video-promo--content')}>
              <div className={cx(styles, 'video-promo--video')}>
                {/* Play-button overlay for HTML5 native video (no embed format) */}
                {showPlayButton && (
                  <Button
                    variant="link"
                    label=""
                    className={cx(styles, 'video-promo--play')}
                    aria-label="Play video"
                  >
                    <PlayIcon />
                  </Button>
                )}
                <Video {...resolvedVideoProps} />
              </div>
            </div>
          )}

          {/* ── CTAs ───────────────────────────────────────────────────────── */}
          {ctas && ctas.length > 0 && (
            <div className={cx(styles, 'video-promo--content')}>
              <div className={cx(styles, 'video-promo--promos')}>
                {ctas.map((cta, index) => (
                  <Button
                    key={cta.id ?? index}
                    {...cta}
                  >
                    {cta.children ?? (
                      <>
                        {cta.label && (
                          <span className={cx(styles, 'button--label')}>{cta.label}</span>
                        )}
                        <ArrowRightIcon />
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

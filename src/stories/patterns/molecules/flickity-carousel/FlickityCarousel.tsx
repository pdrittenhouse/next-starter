'use client';

import React, { useId, useRef, useEffect } from 'react';
import styles from './flickity-carousel.module.scss';
import { cx } from '@/lib/cx';

export interface FlickityCarouselProps {
  /** Slides to render — each item becomes a `.carousel-cell` div. */
  slides?: React.ReactNode[];
  /** Carousel element ID. Auto-generated if omitted. */
  id?: string;
  /** Number of columns for slide sizing (adds `flickity-cols-{n}` class). */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Show custom previous/next/dot controls below the carousel. */
  showControls?: boolean;
  /** Enable dragging and flicking. @default true */
  draggable?: boolean;
  /** Free-scroll without snapping to cells. */
  freeScroll?: boolean;
  /** Infinite wrap-around scrolling. */
  wrapAround?: boolean;
  /** Group cells into slides. */
  groupCells?: boolean;
  /** Auto-play interval in ms, or false to disable. */
  autoPlay?: boolean | number;
  /** Pause auto-play on hover. */
  pauseAutoPlayOnHover?: boolean;
  /** Enable fullscreen view. */
  fullscreen?: boolean;
  /** Fade between slides instead of sliding. */
  fade?: boolean;
  /** Adapt carousel height to selected slide. */
  adaptiveHeight?: boolean;
  /** Selector string for a nav carousel to sync with. */
  asNavFor?: string;
  /** CSS selector for cell elements. @default '.carousel-cell' */
  cellSelector?: string;
  /** Zero-based index of the initial selected cell. */
  initialIndex?: number;
  /** Set gallery height to tallest cell. @default true */
  setGallerySize?: boolean;
  /** Cell alignment within the carousel. @default 'left' */
  cellAlign?: 'left' | 'center' | 'right';
  /** Prevent excess scroll at start/end. */
  contain?: boolean;
  /** Right-to-left layout. */
  rightToLeft?: boolean;
  /** Show prev/next arrow buttons. */
  prevNextButtons?: boolean;
  /** Show page dot indicators. */
  pageDots?: boolean;
  /** Pixels before dragging begins. @default 3 */
  dragThreshold?: number;
  /** Attraction to selected cell position. @default 0.025 */
  selectedAttraction?: number;
  /** Friction applied to slider movement. @default 0.28 */
  friction?: number;
  /** Friction when freeScroll is enabled. @default 0.075 */
  freeScrollFriction?: number;
  /** Use percent values for positioning instead of pixels. */
  percentPosition?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

export function FlickityCarousel({
  slides = [],
  id,
  columns,
  showControls,
  draggable,
  freeScroll,
  wrapAround,
  groupCells,
  autoPlay,
  pauseAutoPlayOnHover,
  fullscreen,
  fade,
  adaptiveHeight,
  asNavFor,
  cellSelector = '.carousel-cell',
  initialIndex,
  setGallerySize,
  cellAlign = 'left',
  contain,
  rightToLeft,
  prevNextButtons,
  pageDots,
  dragThreshold = 3,
  selectedAttraction = 0.025,
  friction = 0.28,
  freeScrollFriction = 0.075,
  percentPosition,
  className,
}: FlickityCarouselProps) {
  const uid = useId().replace(/:/g, '');
  const carouselId = id ?? `flickityCarousel${uid}`;
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const carousel = wrapper.querySelector<HTMLElement>('.flickity-carousel');
    if (!carousel) return;

    const FOCUSABLE = 'a, button, input, select, textarea, [tabindex]';
    const syncFocus = (el: HTMLElement) => {
      el.querySelectorAll<HTMLElement>(`[aria-hidden="true"] ${FOCUSABLE}`).forEach(f => f.setAttribute('tabindex', '-1'));
      el.querySelectorAll<HTMLElement>(`:not([aria-hidden="true"]) > ${FOCUSABLE}`).forEach(f => f.removeAttribute('tabindex'));
    };

    let flkty: any;
    import('flickity').then(({ default: Flickity }) => {
      flkty = new Flickity(carousel, {
        draggable:            draggable ?? true,
        freeScroll:           freeScroll ?? false,
        wrapAround:           wrapAround ?? false,
        groupCells:           groupCells ?? false,
        autoPlay:             autoPlay ?? false,
        pauseAutoPlayOnHover: pauseAutoPlayOnHover ?? true,
        fullscreen:           fullscreen ?? false,
        fade:                 fade ?? false,
        adaptiveHeight:       adaptiveHeight ?? false,
        watchCSS:             true,
        asNavFor,
        hash:                 true,
        dragThreshold,
        selectedAttraction,
        friction,
        freeScrollFriction,
        imagesLoaded:         true,
        lazyLoad:             true,
        cellSelector,
        initialIndex:         initialIndex ?? 0,
        accessibility:        true,
        setGallerySize:       setGallerySize !== false,
        resize:               true,
        cellAlign,
        contain:              contain ?? false,
        percentPosition:      percentPosition ?? false,
        rightToLeft:          rightToLeft ?? false,
        prevNextButtons:      prevNextButtons ?? true,
        pageDots:             pageDots ?? true,
        arrowShape: 'M50.7,74.3l2.2-2.2c0.5-0.5,0.5-1.4,0-1.9L35.6,52.9h38.1c0.7,0,1.3-0.6,1.3-1.3v-3.1c0-0.7-0.6-1.3-1.3-1.3H35.6 l17.3-17.3c0.5-0.5,0.5-1.4,0-1.9l-2.2-2.2c-0.5-0.5-1.4-0.5-1.9,0L25.4,49.1c-0.5,0.5-0.5,1.4,0,1.9l23.4,23.4 C49.3,74.8,50.1,74.8,50.7,74.3z',
      });

      syncFocus(carousel);
      flkty.on('select', () => syncFocus(carousel));

      const cellsButtonGroup = wrapper.querySelector<HTMLElement>('.button--group-cells');
      const prevBtn = wrapper.querySelector<HTMLButtonElement>('.button--previous');
      const nextBtn = wrapper.querySelector<HTMLButtonElement>('.button--next');

      if (cellsButtonGroup) {
        const btns = [...cellsButtonGroup.children] as HTMLElement[];
        flkty.on('select', () => {
          cellsButtonGroup.querySelector('.is-selected')?.classList.remove('is-selected');
          btns[flkty.selectedIndex]?.classList.add('is-selected');
        });
        cellsButtonGroup.addEventListener('click', (e: MouseEvent) => {
          const idx = btns.indexOf(e.target as HTMLElement);
          if (idx >= 0) flkty.select(idx);
        });
        prevBtn?.addEventListener('click', () => flkty.previous());
        nextBtn?.addEventListener('click', () => flkty.next());
      }

      [...carousel.querySelectorAll<HTMLElement>('.carousel-cell')].forEach((cell, i) => {
        cell.addEventListener('click', () => flkty.select(i));
      });

      flkty.on('fullscreenChange', () => document.body.classList.toggle('is-fullscreen'));
      if (autoPlay) flkty.on('pointerUp', () => flkty.player.play());
    });

    return () => { flkty?.destroy(); };
  }, []);

  const wrapperClasses = cx(
    styles,
    'flickity-carousel--wrapper',
    columns ? `flickity-cols-${columns}` : null,
    className,
  );

  const carouselClasses = cx(
    styles,
    'flickity-carousel',
    prevNextButtons && 'has-arrows',
  );

  return (
    <div
      ref={wrapperRef}
      className={wrapperClasses}
      data-pattern="timberland/flickity-carousel"
    >
      <div
        id={carouselId}
        className={carouselClasses}
        data-cellselector={cellSelector}
        data-dragthreshold={dragThreshold}
        data-selectedattraction={selectedAttraction}
        data-friction={friction}
        data-freescrollfriction={freeScrollFriction}
        data-cellalign={cellAlign}
        data-nojs="false"
        data-draggable={draggable ? 'true' : 'false'}
        data-freescroll={freeScroll ? 'true' : 'false'}
        data-wraparound={wrapAround ? 'true' : 'false'}
        data-groupcells={groupCells ? 'true' : 'false'}
        data-autoplay={autoPlay != null && autoPlay !== false ? String(autoPlay) : 'false'}
        data-pauseautoplay={pauseAutoPlayOnHover ? 'true' : 'false'}
        data-fullscreen={fullscreen ? 'true' : 'false'}
        data-fade={fade ? 'true' : 'false'}
        data-adaptiveheight={adaptiveHeight ? 'true' : 'false'}
        data-asnavfor={asNavFor ?? undefined}
        data-initialindex={initialIndex ?? undefined}
        data-setgallerysize={setGallerySize === false ? 'false' : 'true'}
        data-contain={contain ? 'true' : 'false'}
        data-righttoleft={rightToLeft ? 'true' : 'false'}
        data-prevnextbuttons={prevNextButtons ? 'true' : 'false'}
        data-pagedots={pageDots ? 'true' : 'false'}
        data-percentposition={percentPosition ? 'true' : 'false'}
      >
        {slides.map((slide, i) => (
          <div key={i} className={cx(styles, 'carousel-cell')}>
            {slide}
          </div>
        ))}
      </div>

      {showControls && (
        <div className={cx(styles, 'button--row')}>
          <button className={cx(styles, 'button', 'button--previous')} aria-label="Previous slide">&larr;</button>
          <div className={cx(styles, 'button--group', 'button--group-cells')}>
            {slides.map((_, i) => (
              <button
                key={i}
                className={cx(styles, 'button', i === 0 && 'is-selected')}
                aria-label={`Go to slide ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button className={cx(styles, 'button', 'button--next')} aria-label="Next slide">&rarr;</button>
        </div>
      )}
    </div>
  );
}

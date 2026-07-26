import React, { useId } from 'react';
import styles from './flickity-carousel.module.scss';

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

  const wrapperClasses = [
    'flickity-carousel--wrapper',
    columns ? `flickity-cols-${columns}` : null,
    className,
  ].filter(Boolean).join(' ');

  const carouselClasses = [
    'flickity-carousel',
    prevNextButtons ? 'has-arrows' : null,
  ].filter(Boolean).join(' ');

  return (
    <div
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
          <div key={i} className="carousel-cell">
            {slide}
          </div>
        ))}
      </div>

      {showControls && (
        <div className="button--row">
          <button className="button button--previous" aria-label="Previous slide">&larr;</button>
          <div className="button--group button--group-cells">
            {slides.map((_, i) => (
              <button
                key={i}
                className={['button', i === 0 ? 'is-selected' : null].filter(Boolean).join(' ')}
                aria-label={`Go to slide ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button className="button button--next" aria-label="Next slide">&rarr;</button>
        </div>
      )}
    </div>
  );
}

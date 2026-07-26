import React, { useId } from 'react';
import styles from './slick-carousel.module.scss';

export interface SlickResponsiveBreakpoint {
  breakpoint: number;
  settings: Record<string, unknown>;
}

export interface SlickCarouselProps {
  /** Slides to render — each item becomes a slide div. */
  slides?: React.ReactNode[];
  /** Carousel element ID. Auto-generated if omitted. */
  id?: string;
  /** Show custom controls element below slider. */
  customControls?: boolean;
  /** Adapt height to tallest visible slide. */
  adaptiveHeight?: boolean;
  /** Enable auto-play. */
  autoplay?: boolean;
  /** Auto-play interval in ms. @default 3000 */
  autoplaySpeed?: number;
  /** Show prev/next arrow buttons. @default true */
  arrows?: boolean;
  /** Selector string for a nav slider to sync with. */
  asNavFor?: string;
  /** Enable centered view with partial prev/next slides. */
  centerMode?: boolean;
  /** Side padding in center mode (px or %). @default '50px' */
  centerPadding?: string;
  /** Show dot indicators. */
  dots?: boolean;
  /** Enable fade transition. */
  fade?: boolean;
  /** Infinite loop sliding. */
  infinite?: boolean;
  /** Zero-based starting slide. @default 0 */
  initialSlide?: number;
  /** Grid mode: rows per slide group. @default 1 */
  rows?: number;
  /** Slides per grid row (used with rows > 1). @default 1 */
  slidesPerRow?: number;
  /** Number of slides to show at once. @default 1 */
  slidesToShow?: number;
  /** Number of slides to scroll at once. @default 1 */
  slidesToScroll?: number;
  /** Slide/fade animation speed in ms. @default 300 */
  speed?: number;
  /** Allow variable-width slides. */
  variableWidth?: boolean;
  /** Vertical slide mode. */
  vertical?: boolean;
  /** Vertical swipe mode. */
  verticalSwiping?: boolean;
  /** Right-to-left direction. */
  rtl?: boolean;
  /** Responsive breakpoint overrides. */
  responsive?: SlickResponsiveBreakpoint[];
  /** Enable mouse dragging. */
  draggable?: boolean;
  /** Resistance at edges for non-infinite carousels. @default 0.15 */
  edgeFriction?: number;
  /** Enable focus on selected element. */
  focusOnSelect?: boolean;
  /** Pause auto-play on focus. */
  pauseOnFocus?: boolean;
  /** Pause auto-play on hover. */
  pauseOnHover?: boolean;
  /** Pause auto-play when a dot is hovered. */
  pauseOnDotsHover?: boolean;
  /** Enable touch/swipe. */
  swipe?: boolean;
  /** Allow drag directly to any slide. */
  swipeToSlide?: boolean;
  /** Enable slide motion with touch. */
  touchMove?: boolean;
  /** Touch swipe threshold. @default 5 */
  touchThreshold?: number;
  /** jQuery easing method. @default 'linear' */
  easing?: string;
  /** CSS3 animation easing. @default 'linear' */
  cssEase?: string;
  /** Additional CSS class names. */
  className?: string;
}

export function SlickCarousel({
  slides = [],
  id,
  customControls,
  adaptiveHeight,
  autoplay,
  autoplaySpeed = 3000,
  arrows = true,
  asNavFor,
  centerMode,
  centerPadding = '50px',
  dots,
  fade,
  infinite,
  initialSlide = 0,
  rows = 1,
  slidesPerRow = 1,
  slidesToShow = 1,
  slidesToScroll = 1,
  speed = 300,
  variableWidth,
  vertical,
  verticalSwiping,
  rtl,
  responsive,
  draggable,
  edgeFriction = 0.15,
  focusOnSelect,
  pauseOnFocus,
  pauseOnHover,
  pauseOnDotsHover,
  swipe,
  swipeToSlide,
  touchMove,
  touchThreshold = 5,
  easing = 'linear',
  cssEase = 'linear',
  className,
}: SlickCarouselProps) {
  const uid = useId().replace(/:/g, '');
  const carouselId = id ?? `slickSlider${uid}`;

  const wrapperClasses = [
    'slick-carousel-wrapper',
    customControls ? 'show-custom-controls' : null,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperClasses}
      data-pattern="timberland/slick-carousel"
      data-customcontrols={customControls ? 'true' : ''}
      data-adaptiveheight={adaptiveHeight ? 'true' : 'false'}
      data-autoplay={autoplay ? 'true' : 'false'}
      data-autoplayspeed={autoplaySpeed}
      data-arrows={arrows === false ? 'false' : 'true'}
      data-asnavfor={asNavFor ?? ''}
      data-centermode={centerMode ? 'true' : 'false'}
      data-centerpadding={centerPadding}
      data-dots={dots ? 'true' : 'false'}
      data-fade={fade ? 'true' : 'false'}
      data-infinite={infinite ? 'true' : 'false'}
      data-initialslide={initialSlide}
      data-rows={rows}
      data-slidesperrow={slidesPerRow}
      data-slidestoshow={slidesToShow}
      data-slidestoscroll={slidesToScroll}
      data-speed={speed}
      data-variablewidth={variableWidth ? 'true' : 'false'}
      data-vertical={vertical ? 'true' : 'false'}
      data-verticalswiping={verticalSwiping ? 'true' : 'false'}
      data-rtl={rtl ? 'true' : 'false'}
      data-responsive={responsive ? JSON.stringify(responsive) : '[]'}
      data-draggable={draggable ? 'true' : 'false'}
      data-edgefriction={edgeFriction}
      data-focusonselect={focusOnSelect ? 'true' : 'false'}
      data-pauseonfocus={pauseOnFocus ? 'true' : 'false'}
      data-pauseonhover={pauseOnHover ? 'true' : 'false'}
      data-pauseondotshover={pauseOnDotsHover ? 'true' : 'false'}
      data-swipe={swipe ? 'true' : 'false'}
      data-swipetoslide={swipeToSlide ? 'true' : 'false'}
      data-touchmove={touchMove ? 'true' : 'false'}
      data-touchthreshold={touchThreshold}
      data-easing={easing}
      data-cssease={cssEase}
    >
      <div id={carouselId} className="slick-carousel">
        {slides.map((slide, i) => (
          <div key={i}>{slide}</div>
        ))}
      </div>
      <div className="slick-carousel-controls" />
    </div>
  );
}

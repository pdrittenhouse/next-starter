'use client';

import React, { useId, useRef, useEffect } from 'react';
import styles from './slick-carousel.module.scss';
import { cx } from '@/lib/cx';

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
  /** Enable keyboard (accessibility) navigation. Maps to Slick's `accessibility` option. */
  keyboard?: boolean;
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
  keyboard,
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
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const convertValue = (value: string): string | number | boolean => {
      if (!isNaN(Number(value)) && value !== '') return parseInt(value, 10);
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    };

    let $wrapper: any;
    (async () => {
      const jq = (await import('jquery')).default;
      (window as any).jQuery = jq;
      (window as any).$ = jq;
      await import('slick-carousel');
      const $ = jq as any;

      const responsiveSettings: any[] = JSON.parse(wrapper.dataset.responsive ?? '[]');
      responsiveSettings.forEach(item => {
        item.breakpoint = convertValue(String(item.breakpoint));
        Object.keys(item.settings).forEach(k => {
          item.settings[k] = convertValue(String(item.settings[k]));
        });
      });

      const isCustomControls = wrapper.dataset.customcontrols === 'true';
      const controlsWrap = $(wrapper).find('.slick-carousel-controls');

      const opts: Record<string, any> = {
        accessibility:    keyboard ?? false,
        adaptiveHeight:   adaptiveHeight ?? false,
        autoplay:         autoplay ?? false,
        autoplaySpeed:    autoplaySpeed,
        arrows:           arrows,
        asNavFor:         asNavFor,
        prevArrow:        '<button type="button" class="slick-prev">Previous</button>',
        nextArrow:        '<button type="button" class="slick-next">Next</button>',
        centerMode:       centerMode ?? false,
        centerPadding:    centerPadding,
        dots:             dots ?? false,
        draggable:        draggable ?? false,
        fade:             fade ?? false,
        focusOnSelect:    focusOnSelect ?? false,
        easing:           easing,
        cssEase:          cssEase,
        edgeFriction:     edgeFriction,
        infinite:         infinite ?? false,
        initialSlide:     initialSlide,
        lazyLoad:         'ondemand',
        mobileFirst:      true,
        pauseOnFocus:     pauseOnFocus ?? false,
        pauseOnHover:     pauseOnHover ?? false,
        pauseOnDotsHover: pauseOnDotsHover ?? false,
        respondTo:        'window',
        responsive:       responsiveSettings,
        rows:             rows,
        slidesPerRow:     slidesPerRow,
        slidesToShow:     slidesToShow,
        slidesToScroll:   slidesToScroll,
        speed:            speed,
        swipe:            swipe ?? false,
        swipeToSlide:     swipeToSlide ?? false,
        touchMove:        touchMove ?? false,
        touchThreshold:   touchThreshold,
        useCSS:           true,
        useTransform:     true,
        variableWidth:    variableWidth ?? false,
        vertical:         vertical ?? false,
        verticalSwiping:  verticalSwiping ?? false,
        rtl:              rtl ?? false,
        waitForAnimate:   true,
        zIndex:           2,
      };

      if (isCustomControls) {
        opts.appendArrows = controlsWrap;
        opts.appendDots   = controlsWrap;
        responsiveSettings.forEach(item => {
          item.settings.appendArrows = controlsWrap;
          item.settings.appendDots   = controlsWrap;
        });
        opts.responsive = responsiveSettings;
      }

      $wrapper = $(wrapper).find('.slick-carousel').slick(opts);
    })();

    return () => {
      try { $wrapper?.slick('unslick'); } catch (_) {}
    };
  }, []);

  const wrapperClasses = cx(
    styles,
    'slick-carousel-wrapper',
    customControls && 'show-custom-controls',
    className,
  );

  return (
    <div
      ref={wrapperRef}
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
      data-keyboard={keyboard ? 'true' : 'false'}
      data-swipe={swipe ? 'true' : 'false'}
      data-swipetoslide={swipeToSlide ? 'true' : 'false'}
      data-touchmove={touchMove ? 'true' : 'false'}
      data-touchthreshold={touchThreshold}
      data-easing={easing}
      data-cssease={cssEase}
    >
      <div id={carouselId} className={cx(styles, 'slick-carousel')}>
        {slides.map((slide, i) => (
          <div key={i}>{slide}</div>
        ))}
      </div>
      <div className={cx(styles, 'slick-carousel-controls')} />
    </div>
  );
}

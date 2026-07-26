'use client';

import React, { useId, useState } from 'react';
import { Carousel as BsCarousel } from 'react-bootstrap';
import { Image } from '@/stories/atoms/image/Image';
import type { ImageProps } from '@/stories/atoms/image/Image';
import styles from './carousel.module.scss';

/**
 * Slide image — all ImageProps except `className`, plus an optional
 * `imageOtherClasses` that mirrors the Twig pattern's `image_other_classes`.
 */
export interface SlideImage extends Omit<ImageProps, 'className'> {
  /**
   * Additional CSS class names for the image element.
   * Maps to `image_other_classes` in the Twig pattern.
   */
  imageOtherClasses?: string;
}

/**
 * A single carousel slide object.
 */
export interface ImageSlide {
  /** Image for this slide. */
  image?: SlideImage;
  /** Slide heading label (renders as `<h5 class="carousel--label">`). */
  label?: string;
  /** Slide caption paragraph (renders as `<p class="carousel--caption">`). */
  caption?: string;
  /** True if this is the initially visible slide. */
  active?: boolean;
  /**
   * Per-slide auto-cycling delay override in milliseconds.
   * Passed as `interval` on the `Carousel.Item` element.
   */
  delay?: number;
}

/**
 * Props for the Carousel molecule.
 * Mirrors all variables documented in `_carousel.tpl.twig`.
 */
export interface CarouselProps {
  /**
   * Explicit element ID. Auto-generated with `useId()` if omitted.
   * Maps to `carousel_id` in the Twig pattern.
   */
  carouselId?: string;
  /**
   * Additional CSS class names as an array (merged with base classes).
   * Maps to `carousel_classes` in the Twig pattern.
   */
  carouselClasses?: string[];
  /**
   * Additional CSS class names as a single string (appended last).
   * Maps to `carousel_other_classes` in the Twig pattern.
   */
  carouselOtherClasses?: string;
  /** Show prev/next arrow controls. Defaults to `true`. */
  arrows?: boolean;
  /** Show slide position indicator buttons. Defaults to `true`. */
  indicators?: boolean;
  /** Animate slides with a crossfade transition instead of a slide. */
  crossfade?: boolean;
  /** Control touch-swipe on touchscreen devices. */
  touch?: boolean;
  /** Apply Bootstrap's dark carousel variant (darker controls and captions). */
  dark?: boolean;
  /** Ordered array of slide objects. */
  slides: ImageSlide[];
  /**
   * Auto-cycling interval in milliseconds between slides.
   * Pass `'false'` (string) to disable auto-cycling, matching Bootstrap's API.
   */
  interval?: number | 'false';
  /** Whether the carousel should react to keyboard events. */
  keyboard?: boolean;
  /**
   * Pause on hover: `'hover'` pauses on mouseenter / resumes on mouseleave.
   * `'false'` disables hovering pause.
   */
  pause?: 'hover' | 'false';
  /**
   * Autoplay behaviour. In React Bootstrap, autoplay is controlled via
   * the `interval` prop (pass a number to auto-cycle, null to disable).
   */
  ride?: boolean | 'carousel';
  /** `true` cycles continuously; `false` stops at the last slide. */
  wrap?: boolean;
  /** Convenience additional class names (appended after `carouselOtherClasses`). */
  className?: string;
}

/**
 * Carousel molecule — mirrors `02-molecules/carousel/_carousel.tpl.twig`.
 *
 * Composes the Image atom for slide images. Slide navigation is managed via
 * React state and React Bootstrap's `Carousel` component —
 * no Bootstrap JS bundle required.
 */
export function Carousel({
  carouselId,
  carouselClasses = [],
  carouselOtherClasses,
  arrows = true,
  indicators = true,
  crossfade = false,
  touch,
  dark = false,
  slides = [],
  interval,
  keyboard,
  pause,
  wrap,
  className,
}: CarouselProps) {
  const generatedId = useId();
  const resolvedId = carouselId ?? `carousel_${generatedId.replace(/:/g, '')}`;

  const initialIndex = slides.findIndex(s => s.active);
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  // Extra classes passed from props (React Bootstrap adds carousel/slide/fade/dark itself).
  const extraClasses = [...carouselClasses, carouselOtherClasses, className]
    .filter(Boolean)
    .join(' ');

  // Map 'false' string to null (React Bootstrap uses null to disable auto-cycle).
  const resolvedInterval = interval === 'false' ? null : interval;

  // Map 'false' string to false boolean for React Bootstrap.
  const resolvedPause = pause === 'false' ? false : pause;

  return (
    <BsCarousel
      id={resolvedId}
      activeIndex={activeIndex}
      onSelect={(idx) => setActiveIndex(idx)}
      fade={crossfade}
      indicators={indicators}
      controls={arrows}
      touch={touch}
      keyboard={keyboard}
      pause={resolvedPause}
      wrap={wrap}
      interval={resolvedInterval}
      variant={dark ? 'dark' : undefined}
      className={extraClasses || undefined}
      data-pattern="timberland/carousel"
    >
      {slides.map((slide, i) => (
        <BsCarousel.Item key={i} interval={slide.delay}>
          {slide.image && (() => {
            const { imageOtherClasses, ...imageProps } = slide.image;
            return (
              <Image
                {...imageProps}
                className={[
                  'carousel--image',
                  'd-block',
                  'w-100',
                  imageOtherClasses ?? null,
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            );
          })()}

          {(slide.label || slide.caption) && (
            <BsCarousel.Caption>
              {slide.label && (
                <h5 className="carousel--label">{slide.label}</h5>
              )}
              {slide.caption && (
                <p className="carousel--caption">{slide.caption}</p>
              )}
            </BsCarousel.Caption>
          )}
        </BsCarousel.Item>
      ))}
    </BsCarousel>
  );
}

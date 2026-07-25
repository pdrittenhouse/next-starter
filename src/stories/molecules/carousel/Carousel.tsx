'use client';

import { useId } from 'react';
import { Image } from '@/stories/atoms/image/Image';
import type { ImageProps } from '@/stories/atoms/image/Image';
import { Button } from '@/stories/atoms/button/Button';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import type { ComponentType } from 'react';

/**
 * Local type alias extending ButtonProps with carousel-specific data attributes.
 * The Button atom spreads `...rest` to BootstrapButton, so these attributes flow
 * through to the DOM. The cast at the end of this file bridges the type gap.
 */
type CarouselButtonProps = ButtonProps & {
  'data-bs-target'?: string;
  'data-bs-slide'?: 'prev' | 'next';
  'data-bs-slide-to'?: string;
  'aria-current'?: string | boolean;
};

// Cast Button to accept the carousel-specific extra props.
const CarouselButton = Button as ComponentType<CarouselButtonProps>;

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
   * Outputs `data-bs-interval` on the `.carousel-item` element.
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
  /**
   * Control touch-swipe on touchscreen devices.
   * Outputs `data-bs-touch` on the root element when set.
   */
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
   * Autoplay behaviour: `true` autoplays after first manual interaction;
   * `'carousel'` autoplays immediately on page load.
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
 * Composes the Image atom for slide images and the Button atom (via
 * `CarouselButton`) for indicator dots and prev/next controls. Bootstrap's
 * carousel JS is expected to be loaded globally; this component only emits
 * the static HTML + `data-bs-*` attributes required for it to function.
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
  ride,
  wrap,
  className,
}: CarouselProps) {
  // Generate a stable, unique ID — mirrors the Twig random-string generator.
  // `useId()` returns values like ":r0:" — strip colons for a clean DOM attribute.
  const generatedId = useId();
  const resolvedId = carouselId ?? `carousel_${generatedId.replace(/:/g, '')}`;

  // Build class string — mirrors the Twig carousel_classes merge + trim pattern.
  const classes = [
    'carousel',
    'slide',
    crossfade ? 'carousel-fade' : null,
    dark ? 'carousel-dark' : null,
    ...carouselClasses,
    carouselOtherClasses ?? null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  // Collect optional Bootstrap data attributes for the root element.
  const bsRootAttrs: Record<string, string> = {};
  if (touch !== undefined) bsRootAttrs['data-bs-touch'] = String(touch);
  if (ride !== undefined) bsRootAttrs['data-bs-ride'] = String(ride);
  if (interval !== undefined) bsRootAttrs['data-bs-interval'] = String(interval);
  if (keyboard !== undefined) bsRootAttrs['data-bs-keyboard'] = String(keyboard);
  if (pause !== undefined) bsRootAttrs['data-bs-pause'] = String(pause);
  if (wrap !== undefined) bsRootAttrs['data-bs-wrap'] = String(wrap);

  return (
    <div
      id={resolvedId}
      className={classes}
      data-pattern="timberland/carousel"
      {...bsRootAttrs}
    >
      {/* ── Indicators ─────────────────────────────────────────────────── */}
      {indicators && slides.length > 0 && (
        <div className="carousel-indicators">
          {slides.map((slide, i) => (
            <CarouselButton
              key={i}
              type="button"
              hideLabel
              className={[
                'carousel--indicator',
                slide.active ? 'active' : null,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={slide.active ? 'true' : undefined}
              aria-label={slide.label ?? `Slide ${i + 1}`}
              data-bs-target={`#${resolvedId}`}
              data-bs-slide-to={String(i)}
            />
          ))}
        </div>
      )}

      {/* ── Slides ─────────────────────────────────────────────────────── */}
      <div className="carousel-inner">
        {slides.map((slide, i) => {
          const itemAttrs: Record<string, string> = {};
          if (slide.delay != null) {
            itemAttrs['data-bs-interval'] = String(slide.delay);
          }

          return (
            <div
              key={i}
              className={[
                'carousel-item',
                slide.active ? 'active' : null,
              ]
                .filter(Boolean)
                .join(' ')}
              {...itemAttrs}
            >
              {/* Slide image — composes the Image atom */}
              {slide.image && (() => {
                const { imageOtherClasses, ...imageProps } = slide.image;
                const imgClassName = [
                  'carousel--image',
                  'd-block',
                  'w-100',
                  imageOtherClasses ?? null,
                ]
                  .filter(Boolean)
                  .join(' ');
                return <Image {...imageProps} className={imgClassName} />;
              })()}

              {/* Caption overlay */}
              {(slide.label || slide.caption) && (
                <div className="carousel-caption d-none d-md-block">
                  {slide.label && (
                    <h5 className="carousel--label">{slide.label}</h5>
                  )}
                  {slide.caption && (
                    <p className="carousel--caption">{slide.caption}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Prev / Next controls ───────────────────────────────────────── */}
      {arrows && (
        <>
          <CarouselButton
            type="button"
            className="carousel-control-prev"
            data-bs-target={`#${resolvedId}`}
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </CarouselButton>

          <CarouselButton
            type="button"
            className="carousel-control-next"
            data-bs-target={`#${resolvedId}`}
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </CarouselButton>
        </>
      )}
    </div>
  );
}

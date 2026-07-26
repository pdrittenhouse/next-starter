import React from 'react';
import { Image } from '@/stories/atoms/image/Image';
import type { ImageVariant } from '@/stories/atoms/image/Image';
import styles from './testimonial.module.scss';

/**
 * Testimonial image props — mirrors the image object from the Twig pattern.
 * Only `src` and `alt` are required; all other fields are optional.
 */
export interface TestimonialImageProps {
  /** Which image variant to render. Defaults to 'primary'. */
  variant?: ImageVariant;
  /** Image source URL. */
  src: string;
  /** Alt text — required for accessibility. Empty string for decorative images. */
  alt: string;
  /** Explicit width in pixels. */
  width?: number;
  /** Explicit height in pixels. */
  height?: number;
  /** Responsive sizes attribute. */
  sizes?: string;
  /** Native lazy loading. Defaults to 'lazy'. */
  loading?: 'lazy' | 'eager';
  /** Additional CSS class names (maps to image_other_classes in Twig). */
  className?: string;
}

/**
 * Testimonial molecule props — mirrors all variables from
 * `02-molecules/testimonial/_testimonial.tpl.twig`.
 */
export interface TestimonialProps {
  /**
   * Testimonial image object. When `src` is provided, the Image atom is rendered
   * inside a `<figure class="testimonial-image">` element.
   */
  image?: TestimonialImageProps;
  /** Testimonial title rendered inside an `<h2 class="testimonial-title">` element. */
  title?: string;
  /** Testimonial quote text rendered inside a `<blockquote class="testimonial-quote">`. */
  quote?: string;
  /** Testimonial author name. */
  author?: string;
  /** Author's organization or descriptor. */
  descriptor?: string;
  /** Additional CSS class names to merge onto the root `<div>` element. */
  className?: string;
}

/**
 * Testimonial molecule — mirrors `timberland/testimonial` from Pattern Lab.
 *
 * Produces identical HTML/class structure to the Twig template at:
 * `02-molecules/testimonial/_testimonial.tpl.twig`.
 *
 * Composes the Image atom when `image.src` is provided.
 */
export function Testimonial({
  image,
  title,
  quote,
  author,
  descriptor,
  className,
}: TestimonialProps) {
  // Mirror the Twig class-building logic:
  // testimonial_classes|merge(['testimonial', testimonial_other_classes])
  const testimonialClasses = ['testimonial', className]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <div className={testimonialClasses} data-pattern="timberland/testimonial">
      {image?.src && (
        <figure className="testimonial-image">
          <Image
            variant={image.variant}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={image.sizes}
            loading={image.loading}
            className={image.className}
          />
        </figure>
      )}
      <div className="testimonial-body">
        {title && <h2 className="testimonial-title">{title}</h2>}
        {quote && (
          <blockquote className="testimonial-quote">
            <i className="fas fa-quote-left" aria-hidden="true"></i>
            {quote}
            <i className="fas fa-quote-right" aria-hidden="true"></i>
          </blockquote>
        )}
        {(author || descriptor) && (
          <div className="testimonial-meta">
            {author && <span className="testimonial-author">{author}</span>}
            {descriptor && (
              <span className="testimonial-descriptor">{descriptor}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

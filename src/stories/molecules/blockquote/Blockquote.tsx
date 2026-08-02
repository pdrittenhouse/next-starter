import React from 'react';
import { Image } from '@/stories/atoms/image/Image';
import type { ImageVariant } from '@/stories/atoms/image/Image';
import styles from './blockquote.module.scss';
import { cx } from '@/lib/cx';

/**
 * Citation image props — mirrors the citation_image object from the Twig pattern.
 * Only `src` and `alt` are required; all other fields are optional.
 */
export interface CitationImageProps {
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
 * Blockquote molecule props — mirrors all variables from
 * `02-molecules/blockquote/_blockquote.tpl.twig`.
 */
export interface BlockquoteProps {
  /** Blockquote text rendered inside a <q> element. */
  quote?: string;
  /** Citation text rendered inside a <cite> element. */
  citation?: string;
  /**
   * Citation image object. When `src` is provided, the Image atom is rendered
   * inside a `<span class="cite-img">` wrapper within the <cite> element.
   */
  citationImage?: CitationImageProps;
  /**
   * Controls where the <cite> element appears relative to the <q> element.
   * - 'before' → cite renders above the quote; adds class `citation-top`.
   * - 'after'  → cite renders below the quote; adds class `citation-bottom`.
   * Defaults to 'after'.
   */
  citationPosition?: 'before' | 'after';
  /** URL for the `cite` attribute on the <blockquote> element. */
  citationLink?: string;
  /** Additional CSS class names to merge onto the <blockquote> element. */
  className?: string;
}

/**
 * Blockquote molecule — mirrors `timberland/blockquote` from Pattern Lab.
 *
 * Produces identical HTML/class structure to the Twig template at:
 * `02-molecules/blockquote/_blockquote.tpl.twig`.
 *
 * Composes the Image atom when `citationImage.src` is provided.
 */
export function Blockquote({
  quote,
  citation,
  citationImage,
  citationPosition = 'after',
  citationLink,
  className,
}: BlockquoteProps) {
  // Mirror the Twig class-building logic:
  // blockquote_classes|merge(['blockquote', positionClass, blockquote_other_classes])
  const positionClass = citationPosition === 'before' ? 'citation-top' : 'citation-bottom';
  const blockquoteClasses = cx(styles, 'blockquote', positionClass, className);

  // Render the <cite> block — shared between 'before' and 'after' positions.
  const renderCite = () => (
    <cite>
      {citationImage?.src && (
        <span className={cx(styles, 'cite-img')}>
          <Image
            variant={citationImage.variant}
            src={citationImage.src}
            alt={citationImage.alt}
            width={citationImage.width}
            height={citationImage.height}
            sizes={citationImage.sizes}
            loading={citationImage.loading}
            className={cx(styles, 'citation-image', citationImage.className)}
          />
        </span>
      )}
      <span className={cx(styles, 'cite-txt')}>{citation}</span>
    </cite>
  );

  return (
    <blockquote
      className={blockquoteClasses}
      {...(citationLink ? { cite: citationLink } : {})}
      data-pattern="timberland/blockquote"
    >
      {citation && citationPosition === 'before' && renderCite()}
      {quote && <q>{quote}</q>}
      {citation && citationPosition === 'after' && renderCite()}
    </blockquote>
  );
}

import NextImage from 'next/image';
import styles from './image.module.scss';

/**
 * Image rendering variants — mirrors the Twig pattern's `variant` parameter.
 *
 * - primary:      Standard <img> rendered via next/image with explicit dimensions.
 * - picture:      Same output as primary; next/image delivers WebP automatically,
 *                 so no separate <picture> element is needed. Class `image--picture`
 *                 is applied for CSS targeting.
 * - aspect-ratio: Constrained wrapper div (ar-{w}-{h} class) with a fill-mode
 *                 next/image inside. Caller passes the ratio as width/height
 *                 (e.g. width={16} height={9}), not pixel dimensions.
 * - bg:           CSS background-image div. next/image cannot handle this variant;
 *                 a plain <div> with an inline style is rendered instead.
 */
export type ImageVariant = 'primary' | 'picture' | 'aspect-ratio' | 'bg';

export interface ImageProps {
  /** Which image variant to render. Defaults to 'primary'. */
  variant?: ImageVariant;
  /** Image source URL. */
  src: string;
  /** Alt text — required for accessibility. Empty string for decorative images. */
  alt: string;
  /** Explicit width in pixels (primary/picture) or aspect-ratio width unit (aspect-ratio). */
  width?: number;
  /** Explicit height in pixels (primary/picture) or aspect-ratio height unit (aspect-ratio). */
  height?: number;
  /** Responsive sizes attribute — informs the browser which breakpoint image to load. */
  sizes?: string;
  /** Native lazy loading. Defaults to 'lazy'. Set to 'eager' for above-the-fold images. */
  loading?: 'lazy' | 'eager';
  /**
   * Fetch priority hint. Use 'high' for the LCP image — sets next/image's `priority`
   * flag which also disables lazy loading. 'low' and 'auto' fall through to the
   * `loading` prop.
   */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Additional CSS class names — maps to `image_other_classes` in the Twig pattern. */
  className?: string;
}

function buildClasses(variant: ImageVariant, extra?: string): string {
  return [
    'image',
    variant !== 'bg' ? 'img-fluid' : null,
    `image--${variant}`,
    extra ?? null,
  ].filter(Boolean).join(' ');
}

/**
 * Image atom — mirrors `src/design-system/patterns/01-atoms/image/_image.tpl.twig`.
 *
 * Uses next/image for all variants except `bg`, which requires a CSS background-image
 * and cannot be expressed as an <img> element. The `picture` variant collapses to the
 * same output as `primary` because next/image delivers WebP automatically.
 */
export function Image({
  variant = 'primary',
  src,
  alt,
  width,
  height,
  sizes,
  loading = 'lazy',
  fetchPriority,
  className,
}: ImageProps) {
  const priority = fetchPriority === 'high';
  // next/image: when priority=true, loading must be undefined (it ignores it anyway,
  // but passing both generates a console warning).
  const resolvedLoading = priority ? undefined : loading;
  const cls = buildClasses(variant, className);

  if (variant === 'bg') {
    const style: React.CSSProperties = {
      backgroundImage: `url('${src}')`,
      ...(width != null ? { width } : {}),
      ...(height != null ? { height } : {}),
    };
    return (
      <div
        className={cls}
        style={style}
        aria-label={`[${alt}]`}
        role="img"
      />
    );
  }

  if (variant === 'aspect-ratio') {
    const arClass = width != null && height != null ? `ar-${width}-${height}` : '';
    return (
      <div
        className={[cls, arClass].filter(Boolean).join(' ')}
        style={{ position: 'relative' }}
      >
        <div className="content">
          <NextImage
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            loading={resolvedLoading}
            priority={priority}
            style={{ objectFit: 'cover', maxWidth: '100%' }}
          />
        </div>
      </div>
    );
  }

  // primary / picture — render via next/image with explicit dimensions when available
  if (width != null && height != null) {
    return (
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={resolvedLoading}
        priority={priority}
        className={cls}
      />
    );
  }

  // No explicit dimensions: fall back to fill mode inside a relative wrapper.
  // Callers should provide width + height from WP GraphQL (mediaDetails.width/height)
  // whenever possible to avoid this path.
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={resolvedLoading}
        priority={priority}
        className={cls}
      />
    </div>
  );
}

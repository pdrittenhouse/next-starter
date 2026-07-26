import styles from './svg.module.scss';

export type SvgType = 'inline' | 'object' | 'picture';

export interface SvgProps {
  /** SVG file path — used as `data` for object, `srcSet` for picture, or ignored for inline (use children). */
  path?: string;
  /** Rendering type. Defaults to 'inline' (span wrapper). */
  type?: SvgType;
  /** When true, preserves the SVG's original colours. When false (default), adds svg--colorable so fills inherit currentColor. */
  colorOriginal?: boolean;
  /** Path to a fallback image shown when the SVG cannot render. */
  fallback?: string;
  /** Alt text for the fallback image. */
  alt?: string;
  /** Bootstrap text-colour name (e.g. 'primary' → 'text-primary'). Applies a fill colour via CSS. */
  fill?: string;
  /** Additional CSS class names — maps to svg_other_classes in the Twig pattern. */
  className?: string;
  /** Inline SVG element content for the 'inline' rendering type. */
  children?: React.ReactNode;
}

function buildClasses(colorOriginal?: boolean, fill?: string, extra?: string): string {
  return [
    'svg',
    !colorOriginal ? 'svg--colorable' : null,
    fill ? `text-${fill}` : null,
    extra ?? null,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Svg({
  path,
  type = 'inline',
  colorOriginal,
  fallback,
  alt = '',
  fill,
  className,
  children,
}: SvgProps) {
  const cls = buildClasses(colorOriginal, fill, className);

  if (type === 'object') {
    return (
      <object
        className={cls}
        data-pattern="timberland/svg"
        type="image/svg+xml"
        data={path}
      >
        {/* object children are fallback content for browsers that cannot render the object */}
        {fallback && <img src={fallback} alt={alt} />}
      </object>
    );
  }

  if (type === 'picture') {
    return (
      <picture className={cls} data-pattern="timberland/svg">
        <source type="image/svg+xml" srcSet={path} />
        {fallback && <img src={fallback} alt={alt} />}
      </picture>
    );
  }

  return (
    <span className={cls} data-pattern="timberland/svg">
      {children}
    </span>
  );
}

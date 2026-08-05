import React from 'react';
import { Image } from '@/stories/atoms/image/Image';
import { Button } from '@/stories/atoms/button/Button';
import type { ImageProps } from '@/stories/atoms/image/Image';
import type { ButtonProps } from '@/stories/atoms/button/Button';

/**
 * Props for the Feature molecule — mirrors the Twig pattern at
 * timberland-extended patterns/02-molecules/feature/_feature.tpl.twig.
 */
export interface FeatureProps {
  /** HTML id attribute. */
  id?: string;
  /** Wrap content in a container/row/col. */
  includeContainer?: boolean;
  /** Use container-fluid instead of container. */
  fullWidth?: boolean;
  /** Responsive breakpoint suffix for the container (e.g. 'lg'). */
  containerBreakpoint?: string;
  /** Add max-width class to a fluid container. */
  maxWidthFluidContainer?: boolean;
  /** Stack image above content instead of side by side. */
  vertical?: boolean;
  /** Vertically center content in horizontal layout. */
  verticalCenter?: boolean;
  /** Place the image on the right side. */
  imageRight?: boolean;
  /** Feature image. */
  image?: ImageProps;
  /** Image caption text. */
  caption?: string;
  /** Caption position relative to image: 'before' | 'after'. */
  captionPosition?: 'before' | 'after';
  /** Optional heading rendered above the feature wrapper. */
  heading?: string;
  /** Eyebrow label above the title. */
  label?: string;
  /** Primary title. */
  title?: string;
  /** Subtitle below the title. */
  subtitle?: string;
  /** Body copy — rendered as raw HTML. */
  description?: string;
  /** Wrap the entire feature in an anchor. */
  linked?: boolean;
  /** Link URL (used when linked is true or for the button). */
  link?: string;
  /** Link target attribute. */
  target?: string;
  /** CTA button. */
  button?: ButtonProps;
  /** Extra CSS class names on the root element. */
  className?: string;
}

/**
 * Feature molecule — side-by-side or stacked layout with image, heading,
 * label, title, subtitle, body copy, and optional CTA button.
 *
 * Mirrors the HTML/class structure of the timberland-extended Twig template.
 */
export const Feature = ({
  id,
  includeContainer = false,
  fullWidth = false,
  containerBreakpoint,
  maxWidthFluidContainer = false,
  vertical = false,
  verticalCenter = false,
  imageRight = false,
  image,
  caption,
  captionPosition = 'after',
  heading,
  label,
  title,
  subtitle,
  description,
  linked = false,
  link,
  target = '_self',
  button,
  className,
}: FeatureProps) => {
  const breakpointSuffix = containerBreakpoint ? `-${containerBreakpoint}` : '';
  const containerClass = fullWidth
    ? `container-fluid${maxWidthFluidContainer ? ' max-width-fluid-container' : ''}`
    : `container${breakpointSuffix}`;

  const rootClasses = [
    'feature',
    image && 'has-image',
    verticalCenter && 'vertical-center',
    vertical && 'feature-vertical',
    imageRight && 'feature-image-right',
    className,
  ].filter(Boolean).join(' ');

  const hasButton = !!(button && (button.label ?? button.href ?? button.children));

  const imageEl = image && (
    <figure className="feature-image" role="figure" aria-labelledby={id ? `${id}image-caption` : undefined}>
      {captionPosition === 'before' && caption && (
        <figcaption id={id ? `${id}image-caption` : undefined}>{caption}</figcaption>
      )}
      <Image {...image} />
      {captionPosition === 'after' && caption && (
        <figcaption id={id ? `${id}image-caption` : undefined}>{caption}</figcaption>
      )}
    </figure>
  );

  const bodyEl = (
    <div className="feature-body">
      <div className="feature-content">
        {label && <span className="feature-label">{label}</span>}
        {title && <h2 className="feature-title">{title}</h2>}
        {subtitle && <h3 className="feature-subtitle">{subtitle}</h3>}
        {description && (
          // eslint-disable-next-line react/no-danger
          <div className="feature-description" dangerouslySetInnerHTML={{ __html: description }} />
        )}
        {hasButton && (
          <footer className="feature-footer">
            <Button {...button!} href={button!.href ?? link} target={button!.target ?? target} />
          </footer>
        )}
      </div>
    </div>
  );

  const wrapper = linked && link ? (
    <a href={link} className="feature-wrapper feature-link" target={target}>
      {imageEl}
      {bodyEl}
    </a>
  ) : (
    <div className="feature-wrapper">
      {imageEl}
      {bodyEl}
    </div>
  );

  const inner = (
    <div className={rootClasses} {...(id ? { id } : {})} data-pattern="timberland/feature">
      {heading && (
        <header>
          <h2 className="feature-heading">{heading}</h2>
        </header>
      )}
      {wrapper}
    </div>
  );

  if (!includeContainer) return inner;

  return (
    <div className={containerClass}>
      <div className="row">
        <div className="col">
          {inner}
        </div>
      </div>
    </div>
  );
};

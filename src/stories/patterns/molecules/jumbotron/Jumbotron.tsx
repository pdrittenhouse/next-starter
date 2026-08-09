import React from 'react';
import { Image } from '@/stories/patterns/atoms/image/Image';
import { Button } from '@/stories/patterns/atoms/button/Button';
import type { ImageProps } from '@/stories/patterns/atoms/image/Image';
import type { ButtonProps } from '@/stories/patterns/atoms/button/Button';
import styles from './jumbotron.module.scss';
import { cx } from '@/lib/cx';

/**
 * Props for the Jumbotron molecule — mirrors the Twig pattern at
 * patterns/02-molecules/jumbotron/_jumbotron.tpl.twig.
 *
 * All prop names are camelCase equivalents of the Twig template variables.
 */
export interface JumbotronProps {
  /** HTML id attribute. Twig: `id`. */
  id?: string;
  /** Remove rounded corners and span full horizontal width. Twig: `jumbotron_fluid`. */
  fluid?: boolean;
  /** Omit the container and row wrapper divs. Twig: `remove_container`. */
  removeContainer?: boolean;
  /** Vertically center content on desktop. Twig: `vertical_center`. */
  verticalCenter?: boolean;
  /** Position the inline image to the left of the content. Twig: `image_left`. */
  imageLeft?: boolean;
  /** Container responsive breakpoint (e.g. 'lg', 'xl'). Twig: `container_breakpoint`. */
  containerBreakpoint?: string;
  /** Add max-width class to a fluid container. Twig: `max_width_fluid_container`. */
  maxWidthFluidContainer?: boolean;
  /** Small eyebrow label rendered above the title. Twig: `jumbotron_label`. */
  label?: string;
  /** Primary heading rendered as an `<h1>`. Twig: `jumbotron_title`. */
  title?: string;
  /** Secondary heading rendered as an `<h2>`. Twig: `jumbotron_subtitle`. */
  subtitle?: string;
  /** Body copy — rendered as raw HTML inside a `<div>`. Twig: `jumbotron_text`. */
  text?: string;
  /** CSS background-image URL applied as an inline style. Twig: `jumbotron_bg_image`. */
  bgImage?: string;
  /**
   * Inline side image. Accepts all Image atom props.
   * Adds the `has-image` modifier class to the root element.
   * Twig: `jumbotron_image.*`.
   */
  image?: ImageProps;
  /**
   * CTA button. Accepts all Button atom props.
   * Rendered when `cta.label`, `cta.href`, or `cta.children` is provided.
   * Twig: `button_*` variables (button_text, button_color, button_link, etc.).
   */
  cta?: ButtonProps;
  /** Extra CSS class names appended to the root element. Twig: `jumbotron_other_classes`. */
  className?: string;
  /** Additional inline CSS styles applied to the root element. */
  customStyle?: React.CSSProperties;
  /** Extra data-* attributes spread onto the root element (used for bg-video). */
  customAttributes?: Record<string, string>;
  /** CSS classes for the overlay span. Renders the span when set. */
  overlayClass?: string;
  /** Inline style for the overlay span. */
  overlayStyle?: React.CSSProperties;
}

/**
 * Jumbotron molecule — full-width hero section with headline, body copy,
 * optional background image, optional inline side image, and a CTA button.
 *
 * Produces identical HTML/class structure to the Pattern Lab Twig template.
 * Bootstrap JS is loaded globally — only `data-bs-*` attributes are needed here.
 */
export const Jumbotron = ({
  id,
  fluid = false,
  removeContainer = false,
  verticalCenter = false,
  imageLeft = false,
  containerBreakpoint,
  maxWidthFluidContainer = false,
  label,
  title,
  subtitle,
  text,
  bgImage,
  image,
  cta,
  className,
  customStyle,
  customAttributes,
  overlayClass,
  overlayStyle,
}: JumbotronProps) => {
  // ── Root element classes (mirrors Twig jumbotron_classes merge + sort + trim) ──
  const rootClasses = cx(
    styles,
    'jumbotron',
    image && 'has-image',
    imageLeft && 'image-left',
    removeContainer && 'no-container',
    verticalCenter && 'vertical-center',
    className,
  );

  // ── Inline background-image style (mirrors Twig jumbotron_styles merge) ──
  const rootStyle: React.CSSProperties | undefined =
    bgImage || customStyle
      ? { ...(bgImage ? { backgroundImage: `url(${bgImage})` } : {}), ...(customStyle ?? {}) }
      : undefined;

  // ── Container class (mirrors Twig's container_breakpoint logic) ───────────
  const breakpointSuffix = containerBreakpoint ? `-${containerBreakpoint}` : '';
  const containerClass = fluid
    ? cx(styles, 'container-fluid', maxWidthFluidContainer && 'max-width-fluid-container')
    : cx(styles, `container${breakpointSuffix}`);

  // ── CTA visibility guard — mirrors Twig: {% if button_text or button_link %} ──
  const hasCta = !!(cta && (cta.label ?? cta.href ?? cta.children));

  // ── Inner block (image + content) extracted to avoid conditional duplication ──
  const inner = (
    <>
      {image && (
        <div className={cx(styles, 'jumbotron--image')}>
          <Image {...image} />
        </div>
      )}
      <div className={cx(styles, 'jumbotron--content')}>
        {label && <span className={cx(styles, 'jumbotron--label')}>{label}</span>}
        {title && <h1 className={cx(styles, 'jumbotron--title')}>{title}</h1>}
        {subtitle && <h2 className={cx(styles, 'jumbotron--subtitle')}>{subtitle}</h2>}
        {text && (
          // Twig renders {{ jumbotron_text }} unescaped — mirror that here.
          // eslint-disable-next-line react/no-danger
          <div
            className={cx(styles, 'jumbotron--text')}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}
        {hasCta && <Button {...cta!} />}
      </div>
    </>
  );

  return (
    <div
      className={rootClasses}
      style={rootStyle}
      data-pattern="timberland/jumbotron"
      {...(id ? { id } : {})}
      {...(customAttributes ?? {})}
    >
      <span className={cx(styles, 'bg', 'bg-top')} />
      {overlayClass && (
        <span className={overlayClass} style={overlayStyle} />
      )}

      {removeContainer ? (
        inner
      ) : (
        <div className={containerClass}>
          <div className={cx(styles, 'row')}>{inner}</div>
        </div>
      )}

      <span className={cx(styles, 'bg', 'bg-bottom')} />
    </div>
  );
};

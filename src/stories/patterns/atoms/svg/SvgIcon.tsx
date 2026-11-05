import React from 'react';
import styles from './svg.module.scss';
import { cx } from '@/lib/cx';

/**
 * SvgIcon atom — mirrors _svg~icon.tpl.twig in the Timberland framework.
 *
 * Renders a custom spritemap icon via <svg><use href="#sprite-{name}">.
 * Requires the spritemap SVG to be injected inline in the page by the root
 * layout (layout.tsx fetches `spritemapIcons.spritemap` and injects it).
 *
 * Color is driven by CSS `color` on the wrapper span → `fill: currentColor`
 * on svg elements inside via `.svg--icon` styles. Use the `fill` prop to apply
 * a Bootstrap color token, or target `.svg--icon` with a parent CSS selector.
 */

export interface SvgIconProps {
  /** Spritemap icon slug — matches <symbol id="sprite-{name}"> in the injected SVG. */
  name: string;
  /** Bootstrap color token (e.g. 'primary'). Adds text-{fill} and color-fill--{fill}. */
  fill?: string;
  /** CSS width (e.g. '30px', '1.5rem'). */
  width?: string;
  /** CSS height (e.g. '30px', '1.5rem'). */
  height?: string;
  /** Additional CSS class names. */
  className?: string;
  /**
   * Inline styles for the wrapper span — mirrors `svg_styles` on the Twig include, which the
   * button icon groups use for colour and transform offsets. Merged after width/height so a
   * caller can override them.
   */
  style?: React.CSSProperties;
}

export function SvgIcon({ name, fill, width, height, className, style: styleProp }: SvgIconProps) {
  const classes = cx(
    styles,
    'svg',
    'svg--icon',
    fill ? `color-fill--${fill}` : null,
    fill ? `text-${fill}` : null,
    className,
  );

  const sizeStyle = (width || height)
    ? { ...(width ? { width } : {}), ...(height ? { height } : {}) }
    : undefined;
  const style: React.CSSProperties | undefined = (sizeStyle || styleProp)
    ? { ...sizeStyle, ...styleProp }
    : undefined;

  return (
    <span className={classes} style={style} data-pattern="timberland/svg">
      <svg viewBox="0 0 500 500" aria-hidden={true}>
        <use href={`#sprite-${name}`} />
      </svg>
    </span>
  );
}

import React from 'react';

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
}

export function SvgIcon({ name, fill, width, height, className }: SvgIconProps) {
  const classes = [
    'svg',
    'svg--icon',
    fill ? `color-fill--${fill}` : null,
    fill ? `text-${fill}` : null,
    className ?? null,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties | undefined = (width || height)
    ? { ...(width ? { width } : {}), ...(height ? { height } : {}) }
    : undefined;

  return (
    <span className={classes} style={style} data-pattern="timberland/svg">
      <svg viewBox="0 0 500 500" aria-hidden={true}>
        <use href={`#sprite-${name}`} />
      </svg>
    </span>
  );
}

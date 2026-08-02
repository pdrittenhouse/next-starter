import React from 'react';
import styles from './svg.module.scss';
import { cx } from '@/lib/cx';
import { SvgIcon } from './SvgIcon';
import { Svg } from './Svg';
import { isFontAwesome, isPhosphor, isBootstrapIcon, isCustomIcon } from '@/lib/icons/iconType';
import type { SvgType } from './Svg';

/**
 * SvgLink atom — mirrors _svg~link.tpl.twig in the Timberland framework.
 *
 * A link element wrapping an icon and optional text. Routes the `icon` prop
 * to the correct renderer:
 *   FA pattern   → <i class="{icon}"> (dom.watch() replaces with inline SVG)
 *   Phosphor     → <i class="{icon}"> (PhosphorLibrary.watch() replaces)
 *   BI pattern   → <i class="{icon}"> (BootstrapIconsLibrary.watch() replaces)
 *   bare name    → <SvgIcon name="{icon}"> via inline spritemap <use>
 *
 * When `path` is provided instead of `icon`, delegates to Svg for
 * file-based SVG embeds (inline, object, or picture types).
 */

export interface SvgLinkProps {
  /** Link URL. */
  url: string;
  /** Link target (e.g. '_blank'). */
  target?: string;
  /** Visible link text. */
  text?: string;
  /**
   * Icon string — FA class, Phosphor class, Bootstrap Icons class, or
   * a bare custom spritemap slug. Mutually exclusive with `path`.
   */
  icon?: string;
  /** SVG file path — alternative to `icon` for file-based SVG embeds. */
  path?: string;
  /** Embed type for file-based SVGs. @default 'inline' */
  type?: SvgType;
  /** Color token (e.g. 'primary'). Adds color-fill--{fill} / text-{fill} classes. */
  fill?: string;
  /** Icon width CSS value (e.g. '1.5rem'). */
  width?: string;
  /** Icon height CSS value. */
  height?: string;
  /** Icon position relative to text. @default 'before' */
  position?: 'before' | 'after';
  /** Preserve original SVG colours when using file-based embed. */
  colorOriginal?: boolean;
  /** Fallback image path for file-based embeds. */
  fallback?: string;
  /** Alt text for the fallback image. */
  alt?: string;
  /** Additional CSS class names for the <a> element. */
  className?: string;
  /** Additional CSS class names for the SVG/icon wrapper. */
  svgClassName?: string;
}

function IconNode({
  icon,
  path,
  type,
  fill,
  width,
  height,
  colorOriginal,
  fallback,
  alt,
  svgClassName,
}: Pick<SvgLinkProps, 'icon' | 'path' | 'type' | 'fill' | 'width' | 'height' | 'colorOriginal' | 'fallback' | 'alt' | 'svgClassName'>) {
  const iconSizeStyle: React.CSSProperties | undefined = width ? { fontSize: width } : undefined;
  const linkSvgCls = cx(styles, 'svg--link', svgClassName);

  if (icon) {
    if (isFontAwesome(icon)) {
      const cls = cx(styles, icon, fill ? `color-fill--${fill}` : null);
      return <span className={cx(styles, 'icon')} style={iconSizeStyle}><i className={cls} aria-hidden="true" /></span>;
    }
    if (isPhosphor(icon)) {
      return <span className={cx(styles, 'icon')} style={iconSizeStyle}><i className={icon} aria-hidden="true" /></span>;
    }
    if (isBootstrapIcon(icon)) {
      const cls = cx(styles, icon, fill ? `text-${fill}` : null);
      return <span className={cx(styles, 'icon')} style={iconSizeStyle}><i className={cls} aria-hidden="true" /></span>;
    }
    if (isCustomIcon(icon)) {
      return <SvgIcon name={icon} fill={fill} width={width} height={height} className={linkSvgCls} />;
    }
  }

  if (path) {
    return (
      <Svg
        path={path}
        type={type}
        colorOriginal={colorOriginal}
        fallback={fallback}
        alt={alt}
        className={linkSvgCls}
      />
    );
  }

  return null;
}

export function SvgLink({
  url,
  target,
  text,
  icon,
  path,
  type = 'inline',
  fill,
  width,
  height,
  position = 'before',
  colorOriginal,
  fallback,
  alt,
  className,
  svgClassName,
}: SvgLinkProps) {
  const iconProps = { icon, path, type, fill, width, height, colorOriginal, fallback, alt, svgClassName };

  return (
    <a
      href={url}
      className={cx(styles, 'svg--link', className)}
      target={target}
      data-pattern="timberland/svg"
    >
      {position === 'before' && <IconNode {...iconProps} />}
      {text && <span className={cx(styles, 'svg--link-text')}>{text}</span>}
      {position === 'after' && <IconNode {...iconProps} />}
    </a>
  );
}

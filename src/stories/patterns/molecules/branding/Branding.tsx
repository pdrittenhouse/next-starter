import React from 'react';
import { Image } from '@/stories/patterns/atoms/image/Image';
import styles from './branding.module.scss';
import { cx } from '@/lib/cx';

/**
 * Branding molecule — mirrors the Twig pattern at:
 * src/design-system/patterns/02-molecules/branding/_branding.tpl.twig
 *
 * Renders the site logo + site name + slogan block.
 * The logo can be supplied as:
 *   1. An inline SVG string (`logoSvgInline`)
 *   2. A CSS background-image src (`logoBgImgSrc`) — rendered via the Image atom
 *   3. A standard <img> src (`logoImgSrc`) — rendered via the Image atom
 *
 * When `url` is provided the logo and site name are wrapped in <a href={url}>;
 * otherwise they are wrapped in a non-interactive <span>.
 */
export interface BrandingProps {
  /**
   * URL the logo / site-name link points to.
   * When omitted the wrapper element becomes a <span> (no link).
   */
  url?: string;

  /**
   * Inline SVG markup string. Adds `logo-type--svg` class to the wrapper.
   * Takes precedence over `logoBgImgSrc` and `logoImgSrc`.
   */
  logoSvgInline?: string;

  /**
   * Image src for a CSS background-image logo.
   * Adds `logo-type--bg` class to the wrapper.
   * Used when `logoSvgInline` is absent.
   */
  logoBgImgSrc?: string;

  /**
   * Image src for a standard <img> logo.
   * Used when both `logoSvgInline` and `logoBgImgSrc` are absent.
   */
  logoImgSrc?: string;

  /** Explicit logo width (px). Passed to the Image atom for img/bg variants. */
  width?: number;

  /** Explicit logo height (px). Passed to the Image atom for img/bg variants. */
  height?: number;

  /** Site name text. */
  siteName?: string;

  /** Hide the site name even when `siteName` is set. */
  hideSiteName?: boolean;

  /** Site slogan / tagline text. */
  siteSlogan?: string;

  /** Hide the site slogan even when `siteSlogan` is set. */
  hideSiteSlogan?: boolean;

  /**
   * Heading element used for the site name.
   * Defaults to `h1`. Pass `'span'` when nesting inside another heading.
   */
  nameElement?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p';

  /**
   * Link target attribute (e.g. `'_blank'`).
   * Defaults to `'_self'` when `url` is provided.
   */
  target?: string;

  /**
   * Pass `true` to preserve the SVG's original colours (disables currentColor
   * override). Only relevant when `logoSvgInline` is used.
   */
  colorOriginal?: boolean;

  /** Additional CSS class names appended to the root wrapper. */
  otherClasses?: string | string[];

  /** Additional inline styles on the root wrapper element. */
  otherStyles?: React.CSSProperties;
}

/**
 * Resolve the root wrapper class string.
 * Mirrors the Twig `branding_classes` merge + sort + trim.
 */
function buildWrapperClasses(
  logoSvgInline?: string,
  logoBgImgSrc?: string,
  otherClasses?: string | string[],
): string {
  const extras = otherClasses
    ? (Array.isArray(otherClasses) ? otherClasses : [otherClasses])
    : [];
  return cx(
    styles,
    'branding',
    logoSvgInline ? 'logo-type--svg' : logoBgImgSrc ? 'logo-type--bg' : null,
    ...extras.filter(Boolean),
  );
}

/**
 * Branding molecule component.
 *
 * Produces output identical to the Timberland Pattern Lab Twig template.
 */
export function Branding({
  url,
  logoSvgInline,
  logoBgImgSrc,
  logoImgSrc,
  width,
  height,
  siteName,
  hideSiteName = false,
  siteSlogan,
  hideSiteSlogan = false,
  nameElement: NameEl = 'h1',
  target,
  colorOriginal = false,
  otherClasses,
  otherStyles,
}: BrandingProps) {
  const altText = [siteName, siteSlogan].filter(Boolean).join(': ');
  const wrapperClass = buildWrapperClasses(logoSvgInline, logoBgImgSrc, otherClasses);

  // Link element is <a> when url is provided, <span> otherwise (mirrors Twig link_element)
  const LinkEl = url ? 'a' : 'span';

  const linkProps = url
    ? {
        href: url,
        title: siteName,
        rel: 'home' as const,
        target: target ?? '_self',
        'aria-label': siteName,
      }
    : {
        title: siteName,
        rel: 'home' as const,
        'aria-label': siteName,
      };

  // --- Logo content ---
  let logoContent: React.ReactNode = null;

  if (logoSvgInline) {
    // Inline SVG — mirrors @atoms/svg/_svg.tpl.twig
    const svgClass = cx(
      styles,
      'svg',
      'branding--logo-img',
      colorOriginal && 'svg--color-original',
    );
    logoContent = (
      <span
        className={svgClass}
        role="img"
        aria-label={altText}
        dangerouslySetInnerHTML={{ __html: logoSvgInline }}
      />
    );
  } else if (logoBgImgSrc) {
    // CSS background-image logo — Image atom variant="bg"
    logoContent = (
      <Image
        variant="bg"
        src={logoBgImgSrc}
        alt={altText}
        width={width}
        height={height}
        className={cx(styles, 'branding--logo-img')}
      />
    );
  } else if (logoImgSrc) {
    // Standard <img> logo — Image atom variant="primary"
    logoContent = (
      <Image
        variant="primary"
        src={logoImgSrc}
        alt={altText}
        width={width}
        height={height}
        className={cx(styles, 'branding--logo-img')}
      />
    );
  }

  return (
    <div
      className={wrapperClass}
      style={otherStyles}
      data-pattern="timberland/branding"
    >
      {/* Site logo */}
      <div className={cx(styles, 'branding--site-logo')}>
        <LinkEl {...(linkProps as any)}>
          {logoContent}
        </LinkEl>
      </div>

      {/* Site name */}
      {siteName && !hideSiteName && (
        <NameEl className={cx(styles, 'branding--site-name')}>
          <a title="Home" href={url} rel="home" aria-label={siteName}>
            {siteName}
          </a>
        </NameEl>
      )}

      {/* Site slogan */}
      {siteSlogan && !hideSiteSlogan && (
        <p className={cx(styles, 'lead', 'branding--site-slogan')}>
          {siteSlogan}
        </p>
      )}
    </div>
  );
}

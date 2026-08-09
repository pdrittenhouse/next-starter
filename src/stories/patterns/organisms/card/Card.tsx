import React from 'react';
import { Button } from '@/stories/patterns/atoms/button/Button';
import type { ButtonProps } from '@/stories/patterns/atoms/button/Button';
import { Image } from '@/stories/patterns/atoms/image/Image';
import type { ImageProps } from '@/stories/patterns/atoms/image/Image';
import { List } from '@/stories/patterns/molecules/list/List';
import type { ListProps } from '@/stories/patterns/molecules/list/List';
import styles from './card.module.scss';
import { cx } from '@/lib/cx';

// ─── Type exports ─────────────────────────────────────────────────────────────

export type CardBackground =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export type CardBorder =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export type CardTextColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'muted'
  | 'white';

export type CardWidth = 25 | 50 | 75;
export type CardImageLocation = 'top' | 'bottom';
export type CardTextAlignment = 'center' | 'start' | 'end' | 'justify';
export type CardLinkTarget = '_self' | '_blank' | '_parent' | '_top';

/**
 * Structured icon for the card header lead area.
 * For simple icon fonts or Bootstrap Icons, pass a class string directly to the `icon` prop.
 */
export interface CardIconProps {
  /** Icon class name or identifier (e.g. 'bi bi-star', 'fas fa-check'). */
  name: string;
  fill?: string;
  width?: number;
  height?: number;
  /** Additional CSS classes for the SVG wrapper span. */
  svgClasses?: string;
}

/**
 * Card organism props — mirrors all template variables from
 * `src/design-system/patterns/03-organisms/card/_card.tpl.twig`.
 */
export interface CardProps {
  // ─── Identity & element ────────────────────────────────────────────────────
  /** HTML id attribute for the card wrapper element. Maps to card_id in Twig. */
  id?: string;
  /**
   * HTML element tag for the card wrapper. Defaults to 'div'.
   * Ignored when `linked` is true — the wrapper becomes an `<a>` element.
   * Maps to card_element in Twig.
   */
  element?: 'div' | 'article' | 'section';
  /** data-pattern attribute value. Defaults to 'timberland/card'. Maps to card_pattern_slug in Twig. */
  patternSlug?: string;

  // ─── Layout ────────────────────────────────────────────────────────────────
  /** Card width as a Bootstrap w-{n} percentage: 25, 50, or 75. Maps to card_width in Twig. */
  width?: CardWidth;
  /**
   * Bootstrap col class(es) applied to the card wrapper (e.g. 'col-md-4').
   * Maps to card_cols in Twig.
   */
  cols?: string;

  // ─── Appearance ────────────────────────────────────────────────────────────
  /** Background color variant — adds bg-{color} Bootstrap class. Maps to card_background in Twig. */
  background?: CardBackground;
  /** Border color variant — adds border border-{color} Bootstrap classes. Maps to card_border in Twig. */
  border?: CardBorder;
  /** Text alignment — adds text-{alignment} Bootstrap class. Maps to text_alignment in Twig. */
  textAlignment?: CardTextAlignment;
  /** Text color variant — adds text-{color} Bootstrap class. Maps to text_color in Twig. */
  textColor?: CardTextColor;
  /** Remove card border. Adds no-border class. Maps to no_border in Twig. */
  noBorder?: boolean;
  /**
   * Reset label, title, subtitle, and text colors so they inherit from the parent element.
   * Adds text-reset to each of those elements. Maps to inherit_color in Twig.
   */
  inheritColor?: boolean;

  // ─── Background image ──────────────────────────────────────────────────────
  /**
   * CSS background-image URL applied as an inline style. Adds has-bg-img class.
   * For flip cards, applied to the front face; otherwise applied to the card wrapper.
   * Maps to background_image in Twig.
   */
  backgroundImage?: string;
  /** Additional inline styles applied to the card wrapper element. */
  cardCustomStyle?: React.CSSProperties;

  // ─── Header area ───────────────────────────────────────────────────────────
  /**
   * Icon rendered in the card header lead area.
   * - String: treated as an icon class string (e.g. 'bi bi-star', 'fas fa-check').
   *   Renders as `<span class="{icon}" />`.
   * - Object: structured icon with `name`, `fill`, `width`, `height`, `svgClasses`.
   *   Renders as an SVG colorable span wrapper.
   * Maps to card_icon in Twig.
   */
  icon?: CardIconProps | string;
  /**
   * Label / category text rendered inside the card header lead area.
   * Maps to card_label in Twig.
   */
  label?: string;
  /**
   * Header text rendered inside the .card-header div.
   * Acts as both a display string and a conditional flag to show .card-header.
   * Maps to card_header in Twig.
   */
  header?: string;
  /** Remove padding from the card header. Adds p-0 to .card-header. Maps to no_header_padding in Twig. */
  noHeaderPadding?: boolean;

  // ─── Card image ────────────────────────────────────────────────────────────
  /**
   * Image atom props. Rendered as card-img-top when imageLocation is 'top',
   * or card-img-bottom when imageLocation is 'bottom'. Maps to card_image in Twig.
   */
  image?: ImageProps;
  /**
   * Image position within the card. 'top' renders the image in the card header area;
   * 'bottom' renders it in the card footer area. Maps to card_image_location in Twig.
   */
  imageLocation?: CardImageLocation;
  /**
   * Overlay the card body content on top of the image (Bootstrap card-img-overlay).
   * Adds has-image-overlay class to the card wrapper. Maps to card_image_overlay in Twig.
   */
  imageOverlay?: boolean;
  /**
   * Text rendered as an overlay on the card image. Adds has-overlay-text class to the card wrapper.
   * When set without imageOverlay, renders an overlay div on the image.
   * Maps to card_image_overlay_text in Twig.
   */
  imageOverlayText?: string;

  // ─── Body content ──────────────────────────────────────────────────────────
  /** Card title rendered as <h4 class="card-title">. Maps to card_title in Twig. */
  title?: string;
  /** Card subtitle rendered as <h6 class="card-subtitle">. Maps to card_subtitle in Twig. */
  subtitle?: string;
  /** Card body text or rich content inside .card-text. Maps to card_text in Twig. */
  text?: React.ReactNode;
  /**
   * Remove padding from the card body area. Adds p-0 to .card-content, .card-intro, and .card-body.
   * Maps to no_body_padding in Twig.
   */
  noBodyPadding?: boolean;

  // ─── Link ──────────────────────────────────────────────────────────────────
  /**
   * URL for the card link. Used as the full card's href when `linked` is true,
   * or as an inline card-link anchor when `linked` is false. Maps to card_link in Twig.
   */
  link?: string;
  /**
   * Display text for the inline card-link anchor. Only rendered when `linked` is false.
   * Maps to card_link_text in Twig.
   */
  linkText?: string;
  /** Target attribute for the card link. Maps to card_link_target in Twig. */
  linkTarget?: CardLinkTarget;
  /**
   * Wrap the entire card in an `<a>` element, making the whole card clickable.
   * Sets card--linked class and adds aria-label with the card title. Maps to card_linked in Twig.
   */
  linked?: boolean;

  // ─── Composed atoms & molecules ────────────────────────────────────────────
  /** Button atom props rendered inside the card body. Maps to card_button in Twig. */
  button?: ButtonProps;
  /** List molecule props rendered inside the card body. Maps to card_list in Twig. */
  list?: ListProps;

  // ─── Footer ────────────────────────────────────────────────────────────────
  /** Card footer text or rich content inside .card-footer-content. Maps to card_footer in Twig. */
  footer?: React.ReactNode;
  /** Remove padding from the card footer. Adds p-0 to .card-footer. Maps to no_footer_padding in Twig. */
  noFooterPadding?: boolean;

  // ─── Flip card ─────────────────────────────────────────────────────────────
  /** Enable flip-card 3D structure with front and back faces. Adds flip-card class. Maps to flip_card in Twig. */
  flipCard?: boolean;
  /** Background image URL for the flip-card back face. Maps to back_background_image in Twig. */
  backBackgroundImage?: string;
  /** Content rendered inside .card-back-content on the flip-card back face. Maps to back block in Twig. */
  backContent?: React.ReactNode;

  // ─── Additional classes ────────────────────────────────────────────────────
  /** Additional CSS class names appended to the card wrapper. Maps to card_other_classes in Twig. */
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a sorted, space-joined class string via cx — mirrors the Twig `| sort | join | trim` chain.
 */
function buildClasses(parts: (string | null | undefined | false)[]): string {
  return cx(
    styles,
    ...parts
      .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      .sort(),
  );
}

/**
 * Render the icon markup for the card lead area.
 * Mirrors the two branches of the Twig card_icon block:
 *   - iterable/object  → SVG colorable span wrapper
 *   - string           → plain class span
 */
function renderIcon(icon: CardIconProps | string): React.ReactNode {
  if (typeof icon === 'string') {
    return <span className={icon} />;
  }
  const { name, fill, width, height, svgClasses } = icon;
  const cls = cx(styles, 'svg', 'svg--colorable', svgClasses);
  return (
    <span
      className={cls}
      style={{
        width: width != null ? `${width}px` : '1em',
        height: height != null ? `${height}px` : '1em',
        display: 'inline-block',
        ...(fill ? { fill } : {}),
      }}
      aria-hidden="true"
      data-icon={name}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Card organism — mirrors `src/design-system/patterns/03-organisms/card/_card.tpl.twig`.
 *
 * Produces the full Bootstrap 5 card HTML structure including:
 * - Card header with icon lead, label, header text, and top image
 * - Card content with title, subtitle, body text, inline link, Button atom, and List molecule
 * - Card footer with footer content and bottom image
 * - Full-card link wrapping (linked mode)
 * - Flip-card front/back faces with 3D transform support
 * - Background image, color variants, border variants, and width utilities
 */
export function Card({
  id,
  element = 'div',
  patternSlug = 'timberland/card',
  width,
  cols,
  background,
  border,
  textAlignment,
  textColor,
  noBorder = false,
  inheritColor = false,
  backgroundImage,
  cardCustomStyle,
  icon,
  label,
  header,
  noHeaderPadding = false,
  image,
  imageLocation,
  imageOverlay = false,
  imageOverlayText,
  title,
  subtitle,
  text,
  noBodyPadding = false,
  link,
  linkText,
  linkTarget,
  linked = false,
  button,
  list,
  footer,
  noFooterPadding = false,
  flipCard = false,
  backBackgroundImage,
  backContent,
  className,
}: CardProps) {
  // ─── Class building ─────────────────────────────────────────────────────────
  // Mirrors the Twig card_classes merge → sort → join → trim chain.
  const cardClasses = buildClasses([
    'card',
    width ? `w-${width}` : null,
    cols ?? null,
    textAlignment ? `text-${textAlignment}` : null,
    textColor ? `text-${textColor}` : null,
    background ? `bg-${background}` : null,
    border ? `border border-${border}` : null,
    linked ? 'card--linked' : null,
    imageOverlay ? 'has-image-overlay' : null,
    imageOverlayText ? 'has-overlay-text' : null,
    backgroundImage || backBackgroundImage ? 'has-bg-img' : null,
    flipCard ? 'flip-card' : null,
    image?.src ? 'has-img' : null,
    noBorder ? 'no-border' : null,
    className ?? null,
  ]);

  // ─── Inline styles ──────────────────────────────────────────────────────────
  // Non-flip: background image on the card wrapper itself.
  const cardStyle: React.CSSProperties = {
    ...((!flipCard && backgroundImage) ? { backgroundImage: `url('${backgroundImage}')` } : {}),
    ...(cardCustomStyle ?? {}),
  };

  // Flip front/back background images on their respective face divs.
  const frontStyle: React.CSSProperties =
    flipCard && backgroundImage
      ? { backgroundImage: `url('${backgroundImage}')` }
      : {};

  const backStyle: React.CSSProperties =
    flipCard && backBackgroundImage
      ? { backgroundImage: `url('${backBackgroundImage}')` }
      : {};

  // ─── Visibility flags ───────────────────────────────────────────────────────
  // Whether the icon resolves to a renderable value.
  const hasIcon = icon != null
    ? (typeof icon === 'string' ? icon.trim().length > 0 : !!icon.name)
    : false;

  // Show .card-header: icon, label, header text, or image at top position.
  const showHeader = !!(hasIcon || label || header || imageLocation === 'top');

  // Show .card-lead inside the header: icon or label.
  const showLead = !!(hasIcon || label);

  // Show .card-body: text content, button, list, or inline link (non-linked mode only).
  const showBody = !!(text || button || list || (link && !linked));

  // Show .card-footer: footer content or bottom image.
  const showFooter = !!(footer || (imageLocation === 'bottom' && image?.src));

  // ─── Shared wrapper attributes ──────────────────────────────────────────────
  // These are applied to both the <a> (linked) and the element wrapper (unlinked).
  const wrapperProps: React.HTMLAttributes<HTMLElement> & {
    'data-pattern': string;
    href?: string;
    target?: string;
    'aria-label'?: string;
  } = {
    'data-pattern': patternSlug,
    id: id ?? undefined,
    className: cardClasses,
    ...(Object.keys(cardStyle).length > 0 ? { style: cardStyle } : {}),
  };

  if (linked && link) {
    wrapperProps.href = link;
    if (linkTarget) wrapperProps.target = linkTarget;
    if (title) wrapperProps['aria-label'] = `Read more about ${title}`;
  }

  // ─── Core card content ─────────────────────────────────────────────────────
  const cardContent = (
    <div className={cx(styles, 'card-wrapper')}>
      {/* ── Front face ─────────────────────────────────────────────────────── */}
      <div
        className={cx(styles, 'front')}
        {...(Object.keys(frontStyle).length > 0 ? { style: frontStyle } : {})}
      >
        <div className={cx(styles, 'card-content-wrapper-outer')}>
          <div className={cx(styles, 'card-content-wrapper-inner')}>

            {/* ── card-header block ──────────────────────────────────────────── */}
            {showHeader && (
              <div className={cx(styles, 'card-header', noHeaderPadding ? 'p-0' : null)}>

                {/* card-lead: icon + label */}
                {showLead && (
                  <div className={cx(styles, 'card-lead')}>
                    {hasIcon && icon != null && (
                      <div className={cx(styles, 'card-icon')}>
                        {renderIcon(icon)}
                      </div>
                    )}
                    {label && (
                      <span className={cx(styles, 'card-label', inheritColor ? 'text-reset' : null)}>
                        {label}
                      </span>
                    )}
                  </div>
                )}

                {/* Optional header heading text */}
                {header && (
                  <div className={cx(styles, 'card-header-text')}>{header}</div>
                )}

                {/* Image at top position */}
                {imageLocation === 'top' && image && (
                  <div
                    className={cx(
                      styles,
                      'card-image',
                      !imageOverlay && imageOverlayText ? 'has-image-overlay' : null,
                    )}
                  >
                    <Image
                      {...image}
                      className={cx(styles, 'card-img-top', image.className)}
                    />
                    {!imageOverlay && imageOverlayText && (
                      <div className={cx(styles, 'card-img-overlay', 'card-img-overlay--text')}>
                        <p>{imageOverlayText}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── card-content ───────────────────────────────────────────────── */}
            <div
              className={cx(
                styles,
                'card-content',
                imageOverlay && !imageOverlayText ? 'card-img-overlay' : null,
                noBodyPadding ? 'p-0' : null,
              )}
            >
              {/* card-intro: title + subtitle */}
              {(title || subtitle) && (
                <div className={cx(styles, 'card-intro', noBodyPadding ? 'p-0' : null)}>
                  {title && (
                    <h4 className={cx(styles, 'card-title', inheritColor ? 'text-reset' : null)}>
                      {title}
                    </h4>
                  )}
                  {subtitle && (
                    <h6 className={cx(styles, 'card-subtitle', inheritColor ? 'text-reset' : null)}>
                      {subtitle}
                    </h6>
                  )}
                </div>
              )}

              {/* card-body: text, link, button, list */}
              {showBody && (
                <div className={cx(styles, 'card-body', noBodyPadding ? 'p-0' : null)}>

                  {/* body text */}
                  {text && (
                    <div className={cx(styles, 'card-text', inheritColor ? 'text-reset' : null)}>
                      {text}
                    </div>
                  )}

                  {/* inline link — only when the whole card is NOT linked */}
                  {link && !linked && (
                    <a
                      href={link}
                      className={cx(styles, 'card-link', inheritColor ? 'text-reset' : null)}
                      {...(linkTarget ? { target: linkTarget } : {})}
                    >
                      {linkText}
                    </a>
                  )}

                  {/* Button atom */}
                  {button && (
                    <Button
                      {...button}
                      className={cx(styles, inheritColor ? 'text-reset' : null, button.className ?? null) || undefined}
                    />
                  )}

                  {/* List molecule */}
                  {list && (
                    <List
                      {...list}
                      parentClasses={[
                        ...(list.parentClasses ?? []),
                        inheritColor ? 'text-reset' : null,
                      ].filter((c): c is string => typeof c === 'string' && c.length > 0)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* ── card-footer ────────────────────────────────────────────────── */}
            {showFooter && (
              <div className={cx(styles, 'card-footer', noFooterPadding ? 'p-0' : null)}>

                {footer && (
                  <div className={cx(styles, 'card-footer-content', inheritColor ? 'text-reset' : null)}>
                    {footer}
                  </div>
                )}

                {/* Image at bottom position */}
                {imageLocation === 'bottom' && image && (
                  <div className={cx(styles, 'card-image')}>
                    <Image
                      {...image}
                      className={cx(styles, 'card-img-bottom', image.className)}
                    />
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Flip card back face ────────────────────────────────────────────── */}
      {flipCard && (
        <div
          className={cx(styles, 'back')}
          {...(Object.keys(backStyle).length > 0 ? { style: backStyle } : {})}
        >
          <div className={cx(styles, 'card-content-wrapper-outer')}>
            <div className={cx(styles, 'card-content-wrapper-inner')}>
              <div className={cx(styles, 'card-back-content', inheritColor ? 'text-reset' : null)}>
                {backContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Linked card: wrap in <a> ────────────────────────────────────────────
  if (linked && link) {
    return (
      <a {...(wrapperProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {cardContent}
      </a>
    );
  }

  // ─── Standard card: use the specified element ────────────────────────────
  const Wrapper = element as React.ElementType;
  return (
    <Wrapper {...(wrapperProps as React.HTMLAttributes<HTMLElement>)}>
      {cardContent}
    </Wrapper>
  );
}

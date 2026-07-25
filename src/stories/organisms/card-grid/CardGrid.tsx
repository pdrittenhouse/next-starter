import React from 'react';
import { Image } from '@/stories/atoms/image/Image';
import { Button } from '@/stories/atoms/button/Button';
import type { ImageProps } from '@/stories/atoms/image/Image';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import styles from './card-grid.module.scss';

// ---------------------------------------------------------------------------
// Card sub-types
// ---------------------------------------------------------------------------

/**
 * Image data for a card — mirrors the `card_image` object in the Twig pattern.
 * Only `src` and `alt` are required.
 */
export interface CardImageProps {
  /** Image rendering variant passed to the Image atom. Defaults to 'primary'. */
  variant?: ImageProps['variant'];
  /** Image source URL. */
  src: string;
  /** Alt text — use empty string for purely decorative images. */
  alt: string;
  /** Explicit width in pixels (primary/picture) or aspect-ratio width unit. */
  width?: number;
  /** Explicit height in pixels. */
  height?: number;
  /** Responsive sizes attribute. */
  sizes?: string;
  /** Native lazy loading. Defaults to 'lazy'. */
  loading?: 'lazy' | 'eager';
  /** Additional CSS class names on the Image atom root element. */
  className?: string;
}

/**
 * Icon data for a card — mirrors the `card_icon` object.
 * Pass `className` for an icon font class (e.g. Bootstrap Icons: `'bi bi-star'`).
 */
export interface CardIconProps {
  /** Icon class string (e.g. `'bi bi-rocket'`). Renders a `<span class="card-icon-el">`. */
  className?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
}

// ---------------------------------------------------------------------------
// CardProps
// ---------------------------------------------------------------------------

/**
 * Card organism props — mirrors all variables documented in
 * `03-organisms/card/_card.tpl.twig`.
 */
export interface CardProps {
  // --- Element & width ---
  /** Semantic element for the card root. Defaults to 'div'. Overridden to 'a' when `card_linked` is true. */
  card_element?: 'div' | 'article' | 'section';
  /** Fixed percentage width: 25, 50, or 75. Omit to fill the parent grid cell. */
  card_width?: 25 | 50 | 75;

  // --- Color & border ---
  /** Bootstrap contextual color for the card background (e.g. `'primary'`, `'light'`). */
  card_background?: string;
  /** Bootstrap contextual color for the card border (e.g. `'secondary'`). */
  card_border?: string;
  /** Remove the card border entirely. */
  no_border?: boolean;
  /** Inherit color from the parent element (adds Bootstrap `text-reset`). */
  inherit_color?: boolean;

  // --- Text ---
  /** Bootstrap text-alignment utility suffix: `'start'`, `'center'`, or `'end'`. */
  text_alignment?: 'start' | 'center' | 'end';
  /** Bootstrap text-color utility suffix (e.g. `'muted'`, `'white'`). */
  text_color?: string;

  // --- Header slot ---
  /** Text rendered in `<div class="card-header">` above the image and body. */
  card_header?: string;
  /** Category label rendered in `<span class="card-label">` beside the icon. */
  card_label?: string;
  /** Icon object rendered in `<div class="card-icon">`. */
  card_icon?: CardIconProps;

  // --- Image ---
  /** Position of the card image: `'top'` (in header) or `'bottom'` (in footer). */
  card_image_location?: 'top' | 'bottom';
  /** Image data passed to the Image atom. */
  card_image?: CardImageProps;
  /** CSS background-image URL applied directly as `background-image` style. */
  background_image?: string;
  /** Overlay card body content on top of the image (Bootstrap `card-img-overlay`). */
  card_image_overlay?: boolean;
  /** Text rendered as `<p>` inside the image overlay band. */
  card_image_overlay_text?: string;

  // --- Body ---
  /** Card title rendered as `<h4 class="card-title">`. */
  card_title?: string;
  /** Card subtitle rendered as `<h6 class="card-subtitle">`. */
  card_subtitle?: string;
  /**
   * Card body copy. May contain HTML (e.g. WordPress rich-text output).
   * Rendered via `dangerouslySetInnerHTML`.
   */
  card_text?: string;
  /** Remove padding from the card body. */
  no_body_padding?: boolean;

  // --- CTA ---
  /** Props forwarded to the Button atom rendered inside the card body. */
  card_button?: ButtonProps;
  /** Make the entire card a link (`<a>` wrapper). Requires `card_link`. */
  card_linked?: boolean;
  /** Link URL used for both the full-card link (when `card_linked`) and the inline text link. */
  card_link?: string;
  /** Target attribute for the card link. Defaults to `'_self'`. */
  card_link_target?: '_self' | '_blank' | '_parent' | '_top';
  /** Visible text for the inline `<a class="card-link">` element. */
  card_link_text?: string;

  // --- Header / footer padding ---
  /** Remove padding from the card header. */
  no_header_padding?: boolean;
  /** Remove padding from the card footer. */
  no_footer_padding?: boolean;

  // --- Footer slot ---
  /**
   * Footer content. May contain HTML.
   * Rendered via `dangerouslySetInnerHTML` inside `<div class="card-footer-content">`.
   */
  card_footer?: string;

  // --- Flip card ---
  /** Enable 3-D flip-card behavior (adds `.flip-card` class and a `.back` face). */
  flip_card?: boolean;
  /** Back-face background-image URL (flip card only). */
  back_background_image?: string;

  // --- Misc ---
  /** HTML `id` attribute on the card root element. */
  card_id?: string;
  /** Additional CSS class names merged onto the card root element. */
  className?: string;
}

// ---------------------------------------------------------------------------
// CardGrid types
// ---------------------------------------------------------------------------

/** Layout strategy for the inner grid element. */
export type CardGridType = 'grid' | 'group' | 'deck' | 'row';

/**
 * CardGrid organism props — mirrors all variables documented in
 * `03-organisms/card-grid/_card-grid.tpl.twig`.
 */
export interface CardGridProps {
  /**
   * Grid layout type.
   * - `'grid'`  — custom flex-grid with `grid-cols-{n}` class (default)
   * - `'row'`   — Bootstrap `.row` + `row-cols-{n}`
   * - `'group'` — Bootstrap `.card-group`
   * - `'deck'`  — Bootstrap `.card-deck` (BS4 legacy; use `'grid'` for BS5)
   */
  type?: CardGridType;
  /** Optional `<h2>` heading rendered above the grid. */
  card_grid_title?: string;
  /** Number of columns (2–6). */
  columns?: 2 | 3 | 4 | 5 | 6;
  /**
   * Append invisible `<span class="placecard">` elements to fill the last
   * row in a flex-grid layout (prevents orphan cards from stretching).
   * Only meaningful for `type='grid'`.
   */
  placecard?: boolean;
  /** Lock the grid to a single horizontal row (adds `.single-row`). */
  singlerow?: boolean;
  /** Preserve the multi-column layout on mobile (adds `.mobile-columns`). */
  mobilecolumns?: boolean;
  /** Stagger cards vertically: `'left'` descends left→right, `'right'` ascends. */
  vertical_offset?: 'left' | 'right';
  /** Cards to render. Each item maps to a `CardProps` object. */
  cards?: CardProps[];
  /** Additional CSS class names merged onto the outer wrapper `<div>`. */
  className?: string;
  /** Additional CSS class names merged onto the inner grid `<div>`. */
  gridClassName?: string;
}

// ---------------------------------------------------------------------------
// Internal: Card
// ---------------------------------------------------------------------------

/**
 * Internal Card component — not exported from the barrel; use `CardGrid` as
 * the public API. Export `CardProps` is available for typing `cards` arrays.
 */
function Card({
  card_element = 'div',
  card_width,
  card_background,
  card_border,
  no_border = false,
  inherit_color = false,
  text_alignment,
  text_color,
  card_header,
  card_label,
  card_icon,
  card_image_location,
  card_image,
  background_image,
  card_image_overlay = false,
  card_image_overlay_text,
  card_title,
  card_subtitle,
  card_text,
  no_body_padding = false,
  card_button,
  card_linked = false,
  card_link,
  card_link_target = '_self',
  card_link_text,
  no_header_padding = false,
  no_footer_padding = false,
  card_footer,
  flip_card = false,
  back_background_image,
  card_id,
  className,
}: CardProps) {
  // --- Build card root class list (mirrors Twig card_classes) ---
  const cardClasses = [
    'card',
    card_width ? `w-${card_width}` : null,
    text_alignment ? `text-${text_alignment}` : null,
    text_color ? `text-${text_color}` : null,
    card_background ? `bg-${card_background}` : null,
    card_border ? `border border-${card_border}` : null,
    card_linked ? 'card--linked' : null,
    card_image_overlay ? 'has-image-overlay' : null,
    card_image_overlay_text ? 'has-overlay-text' : null,
    background_image || back_background_image ? 'has-bg-img' : null,
    flip_card ? 'flip-card' : null,
    card_image?.src ? 'has-img' : null,
    no_border ? 'no-border' : null,
    className || null,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  // --- Card root inline style ---
  const cardStyle: React.CSSProperties =
    !flip_card && background_image
      ? { backgroundImage: `url('${background_image}')` }
      : {};

  // --- Shared conditional flags ---
  const hasHeaderSlot =
    card_icon?.className || card_label || card_header || card_image_location === 'top';
  const hasFooterSlot =
    card_footer || (card_image_location === 'bottom' && card_image?.src);
  const hasBodySlot =
    card_text || card_button || (card_link && !card_linked);

  // --- Inner content tree ---
  const cardInner = (
    <div className="card-wrapper">
      {/* Front face */}
      <div
        className="front"
        style={
          flip_card && background_image
            ? { backgroundImage: `url('${background_image}')` }
            : undefined
        }
      >
        <div className="card-content-wrapper-outer">
          <div className="card-content-wrapper-inner">

            {/* Header slot */}
            {hasHeaderSlot && (
              <div
                className={[
                  'card-header',
                  no_header_padding ? 'p-0' : null,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {(card_icon?.className || card_label) && (
                  <div className="card-lead">
                    {card_icon?.className && (
                      <div className="card-icon">
                        <span
                          className={`card-icon-el ${card_icon.className}`}
                          aria-hidden={card_icon.ariaLabel ? undefined : 'true'}
                          aria-label={card_icon.ariaLabel}
                        />
                      </div>
                    )}
                    {card_label && (
                      <span
                        className={[
                          'card-label',
                          inherit_color ? 'text-reset' : null,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {card_label}
                      </span>
                    )}
                  </div>
                )}

                {/* Explicit card-header text */}
                {card_header && (
                  <div className="card-header-text">{card_header}</div>
                )}

                {/* Image — top position */}
                {card_image_location === 'top' && card_image?.src && (
                  <div
                    className={[
                      'card-image',
                      !card_image_overlay && card_image_overlay_text
                        ? 'has-image-overlay'
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <Image
                      variant={card_image.variant}
                      src={card_image.src}
                      alt={card_image.alt}
                      width={card_image.width}
                      height={card_image.height}
                      sizes={card_image.sizes}
                      loading={card_image.loading}
                      className={[
                        'card-img-top',
                        card_image.className,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                    {!card_image_overlay && card_image_overlay_text && (
                      <div className="card-img-overlay card-img-overlay--text">
                        <p>{card_image_overlay_text}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Card content (intro + body) */}
            <div
              className={[
                'card-content',
                card_image_overlay && !card_image_overlay_text
                  ? 'card-img-overlay'
                  : null,
                no_body_padding ? 'p-0' : null,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* Intro: title + subtitle */}
              {(card_title || card_subtitle) && (
                <div
                  className={[
                    'card-intro',
                    no_body_padding ? 'p-0' : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {card_title && (
                    <h4
                      className={[
                        'card-title',
                        inherit_color ? 'text-reset' : null,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {card_title}
                    </h4>
                  )}
                  {card_subtitle && (
                    <h6
                      className={[
                        'card-subtitle',
                        inherit_color ? 'text-reset' : null,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {card_subtitle}
                    </h6>
                  )}
                </div>
              )}

              {/* Body: text, link, button */}
              {hasBodySlot && (
                <div
                  className={[
                    'card-body',
                    no_body_padding ? 'p-0' : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {card_text && (
                    <div
                      className={[
                        'card-text',
                        text_color ? text_color : null,
                        inherit_color ? 'text-reset' : null,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      dangerouslySetInnerHTML={{ __html: card_text }}
                    />
                  )}

                  {/* Inline link (non-linked card) */}
                  {card_link && !card_linked && (
                    <a
                      href={card_link}
                      className={[
                        'card-link',
                        inherit_color ? 'text-reset' : null,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      target={card_link_target}
                    >
                      {card_link_text}
                    </a>
                  )}

                  {/* CTA button */}
                  {card_button && (
                    <Button
                      {...card_button}
                      className={[
                        inherit_color ? 'text-reset' : null,
                        card_button.className,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer slot */}
            {hasFooterSlot && (
              <div
                className={[
                  'card-footer',
                  no_footer_padding ? 'p-0' : null,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {card_footer && (
                  <div
                    className={[
                      'card-footer-content',
                      inherit_color ? 'text-reset' : null,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    dangerouslySetInnerHTML={{ __html: card_footer }}
                  />
                )}

                {/* Image — bottom position */}
                {card_image_location === 'bottom' && card_image?.src && (
                  <div className="card-image">
                    <Image
                      variant={card_image.variant}
                      src={card_image.src}
                      alt={card_image.alt}
                      width={card_image.width}
                      height={card_image.height}
                      sizes={card_image.sizes}
                      loading={card_image.loading}
                      className={[
                        'card-img-bottom',
                        card_image.className,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Back face (flip card only) */}
      {flip_card && (
        <div
          className="back"
          style={
            back_background_image
              ? { backgroundImage: `url('${back_background_image}')` }
              : undefined
          }
        >
          <div className="card-content-wrapper-outer">
            <div className="card-content-wrapper-inner">
              <div className={`card-back-content${inherit_color ? ' text-reset' : ''}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- Render as linked <a> or container element ---
  if (card_link && card_linked) {
    return (
      <a
        href={card_link}
        id={card_id}
        className={cardClasses}
        style={Object.keys(cardStyle).length ? cardStyle : undefined}
        target={card_link_target}
        data-pattern="timberland/card"
        aria-label={card_title ? `Read more about ${card_title}` : undefined}
      >
        {cardInner}
      </a>
    );
  }

  const Tag = card_element as React.ElementType;
  return (
    <Tag
      id={card_id}
      className={cardClasses}
      style={Object.keys(cardStyle).length ? cardStyle : undefined}
      data-pattern="timberland/card"
    >
      {cardInner}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// CardGrid
// ---------------------------------------------------------------------------

/**
 * CardGrid organism — mirrors `timberland/card-grid` from Pattern Lab.
 *
 * Produces the same HTML/class structure as the Twig template at:
 * `03-organisms/card-grid/_card-grid.tpl.twig`.
 *
 * Renders an array of `Card` organisms inside a responsive grid wrapper.
 * Four layout strategies are supported via the `type` prop: `'grid'`
 * (custom flex-grid), `'row'` (Bootstrap row/col), `'group'`, and `'deck'`.
 */
export function CardGrid({
  type = 'grid',
  card_grid_title,
  columns,
  placecard = false,
  singlerow = false,
  mobilecolumns = false,
  vertical_offset,
  cards = [],
  className,
  gridClassName,
}: CardGridProps) {
  // --- Outer wrapper classes (mirrors card_grid_classes in Twig) ---
  const wrapperClasses = [
    'card-grid-wrapper',
    className,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  // --- Inner grid classes (mirrors grid_classes in Twig) ---
  const gridClasses = [
    `card-${type}`,
    type === 'row' ? 'row' : null,
    columns && type === 'row' ? `row-cols-${columns}` : null,
    columns && type === 'grid' ? `grid-cols-${columns}` : null,
    columns && type === 'grid' && singlerow ? 'single-row' : null,
    columns && type === 'grid' && mobilecolumns ? 'mobile-columns' : null,
    vertical_offset === 'left' || vertical_offset === 'right'
      ? `vertical-offset vertical-offset-${vertical_offset}`
      : null,
    gridClassName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  // --- Placecard spans: fills orphan cells in the last flex row ---
  // Twig: {% for i in 1..columns - 2 %} — renders columns - 2 placecards.
  const placecardCount =
    placecard && columns && columns >= 2 ? columns - 2 : 0;

  return (
    <div
      className={wrapperClasses}
      data-pattern="timberland/card-grid"
    >
      {card_grid_title && (
        <h2 className="card-grid--title">{card_grid_title}</h2>
      )}

      <div className={gridClasses}>
        {cards.map((card, index) => (
          <Card key={card.card_id ?? index} {...card} />
        ))}
        {Array.from({ length: placecardCount }, (_, i) => (
          <span key={`placecard-${i}`} className="placecard" aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}

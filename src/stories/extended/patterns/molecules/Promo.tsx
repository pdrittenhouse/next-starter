import React from 'react';
import { Image } from '@/stories/atoms/image/Image';
import { Button } from '@/stories/atoms/button/Button';
import type { ImageProps } from '@/stories/atoms/image/Image';
import type { ButtonProps } from '@/stories/atoms/button/Button';

/**
 * A single promo panel — image, title, body text, and a button group.
 */
export interface PromoItem {
  /** Promo image. */
  image?: ImageProps;
  /** Panel heading. */
  title?: string;
  /** Body copy — rendered as raw HTML. */
  text?: string;
  /** Array of CTA buttons. */
  buttonGroup?: ButtonProps[];
}

/**
 * Props for the Promo molecule — mirrors the Twig pattern at
 * timberland-extended patterns/02-molecules/promo/_promo.tpl.twig.
 */
export interface PromoProps {
  /** First promo panel (always required for a 1-up or 2-up layout). */
  promo1: PromoItem;
  /** Second promo panel — when provided renders a 2-up side-by-side layout. */
  promo2?: PromoItem;
  /** Wrap in a Bootstrap container. */
  container?: boolean;
  /** Use container-fluid. */
  containerFluid?: boolean;
  /** Responsive breakpoint suffix for the container (e.g. 'lg'). */
  containerBreakpoint?: string;
  /** Add max-width class to a fluid container. */
  maxWidthFluidContainer?: boolean;
  /** Extra CSS class names on the root element. */
  className?: string;
}

function PromoPanel({ item, panelClass }: { item: PromoItem; panelClass: string }) {
  const hasContent = !!(item.title || item.text || item.buttonGroup?.length);
  return (
    <div className={panelClass}>
      {item.image && (
        <div className={`promo-image${item.image.src ? '' : ' hide-image'}`}>
          <Image {...item.image} />
        </div>
      )}
      {hasContent && (
        <div className="promo-content">
          {(item.title || item.text) && (
            <div className="promo-intro">
              {item.title && <h2 className="promo-title">{item.title}</h2>}
              {item.text && (
                // eslint-disable-next-line react/no-danger
                <div className="promo-text" dangerouslySetInnerHTML={{ __html: item.text }} />
              )}
            </div>
          )}
          {item.buttonGroup && item.buttonGroup.length > 0 && (
            <div className="promo-cta">
              <div className="button-group">
                {item.buttonGroup.map((btn, i) => (
                  <Button key={i} {...btn} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Promo molecule — 1-up or 2-up promotional panels with image, title,
 * body text, and button group.
 *
 * Mirrors the HTML/class structure of the timberland-extended Twig template.
 */
export const Promo = ({
  promo1,
  promo2,
  container = false,
  containerFluid = false,
  containerBreakpoint,
  maxWidthFluidContainer = false,
  className,
}: PromoProps) => {
  const breakpointSuffix = containerBreakpoint ? `-${containerBreakpoint}` : '';
  const containerClass = containerFluid
    ? `container-fluid${maxWidthFluidContainer ? ' max-width-fluid-container' : ''}`
    : `container${breakpointSuffix}`;

  const rootClasses = [
    'promo',
    promo2 ? 'promo--2-up' : 'promo--1-up',
    className,
  ].filter(Boolean).join(' ').trim();

  const inner = promo2 ? (
    <div className={rootClasses} data-pattern="timberland/promo">
      <div className={container || containerFluid ? containerClass : undefined}>
        <div className="row">
          <div className="col-md-6">
            <PromoPanel item={promo1} panelClass="promo-1" />
          </div>
          <div className="col-md-6">
            <PromoPanel item={promo2} panelClass="promo-2" />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className={rootClasses} data-pattern="timberland/promo">
      <div className={container || containerFluid ? containerClass : undefined}>
        <div className="row">
          <div className="col">
            <PromoPanel item={promo1} panelClass="promo-1" />
          </div>
        </div>
      </div>
    </div>
  );

  return inner;
};

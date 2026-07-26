import React from 'react';
import { Button } from '@/stories/atoms/button/Button';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import styles from './traveling-cta.module.scss';

/**
 * A single CTA button entry in the traveling CTA bar.
 *
 * Extends ButtonProps with display/styling fields that map to the
 * Twig per-CTA variable block (background_color, text_color, display, etc.).
 */
export interface TravelingCtaItem extends ButtonProps {
  /**
   * Inline styles computed from ACF field groups
   * (padding, border, border-radius, box-shadow, font-size, width, margin, etc.).
   * Twig: button_style_string → button_attributes style="…".
   */
  inlineStyle?: React.CSSProperties;
  /**
   * Bootstrap palette background class suffix.
   * Renders as `bg-{bgThemeColor}` on the button.
   * Twig: cta.background_color.bg_color == 'palette' ? 'bg-' ~ bg_theme_color.
   */
  bgThemeColor?: string;
  /**
   * Bootstrap palette text-color class suffix.
   * Renders as `text-{textThemeColor}` on the button.
   * Twig: cta.text_color.color == 'palette' ? 'text-' ~ theme_color.
   */
  textThemeColor?: string;
  /**
   * Display utility class applied when full_width (block) is false.
   * Twig: cta.display.display (e.g. 'd-flex').
   */
  display?: string;
}

/**
 * A single horizontal-alignment rule, optionally scoped to a breakpoint.
 * Twig: tcta_alignment.hor_align[n].{ breakpoint, alignment }.
 */
export interface TravelingCtaAlignment {
  /** Bootstrap breakpoint key (e.g. 'lg', 'xl'). Omit for all sizes. */
  breakpoint?: string;
  /** Flex alignment value (e.g. 'center', 'start', 'end', 'between', 'around'). */
  alignment: string;
}

/**
 * Props for the TravelingCta molecule — mirrors the Twig pattern at
 * patterns/02-molecules/traveling-cta/_traveling-cta.tpl.twig.
 *
 * All prop names are camelCase equivalents of the Twig template variables.
 */
export interface TravelingCtaProps {
  /**
   * Hide the bar on a specific context.
   * 'both' suppresses the entire component.
   * Twig: hide_traveling_cta.
   */
  hideOn?: 'mobile' | 'desktop' | 'both';
  /**
   * Wrap the CTA wrapper in a Bootstrap container + row.
   * Twig: include_tcta_container.
   */
  includeContainer?: boolean;
  /**
   * Use `container-fluid` instead of `container` when includeContainer is true.
   * Twig: tcta_full_width.
   */
  fullWidth?: boolean;
  /**
   * When true, buttons take their natural width.
   * When false (default), the `stretch-ctas` class is added, making buttons flex-grow.
   * Twig: tcta_auto_width.
   */
  autoWidth?: boolean;
  /**
   * Bootstrap palette background class suffix applied to the section element.
   * Renders as `bg-{bgThemeColor}`.
   * Twig: tcta_bg_color.bg_color == 'palette' ? 'bg-' ~ bg_theme_color.
   */
  bgThemeColor?: string;
  /**
   * Inline styles for the `<section>` element.
   * Covers: custom background-color, border-top width/style/color, border-radius top-left/right.
   * Twig: section_styles → style="…" on the section.
   */
  sectionStyle?: React.CSSProperties;
  /**
   * Inline styles for the CTA wrapper div.
   * Covers: padding top/bottom/left/right.
   * Twig: wrapper_styles → style="…" on the wrapper.
   */
  wrapperStyle?: React.CSSProperties;
  /**
   * Horizontal alignment rules, each optionally scoped to a breakpoint.
   * Renders as `justify-content[-bp]-{alignment}` utility classes on the ctas div.
   * Twig: tcta_alignment.hor_align.
   */
  alignment?: TravelingCtaAlignment[];
  /**
   * Reverse the order of CTA buttons.
   * Twig: tcta_reverse_order.
   */
  reverseOrder?: boolean;
  /**
   * Bootstrap container responsive breakpoint suffix.
   * E.g. 'lg' → `container-lg`.
   * Twig: container_breakpoint.
   */
  containerBreakpoint?: string;
  /**
   * Add `max-width-fluid-container` class when using a fluid container.
   * Twig: fields.max_width_fluid_container.
   */
  maxWidthFluidContainer?: boolean;
  /**
   * Array of CTA button configurations rendered inside the bar.
   * Twig: traveling_ctas.
   */
  travelingCtas?: TravelingCtaItem[];
  /** Extra CSS class names appended to the root section element. */
  className?: string;
}

/**
 * TravelingCta molecule — a fixed-position call-to-action bar that appears
 * when scrolling past the header.
 *
 * Produces identical HTML/class structure to the Pattern Lab Twig template.
 * Bootstrap JS is loaded globally — only `data-bs-*` attributes are needed here.
 */
export const TravelingCta = ({
  hideOn,
  includeContainer = false,
  fullWidth = false,
  autoWidth = false,
  bgThemeColor,
  sectionStyle,
  wrapperStyle,
  alignment,
  reverseOrder = false,
  containerBreakpoint,
  maxWidthFluidContainer = false,
  travelingCtas,
  className,
}: TravelingCtaProps) => {
  // Suppress the entire component when hideOn == 'both'
  if (hideOn === 'both') {
    return null;
  }

  // ── Section classes (mirrors Twig section_classes merge + sort + trim) ──────
  const sectionClasses = [
    'traveling-cta',
    bgThemeColor ? `bg-${bgThemeColor}` : null,
    !autoWidth ? 'stretch-ctas' : null,
    hideOn === 'mobile' ? 'd-none' : null,
    hideOn === 'mobile' ? 'd-lg-block' : null,
    hideOn === 'desktop' ? 'd-lg-none' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  // ── Horizontal alignment classes on the ctas div ─────────────────────────────
  // Mirrors Twig's horizontal_alignment loop: justify-content[-bp]-[alignment]
  const alignmentClasses = alignment
    ? alignment
        .map(({ breakpoint, alignment: align }) => {
          if (!align) return null;
          const bp = breakpoint ? `-${breakpoint}` : '';
          return `justify-content${bp}-${align}`;
        })
        .filter(Boolean)
        .join(' ')
    : '';

  // ── Wrapper classes ──────────────────────────────────────────────────────────
  const wrapperClasses = [
    'traveling-cta--ctas-wrapper',
    includeContainer ? 'col' : null,
  ]
    .filter(Boolean)
    .join(' ');

  // ── Container class (mirrors Twig container_breakpoint logic) ────────────────
  const breakpointSuffix = containerBreakpoint ? `-${containerBreakpoint}` : '';
  const containerClass = [
    fullWidth ? 'container-fluid' : `container${breakpointSuffix}`,
    fullWidth && maxWidthFluidContainer ? 'max-width-fluid-container' : null,
  ]
    .filter(Boolean)
    .join(' ');

  // ── CTA order ────────────────────────────────────────────────────────────────
  const ctasToRender = travelingCtas
    ? reverseOrder
      ? [...travelingCtas].reverse()
      : travelingCtas
    : [];

  // ── Inner content (wrapper + buttons) ────────────────────────────────────────
  const ctasContent = ctasToRender.length > 0 ? (
    <div className={wrapperClasses} {...(wrapperStyle ? { style: wrapperStyle } : {})}>
      <div
        className={
          ['traveling-cta--ctas', alignmentClasses]
            .filter(Boolean)
            .join(' ')
        }
      >
        {ctasToRender.map((cta, index) => {
          const {
            inlineStyle,
            bgThemeColor: ctaBgThemeColor,
            textThemeColor,
            display,
            block,
            className: ctaClassName,
            ...buttonProps
          } = cta;

          // Mirrors Twig button_classes array for each CTA
          const buttonClassName = [
            'traveling-cta--button',
            ctaBgThemeColor ? `bg-${ctaBgThemeColor}` : null,
            textThemeColor ? `text-${textThemeColor}` : null,
            !block && display ? display : null,
            ctaClassName ?? null,
          ]
            .filter(Boolean)
            .join(' ');

          // Style is passed through rest spread on the underlying Bootstrap Button.
          // The cast is required because ButtonProps does not extend HTMLAttributes.
          const extraStyle = inlineStyle ? ({ style: inlineStyle } as {}) : {};

          return (
            <Button
              key={index}
              {...buttonProps}
              block={block}
              className={buttonClassName}
              {...extraStyle}
            />
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <section
      className={sectionClasses}
      {...(sectionStyle ? { style: sectionStyle } : {})}
      data-pattern="timberland/traveling-cta"
    >
      {/* Border decoration spans — mirrors Twig traveling-cta--border block */}
      <div className="traveling-cta--border">
        <span className="bg bg1" />
        <span className="bg bg2" />
        <span className="bg bg3" />
        <span className="bg bg4" />
      </div>

      {includeContainer ? (
        <div className={containerClass}>
          <div className="row">{ctasContent}</div>
        </div>
      ) : (
        ctasContent
      )}
    </section>
  );
};

import type { ButtonProps, ButtonVariant } from '@/stories/atoms/button/Button';

const VALID_VARIANTS: ButtonVariant[] = [
  'primary', 'secondary', 'tertiary', 'quaternary', 'quinary', 'senary',
  'septenary', 'octonary', 'nonary', 'denary', 'success', 'info',
  'warning', 'danger', 'light', 'dark', 'link',
];

/**
 * Convert an ACF button module object (from WPGraphQL) to ButtonProps.
 *
 * @param cta        Raw ACF button data — must have a `link.url` to return props.
 * @param breakpoint Bootstrap responsive breakpoint used to build the visibility
 *                   class from `placement` ("mobile" | "desktop" | "both").
 *                   Pass the site's `navbarBreakpoint` value for header CTAs;
 *                   pass "xxl" for footer CTAs (matches the Twig template).
 * @param extraClasses  Additional class names prepended to className (e.g.
 *                   "header-cta-button", "mobile-cta", "footer-cta-button").
 */
export function acfButtonToProps(
  cta: any,
  breakpoint = 'lg',
  extraClasses: string[] = [],
): ButtonProps | undefined {
  if (!cta?.link?.url) return undefined;

  const rawVariant = Array.isArray(cta.style) ? cta.style[0] : cta.style;
  const variant: ButtonVariant = VALID_VARIANTS.includes(rawVariant as ButtonVariant)
    ? (rawVariant as ButtonVariant)
    : 'primary';

  const rawPlacement = Array.isArray(cta.placement) ? cta.placement[0] : cta.placement;
  const visibilityClass =
    rawPlacement === 'mobile'  ? `d-none d-${breakpoint}-flex` :
    rawPlacement === 'desktop' ? `d-${breakpoint}-none` :
    rawPlacement === 'both'    ? 'd-none' :
    undefined;

  const rawSize = cta.size as string | undefined;
  const size = rawSize === 'sm' || rawSize === 'lg' ? rawSize : undefined;

  const classes = [...extraClasses, visibilityClass].filter(Boolean);

  return {
    href: cta.link.url,
    label: cta.link.title || undefined,
    target: cta.link.target || undefined,
    variant,
    size,
    outline: cta.outline ?? false,
    disabled: cta.disabled ?? false,
    className: classes.length ? classes.join(' ') : undefined,
  };
}

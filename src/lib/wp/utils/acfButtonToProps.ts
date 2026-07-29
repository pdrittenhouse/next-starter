import type { ButtonProps, ButtonVariant, ButtonToggle } from '@/stories/atoms/button/Button';

const VALID_VARIANTS: ButtonVariant[] = [
  'default', 'primary', 'secondary', 'tertiary', 'quaternary', 'quinary', 'senary',
  'septenary', 'octonary', 'nonary', 'denary', 'success', 'info',
  'warning', 'danger', 'light', 'dark', 'link',
];

const VALID_TOGGLES: ButtonToggle[] = ['button', 'collapse', 'dropdown', 'modal', 'tab'];

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
    : 'default';

  const rawPlacement = Array.isArray(cta.placement) ? cta.placement[0] : cta.placement;
  const visibilityClass =
    rawPlacement === 'mobile'  ? `d-none d-${breakpoint}-flex` :
    rawPlacement === 'desktop' ? `d-${breakpoint}-none` :
    rawPlacement === 'both'    ? 'd-none' :
    undefined;

  const rawSize = cta.size as string | undefined;
  const size = rawSize === 'sm' || rawSize === 'lg' ? rawSize : undefined;

  // element: 'a' | 'button' — maps to the `as` prop on Button
  const rawElement = cta.element as string | undefined;
  const as: ButtonProps['as'] =
    rawElement === 'a' ? 'a' :
    rawElement === 'button' ? 'button' :
    undefined;

  // toggle: Bootstrap JS toggle type — maps to the `toggle` prop on Button
  const rawToggle = cta.toggle as string | undefined;
  const toggle: ButtonToggle | undefined = rawToggle && VALID_TOGGLES.includes(rawToggle as ButtonToggle)
    ? (rawToggle as ButtonToggle)
    : undefined;

  const classes = [...extraClasses, visibilityClass].filter(Boolean);

  return {
    href: cta.link.url,
    label: cta.link.title || undefined,
    target: cta.link.target || undefined,
    variant,
    size,
    outline: cta.outline ?? false,
    disabled: cta.disabled ?? false,
    ...(as !== undefined ? { as } : {}),
    ...(toggle !== undefined ? { toggle } : {}),
    className: classes.length ? classes.join(' ') : undefined,
  };
}

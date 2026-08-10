import React from 'react';
import { cache } from 'react';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { TravelingCta } from '@/stories/patterns/molecules/traveling-cta/TravelingCta';
import type { TravelingCtaItem } from '@/stories/patterns/molecules/traveling-cta/TravelingCta';
import { GET_TRAVELING_CTA_OPTIONS } from '@/lib/wp/queries/acf-options';

const VALID_VARIANTS = [
  'default', 'primary', 'secondary', 'tertiary', 'quaternary', 'quinary', 'senary',
  'septenary', 'octonary', 'nonary', 'denary', 'success', 'info',
  'warning', 'danger', 'light', 'dark', 'link',
];
const VALID_TOGGLES = ['button', 'collapse', 'dropdown', 'modal', 'tab'];

const getTravelingCtaOptions = cache(async () => {
  const { data } = await fetchGraphQL<any>(
    print(GET_TRAVELING_CTA_OPTIONS),
  ).catch(() => ({ data: null }));
  return (data as any)?.themeFooterOptions?.settingsFooterOptions ?? null;
});

export async function TravelingCtaPattern() {
  const opts = await getTravelingCtaOptions();
  if (!opts) return null;

  const rawHideOn = Array.isArray(opts.hideTravelingCta)
    ? opts.hideTravelingCta[0]
    : opts.hideTravelingCta;
  const hideOn =
    rawHideOn === 'both' || rawHideOn === 'desktop' || rawHideOn === 'mobile'
      ? (rawHideOn as 'both' | 'desktop' | 'mobile')
      : undefined;

  const tctaBgThemeColor =
    opts.tctaBgColor?.bgColor === 'palette' && opts.tctaBgColor?.bgThemeColor
      ? opts.tctaBgColor.bgThemeColor
      : undefined;

  const alignment = opts.tctaAlignment?.horAlign
    ?.map((a: any) => ({ breakpoint: a.breakpoint ?? undefined, alignment: a.alignment ?? 'center' }))
    ?.filter((a: any) => !!a.alignment) ?? undefined;

  const wrapperStyle: React.CSSProperties = {};
  if (opts.tctaPadding?.padding?.top != null) wrapperStyle.paddingTop = `${opts.tctaPadding.padding.top}px`;
  if (opts.tctaPadding?.padding?.bottom != null) wrapperStyle.paddingBottom = `${opts.tctaPadding.padding.bottom}px`;
  if (opts.tctaPadding?.padding?.left != null) wrapperStyle.paddingLeft = `${opts.tctaPadding.padding.left}px`;
  if (opts.tctaPadding?.padding?.right != null) wrapperStyle.paddingRight = `${opts.tctaPadding.padding.right}px`;

  const travelingCtas: TravelingCtaItem[] = (opts.travelingCtas ?? []).map((cta: any): TravelingCtaItem => {
    const rawVariant = Array.isArray(cta.style) ? cta.style[0] : cta.style;
    const variant = VALID_VARIANTS.includes(rawVariant) ? rawVariant : 'default';

    const rawToggle = Array.isArray(cta.toggle) ? cta.toggle[0] : cta.toggle;
    const toggle =
      rawToggle && VALID_TOGGLES.includes(rawToggle)
        ? (rawToggle as TravelingCtaItem['toggle'])
        : undefined;

    const displayClass = !cta.fullWidth && cta.display?.display ? cta.display.display : undefined;

    return {
      href: cta.link?.url || undefined,
      label: cta.link?.title || undefined,
      target: cta.link?.target || undefined,
      variant,
      size: cta.size || undefined,
      outline: cta.outline ?? false,
      block: cta.fullWidth ?? false,
      active: cta.active ?? false,
      disabled: cta.disabled ?? false,
      as: cta.element === 'a' || cta.element === 'button' ? cta.element : undefined,
      toggle,
      hideLabel: cta.hideLabel ?? false,
      display: displayClass,
      className: cta.classes || undefined,
    };
  });

  return (
    <TravelingCta
      hideOn={hideOn}
      autoWidth={opts.tctaAutoWidth ?? false}
      includeContainer={opts.includeTctaContainer ?? false}
      fullWidth={opts.tctaFullWidth ?? false}
      reverseOrder={opts.tctaReverseOrder ?? false}
      bgThemeColor={tctaBgThemeColor}
      alignment={alignment?.length ? alignment : undefined}
      wrapperStyle={Object.keys(wrapperStyle).length ? wrapperStyle : undefined}
      travelingCtas={travelingCtas}
    />
  );
}

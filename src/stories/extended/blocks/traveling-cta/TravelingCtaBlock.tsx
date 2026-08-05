import { TravelingCta } from '@/stories/molecules/traveling-cta/TravelingCta';
import type { TravelingCtaItem, TravelingCtaAlignment } from '@/stories/molecules/traveling-cta/TravelingCta';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';

const VALID_VARIANTS = [
  'default', 'primary', 'secondary', 'tertiary', 'quaternary', 'quinary', 'senary',
  'septenary', 'octonary', 'nonary', 'denary', 'success', 'info',
  'warning', 'danger', 'light', 'dark', 'link',
];
const VALID_TOGGLES = ['button', 'collapse', 'dropdown', 'modal', 'tab'];

interface CtaClone {
  link?: { url?: string | null; title?: string | null; target?: string | null } | null;
  style?: string | string[] | null;
  size?: string | null;
  outline?: boolean;
  active?: boolean;
  disabled?: boolean;
  element?: string | null;
  toggle?: string | string[] | null;
  hideLabel?: boolean;
  fullWidth?: boolean;
  display?: { display?: string | null } | null;
  classes?: string | null;
  background_color?: { bg_color?: string | null; bg_theme_color?: string | null; bg_custom_color?: string | null } | null;
  text_color?: { color?: string | null; theme_color?: string | null } | null;
}

interface TravelingCtaBlockData {
  hide_traveling_cta?: string | null;
  include_tcta_container?: boolean;
  tcta_full_width?: boolean;
  max_width_fluid_container?: boolean;
  container_breakpoint?: { breakpoint?: string | null } | null;
  tcta_reverse_order?: boolean;
  tcta_auto_width?: boolean;
  tcta_bg_color?: { bg_color?: string | null; bg_theme_color?: string | null; bg_custom_color?: string | null } | null;
  tcta_alignment?: { hor_align?: Array<{ breakpoint?: string | null; alignment?: string | null }> | null } | null;
  traveling_ctas?: Array<{ cta?: CtaClone | null }> | null;
}

function mapCtaItem(raw: CtaClone | null | undefined): TravelingCtaItem | null {
  if (!raw) return null;

  const rawVariant = Array.isArray(raw.style) ? raw.style[0] : raw.style;
  const variant = VALID_VARIANTS.includes(rawVariant ?? '') ? (rawVariant as string) : 'default';

  const rawToggle = Array.isArray(raw.toggle) ? raw.toggle[0] : raw.toggle;
  const toggle =
    rawToggle && VALID_TOGGLES.includes(rawToggle)
      ? (rawToggle as TravelingCtaItem['toggle'])
      : undefined;

  const displayClass = !raw.fullWidth && raw.display?.display ? raw.display.display : undefined;
  const bgThemeColor =
    raw.background_color?.bg_color === 'palette' && raw.background_color.bg_theme_color
      ? raw.background_color.bg_theme_color
      : undefined;
  const textThemeColor =
    raw.text_color?.color === 'palette' && raw.text_color.theme_color
      ? raw.text_color.theme_color
      : undefined;

  return {
    href: raw.link?.url ?? undefined,
    label: raw.link?.title ?? undefined,
    target: raw.link?.target ?? undefined,
    variant: variant as TravelingCtaItem['variant'],
    size: raw.size as TravelingCtaItem['size'],
    outline: raw.outline ?? false,
    block: raw.fullWidth ?? false,
    active: raw.active ?? false,
    disabled: raw.disabled ?? false,
    as: raw.element === 'a' || raw.element === 'button' ? raw.element : undefined,
    toggle,
    hideLabel: raw.hideLabel ?? false,
    display: displayClass,
    bgThemeColor,
    textThemeColor,
    className: raw.classes ?? undefined,
  };
}

export async function TravelingCtaBlock({ block }: { block: EditorBlock }) {
  const attrs = parseBlockAttributes(block) as { data?: TravelingCtaBlockData; className?: string };
  const data: TravelingCtaBlockData = attrs?.data ?? {};

  if (!data.traveling_ctas?.length) {
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />;
  }

  const rawHideOn = data.hide_traveling_cta;
  const hideOn =
    rawHideOn === 'both' || rawHideOn === 'desktop' || rawHideOn === 'mobile'
      ? (rawHideOn as 'both' | 'desktop' | 'mobile')
      : undefined;

  const travelingCtas: TravelingCtaItem[] = (data.traveling_ctas ?? [])
    .map((entry) => mapCtaItem(entry.cta))
    .filter((item): item is TravelingCtaItem => item !== null);

  const alignment: TravelingCtaAlignment[] | undefined = data.tcta_alignment?.hor_align
    ?.map((a) => ({ breakpoint: a.breakpoint ?? undefined, alignment: a.alignment ?? 'center' }));

  const bgThemeColor =
    data.tcta_bg_color?.bg_color === 'palette' && data.tcta_bg_color.bg_theme_color
      ? data.tcta_bg_color.bg_theme_color
      : undefined;

  return (
    <TravelingCta
      hideOn={hideOn}
      includeContainer={data.include_tcta_container}
      fullWidth={data.tcta_full_width}
      autoWidth={data.tcta_auto_width}
      bgThemeColor={bgThemeColor}
      alignment={alignment}
      reverseOrder={data.tcta_reverse_order}
      containerBreakpoint={data.container_breakpoint?.breakpoint ?? undefined}
      maxWidthFluidContainer={data.max_width_fluid_container}
      travelingCtas={travelingCtas}
    />
  );
}

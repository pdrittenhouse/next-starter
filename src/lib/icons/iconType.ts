/**
 * Icon type classification — mirrors the regex-based routing in
 * src/design-system/patterns/01-atoms/svg/_svg~link.tpl.twig.
 *
 * WP routes icon strings to four renderers based on pattern:
 *   Font Awesome  → <i class="fas fa-…"> replaced by dom.watch()
 *   Phosphor      → <i class="ph-bold ph-…"> replaced by PhosphorLibrary.watch()
 *   Bootstrap Icons → <i class="bi bi-…"> replaced by BootstrapIconsLibrary.watch()
 *   Custom        → <svg><use href="#sprite-{name}"> via inline spritemap
 */

export type IconType = 'fa' | 'phosphor' | 'bi' | 'custom';

export interface IconInfo {
  type: IconType;
  /** For custom icons: the spritemap slug (e.g. 'facebook', 'close', 'arrow-down'). */
  name?: string;
}

const FA_REGEX = /(fa[bdlrs] fa)/;
const PHOSPHOR_REGEX = /^(ph|ph-(bold|thin|light|fill|duotone)) ph-/;
const BI_REGEX = /\bbi\b/;

export function classifyIcon(icon: string): IconInfo {
  if (FA_REGEX.test(icon)) return { type: 'fa' };
  if (PHOSPHOR_REGEX.test(icon)) return { type: 'phosphor' };
  if (BI_REGEX.test(icon)) return { type: 'bi' };
  return { type: 'custom', name: icon };
}

export function isFontAwesome(icon: string): boolean { return FA_REGEX.test(icon); }
export function isPhosphor(icon: string): boolean { return PHOSPHOR_REGEX.test(icon); }
export function isBootstrapIcon(icon: string): boolean { return BI_REGEX.test(icon); }
export function isCustomIcon(icon: string): boolean {
  return !FA_REGEX.test(icon) && !PHOSPHOR_REGEX.test(icon) && !BI_REGEX.test(icon);
}

/**
 * Read the ACF button icon groups (`icon_left` / `icon_right`) off a button module (H5).
 *
 * Why this is not a simple property read
 * --------------------------------------
 * `icon_left` and `icon_right` are ACF **clones** declared `display: group` with
 * `prefix_name: 1`. That combination stores FLAT, prefixed keys but ACF's render API returns
 * them NESTED — so the Twig side reads `btn.icon_left.fa_icon_style` while what actually
 * reaches `attributesJSON` is `icon_left_fa_icon_style`. Verified against stored content on
 * this install rather than inferred:
 *
 *   icon_left_type                     = "custom"
 *   icon_left_icon                     = "arrow-up"
 *   icon_left_icon_color_color         = "palette"
 *   icon_left_icon_color_theme_color   = { name, slug, color, text, background }
 *   icon_left_size, icon_left_vertical_offset, icon_left_horizontal_offset
 *   icon_left                          = ""          <- the group key itself is EMPTY
 *
 * Reading only the nested form therefore yields `undefined` silently, which is the same class
 * of bug that had seventeen call sites wrong elsewhere in this project. Both shapes are
 * accepted here, flat first, because flat is what the block editor actually writes.
 *
 * Note `icon_color_theme_color` is an OBJECT, not a colour string — its `.slug` is the design
 * token name, which becomes `var(--slug)`.
 */

/** One resolved icon, normalised out of whichever storage shape was used. */
export interface ButtonIconData {
  /** Which icon system. Only 'custom' and 'font-awesome' are rendered — see ButtonIcon. */
  type?: 'custom' | 'font-awesome' | 'phosphor' | 'bootstrap-icons' | null;
  /** Spritemap slug, for `type: 'custom'`. */
  icon?: string | null;
  /** FA style prefix: 'fas' | 'far' | 'fab'. */
  faIconStyle?: string | null;
  /** FA icon class, e.g. 'fa-arrow-right'. */
  faIcon?: string | null;
  /** Phosphor / Bootstrap names, carried through but not rendered (see ButtonIcon). */
  phIcon?: string | null;
  phWeight?: string | null;
  biIcon?: string | null;
  /** Pixel size — font-size for icon fonts, width/height for a custom SVG. */
  size?: number | string | null;
  /** Resolved CSS colour: `var(--token)` for a palette pick, the raw value for custom. */
  color?: string | null;
  /** Offsets in px, applied as a transform. */
  horizontalOffset?: number | string | null;
  verticalOffset?: number | string | null;
}

/** Anything carrying the flat or nested icon keys — a button module object. */
type IconCarrier = Record<string, unknown> | null | undefined;

function pick(src: IconCarrier, side: 'left' | 'right', key: string): unknown {
  if (!src) return undefined;
  const flat = (src as Record<string, unknown>)[`icon_${side}_${key}`];
  if (flat !== undefined && flat !== '') return flat;
  const group = (src as Record<string, unknown>)[`icon_${side}`];
  if (group && typeof group === 'object') {
    const v = (group as Record<string, unknown>)[key];
    if (v !== undefined && v !== '') return v;
  }
  return undefined;
}

const str = (v: unknown): string | null =>
  typeof v === 'string' && v !== '' ? v : typeof v === 'number' ? String(v) : null;

/**
 * Resolve the colour for one side.
 *
 * `palette` -> `var(--<slug>)`, matching the Twig
 * (`'color: var(--' ~ theme_color ~ ')'`). The stored `theme_color` is an object, so its
 * `.slug` is used; a bare string is also accepted, since an older row may hold one.
 */
function resolveColor(src: IconCarrier, side: 'left' | 'right'): string | null {
  // `icon_color` is itself a group, so it arrives either flattened
  // (`icon_left_icon_color_color`) or as a nested object (`icon_left.icon_color.color`).
  // Reading only the flattened keys returns null on the nested shape -- caught by exercising
  // both forms rather than by inspection.
  const nested = pick(src, side, 'icon_color');
  const sub = (key: string): unknown => {
    const flat = pick(src, side, `icon_color_${key}`);
    if (flat !== undefined && flat !== '') return flat;
    if (nested && typeof nested === 'object') {
      const v = (nested as Record<string, unknown>)[key];
      if (v !== undefined && v !== '') return v;
    }
    return undefined;
  };

  const mode = str(sub('color'));
  if (mode === 'palette') {
    // Stored as an object whose `.slug` is the design token; an older row may hold a bare
    // string instead, so both are accepted.
    const theme = sub('theme_color');
    const slug = theme && typeof theme === 'object'
      ? str((theme as Record<string, unknown>).slug)
      : str(theme);
    return slug ? `var(--${slug})` : null;
  }
  if (mode === 'custom') {
    return str(sub('custom_color'));
  }
  return null;
}

/**
 * @param src  The button module object (ACF `button` group), as parsed from attributesJSON.
 * @param side Which icon to read.
 * @returns    The icon, or undefined when `show_{side}_icon` is falsy or nothing resolves.
 */
export function resolveButtonIcon(
  src: IconCarrier,
  side: 'left' | 'right',
): ButtonIconData | undefined {
  if (!src) return undefined;

  // ACF true_false arrives as "1"/"0" through attributesJSON, not a boolean.
  const show = (src as Record<string, unknown>)[`show_${side}_icon`];
  if (show !== true && show !== 1 && show !== '1') return undefined;

  const data: ButtonIconData = {
    type: (str(pick(src, side, 'type')) as ButtonIconData['type']) ?? null,
    icon: str(pick(src, side, 'icon')),
    faIconStyle: str(pick(src, side, 'fa_icon_style')),
    faIcon: str(pick(src, side, 'fa_icon')),
    phIcon: str(pick(src, side, 'ph_icon')),
    phWeight: str(pick(src, side, 'ph_weight')),
    biIcon: str(pick(src, side, 'bi_icon')),
    size: str(pick(src, side, 'size')),
    color: resolveColor(src, side),
    horizontalOffset: str(pick(src, side, 'horizontal_offset')),
    verticalOffset: str(pick(src, side, 'vertical_offset')),
  };

  // `show_*_icon` true with nothing selected is a real editor state; render nothing rather
  // than an empty <span class="icon">, which would still take up layout.
  const hasSomething = data.icon || data.faIcon || data.phIcon || data.biIcon;
  return hasSomething ? data : undefined;
}

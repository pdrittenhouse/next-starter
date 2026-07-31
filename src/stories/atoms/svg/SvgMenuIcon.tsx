import React from 'react';
import { SvgIcon } from './SvgIcon';

/**
 * SvgMenuIcon atom — mirrors _svg~menu-icon.tpl.twig in the Timberland framework.
 *
 * Renders a nav menu item icon. The `iconData.type` field selects the renderer:
 *   'custom'          → <SvgIcon name="{custom}"> via inline spritemap
 *   'font-awesome'    → <i class="{fa_style} fa-{fa_icon}">
 *   'phosphor'        → <i class="{ph_weight} ph-{ph_icon}">
 *   'bootstrap-icons' → <i class="bi bi-{bi_icon}">
 *
 * The `h_offset` / `v_offset` props apply a CSS transform, matching
 * the Twig inline-style offset injection.
 */

export interface MenuIconData {
  /** Whether to render the icon at all. */
  enabled: boolean;
  /** Which icon system to use. */
  type: 'custom' | 'font-awesome' | 'phosphor' | 'bootstrap-icons';
  /** Spritemap slug for type 'custom' (e.g. 'close', 'facebook'). */
  custom?: string;
  /** Icon name (without fa- prefix) for type 'font-awesome'. */
  fa_icon?: string;
  /** FA style prefix (e.g. 'fas', 'fab', 'far'). */
  fa_style?: string;
  /** Icon name (without ph- prefix) for type 'phosphor'. */
  ph_icon?: string;
  /** Phosphor weight prefix (e.g. 'ph-bold', 'ph-fill', 'ph'). */
  ph_weight?: string;
  /** Icon name (without bi- prefix) for type 'bootstrap-icons'. */
  bi_icon?: string;
  /** Bootstrap color token (e.g. 'primary'). */
  fill?: string;
  /** CSS width value (e.g. '1.25rem'). */
  width?: string;
  /** CSS height value. */
  height?: string;
  /** Horizontal translate offset in pixels. */
  h_offset?: number;
  /** Vertical translate offset in pixels. */
  v_offset?: number;
}

export interface SvgMenuIconProps {
  iconData: MenuIconData;
}

export function SvgMenuIcon({ iconData }: SvgMenuIconProps) {
  if (!iconData?.enabled) return null;

  const { type, custom, fa_icon, fa_style, ph_icon, ph_weight, bi_icon, fill, width, height, h_offset, v_offset } = iconData;

  const hasOffset = (h_offset && h_offset !== 0) || (v_offset && v_offset !== 0);
  const offsetStyle: React.CSSProperties | undefined = hasOffset
    ? { transform: `translate(${h_offset ?? 0}px, ${v_offset ?? 0}px)` }
    : undefined;

  if (type === 'custom' && custom) {
    return <SvgIcon name={custom} fill={fill} width={width} height={height} className="menu-icon" />;
  }

  if (type === 'font-awesome' && fa_icon) {
    const cls = [fa_style ?? 'fas', `fa-${fa_icon}`, fill ? `color-fill--${fill}` : null]
      .filter(Boolean).join(' ');
    return (
      <span className="menu-icon" style={offsetStyle}>
        <i className={cls} aria-hidden="true" />
      </span>
    );
  }

  if (type === 'phosphor' && ph_icon) {
    const cls = [ph_weight ?? 'ph', `ph-${ph_icon}`, fill ? `text-${fill}` : null]
      .filter(Boolean).join(' ');
    return (
      <span className="menu-icon" style={offsetStyle}>
        <i className={cls} aria-hidden="true" />
      </span>
    );
  }

  if (type === 'bootstrap-icons' && bi_icon) {
    const cls = ['bi', `bi-${bi_icon}`, fill ? `text-${fill}` : null]
      .filter(Boolean).join(' ');
    return (
      <span className="menu-icon" style={offsetStyle}>
        <i className={cls} aria-hidden="true" />
      </span>
    );
  }

  return null;
}

import React from 'react';
import styles from './social-nav.module.scss';
import { cx } from '@/lib/cx';
import { isFontAwesome, isBootstrapIcon, isCustomIcon } from '@/lib/icons/iconType';
import { SvgIcon } from '@/stories/patterns/atoms/svg/SvgIcon';

/**
 * Render the icon element for a social nav item.
 *
 * - Font Awesome  → <span class="icon"><i class="fas fa-… color-fill--{color}">
 * - Bootstrap Icons → <span class="icon"><i class="bi bi-… text-{color}">
 * - Custom (spritemap) → <SvgIcon name={icon} fill={color} />
 */
function renderIconNode(
  icon: string,
  color?: string,
  size?: string,
): React.ReactNode {
  const spanStyle: React.CSSProperties | undefined = size
    ? { fontSize: size }
    : undefined;

  if (isFontAwesome(icon)) {
    const iconCls = cx(styles, icon, color ? `color-fill--${color}` : null);
    return (
      <span className={cx(styles, 'icon')} style={spanStyle}>
        <i className={iconCls} aria-hidden="true" />
      </span>
    );
  }

  if (isBootstrapIcon(icon)) {
    const iconCls = cx(styles, icon, color ? `text-${color}` : null);
    return (
      <span className={cx(styles, 'icon')} style={spanStyle}>
        <i className={iconCls} aria-hidden="true" />
      </span>
    );
  }

  if (isCustomIcon(icon)) {
    const px = size ?? '18px';
    return <SvgIcon name={icon} fill={color} width={px} height={px} />;
  }

  return null;
}

// ─── Public types ─────────────────────────────────────────────────────────────

/**
 * A single social navigation link.
 * Mirrors the Twig `social_nav_items` item variables.
 */
export interface SocialNavItem {
  /** Link URL. */
  url: string;
  /** Visible label text. Used as the `aria-label`/`title` fallback when `title` is absent. */
  label: string;
  /** `title` attribute for the `<a>` element. Defaults to `label`. */
  title?: string;
  /** Link target. Defaults to `'_self'`. Use `'_blank'` for external social networks. */
  target?: string;
  /**
   * Icon class string.
   * - Bootstrap Icons: `'bi bi-facebook'`, `'bi bi-twitter-x'`, `'bi bi-instagram'`
   * - Font Awesome:    `'fab fa-facebook'`, `'fas fa-share'`
   * - SVG token:       any other string — renders a styled placeholder span
   */
  icon?: string;
  /**
   * Icon color token.
   * - Bootstrap Icons / SVG: maps to `text-{color}` Bootstrap utility.
   * - Font Awesome:          maps to `color-fill--{color}` theme utility.
   */
  iconColor?: string;
  /**
   * Per-item icon position (`'before'` | `'after'`).
   * Overridden by the parent `bulletIconPosition` when that prop is set.
   */
  iconPosition?: 'before' | 'after';
  /** Additional CSS class names for the item `<span>` wrapper (array). */
  itemClasses?: string[];
  /** Additional CSS class string for the item `<span>` wrapper. */
  itemOtherClasses?: string;
}

/**
 * Props for the SocialNav organism.
 * Mirrors the Twig `social-nav` pattern variables.
 */
export interface SocialNavProps {
  /** Social link items. */
  items?: SocialNavItem[];
  /**
   * Layout direction.
   * - `'horizontal'` — flex row (default)
   * - `'vertical'`   — stacked column
   * @default 'horizontal'
   */
  navDirection?: 'horizontal' | 'vertical';
  /**
   * Hide visible label text (icon-only mode).
   * Labels remain accessible via `aria-label` and `title` on the anchor.
   * Adds `hide-labels` CSS class.
   */
  hideLabels?: boolean;
  /**
   * Hide all icons (text-only mode).
   * Adds `hide-icons` CSS class.
   */
  hideIcons?: boolean;
  /**
   * Enable per-icon custom color tokens via `iconColor`.
   * Adds `custom-colors` CSS class, which disables the default uniform icon color.
   */
  customColors?: boolean;
  /**
   * Global icon position for all items.
   * Overrides per-item `iconPosition`.
   * @default 'before'
   */
  bulletIconPosition?: 'before' | 'after';
  /**
   * Global icon size as a CSS value (e.g. `'1.5rem'`, `'24px'`).
   * Sets `font-size` on icon `<span>` elements, and `padding-top` / `min-width`
   * on the anchor — mirroring the Twig inline-style injection.
   */
  bulletIconSize?: string;
  /** HTML `id` attribute for the nav container. */
  navId?: string;
  /** Additional CSS class names for the container (array). */
  navClasses?: string[];
  /** Additional CSS class string for the container. */
  otherClasses?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SocialNav organism — mirrors `timberland/social-nav`.
 *
 * Renders a horizontal or vertical list of social media icon links. Each item
 * shows a Bootstrap Icon (`bi bi-*`) or Font Awesome (`fab fa-*`) icon alongside
 * its label, with individual ARIA accessibility attributes on every anchor.
 *
 * HTML structure mirrors the Twig pattern rendered via `@molecules/list`:
 * - Outer `<div>` receives sorted class string: `social-nav nav-direction-{dir}
 *   bullet-icons bullet-icons--before|after list list-type--unordered …`
 * - Each item is a `<span class="list-item social-nav-item list-item--item-{n}">`.
 * - Icon rendered before or after an `<a class="social-nav-link">`.
 *
 * @example
 * ```tsx
 * <SocialNav
 *   navDirection="horizontal"
 *   hideLabels
 *   bulletIconSize="1.5rem"
 *   items={[
 *     { url: 'https://twitter.com', label: 'Twitter', icon: 'bi bi-twitter-x', target: '_blank' },
 *     { url: 'https://facebook.com', label: 'Facebook', icon: 'bi bi-facebook', target: '_blank' },
 *   ]}
 * />
 * ```
 */
export function SocialNav({
  items = [],
  navDirection = 'horizontal',
  hideLabels = false,
  hideIcons = false,
  customColors = false,
  bulletIconPosition = 'before',
  bulletIconSize,
  navId,
  navClasses = [],
  otherClasses,
}: SocialNavProps) {
  const showIcons = !hideIcons;

  // Mirror Twig: merge all classes → sort → join → trim
  const containerCls = cx(
    styles,
    'social-nav',
    hideLabels ? 'hide-labels' : null,
    hideIcons ? 'hide-icons' : null,
    `nav-direction-${navDirection}`,
    customColors ? 'custom-colors' : null,
    // Classes added by the @molecules/list include
    'list',
    'list-type--unordered',
    showIcons ? 'bullet-icons' : null,
    showIcons && bulletIconPosition === 'before' ? 'bullet-icons--before' : null,
    showIcons && bulletIconPosition === 'after' ? 'bullet-icons--after' : null,
    ...navClasses,
    otherClasses ?? null,
  );

  return (
    <div
      id={navId ?? undefined}
      className={containerCls}
      data-pattern="timberland/social-nav"
    >
      {items.map((item, index) => {
        const itemCount = index + 1;
        const linkTitle = item.title ?? item.label;

        // Per-item position falls back to the global bulletIconPosition
        const effectiveIconPos = item.iconPosition ?? bulletIconPosition;

        // Mirror Twig class-merge → sort → join on each nav_item
        const itemCls = cx(
          styles,
          'list-item',
          `list-item--item-${itemCount}`,
          'social-nav-item',
          ...(item.itemClasses ?? []),
          item.itemOtherClasses ?? null,
        );

        // Mirror Twig inline style on the anchor when icons are shown
        const linkStyle: React.CSSProperties | undefined =
          showIcons && bulletIconSize
            ? { paddingTop: bulletIconSize, minWidth: bulletIconSize }
            : undefined;

        const iconNode =
          showIcons && item.icon
            ? renderIconNode(item.icon, item.iconColor, bulletIconSize)
            : null;

        const anchor = (
          <a
            href={item.url}
            className={cx(styles, 'social-nav-link')}
            target={item.target ?? '_self'}
            title={linkTitle}
            aria-label={linkTitle}
            {...(linkStyle ? { style: linkStyle } : {})}
          >
            <span className={cx(styles, 'label')}>{item.label}</span>
          </a>
        );

        return (
          <span key={index} className={itemCls}>
            {effectiveIconPos === 'before' && iconNode}
            {anchor}
            {effectiveIconPos === 'after' && iconNode}
          </span>
        );
      })}
    </div>
  );
}

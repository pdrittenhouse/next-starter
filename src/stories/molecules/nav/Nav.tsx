'use client';
import React, { useId } from 'react';
import styles from './nav.module.scss';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NavMegaMenu {
  /** Whether the mega menu is active for this item. */
  enabled: boolean;
  /** Raw HTML string rendered inside the mega-menu panel. */
  content: string;
}

export interface NavItemIcon {
  /** Whether the icon is shown. */
  enabled: boolean;
  /** Icon rendered before or after the label. */
  position: 'before' | 'after';
}

export interface NavItem {
  /** Link destination. */
  url: string;
  /** Visible label text. */
  title: string;
  /** Child items — presence triggers Bootstrap dropdown markup. */
  items?: NavItem[];
  /** HTML id applied to the `<a>` link element. */
  linkId?: string;
  /** Additional class names for the `<a>` element. */
  linkClasses?: string[];
  /** Additional class string for the `<a>` element. */
  linkOtherClasses?: string;
  /** `target` attribute for the `<a>` element. */
  linkTarget?: string;
  /** HTML element for the list item wrapper. Defaults to `'li'`. */
  itemElement?: string;
  /** Additional class names for the list item. */
  itemClasses?: string[];
  /** Additional class string for the list item. */
  itemOtherClasses?: string;
  /** Base ID used when computing dropdown toggle target IDs. */
  navId?: string;
  /** Optional description rendered below the label. */
  description?: string;
  /** Suppress the dropdown caret icon. */
  hideDropdownIcon?: boolean;
  /** Mega menu configuration. */
  megaMenu?: NavMegaMenu;
  /** Optional icon config (renders a placeholder `<span>` — swap for SVG atom). */
  icon?: NavItemIcon;
  /** Navbar breakpoint for the nested sub-menu level. */
  navbarBreakpoint?: string;
  /** Nav list element for the nested sub-menu. Defaults to `'ul'`. */
  navElement?: string;
}

export interface NavProps {
  /**
   * HTML `id` for the `<nav>` wrapper.
   * @default 'navbarNav'
   */
  navbarId?: string;
  /** Additional class names for the `<nav>` wrapper. */
  navbarClasses?: string[];
  /** Additional class string for the `<nav>` wrapper. */
  navbarOtherClasses?: string;
  /** `aria-label` for the `<nav>` wrapper. */
  navbarAriaLabel?: string;
  /**
   * Enable hover-based dropdown (injects responsive `<style>` block).
   * Requires `navbarBreakpoint` to be set for the media queries to be meaningful.
   */
  hoverDropdown?: boolean;
  /**
   * Bootstrap navbar expand breakpoint (`'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'none'`).
   * Controls `flex-{bp}-row` on the nav list and the hover-dropdown media query.
   */
  navbarBreakpoint?: string;
  /** Display nav items as Bootstrap tabs (`nav-tabs`). */
  navTabs?: boolean;
  /** Display nav links as Bootstrap pills (`nav-pills`). */
  navPills?: boolean;
  /** Force nav items to fill available width (`nav-fill`). */
  navFill?: boolean;
  /** Force nav items to equal width (`nav-justified`). */
  navJustified?: boolean;
  /** HTML element for the nav list. @default `'ul'` */
  navElement?: string;
  /** HTML `id` for the nav list element. */
  navId?: string;
  /** Navigation items. */
  items?: NavItem[];
  /** Mega menu positioned relative to the item rather than the viewport. */
  relativeMegaMenu?: boolean;
  /** Mega menu positioned relative to a containing element. */
  containerRelativeMenu?: boolean;
  /** Add `toggle-open-menus` behaviour class. */
  toggleOpenMenus?: boolean;
}

// ---------------------------------------------------------------------------
// Bootstrap breakpoint map (mirrors $grid-breakpoints defaults)
// ---------------------------------------------------------------------------

const BS_BREAKPOINTS: Record<string, string> = {
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px',
};

// ---------------------------------------------------------------------------
// Helper: hover-dropdown inline <style> block
// ---------------------------------------------------------------------------

function buildHoverStyles(navUid: string, breakpoint: string): string {
  const bpValue = BS_BREAKPOINTS[breakpoint] ?? '992px';
  const sel = `.navbar-nav.navbar-${navUid}.dropdown-hover > ul > .dropdown,\n  .navbar-nav.navbar-${navUid}.dropdown-hover > ol > .dropdown,\n  .navbar-nav.navbar-${navUid}.dropdown-hover > div > .dropdown`;

  return `
@media only screen and (max-width: ${bpValue}) {
  ${sel} > .dropdown-menu {
    position: relative;
  }
  ${sel} > .dropdown-menu.show {
    max-height: 2000px;
    opacity: 1;
    display: block;
  }
}
@media only screen and (min-width: ${bpValue}) {
  ${sel} > .dropdown-menu {
    position: absolute;
    top: 100%;
    display: none;
  }
  ${sel}:hover > .dropdown-menu {
    max-height: 2000px;
    opacity: 1;
    display: block;
  }
  .navbar-nav.navbar-${navUid}.dropdown-hover > ul > .dropdown .dropdown-item:hover > .dropdown-submenu,
  .navbar-nav.navbar-${navUid}.dropdown-hover > ol > .dropdown .dropdown-item:hover > .dropdown-submenu,
  .navbar-nav.navbar-${navUid}.dropdown-hover > div > .dropdown .dropdown-item:hover > .dropdown-submenu {
    max-height: 2000px;
    opacity: 1;
    display: block;
  }
  .navbar-nav.navbar-${navUid}.dropdown-hover > ul > .dropdown .dropdown-item .dropdown-submenu,
  .navbar-nav.navbar-${navUid}.dropdown-hover > ol > .dropdown .dropdown-item .dropdown-submenu,
  .navbar-nav.navbar-${navUid}.dropdown-hover > div > .dropdown .dropdown-item .dropdown-submenu {
    position: absolute;
    top: 0;
    left: 100%;
  }
}
`.trim();
}

// ---------------------------------------------------------------------------
// Internal recursive nav-items renderer
// ---------------------------------------------------------------------------

interface NavItemsProps {
  items: NavItem[];
  /** Unique nav instance ID (from useId). */
  baseId: string;
  /** Whether this level renders as a Bootstrap dropdown menu. */
  isDropdown?: boolean;
  /** `id` to apply to the list element (dropdown panels only). */
  dropdownId?: string;
  hoverDropdown?: boolean;
  navbarBreakpoint?: string;
  navElement?: string;
  navId?: string;
  navTabs?: boolean;
  navPills?: boolean;
  navFill?: boolean;
  navJustified?: boolean;
  /** Nesting depth: 0 = top-level, 1 = first dropdown, etc. */
  depth?: number;
  /** Index of the parent item in the top-level nav (1-based). */
  menuCount?: number;
}

function NavItems({
  items,
  baseId,
  isDropdown = false,
  dropdownId,
  hoverDropdown,
  navbarBreakpoint,
  navElement = 'ul',
  navId,
  navTabs,
  navPills,
  navFill,
  navJustified,
  depth = 0,
  menuCount,
}: NavItemsProps) {
  const NavTag = navElement as React.ElementType;
  const isTopLevel = depth === 0;
  const isSubMenu = depth > 1; // deeper than the first dropdown level

  const listClasses = [
    'flex-column',
    isTopLevel && navbarBreakpoint && navbarBreakpoint !== 'none'
      ? `flex-${navbarBreakpoint}-row`
      : null,
    isTopLevel && navTabs ? 'nav-tabs' : null,
    isTopLevel && navPills ? 'nav-pills' : null,
    isTopLevel && navFill ? 'nav-fill' : null,
    isTopLevel && navJustified ? 'nav-justified' : null,
    isDropdown ? 'dropdown-menu' : 'nav',
    isSubMenu ? 'dropdown-submenu' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const listId = isDropdown ? dropdownId : navId;

  return (
    <NavTag
      className={listClasses}
      {...(listId ? { id: listId } : {})}
    >
      {items.map((item, index) => {
        const navCount = index + 1;
        // For nested menus the menu_count tracks the top-level parent position
        const activeMenuCount = isTopLevel ? navCount : (menuCount ?? navCount);
        const depthSuffix = depth > 0 ? `-${depth}` : '';
        const itemBaseId = item.navId ?? 'navItem';
        const toggleTargetId = `${itemBaseId}_toggle--${activeMenuCount}${depthSuffix}`;

        const Element = (item.itemElement ?? 'li') as React.ElementType;

        const hasChildren = !!(item.items?.length);
        const hasMegaMenu = !!(item.megaMenu?.enabled);
        const hasDropdown = hasChildren || hasMegaMenu;

        const itemClasses = [
          'nav-item',
          hasDropdown ? 'dropdown' : null,
          hasMegaMenu ? 'has-mega-menu' : null,
          isDropdown ? 'dropdown-item' : null,
          `nav-item--item-${navCount}`,
          item.hideDropdownIcon ? 'hide-dropdown-icon' : null,
          ...(item.itemClasses ?? []),
          item.itemOtherClasses ?? null,
        ]
          .filter(Boolean)
          .join(' ');

        const linkClasses = [
          'nav-link',
          hasDropdown ? 'dropdown-toggle' : null,
          ...(item.linkClasses ?? []),
          item.linkOtherClasses ?? null,
        ]
          .filter(Boolean)
          .join(' ');

        // data-bs-target attribute on the toggle link (matches id on the dropdown list)
        const dropdownLinkTarget = hasDropdown && !item.linkId
          ? toggleTargetId
          : undefined;

        return (
          <Element key={`${baseId}-${depth}-${index}`} className={itemClasses}>
            <a
              className={linkClasses}
              href={item.url}
              {...(item.linkId ? { id: item.linkId } : {})}
              {...(dropdownLinkTarget ? { 'data-bs-target': dropdownLinkTarget } : {})}
              {...(hasDropdown
                ? {
                    role: 'button',
                    'data-bs-toggle': 'dropdown',
                    'aria-haspopup': 'true',
                    'aria-expanded': 'false',
                  }
                : {})}
              aria-label={item.title}
              {...(item.linkTarget ? { target: item.linkTarget } : {})}
            >
              {/* Icon before label */}
              {item.icon?.enabled && item.icon.position === 'before' && (
                <span className="nav-icon nav-icon--before" aria-hidden="true" />
              )}

              <span className="item-label">{item.title}</span>

              {/* Icon after label */}
              {item.icon?.enabled && item.icon.position === 'after' && (
                <span className="nav-icon nav-icon--after" aria-hidden="true" />
              )}

              {item.description && (
                <span className="item-description">{item.description}</span>
              )}

              {hasDropdown && <span className="caret" />}
            </a>

            {/* Mega menu panel */}
            {hasMegaMenu && item.megaMenu && (
              <div
                className="dropdown-menu mega-menu-dropdown"
                id={toggleTargetId}
                aria-labelledby={item.linkId}
                dangerouslySetInnerHTML={{ __html: item.megaMenu.content }}
              />
            )}

            {/* Regular nested dropdown */}
            {!hasMegaMenu && hasChildren && item.items && (
              <NavItems
                items={item.items}
                baseId={baseId}
                isDropdown
                dropdownId={toggleTargetId}
                hoverDropdown={hoverDropdown}
                navbarBreakpoint={item.navbarBreakpoint}
                navElement={item.navElement ?? 'ul'}
                depth={depth + 1}
                menuCount={activeMenuCount}
              />
            )}
          </Element>
        );
      })}
    </NavTag>
  );
}

// ---------------------------------------------------------------------------
// Nav molecule
// ---------------------------------------------------------------------------

/**
 * Nav molecule — mirrors `timberland/nav`.
 *
 * Renders a Bootstrap 5 `<nav>` with recursive dropdown support, mega menus,
 * hover-dropdown CSS injection, and all Bootstrap layout modifiers (tabs,
 * pills, fill, justified). Bootstrap JS is loaded globally; this component
 * uses `data-bs-*` attributes only.
 */
export function Nav({
  navbarId = 'navbarNav',
  navbarClasses = [],
  navbarOtherClasses,
  navbarAriaLabel,
  hoverDropdown = false,
  navbarBreakpoint,
  navTabs,
  navPills,
  navFill,
  navJustified,
  navElement = 'ul',
  navId,
  items = [],
  relativeMegaMenu = false,
  containerRelativeMenu = false,
  toggleOpenMenus = false,
}: NavProps) {
  const uid = useId().replace(/:/g, '');

  const navbarCls = [
    'navbar-nav',
    `navbar-${uid}`,
    hoverDropdown ? 'dropdown-hover' : null,
    relativeMegaMenu ? 'nav-item-relative-mega-menu' : null,
    containerRelativeMenu ? 'container-relative-menu' : null,
    toggleOpenMenus ? 'toggle-open-menus' : null,
    ...navbarClasses,
    navbarOtherClasses ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {hoverDropdown && navbarBreakpoint && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: buildHoverStyles(uid, navbarBreakpoint),
          }}
        />
      )}

      <nav
        className={navbarCls}
        id={navbarId}
        {...(navbarAriaLabel ? { 'aria-label': navbarAriaLabel } : {})}
        data-pattern="timberland/nav"
      >
        {items.length > 0 && (
          <NavItems
            items={items}
            baseId={uid}
            isDropdown={false}
            hoverDropdown={hoverDropdown}
            navbarBreakpoint={navbarBreakpoint}
            navElement={navElement}
            navId={navId}
            navTabs={navTabs}
            navPills={navPills}
            navFill={navFill}
            navJustified={navJustified}
            depth={0}
          />
        )}
      </nav>
    </>
  );
}

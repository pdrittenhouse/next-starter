'use client';
import React, { useId, useState, useRef, useEffect } from 'react';
import styles from './nav.module.scss';
import { cx } from '@/lib/cx';

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
  /** Additional class string appended to the nav list element. */
  navOtherClasses?: string;
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
// Internal: single nav item (with React-managed dropdown open/close)
// ---------------------------------------------------------------------------

interface NavItemEntryProps {
  item: NavItem;
  baseId: string;
  depth: number;
  index: number;
  /** Top-level parent index (1-based) — carried through nesting for ID generation. */
  activeMenuCount: number;
  navbarBreakpoint?: string;
}

function NavItemEntry({
  item,
  baseId,
  depth,
  index,
  activeMenuCount,
  navbarBreakpoint,
}: NavItemEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const itemRef = useRef<HTMLElement>(null);

  const navCount = index + 1;
  const depthSuffix = depth > 0 ? `-${depth}` : '';
  const itemBaseId = item.navId ?? 'navItem';
  const toggleTargetId = `${itemBaseId}_toggle--${activeMenuCount}${depthSuffix}`;

  const Element = (item.itemElement ?? 'li') as React.ElementType;
  const SubMenuTag = (item.navElement ?? 'ul') as React.ElementType;

  const hasChildren = !!(item.items?.length);
  const hasMegaMenu = !!(item.megaMenu?.enabled);
  const hasDropdown = hasChildren || hasMegaMenu;
  const isNestedItem = depth > 0;

  // Close when clicking outside this item
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!itemRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const itemClasses = cx(
    styles,
    'nav-item',
    hasDropdown && 'dropdown',
    hasMegaMenu && 'has-mega-menu',
    isNestedItem && 'dropdown-item',
    `nav-item--item-${navCount}`,
    item.hideDropdownIcon && 'hide-dropdown-icon',
    ...(item.itemClasses ?? []),
    item.itemOtherClasses,
    hasDropdown && isOpen && 'show',
  );

  const linkClasses = cx(
    styles,
    'nav-link',
    hasDropdown && 'dropdown-toggle',
    ...(item.linkClasses ?? []),
    item.linkOtherClasses,
    hasDropdown && isOpen && 'show',
  );

  const itemContent = (
    <>
      {item.icon?.enabled && item.icon.position === 'before' && (
        <span className={cx(styles, 'nav-icon', 'nav-icon--before')} aria-hidden="true" />
      )}
      <span className={cx(styles, 'item-label')}>{item.title}</span>
      {item.icon?.enabled && item.icon.position === 'after' && (
        <span className={cx(styles, 'nav-icon', 'nav-icon--after')} aria-hidden="true" />
      )}
      {item.description && (
        <span className={cx(styles, 'item-description')}>{item.description}</span>
      )}
      {hasDropdown && <span className={cx(styles, 'caret')} />}
    </>
  );

  if (hasDropdown) {
    // depth >= 1 means this sub-menu is itself nested inside another dropdown
    const subMenuClasses = cx(
      styles,
      'flex-column',
      'dropdown-menu',
      depth >= 1 && 'dropdown-submenu',
      isOpen && 'show',
    );

    return (
      <Element ref={itemRef as any} className={itemClasses}>
        <a
          className={linkClasses}
          href={item.url}
          {...(item.linkId ? { id: item.linkId } : {})}
          role="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label={item.title}
          {...(item.linkTarget ? { target: item.linkTarget } : {})}
          onClick={(e) => {
            e.preventDefault();
            setIsOpen((o) => !o);
          }}
        >
          {itemContent}
        </a>

        {hasMegaMenu && item.megaMenu && (
          <div
            className={cx(styles, 'dropdown-menu', 'mega-menu-dropdown', isOpen && 'show')}
            id={toggleTargetId}
            aria-labelledby={item.linkId}
            dangerouslySetInnerHTML={{ __html: item.megaMenu.content }}
          />
        )}

        {!hasMegaMenu && hasChildren && item.items && (
          <SubMenuTag className={subMenuClasses} id={toggleTargetId}>
            {item.items.map((child, childIndex) => (
              <NavItemEntry
                key={`${baseId}-${depth + 1}-${childIndex}`}
                item={child}
                baseId={baseId}
                depth={depth + 1}
                index={childIndex}
                activeMenuCount={activeMenuCount}
                navbarBreakpoint={item.navbarBreakpoint}
              />
            ))}
          </SubMenuTag>
        )}
      </Element>
    );
  }

  return (
    <Element className={itemClasses}>
      <a
        className={linkClasses}
        href={item.url}
        {...(item.linkId ? { id: item.linkId } : {})}
        aria-label={item.title}
        {...(item.linkTarget ? { target: item.linkTarget } : {})}
      >
        {itemContent}
      </a>
    </Element>
  );
}

// ---------------------------------------------------------------------------
// Internal: top-level nav list container
// ---------------------------------------------------------------------------

interface NavItemsProps {
  items: NavItem[];
  baseId: string;
  navbarBreakpoint?: string;
  navElement?: string;
  navId?: string;
  navOtherClasses?: string;
  navTabs?: boolean;
  navPills?: boolean;
  navFill?: boolean;
  navJustified?: boolean;
}

function NavItems({
  items,
  baseId,
  navbarBreakpoint,
  navElement = 'ul',
  navId,
  navOtherClasses,
  navTabs,
  navPills,
  navFill,
  navJustified,
}: NavItemsProps) {
  const NavTag = navElement as React.ElementType;

  const listClasses = cx(
    styles,
    'flex-column',
    navbarBreakpoint && navbarBreakpoint !== 'none'
      ? `flex-${navbarBreakpoint}-row`
      : null,
    navTabs && 'nav-tabs',
    navPills && 'nav-pills',
    navFill && 'nav-fill',
    navJustified && 'nav-justified',
    'nav',
    navOtherClasses,
  );

  return (
    <NavTag className={listClasses} {...(navId ? { id: navId } : {})}>
      {items.map((item, index) => (
        <NavItemEntry
          key={`${baseId}-0-${index}`}
          item={item}
          baseId={baseId}
          depth={0}
          index={index}
          activeMenuCount={index + 1}
          navbarBreakpoint={navbarBreakpoint}
        />
      ))}
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
 * pills, fill, justified). Dropdown open/close is managed via React state —
 * no Bootstrap JS bundle required.
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
  navOtherClasses,
  items = [],
  relativeMegaMenu = false,
  containerRelativeMenu = false,
  toggleOpenMenus = false,
}: NavProps) {
  const uid = useId().replace(/:/g, '');
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !relativeMegaMenu) return;

    const BS_BP: Record<string, number> = { sm:576, md:768, lg:992, xl:1200, xxl:1400 };
    const getBreakpointPx = () => navbarBreakpoint ? (BS_BP[navbarBreakpoint] ?? 0) : 0;
    const isDesktop = () => window.innerWidth >= getBreakpointPx();

    const positionMegaMenus = () => {
      nav.querySelectorAll<HTMLElement>('.nav-item.has-mega-menu').forEach(item => {
        const dropdown = item.querySelector<HTMLElement>('.mega-menu-dropdown');
        if (!dropdown) return;
        if (isDesktop()) {
          const offsetLeft = item.getBoundingClientRect().left;
          dropdown.style.transform = `translateX(-${offsetLeft}px)`;
          dropdown.style.width = '100vw';
        } else {
          dropdown.style.transform = '';
          dropdown.style.width = '';
        }
      });
    };

    // Re-position on open (Bootstrap dropdown events bubble from the nav element)
    nav.addEventListener('show.bs.dropdown', positionMegaMenus);
    window.addEventListener('resize', positionMegaMenus);

    return () => {
      nav.removeEventListener('show.bs.dropdown', positionMegaMenus);
      window.removeEventListener('resize', positionMegaMenus);
    };
  }, [relativeMegaMenu, navbarBreakpoint]);

  const navbarCls = cx(
    styles,
    'navbar-nav',
    `navbar-${uid}`,
    hoverDropdown && 'dropdown-hover',
    relativeMegaMenu && 'nav-item-relative-mega-menu',
    containerRelativeMenu && 'container-relative-menu',
    toggleOpenMenus && 'toggle-open-menus',
    ...navbarClasses,
    navbarOtherClasses,
  );

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
        ref={navRef}
        className={navbarCls}
        id={navbarId}
        {...(navbarAriaLabel ? { 'aria-label': navbarAriaLabel } : {})}
        data-pattern="timberland/nav"
      >
        {items.length > 0 && (
          <NavItems
            items={items}
            baseId={uid}
            navbarBreakpoint={navbarBreakpoint}
            navElement={navElement}
            navId={navId}
            navOtherClasses={navOtherClasses}
            navTabs={navTabs}
            navPills={navPills}
            navFill={navFill}
            navJustified={navJustified}
          />
        )}
      </nav>
    </>
  );
}

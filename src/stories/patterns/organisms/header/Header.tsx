'use client';
import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { Branding, BrandingProps } from '@/stories/patterns/molecules/branding/Branding';
import { Nav, NavProps } from '@/stories/patterns/molecules/nav/Nav';
import { Button, ButtonProps } from '@/stories/patterns/atoms/button/Button';
import { SvgIcon } from '@/stories/patterns/atoms/svg/SvgIcon';
import styles from './header.module.scss';
import { cx } from '@/lib/cx';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Bootstrap navbar expand breakpoints. */
export type NavbarBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Header organism props — mirrors the Timberland Pattern Lab
 * `timberland/header` organism Twig template.
 *
 * Slot props (`alertContent`, `socialNavContent`, `navTopContent`,
 * `additionalContent`) accept any `React.ReactNode` so callers can
 * supply arbitrary markup without requiring new props.
 */
export interface HeaderProps {
  // -------------------------------------------------------------------------
  // Layout & identity
  // -------------------------------------------------------------------------

  /**
   * Bootstrap navbar expand breakpoint.
   * Adds `navbar-expand-{breakpoint}` to the `<header>` element.
   * @default 'lg'
   */
  navbarBreakpoint?: NavbarBreakpoint;

  /**
   * `id` attribute on the `<header>` element.
   * @default 'siteHeader'
   */
  headerId?: string;

  /**
   * Background image URL. Sets an inline `background-image` style on
   * the `<header>` element when provided.
   */
  backgroundImage?: string;

  /**
   * Additional CSS class names appended to the `<header>` element.
   */
  otherClasses?: string | string[];

  // -------------------------------------------------------------------------
  // Alert bar
  // -------------------------------------------------------------------------

  /**
   * Content rendered inside the alert bar. When absent the entire
   * `site-header--alert` block is omitted.
   */
  alertContent?: React.ReactNode;

  /**
   * Additional CSS class names appended to the alert bar wrapper.
   */
  alertOtherClasses?: string | string[];

  // -------------------------------------------------------------------------
  // Nav top slot
  // -------------------------------------------------------------------------

  /**
   * Optional content rendered inside the `site-header--nav-top` block.
   */
  navTopContent?: React.ReactNode;

  // -------------------------------------------------------------------------
  // Branding
  // -------------------------------------------------------------------------

  /**
   * Props forwarded directly to the Branding molecule.
   */
  brand?: BrandingProps;

  /**
   * Props for a secondary co-brand Branding molecule rendered after `brand`
   * inside `.site-header--branding`. Maps to `options.co_brand` in the Twig —
   * rendered with `otherClasses: 'co-brand'` to distinguish it from the primary brand.
   */
  coBrand?: BrandingProps;

  // -------------------------------------------------------------------------
  // Navbar toggler
  // -------------------------------------------------------------------------

  /**
   * Additional CSS class names appended to the hamburger / navbar-toggler button.
   */
  navbarTogglerClasses?: string | string[];

  /**
   * Hamburger animation style. Maps to `hamburger--{animation}`.
   * Mirrors `options.hamburger_animation | default('boring')` in the Twig.
   * @default 'boring'
   */
  hamburgerAnimation?: string;

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  /**
   * Props forwarded to the primary Nav molecule.
   * Rendered inside `site-header--primary-nav`.
   */
  primaryNav?: NavProps;

  /**
   * Props forwarded to the secondary Nav molecule.
   * Rendered inside `site-header--secondary-nav`.
   */
  secondaryNav?: NavProps;

  /**
   * Props for the CTA Button rendered alongside the primary nav (desktop).
   * Rendered inside `.button-wrapper` inside `.navbar-collapse`.
   */
  primaryNavCta?: ButtonProps;

  /**
   * Props for the CTA Button rendered in the mobile header area.
   * Rendered inside `.button-wrapper--mobile` immediately before `.navbar-collapse`.
   */
  mobileNavCta?: ButtonProps;

  // -------------------------------------------------------------------------
  // Social nav slot
  // -------------------------------------------------------------------------

  /**
   * Content rendered inside `site-header--social-nav`.
   * Pass a SocialNav organism or any other element.
   */
  socialNavContent?: React.ReactNode;

  /**
   * Additional CSS classes applied to the `site-header--social-nav` wrapper div.
   * Use for per-viewport visibility (`d-none d-lg-flex`, `d-lg-none`).
   */
  socialNavWrapperClasses?: string;

  // -------------------------------------------------------------------------
  // Mobile CTA wrapper
  // -------------------------------------------------------------------------

  /**
   * Additional CSS classes applied to the `.button-wrapper--mobile` div.
   * Use `'d-none'` when `showMobileCtaButton` is false to hide the wrapper —
   * mirrors `show_button != true ? 'd-none'` in the Twig template.
   */
  mobileNavCtaWrapperClasses?: string;

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  /**
   * Render the search form inside `site-header--search`.
   * @default false
   */
  showSearch?: boolean;

  /**
   * Additional CSS classes applied to the wrapper div around the search form.
   * Use for per-viewport visibility (`d-none d-lg-flex`, `d-lg-none`) — mirrors
   * the inner `<div class="pt-2 …">` inside `.site-header--search` in the Twig.
   */
  searchWrapperClasses?: string;

  // -------------------------------------------------------------------------
  // Skip navigation
  // -------------------------------------------------------------------------

  /**
   * Label text for the skip-navigation link rendered before `<header>`.
   * Mirrors `@atoms/skip-nav/_skip-nav.tpl.twig` in the Twig pattern library.
   * Target is `#content` (`<main id="content">`).
   * @default 'Skip to content'
   */
  skipNavLabel?: string;

  // -------------------------------------------------------------------------
  // Additional content slot
  // -------------------------------------------------------------------------

  /**
   * Content rendered in the additional-content block below the main navbar row.
   */
  additionalContent?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build the sorted, deduplicated class string for the `<header>` element via cx.
 * Mirrors the Twig `sort | join | trim` logic.
 */
function buildHeaderClasses(
  navbarBreakpoint?: NavbarBreakpoint,
  otherClasses?: string | string[],
): string {
  const parts: (string | null | undefined | false)[] = ['site-header', 'navbar'];

  if (navbarBreakpoint) {
    parts.push(`navbar-expand-${navbarBreakpoint}`);
  }

  if (otherClasses) {
    const extras = Array.isArray(otherClasses) ? otherClasses : [otherClasses];
    parts.push(...extras.filter(Boolean));
  }

  return cx(styles, ...parts);
}

/**
 * Build the class string for the alert bar via cx.
 */
function buildAlertClasses(alertOtherClasses?: string | string[]): string {
  const parts: (string | null | undefined | false)[] = ['site-header--alert'];

  if (alertOtherClasses) {
    const extras = Array.isArray(alertOtherClasses)
      ? alertOtherClasses
      : [alertOtherClasses];
    parts.push(...extras.filter(Boolean));
  }

  return cx(styles, ...parts);
}

/**
 * Build the class string for the navbar-toggler button via cx.
 * Mirrors the Twig nav_toggle block.
 */
function buildTogglerClasses(
  hamburgerAnimation?: string,
  navbarTogglerClasses?: string | string[],
): string {
  const parts: (string | null | undefined | false)[] = [
    'btn',
    'btn-default',
    'button',
    'navbar-toggler',
    'hamburger',
    `hamburger--${hamburgerAnimation ?? 'boring'}`,
  ];

  if (navbarTogglerClasses) {
    const extras = Array.isArray(navbarTogglerClasses)
      ? navbarTogglerClasses
      : [navbarTogglerClasses];
    parts.push(...extras.filter(Boolean));
  }

  return cx(styles, ...parts);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Header organism — mirrors `timberland/header` in Pattern Lab.
 *
 * Full Bootstrap 5 site header with:
 * - Optional alert bar
 * - Optional nav-top row
 * - Branding molecule slot
 * - Hamburger / navbar-toggler for mobile collapse
 * - Primary & secondary Nav molecule slots
 * - CTA Button alongside primary nav
 * - Social nav slot
 * - Optional search form
 * - Additional content slot below the main navbar row
 *
 * The navbar collapse is managed via React Bootstrap's `Collapse` component
 * and local `useState` — no Bootstrap JS bundle required.
 */
export function Header({
  navbarBreakpoint = 'lg',
  headerId = 'siteHeader',
  backgroundImage,
  otherClasses,
  alertContent,
  alertOtherClasses,
  navTopContent,
  brand,
  coBrand,
  hamburgerAnimation,
  navbarTogglerClasses,
  primaryNav,
  secondaryNav,
  primaryNavCta,
  mobileNavCta,
  mobileNavCtaWrapperClasses,
  socialNavContent,
  socialNavWrapperClasses,
  showSearch = false,
  searchWrapperClasses,
  skipNavLabel = 'Skip to content',
  additionalContent,
}: HeaderProps) {
  const [navOpen, setNavOpen] = useState(false);

  const headerClasses = buildHeaderClasses(navbarBreakpoint, otherClasses);
  const alertClasses = buildAlertClasses(alertOtherClasses);
  const togglerClasses = cx(
    styles,
    buildTogglerClasses(hamburgerAnimation, navbarTogglerClasses),
    !navOpen ? 'collapsed' : null,
    navOpen ? 'is-active' : null,
  );

  const headerStyle: React.CSSProperties | undefined = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : undefined;

  return (
    <>
    <a href="#content" className={cx(styles, 'skip-nav', 'visually-hidden-focusable')}>
      {skipNavLabel}
    </a>
    <header
      className={headerClasses}
      role="banner"
      id={headerId}
      style={headerStyle}
      data-pattern="timberland/header"
    >
      <div className={cx(styles, 'site-header--wrapper')}>

        {/* ---------------------------------------------------------------- */}
        {/* Alert bar                                                         */}
        {/* ---------------------------------------------------------------- */}
        {alertContent && (
          <div className={alertClasses}>
            <div className={cx(styles, 'site-header--container')}>
              <div className={cx(styles, 'site-header--row')}>
                <div className={cx(styles, 'site-header--column')}>
                  {alertContent}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Nav top                                                           */}
        {/* ---------------------------------------------------------------- */}
        {navTopContent && (
          <div className={cx(styles, 'site-header--nav-top')}>
            {navTopContent}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Main header content row                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className={cx(styles, 'site-header--content')}>
          <div className={cx(styles, 'site-header--container')}>
            <div className={cx(styles, 'site-header--row')}>

              {/* Branding ------------------------------------------------- */}
              <div className={cx(styles, 'site-header--branding')}>
                {brand && <Branding {...brand} />}
                {coBrand && <Branding {...coBrand} />}
              </div>

              {/* Navigation ------------------------------------------------ */}
              <div className={cx(styles, 'site-header--navigation')}>

                {/* Hamburger toggler */}
                <button
                  type="button"
                  id="navToggle"
                  className={togglerClasses}
                  onClick={() => setNavOpen(o => !o)}
                  aria-controls="siteNav"
                  aria-expanded={navOpen}
                  aria-label="Toggle navigation"
                >
                  <span className={cx(styles, 'hamburger-box')}>
                    <span className={cx(styles, 'hamburger-inner')} />
                  </span>
                </button>

                {/* Mobile CTA — immediately before .navbar-collapse */}
                {mobileNavCta && (
                  <div className={cx(styles, 'button-wrapper--mobile', mobileNavCtaWrapperClasses)}>
                    <Button {...mobileNavCta} />
                  </div>
                )}

                <div className={cx(styles, 'site-header--row')}>
                  {/* Collapsible nav panel */}
                  <Collapse in={navOpen}>
                    <div className={cx(styles, 'navbar-collapse')} id="siteNav">
                      <div className={cx(styles, 'site-header--navbar-wrapper')}>
                        <div className={cx(styles, 'site-header--row')}>

                          {/* Secondary nav + social ------------------------ */}
                          <div className={cx(styles, 'site-header--secondary-nav')}>
                            {secondaryNav && (
                              <Nav
                                navbarBreakpoint={navbarBreakpoint}
                                {...secondaryNav}
                              />
                            )}
                            <div className={cx(styles, 'site-header--social-nav', socialNavWrapperClasses)}>
                              {socialNavContent}
                            </div>
                          </div>

                          {/* Primary nav + CTA ----------------------------- */}
                          <div className={cx(styles, 'site-header--primary-nav')}>
                            {primaryNav && (
                              <Nav
                                navbarBreakpoint={navbarBreakpoint}
                                {...primaryNav}
                              />
                            )}
                            {primaryNavCta && (
                              <div className={cx(styles, 'button-wrapper')}>
                                <Button {...primaryNavCta} />
                              </div>
                            )}
                          </div>

                          {/* Search ---------------------------------------- */}
                          <div className={cx(styles, 'site-header--search')}>
                            {showSearch && (() => {
                              const searchForm = (
                                <form
                                  name="searchform"
                                  id="headerSearch"
                                  className={cx(styles, 'searchform', 'placeholder-black')}
                                  role="search"
                                  action="/"
                                  method="get"
                                  autoComplete="off"
                                >
                                  <div>
                                    <label className={cx(styles, 'screen-reader-text')} htmlFor="s">Search</label>
                                    <input
                                      type="text"
                                      name="s"
                                      id="s"
                                      className={cx(styles, 'search-field')}
                                      placeholder="Search"
                                    />
                                    <button
                                      type="submit"
                                      className={cx(styles, 'btn', 'btn-black', 'btn-default', 'btn-lg', 'button', 'search-submit', 'text-nowrap')}
                                      aria-label="Submit"
                                    >
                                      <SvgIcon name="search" fill="white" width="16px" height="16px" className={cx(styles, 'search-icon')} />
                                    </button>
                                  </div>
                                </form>
                              );
                              return searchWrapperClasses
                                ? <div className={searchWrapperClasses}>{searchForm}</div>
                                : searchForm;
                            })()}
                          </div>

                        </div>
                      </div>
                    </div>
                  </Collapse>
                </div>

              </div>
              {/* /site-header--navigation */}

            </div>
          </div>
        </div>
        {/* /site-header--content */}

        {/* ---------------------------------------------------------------- */}
        {/* Additional content slot                                           */}
        {/* ---------------------------------------------------------------- */}
        {additionalContent && (
          <div className={cx(styles, 'site-header--container')}>
            <div className={cx(styles, 'site-header--row')}>
              <div className={cx(styles, 'site-header--column')}>
                {additionalContent}
              </div>
            </div>
          </div>
        )}

      </div>
      {/* /site-header--wrapper */}
    </header>
    </>
  );
}

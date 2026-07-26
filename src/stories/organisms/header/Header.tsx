'use client';
import React from 'react';
import { Branding, BrandingProps } from '@/stories/molecules/branding/Branding';
import { Nav, NavProps } from '@/stories/molecules/nav/Nav';
import { Button, ButtonProps } from '@/stories/atoms/button/Button';
import styles from './header.module.scss';

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

  // -------------------------------------------------------------------------
  // Navbar toggler
  // -------------------------------------------------------------------------

  /**
   * Additional CSS class names appended to the hamburger / navbar-toggler button.
   */
  navbarTogglerClasses?: string | string[];

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

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  /**
   * Render the search form inside `site-header--search`.
   * @default false
   */
  showSearch?: boolean;

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
 * Build the sorted, deduplicated class string for the `<header>` element.
 * Mirrors the Twig `sort | join | trim` logic.
 */
function buildHeaderClasses(
  navbarBreakpoint?: NavbarBreakpoint,
  otherClasses?: string | string[],
): string {
  const base = ['site-header', 'navbar'];

  if (navbarBreakpoint) {
    base.push(`navbar-expand-${navbarBreakpoint}`);
  }

  if (otherClasses) {
    const extras = Array.isArray(otherClasses) ? otherClasses : [otherClasses];
    base.push(...extras.filter(Boolean));
  }

  return [...new Set(base)].sort().join(' ');
}

/**
 * Build the sorted, deduplicated class string for the alert bar.
 */
function buildAlertClasses(alertOtherClasses?: string | string[]): string {
  const base = ['site-header--alert'];

  if (alertOtherClasses) {
    const extras = Array.isArray(alertOtherClasses)
      ? alertOtherClasses
      : [alertOtherClasses];
    base.push(...extras.filter(Boolean));
  }

  return [...new Set(base)].sort().join(' ');
}

/**
 * Build the class string for the navbar-toggler button.
 */
function buildTogglerClasses(navbarTogglerClasses?: string | string[]): string {
  const base = [
    'navbar-toggler',
    'collapsed',
    'hamburger',
    'hamburger--collapse',
  ];

  if (navbarTogglerClasses) {
    const extras = Array.isArray(navbarTogglerClasses)
      ? navbarTogglerClasses
      : [navbarTogglerClasses];
    base.push(...extras.filter(Boolean));
  }

  return base.filter(Boolean).join(' ');
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
 * Bootstrap JS handles the `data-bs-toggle="collapse"` behaviour at runtime;
 * this component only supplies `data-bs-*` attributes.
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
  navbarTogglerClasses,
  primaryNav,
  secondaryNav,
  primaryNavCta,
  mobileNavCta,
  socialNavContent,
  showSearch = false,
  additionalContent,
}: HeaderProps) {
  const headerClasses = buildHeaderClasses(navbarBreakpoint, otherClasses);
  const alertClasses = buildAlertClasses(alertOtherClasses);
  const togglerClasses = buildTogglerClasses(navbarTogglerClasses);

  const headerStyle: React.CSSProperties | undefined = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : undefined;

  return (
    <header
      className={headerClasses}
      role="banner"
      id={headerId}
      style={headerStyle}
      data-pattern="timberland/header"
    >
      <div className="site-header--wrapper">

        {/* ---------------------------------------------------------------- */}
        {/* Alert bar                                                         */}
        {/* ---------------------------------------------------------------- */}
        {alertContent && (
          <div className={alertClasses}>
            <div className="site-header--container">
              <div className="site-header--row">
                <div className="site-header--column">
                  {alertContent}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Nav top                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="site-header--nav-top">
          <div className="site-header--row">
            {navTopContent}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Main header content row                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="site-header--content">
          <div className="site-header--container">
            <div className="site-header--row">

              {/* Branding ------------------------------------------------- */}
              <div className="site-header--branding">
                {brand && <Branding {...brand} />}
              </div>

              {/* Navigation ------------------------------------------------ */}
              <div className="site-header--navigation">

                {/* Hamburger toggler */}
                <button
                  type="button"
                  id="navToggle"
                  className={togglerClasses}
                  data-bs-toggle="collapse"
                  data-bs-target="#siteNav"
                  aria-controls="siteNav"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="hamburger-box">
                    <span className="hamburger-inner" />
                  </span>
                </button>

                {/* Mobile CTA — immediately before .navbar-collapse */}
                {mobileNavCta && (
                  <div className="button-wrapper--mobile">
                    <Button {...mobileNavCta} />
                  </div>
                )}

                <div className="site-header--row">
                  {/* Collapsible nav panel */}
                  <div className="collapse navbar-collapse" id="siteNav">
                    <div className="site-header--navbar-wrapper">
                      <div className="site-header--row">

                        {/* Secondary nav + social ------------------------ */}
                        <div className="site-header--secondary-nav">
                          {secondaryNav && (
                            <Nav
                              navbarBreakpoint={navbarBreakpoint}
                              {...secondaryNav}
                            />
                          )}
                          <div className="site-header--social-nav">
                            {socialNavContent}
                          </div>
                        </div>

                        {/* Primary nav + CTA ----------------------------- */}
                        <div className="site-header--primary-nav">
                          {primaryNav && (
                            <Nav
                              navbarBreakpoint={navbarBreakpoint}
                              {...primaryNav}
                            />
                          )}
                          {primaryNavCta && (
                            <div className="button-wrapper">
                              <Button {...primaryNavCta} />
                            </div>
                          )}
                        </div>

                        {/* Search ---------------------------------------- */}
                        <div className="site-header--search">
                          {showSearch && (
                            <form
                              name="header-search"
                              id="headerSearch"
                              className="header-search"
                            >
                              <legend className="visually-hidden">Search</legend>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Search"
                                aria-label="Search"
                              />
                              <button
                                type="submit"
                                className="btn search-submit"
                                aria-label="Submit search"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                  focusable="false"
                                  className="icon"
                                >
                                  <circle cx="11" cy="11" r="8" />
                                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                              </button>
                            </form>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
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
          <div className="site-header--container">
            <div className="site-header--row">
              <div className="site-header--column">
                {additionalContent}
              </div>
            </div>
          </div>
        )}

      </div>
      {/* /site-header--wrapper */}
    </header>
  );
}

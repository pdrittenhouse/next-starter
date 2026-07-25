'use client';
import React from 'react';
import { Branding } from '@/stories/molecules/branding/Branding';
import type { BrandingProps } from '@/stories/molecules/branding/Branding';
import { Button } from '@/stories/atoms/button/Button';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import { Nav } from '@/stories/molecules/nav/Nav';
import type { NavProps } from '@/stories/molecules/nav/Nav';
import { List } from '@/stories/molecules/list/List';
import type { ListProps } from '@/stories/molecules/list/List';
import styles from './footer.module.scss';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FooterProps {
  /**
   * HTML `id` for the `<footer>` element.
   * @default 'siteFooter'
   */
  id?: string;

  /**
   * Additional CSS class names appended to the root `<footer>` element.
   * Mirrors `footer_other_classes` in the Twig pattern.
   */
  otherClasses?: string | string[];

  // ---- Pre-footer content slot ------------------------------------------

  /**
   * Arbitrary content rendered in the pre-footer band above the main
   * content area — mirrors the `additional_content` Twig block.
   */
  additionalContent?: React.ReactNode;

  // ---- Post-footer content slot -----------------------------------------

  /**
   * Arbitrary content rendered in the post-footer band below the main
   * content area — mirrors the `post_footer_content` Twig block.
   */
  postFooterContent?: React.ReactNode;

  // ---- Branding ---------------------------------------------------------

  /**
   * Props forwarded to the Branding molecule rendered in the
   * `site-footer--branding` column. Omit to suppress the branding block.
   */
  brand?: BrandingProps;

  // ---- CTA button -------------------------------------------------------

  /**
   * Props forwarded to the Button atom rendered in the
   * `site-footer--cta` column — mirrors the `cta_button` Twig variable.
   * Omit to suppress the CTA.
   */
  ctaButton?: ButtonProps;

  // ---- Footer navigation ------------------------------------------------

  /**
   * Props forwarded to the Nav molecule rendered in the
   * `site-footer--nav` column — mirrors the `footer_nav` Twig variable.
   * Omit to suppress the footer nav.
   */
  footerNav?: NavProps;

  // ---- Social nav slot --------------------------------------------------

  /**
   * Arbitrary content (typically a SocialNav organism) rendered in the
   * `site-footer--social-nav` column — mirrors the `social_nav` Twig block.
   */
  socialNav?: React.ReactNode;

  // ---- Search -----------------------------------------------------------

  /**
   * Render the built-in search form slot in the `site-footer--search`
   * column. Mirrors the `footer_search` Twig block.
   * @default false
   */
  showSearch?: boolean;

  /**
   * Callback fired when the footer search form is submitted.
   * Receives the raw text-field value.
   */
  onSearch?: (query: string) => void;

  // ---- Company / contact info -------------------------------------------

  /**
   * Props forwarded to the List molecule rendered in the
   * `site-footer--company` column — mirrors the `contact_info` Twig variable.
   * Omit to suppress the contact info block.
   */
  contactInfo?: ListProps;

  // ---- Disclaimer -------------------------------------------------------

  /**
   * Arbitrary content rendered in the `site-footer--disclaimer` div.
   * Mirrors the `disclaimer` Twig block.
   */
  disclaimer?: React.ReactNode;

  // ---- Attribution ------------------------------------------------------

  /**
   * Arbitrary content rendered in the `site-footer--attribution-wrapper` div.
   * Mirrors the `attribution` Twig block.
   */
  attribution?: React.ReactNode;

  // ---- Utilities nav ----------------------------------------------------

  /**
   * Props forwarded to the Nav molecule rendered in the
   * `site-footer--utilities` column — mirrors the `user_nav` Twig variable.
   * Omit to suppress the utilities nav.
   */
  utilitiesNav?: NavProps;

  // ---- Copyright --------------------------------------------------------

  /**
   * Copyright line rendered inside `<div class="copyright">`.
   * Accepts a string or any React node — mirrors the `{{ copyright }}`
   * Twig variable and the `copyright` block.
   */
  copyright?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFooterClasses(otherClasses?: string | string[]): string {
  const base = ['site-footer'];

  if (otherClasses) {
    const extras = Array.isArray(otherClasses) ? otherClasses : [otherClasses];
    base.push(...extras.filter(Boolean));
  }

  return [...new Set(base)].sort().join(' ');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Footer organism — mirrors `timberland/footer` in Pattern Lab.
 *
 * Reproduces the full Twig shell with all six layout regions:
 *
 * 1. **Pre-footer band** (`additional_content` block) — arbitrary content
 *    above the main footer body.
 * 2. **Navigation region** — branding, CTA button, footer nav, social nav,
 *    and optional search form.
 * 3. **Info region** — contact info list, disclaimer, attribution.
 * 4. **Meta region** — utilities nav and copyright line.
 * 5. **Post-footer band** (`post_footer_content` block) — arbitrary content
 *    below the main footer body.
 *
 * Bootstrap 5 utility classes and `data-bs-*` attributes are used throughout;
 * no Bootstrap JS is imported directly — the host page is responsible for
 * loading Bootstrap's JS bundle.
 */
export function Footer({
  id = 'siteFooter',
  otherClasses,
  additionalContent,
  postFooterContent,
  brand,
  ctaButton,
  footerNav,
  socialNav,
  showSearch = false,
  onSearch,
  contactInfo,
  disclaimer,
  attribution,
  utilitiesNav,
  copyright,
}: FooterProps) {
  const footerClass = buildFooterClasses(otherClasses);

  // ---- Search form state (uncontrolled via ref) --------------------------
  const searchRef = React.useRef<HTMLInputElement>(null);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(searchRef.current?.value ?? '');
  }

  // ---- Render ------------------------------------------------------------
  return (
    <footer
      className={footerClass}
      role="contentinfo"
      id={id}
      data-pattern="timberland/footer"
    >
      {/* ---- Pre-footer content band ------------------------------------ */}
      {additionalContent && (
        <div className="site-footer--container">
          <div className="site-footer--row">
            <div className="site-footer--column">
              {additionalContent}
            </div>
          </div>
        </div>
      )}

      {/* ---- Main content ----------------------------------------------- */}
      <div className="site-footer--content">
        <div className="site-footer--container">
          <div className="site-footer--row">

            {/* ---- Navigation region ------------------------------------ */}
            <div className="site-footer--navigation">
              <div className="site-footer--row">

                {/* Branding */}
                {brand && (
                  <div className="site-footer--branding">
                    <Branding {...brand} />
                  </div>
                )}

                {/* CTA button */}
                {ctaButton && (
                  <div className="site-footer--cta">
                    <Button {...ctaButton} />
                  </div>
                )}

                {/* Footer navigation */}
                {footerNav && (
                  <div className="site-footer--nav">
                    <Nav {...footerNav} />
                  </div>
                )}

                {/* Social nav slot */}
                {socialNav && (
                  <div className="site-footer--social-nav">
                    {socialNav}
                  </div>
                )}

                {/* Search form */}
                {showSearch && (
                  <div className="site-footer--search">
                    <form
                      name="footer-search"
                      id="footerSearch"
                      className={`footer-search ${styles.footerSearch}`}
                      onSubmit={handleSearchSubmit}
                    >
                      <fieldset>
                        <legend className="visually-hidden">Search</legend>
                        <div className={styles.footerSearchInner}>
                          <label htmlFor="footerSearchInput" className="visually-hidden">
                            Search
                          </label>
                          <input
                            ref={searchRef}
                            id="footerSearchInput"
                            type="text"
                            className="form-control"
                            placeholder="Search&hellip;"
                          />
                          <button
                            type="submit"
                            className={`btn btn-link search-submit ${styles.searchSubmit}`}
                            aria-label="Submit search"
                          >
                            {/* Search icon — inline SVG keeps the component self-contained */}
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
                            >
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                          </button>
                        </div>
                      </fieldset>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* ---- Info region ------------------------------------------ */}
            {(contactInfo || disclaimer || attribution) && (
              <div className="site-footer--info">
                <div className="site-footer--row">

                  {/* Contact info */}
                  {contactInfo && (
                    <div className="site-footer--company">
                      <List {...contactInfo} />
                    </div>
                  )}

                  {/* Disclaimer */}
                  {disclaimer && (
                    <div className="site-footer--disclaimer-wrapper">
                      <div className="site-footer--disclaimer">
                        {disclaimer}
                      </div>
                    </div>
                  )}

                  {/* Attribution */}
                  {attribution && (
                    <div className="site-footer--attribution-wrapper">
                      {attribution}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---- Meta region ------------------------------------------ */}
            {(utilitiesNav || copyright) && (
              <div className="site-footer--meta">
                <div className="site-footer--row">

                  {/* Utilities nav */}
                  {utilitiesNav && (
                    <div className="site-footer--utilities">
                      <Nav {...utilitiesNav} />
                    </div>
                  )}

                  {/* Copyright */}
                  {copyright && (
                    <div className="site-footer--copyright">
                      <div className="copyright">
                        {copyright}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ---- Post-footer content band ----------------------------------- */}
      {postFooterContent && (
        <div className="site-footer--container">
          <div className="site-footer--row">
            <div className="site-footer--column">
              {postFooterContent}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

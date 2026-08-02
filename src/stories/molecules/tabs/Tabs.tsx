'use client';

import React, { useId, useState } from 'react';
import { Button } from '@/stories/atoms/button/Button';
import styles from './tabs.module.scss';
import { cx } from '@/lib/cx';

/**
 * A single tab item — maps to the per-item variables in `_tabs.tpl.twig`:
 *   - tab.label     → title
 *   - tab.content   → content
 *   - tab.hide_label → hideLabel
 *   - tab.aria_label → ariaLabel
 */
export interface TabItem {
  /**
   * Stable identifier used to generate aria IDs and React keys.
   * Auto-generated from the index when omitted.
   */
  id?: string;
  /** Tab button label text. Maps to `tab.label` in the Twig template. */
  title: string;
  /** Tab panel content. Supports JSX. Maps to `tab.content`. */
  content: React.ReactNode;
  /** Hide the label text visually (icon-only tabs). Maps to `tab.hide_label`. */
  hideLabel?: boolean;
  /** Accessible label override for the tab button. Maps to `tab.aria_label`. */
  ariaLabel?: string;
}

/**
 * Tabs molecule props — mirrors `_tabs.tpl.twig`.
 *
 * Available variables (camelCase equivalents of the Twig variables):
 *   - tabs_type            → tabsType
 *   - nav_pills            → navPills
 *   - fill_justify         → fillJustify
 *   - tabs_id              → id
 *   - tabs_classes         → classes
 *   - tabs_other_classes   → otherClasses
 *   - tabs_other_styles    → otherStyles
 *   - tabs_other_attributes → otherAttributes
 *   - vertical             → vertical
 *   - tabs                 → tabs
 *
 * jQuery-only responsive-tabs options:
 *   - collapsible, startCollapsed, disabledTabs, activeTab,
 *     accordionTabElement, setHash, rotate, event, animation,
 *     animationQueue, duration, fluidHeight, scrollToAccordion,
 *     scrollToAccordionOnLoad, scrollToAccordionOffset
 */
export interface TabsProps {
  /** Tabs JavaScript library. Default: 'bootstrap'. Maps to `tabs_type`. */
  tabsType?: 'bootstrap' | 'jquery';
  /** Use Bootstrap pill style instead of underline tabs. Maps to `nav_pills`. */
  navPills?: boolean;
  /** Equal-width fill or justified alignment. Maps to `fill_justify`. */
  fillJustify?: 'fill' | 'justified';
  /**
   * Explicit HTML id for the component wrapper.
   * Auto-generated via useId() when omitted. Maps to `tabs_id`.
   */
  id?: string;
  /** Additional CSS class names for the wrapper div. Maps to `tabs_classes`. */
  classes?: string[];
  /** Additional plain-string classes for the wrapper div. Maps to `tabs_other_classes`. */
  otherClasses?: string;
  /** Additional inline style string for the wrapper div. Maps to `tabs_other_styles`. */
  otherStyles?: string;
  /** Additional HTML attributes for the wrapper div (key-value pairs). Maps to `tabs_other_attributes`. */
  otherAttributes?: Record<string, string>;
  /** Render tabs vertically (side nav). Maps to `vertical`. */
  vertical?: boolean;
  /** Array of tab objects. Maps to `tabs`. */
  tabs: TabItem[];

  // ── jQuery responsive-tabs options ────────────────────────────────────────
  /** Responsive tabs: whether tabs are collapsible. Maps to `collapsible`. */
  collapsible?: string;
  /** Responsive tabs: whether tabs start collapsed. Maps to `startCollapsed`. */
  startCollapsed?: string;
  /** Responsive tabs: comma-delimited 0-based indices of disabled tabs. Maps to `disabledTabs`. */
  disabledTabs?: string;
  /** Responsive tabs: 0-based index of the initially active tab. Maps to `activeTab`. */
  activeTab?: number;
  /** Responsive tabs: HTML element template for the accordion tab wrapper. Maps to `accordionTabElement`. */
  accordionTabElement?: string;
  /** Responsive tabs: set URL hash to the active tab ref. Maps to `setHash`. */
  setHash?: string;
  /** Responsive tabs: rotate through tabs. Maps to `rotate`. */
  rotate?: string;
  /** Responsive tabs: event to activate a tab (e.g. 'mouseover'). Maps to `event`. */
  event?: string;
  /** Responsive tabs: 'fade' or 'slide' panel animation. Maps to `animation`. */
  animation?: string;
  /** Responsive tabs: enable/disable animation queuing. Maps to `animationQueue`. */
  animationQueue?: string;
  /** Responsive tabs: animation duration in ms. Default 500. Maps to `duration`. */
  duration?: number;
  /** Responsive tabs: adaptive height on panels. Maps to `fluidHeight`. */
  fluidHeight?: string;
  /** Responsive tabs: scroll to accordion when opened. Maps to `scrollToAccordion`. */
  scrollToAccordion?: string;
  /** Responsive tabs: scroll to tabs/accordion on page load. Maps to `scrollToAccordionOnLoad`. */
  scrollToAccordionOnLoad?: string;
  /** Responsive tabs: pixel offset for the scroll feature. Maps to `scrollToAccordionOffset`. */
  scrollToAccordionOffset?: string;
}

/**
 * Tabs molecule — mirrors `src/design-system/patterns/02-molecules/tabs/_tabs.tpl.twig`.
 *
 * Supports two rendering modes:
 *   - **bootstrap** (default): Bootstrap 5 nav-tabs/nav-pills + tab-content.
 *     Active tab state is managed via React `useState` — no Bootstrap JS required.
 *   - **jquery**: Responsive-tabs plugin markup (`ul.tabs > li.tabs__tab > a`).
 *     This mode is unchanged and still relies on the jQuery plugin.
 */
export function Tabs({
  tabsType = 'bootstrap',
  navPills = false,
  fillJustify,
  id,
  classes = [],
  otherClasses,
  otherStyles,
  otherAttributes,
  vertical = false,
  tabs,
  // jQuery options
  collapsible,
  startCollapsed,
  disabledTabs,
  activeTab,
  accordionTabElement,
  setHash,
  rotate,
  event,
  animation,
  animationQueue,
  duration,
  fluidHeight,
  scrollToAccordion,
  scrollToAccordionOnLoad,
  scrollToAccordionOffset,
}: TabsProps) {
  const generatedId = useId().replace(/:/g, '');
  const tabsId = id ?? `tabs_${generatedId}`;

  // Active tab index for Bootstrap mode — managed via React state.
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // ── Wrapper classes ──────────────────────────────────────────────────────
  const wrapperClasses = cx(
    styles,
    'tabs-wrapper',
    vertical && 'vertical',
    tabsType,
    ...classes,
    otherClasses,
  );

  // ── Wrapper data-* attributes (jQuery responsive-tabs options) ───────────
  const wrapperDataAttrs: Record<string, string> = {};
  if (disabledTabs) {
    wrapperDataAttrs['data-disabledtabs'] = disabledTabs;
  }
  if (tabsType === 'jquery') {
    if (collapsible) wrapperDataAttrs['data-collapsible'] = collapsible;
    if (startCollapsed) wrapperDataAttrs['data-startcollapsed'] = startCollapsed;
    if (activeTab !== undefined) {
      wrapperDataAttrs['data-activetab'] = String(activeTab ?? 0);
    }
    if (accordionTabElement) {
      wrapperDataAttrs['data-accordiontabelement'] = accordionTabElement;
    }
    if (setHash) wrapperDataAttrs['data-sethash'] = setHash;
    if (rotate) wrapperDataAttrs['data-rotate'] = rotate;
    if (event) wrapperDataAttrs['data-event'] = event;
    if (animation) wrapperDataAttrs['data-animation'] = animation;
    if (animationQueue) wrapperDataAttrs['data-animationqueue'] = animationQueue;
    if (duration !== undefined) {
      wrapperDataAttrs['data-duration'] = String(duration ?? 500);
    }
    if (fluidHeight) wrapperDataAttrs['data-fluidheight'] = fluidHeight;
    if (scrollToAccordion) {
      wrapperDataAttrs['data-scrolltoaccordion'] = scrollToAccordion;
    }
    if (scrollToAccordionOnLoad) {
      wrapperDataAttrs['data-scrolltoaccordiononload'] = scrollToAccordionOnLoad;
    }
    if (scrollToAccordionOffset) {
      wrapperDataAttrs['data-scrolltoaccordionoffset'] = scrollToAccordionOffset;
    }
  }

  // ── Inline style string → React CSSProperties (best-effort) ─────────────
  const wrapperStyle = otherStyles
    ? ({ cssText: otherStyles } as React.CSSProperties)
    : undefined;

  // ── Bootstrap tabs variant ───────────────────────────────────────────────
  if (tabsType === 'bootstrap') {
    const navListClasses = cx(
      styles,
      'nav',
      navPills ? 'nav-pills' : 'nav-tabs',
      fillJustify ? `nav-${fillJustify}` : null,
    );

    return (
      <div
        id={tabsId}
        className={wrapperClasses}
        style={wrapperStyle}
        data-pattern="timberland/tabs"
        {...wrapperDataAttrs}
        {...otherAttributes}
      >
        {/* Tab navigation */}
        <nav>
          <div className={navListClasses} role="tablist">
            {tabs.map((tab, i) => {
              const btnId = `${tabsId}--tab-${i + 1}-link`;
              const panelId = `${tabsId}--tab-${i + 1}`;
              const isActive = i === activeTabIndex;
              return (
                <Button
                  key={tab.id ?? i}
                  id={btnId}
                  variant="primary"
                  label={tab.title}
                  className={cx(styles, 'nav-link', isActive && 'active')}
                  controls={panelId}
                  role="tab"
                  hideLabel={tab.hideLabel}
                  active={isActive}
                  onClick={() => setActiveTabIndex(i)}
                  {...(tab.ariaLabel ? { 'aria-label': tab.ariaLabel } : {})}
                  {...({ 'aria-selected': isActive ? 'true' : 'false' } as Record<string, string>)}
                />
              );
            })}
          </div>
        </nav>

        {/* Tab panels */}
        <div className={cx(styles, 'tab-content')}>
          {tabs.map((tab, i) => {
            const btnId = `${tabsId}--tab-${i + 1}-link`;
            const panelId = `${tabsId}--tab-${i + 1}`;
            const isActive = i === activeTabIndex;
            return (
              <div
                key={tab.id ?? i}
                id={panelId}
                className={cx(styles, 'tab-pane', 'fade', isActive && 'show', isActive && 'active')}
                role="tabpanel"
                aria-labelledby={btnId}
              >
                <div className={cx(styles, 'tab-pane-inner')}>{tab.content}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── jQuery responsive-tabs variant ───────────────────────────────────────
  const jqueryListClasses = cx(
    styles,
    'tabs',
    'clearfix',
    vertical && 'vertical',
  );

  return (
    <div
      id={tabsId}
      className={wrapperClasses}
      style={wrapperStyle}
      data-pattern="timberland/tabs"
      {...wrapperDataAttrs}
      {...otherAttributes}
    >
      {/* Tab list */}
      <ul className={jqueryListClasses} role="tablist">
        {tabs.map((tab, i) => {
          const linkId = `${tabsId}--tab-${i + 1}-link`;
          const panelId = `${tabsId}--tab-${i + 1}`;
          return (
            <li key={tab.id ?? i} className={cx(styles, 'tabs__tab')} role="presentation">
              <a
                href={`#${panelId}`}
                id={linkId}
                className={cx(styles, 'tabs__tab-link')}
                role="tab"
                aria-controls={panelId}
                aria-selected={i === 0 ? 'true' : 'false'}
                tabIndex={i === 0 ? 0 : -1}
              >
                {tab.title}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Tab panels */}
      {tabs.map((tab, i) => {
        const linkId = `${tabsId}--tab-${i + 1}-link`;
        const panelId = `${tabsId}--tab-${i + 1}`;
        return (
          <div
            key={tab.id ?? i}
            id={panelId}
            className={cx(styles, 'tabs__content-wrapper', i === 0 && 'show', i === 0 && 'active')}
            role="tabpanel"
            aria-labelledby={linkId}
          >
            <div className={cx(styles, 'tabs__content')}>{tab.content}</div>
          </div>
        );
      })}
    </div>
  );
}

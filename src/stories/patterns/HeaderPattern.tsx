import { cache } from 'react';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { Header } from '@/stories/organisms/header/Header';
import { SocialNav } from '@/stories/organisms/social-nav/SocialNav';
import type { SocialNavItem } from '@/stories/organisms/social-nav/SocialNav';
import { menuItemsToNavItems } from '@/lib/wp/utils/menuToNavItems';
import { acfButtonToProps } from '@/lib/wp/utils/acfButtonToProps';
import GET_CUSTOMIZER_SETTINGS from '@/lib/wp/queries/customizer-settings';
import { GET_HEADER_OPTIONS, GET_HEADER_LAYOUT_OPTIONS, GET_CO_BRAND } from '@/lib/wp/queries/acf-options';
import { GET_MENU_BY_LOCATION } from '@/lib/wp/queries/menus';
import { GET_WIDGET_AREA_BLOCKS } from '@/lib/wp/queries/widgets';
import { buildBlockTree } from '@/lib/wp/utils/blockTree';
import { BlockRenderer } from '@/stories/templates/partials/block-renderer';
import type { NavbarBreakpoint } from '@/stories/organisms/header/Header';
import type { BrandingProps } from '@/stories/molecules/branding/Branding';

const getCustomizerSettings = cache(async () => {
  const { data } = await fetchGraphQL<{ customizerSettings: any; generalSettings: any }>(
    print(GET_CUSTOMIZER_SETTINGS),
  ).catch(() => ({ data: null }));
  if (!data) return null;
  return {
    ...(data as any).customizerSettings,
    generalSettings: (data as any).generalSettings ?? null,
  };
});

const getCoBrand = cache(async () => {
  const { data } = await fetchGraphQL(print(GET_CO_BRAND)).catch(() => ({ data: null }));
  return (data as any)?.themeGeneralOptions?.settingsThemeGeneralOptions?.coBrand ?? null;
});

const getHeaderOptions = cache(async () => {
  const { data } = await fetchGraphQL<{ themeHeaderOptions: any }>(
    print(GET_HEADER_OPTIONS),
  ).catch(() => ({ data: null }));
  return (data as any)?.themeHeaderOptions?.settingsHeaderOptions ?? null;
});

const getHeaderLayoutOptions = cache(async () => {
  const { data } = await fetchGraphQL<{ themeOptions: any }>(
    print(GET_HEADER_LAYOUT_OPTIONS),
  ).catch(() => ({ data: null }));
  return (data as any)?.themeOptions?.headerLayoutOptions ?? null;
});

const getWidgetAreaBlocks = cache(async (slug: string) => {
  const { data } = await fetchGraphQL(print(GET_WIDGET_AREA_BLOCKS), { slug }).catch(() => ({ data: null }));
  return (data as any)?.widgetAreaBlocks ?? null;
});

const getMenuByLocation = cache(async (location: string) => {
  const { data } = await fetchGraphQL<{ menus: { nodes: any[] } }>(
    print(GET_MENU_BY_LOCATION),
    { location },
  ).catch(() => ({ data: null }));
  return (data as any)?.menus?.nodes?.[0] ?? null;
});

export async function HeaderPattern() {
  const [
    customizer, headerOptions, layout, coBrandData,
    headerAlertsBlocks, headerWidgetBlocks,
    primaryMenu, secondaryMenu, socialMenu,
  ] = await Promise.all([
    getCustomizerSettings(),
    getHeaderOptions(),
    getHeaderLayoutOptions(),
    getCoBrand(),
    getWidgetAreaBlocks('header_alerts_widget_area'),
    getWidgetAreaBlocks('header_widget_area'),
    getMenuByLocation('PRIMARY'),
    getMenuByLocation('SECONDARY'),
    getMenuByLocation('SOCIAL'),
  ]);

  if (headerOptions?.hideHeader) return null;

  // ── Navbar breakpoint ────────────────────────────────────────────────
  const rawBp = Array.isArray(headerOptions?.navbarBreakpoint)
    ? headerOptions.navbarBreakpoint[0]
    : headerOptions?.navbarBreakpoint;
  const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', 'xxl'];
  const navbarBreakpoint = (BREAKPOINTS.includes(rawBp) ? rawBp : 'lg') as NavbarBreakpoint;

  // ── Branding ─────────────────────────────────────────────────────────
  const logoSrc: string | undefined = customizer?.customLogo?.sourceUrl ?? undefined;
  const siteName: string | undefined = customizer?.generalSettings?.title ?? undefined;
  const siteSlogan: string | undefined = customizer?.generalSettings?.description ?? undefined;
  const displayHeaderText: boolean = customizer?.displayHeaderText !== false;

  const isSvgLogo = logoSrc?.toLowerCase().endsWith('.svg') ?? false;

  const brand = logoSrc || siteName
    ? {
        url: '/',
        logoSvgInline: isSvgLogo ? logoSrc : undefined,
        logoBgImgSrc:  !isSvgLogo ? logoSrc : undefined,
        otherClasses: 'navbar-brand',
        siteName,
        siteSlogan,
        hideSiteName: !displayHeaderText,
        hideSiteSlogan: !displayHeaderText,
        colorOriginal: headerOptions?.headerLogoUseOriginalColor ?? false,
        height: headerOptions?.brandHeight ?? undefined,
      }
    : undefined;

  // ── Co-brand ─────────────────────────────────────────────────────────
  const coBrandNode = coBrandData?.node;
  const coBrand: BrandingProps | undefined = coBrandNode?.sourceUrl
    ? {
        logoImgSrc: coBrandNode.sourceUrl,
        otherClasses: 'co-brand',
      }
    : undefined;

  // ── Layout modifier classes ───────────────────────────────────────────
  const layoutOpts = layout ?? {};
  const menuPos: string = layoutOpts.mobileNavMenuPosition ?? '';
  const headerLayout: string | null = headerOptions?.siteHeaderLayout?.headerLayout ?? null;

  const layoutClasses = [
    headerLayout && headerLayout !== 'default' ? `site-header-${headerLayout}` : null,
    layoutOpts.fullWidthHeader === 'mobile'  ? 'full-width-mobile'        : null,
    layoutOpts.fullWidthHeader === 'desktop' ? 'full-width-desktop'       : null,
    layoutOpts.fullWidthHeader === 'both'    ? 'full-width'               : null,
    layoutOpts.centerHeaderContent           ? 'center-mobile'            : null,
    layoutOpts.desktopLogoRight              ? 'logo-right'               : null,
    layoutOpts.showMobileCtaButton           ? 'show-mobile-button'       : null,
    layoutOpts.alignMobileCtaButton          ? 'align-mobile-button'      : null,
    layoutOpts.fullHeightMobileCtaButton     ? 'full-height-mobile-cta'   : null,
    layoutOpts.navToggleRelativeToContainer  ? 'relative-to-container'    : null,
    layoutOpts.centerNavToggle               ? 'center-nav-toggle'        : null,
    layoutOpts.inlineMobileNavToggle         ? 'inline-toggle'            : null,
    layoutOpts.reverseMobileButtons          ? 'reverse-mobile-buttons'   : null,
    menuPos === 'top'                        ? 'mobile-nav-top'           : null,
    menuPos === 'bottom'                     ? 'mobile-nav-bottom'        : null,
    menuPos === 'left'                       ? 'mobile-nav-left'          : null,
    menuPos === 'right'                      ? 'mobile-nav-right'         : null,
    menuPos === 'overlay'                    ? 'mobile-nav-overlay'       : null,
    layoutOpts.alignNavToContent             ? 'align-to-content'         : null,
    layoutOpts.fullScreenNav                 ? 'full-screen-mobile-nav'   : null,
    layoutOpts.centerMobileNavContent        ? 'center-mobile-nav-content': null,
  ].filter(Boolean) as string[];

  // ── Alert content + layout ───────────────────────────────────────────
  const alertContent = headerOptions?.headerAlertMessage
    ? <span dangerouslySetInnerHTML={{ __html: headerOptions.headerAlertMessage }} />
    : undefined;

  // alertLayout is a seamless clone field — flattened to settingsHeaderOptions.alertLayout.
  // Class is only emitted when value is not 'default', future-proofing for new layout choices.
  const alertLayoutVal: string | null = headerOptions?.alertLayout ?? null;
  const alertOtherClasses = alertLayoutVal && alertLayoutVal !== 'default'
    ? `alert-layout-${alertLayoutVal}`
    : undefined;

  // ── Visibility toggles ───────────────────────────────────────────────
  const hidePrimaryBoth   = layoutOpts.hidePrimaryNav   === 'both';
  const hideSecondaryBoth = layoutOpts.hideSecondaryNav === 'both';
  const hideSocialBoth    = layoutOpts.hideSocialNav    === 'both';
  const hideCtaBoth       = layoutOpts.hideHeaderCta    === 'both';
  const hideSearchBoth    = layoutOpts.hideHeaderSearch === 'both';

  // Hide hamburger toggler when every nav element is hidden on both viewports
  const hideToggler =
    hidePrimaryBoth && hideCtaBoth && hideSearchBoth && hideSecondaryBoth && hideSocialBoth;

  // ── H8: content-hidden header shell ─────────────────────────────────
  // When hideHeaderContent is true, WP renders the same layout shell (with the
  // same layout classes, alert, and toggler) but replaces all nav/brand/CTA
  // slots with widget-area content. In headless we render the shell empty.
  if (headerOptions?.hideHeaderContent) {
    return (
      <Header
        navbarBreakpoint={navbarBreakpoint}
        backgroundImage={customizer?.headerImage || undefined}
        otherClasses={layoutClasses.length ? layoutClasses : undefined}
        navbarTogglerClasses={hideToggler ? 'd-none' : undefined}
        hamburgerAnimation={headerOptions?.hamburgerAnimation ?? undefined}
        alertContent={alertContent}
        alertOtherClasses={alertOtherClasses}
        navTopContent={headerAlertsBlocks?.length ? <BlockRenderer blocks={buildBlockTree(headerAlertsBlocks)} /> : undefined}
        additionalContent={headerWidgetBlocks?.length ? <BlockRenderer blocks={buildBlockTree(headerWidgetBlocks)} /> : undefined}
      />
    );
  }

  // ── Per-viewport visibility class helper ─────────────────────────────
  // Mirrors header.twig:277–410 — d-none d-{bp}-flex for mobile, d-{bp}-none
  // for desktop. 'both' is handled by not passing the element at all.
  const visClass = (val: string | null | undefined): string | undefined => {
    if (val === 'mobile')  return `d-none d-${navbarBreakpoint}-flex`;
    if (val === 'desktop') return `d-${navbarBreakpoint}-none`;
    return undefined;
  };

  // ── Navigation ───────────────────────────────────────────────────────
  // navId, navOtherClasses, and navbarBreakpoint mirror header.twig:274–284
  // (secondary) and header.twig:312–323 (primary).
  const secondaryNavVisibility = visClass(layoutOpts.hideSecondaryNav);
  const secondaryNavItems = secondaryMenu?.menuItems?.edges?.length
    ? {
        items: menuItemsToNavItems(secondaryMenu.menuItems.edges),
        navId: 'secondaryNav',
        navbarBreakpoint: 'xs',
        navOtherClasses: ['secondary-nav', secondaryNavVisibility].filter(Boolean).join(' ') || undefined,
      }
    : undefined;

  const primaryNavVisibility = visClass(layoutOpts.hidePrimaryNav);
  const primaryNavItems = primaryMenu?.menuItems?.edges?.length
    ? {
        items: menuItemsToNavItems(primaryMenu.menuItems.edges),
        navbarId: 'primaryNavigation',
        navId: 'primaryNav',
        navOtherClasses: ['primary-nav', primaryNavVisibility].filter(Boolean).join(' ') || undefined,
        relativeMegaMenu: !!(headerOptions?.enableMegaMenus && headerOptions?.navItemRelative),
      }
    : undefined;

  // ── CTA buttons ──────────────────────────────────────────────────────
  // ctaVisibility merges the layout-level hide flag into the button's className,
  // alongside the button-level placement visibility from acfButtonToProps.
  const ctaVisibility = visClass(layoutOpts.hideHeaderCta);
  const primaryNavCta = acfButtonToProps(
    headerOptions?.headerCta?.headerCta,
    navbarBreakpoint,
    ['header-cta-button', ctaVisibility].filter(Boolean) as string[],
  );
  const mobileNavCta = acfButtonToProps(
    headerOptions?.headerCta?.headerMobileCta,
    navbarBreakpoint,
    ['header-cta-button', 'mobile-cta'],
  );

  // H12: .button-wrapper--mobile gets d-none when showMobileCtaButton is false.
  // Mirrors header.twig:370 — show_button != true ? 'd-none'
  const mobileNavCtaWrapperClasses = !layoutOpts.showMobileCtaButton ? 'd-none' : undefined;

  // ── Social nav ───────────────────────────────────────────────────────
  // WP social menu items carry the network name as a CSS class (e.g. 'facebook', 'twitter').
  // Mirror Twig social-nav.twig: strip 'menu-item*' utility classes and pass the remaining
  // class(es) — typically the bare network name — directly to SocialNav so it routes to the
  // correct renderer (spritemap for custom names, BI/FA for icon class strings).
  const socialCssToIcon = (cssClasses: string[] | null | undefined): string | undefined => {
    if (!cssClasses) return undefined;
    const iconClasses = cssClasses.filter(Boolean).filter((cls: string) => !cls.startsWith('menu-item'));
    const icon = iconClasses.sort().join(' ').trim();
    return icon || undefined;
  };

  const socialNavVisibility = visClass(layoutOpts.hideSocialNav);
  const socialNavItems: SocialNavItem[] = socialMenu?.menuItems?.edges?.length
    ? socialMenu.menuItems.edges.map(({ node }: any) => ({
        url: node.url || node.path || '#',
        label: node.label || node.title || '',
        target: node.target || '_blank',
        icon: socialCssToIcon(node.cssClasses),
      }))
    : [];

  // ── Search visibility ─────────────────────────────────────────────────
  const searchVisibility = visClass(layoutOpts.hideHeaderSearch);

  return (
    <Header
      navbarBreakpoint={navbarBreakpoint}
      backgroundImage={customizer?.headerImage || undefined}
      otherClasses={layoutClasses.length ? layoutClasses : undefined}
      navbarTogglerClasses={hideToggler ? 'd-none' : undefined}
      hamburgerAnimation={headerOptions?.hamburgerAnimation ?? undefined}
      brand={brand}
      coBrand={coBrand}
      primaryNav={!hidePrimaryBoth ? primaryNavItems : undefined}
      secondaryNav={!hideSecondaryBoth ? secondaryNavItems : undefined}
      primaryNavCta={!hideCtaBoth ? primaryNavCta : undefined}
      mobileNavCta={mobileNavCta}
      mobileNavCtaWrapperClasses={mobileNavCtaWrapperClasses}
      showSearch={!hideSearchBoth}
      searchWrapperClasses={hideSearchBoth ? undefined : searchVisibility}
      socialNavContent={
        !hideSocialBoth && socialNavItems.length
          ? <SocialNav items={socialNavItems} hideLabels bulletIconSize="18px" />
          : undefined
      }
      socialNavWrapperClasses={hideSocialBoth ? undefined : socialNavVisibility}
      alertContent={alertContent}
      alertOtherClasses={alertOtherClasses}
      navTopContent={headerAlertsBlocks?.length ? <BlockRenderer blocks={buildBlockTree(headerAlertsBlocks)} /> : undefined}
      additionalContent={headerWidgetBlocks?.length ? <BlockRenderer blocks={buildBlockTree(headerWidgetBlocks)} /> : undefined}
    />
  );
}

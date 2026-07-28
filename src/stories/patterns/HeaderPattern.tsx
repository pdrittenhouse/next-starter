import { cache } from 'react';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { Header } from '@/stories/organisms/header/Header';
import { SocialNav } from '@/stories/organisms/social-nav/SocialNav';
import type { SocialNavItem } from '@/stories/organisms/social-nav/SocialNav';
import { menuItemsToNavItems } from '@/lib/wp/utils/menuToNavItems';
import { acfButtonToProps } from '@/lib/wp/utils/acfButtonToProps';
import GET_CUSTOMIZER_SETTINGS from '@/lib/wp/queries/customizer-settings';
import { GET_HEADER_OPTIONS, GET_HEADER_LAYOUT_OPTIONS } from '@/lib/wp/queries/acf-options';
import { GET_MENU_BY_LOCATION } from '@/lib/wp/queries/menus';
import type { NavbarBreakpoint } from '@/stories/organisms/header/Header';

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

const getMenuByLocation = cache(async (location: string) => {
  const { data } = await fetchGraphQL<{ menus: { nodes: any[] } }>(
    print(GET_MENU_BY_LOCATION),
    { location },
  ).catch(() => ({ data: null }));
  return (data as any)?.menus?.nodes?.[0] ?? null;
});

export async function HeaderPattern() {
  const [customizer, headerOptions, layout, primaryMenu, secondaryMenu, socialMenu] = await Promise.all([
    getCustomizerSettings(),
    getHeaderOptions(),
    getHeaderLayoutOptions(),
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

  const brand = logoSrc || siteName
    ? {
        url: '/',
        logoImgSrc: logoSrc,
        otherClasses: 'navbar-brand',
        siteName,
        siteSlogan,
        hideSiteName: !displayHeaderText,
        hideSiteSlogan: !displayHeaderText,
      }
    : undefined;

  // ── Layout modifier classes ───────────────────────────────────────────
  const layoutOpts = layout ?? {};
  const menuPos: string = layoutOpts.mobileNavMenuPosition ?? '';

  const layoutClasses = [
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

  // ── Visibility toggles ───────────────────────────────────────────────
  const hidePrimaryBoth   = layoutOpts.hidePrimaryNav   === 'both';
  const hideSecondaryBoth = layoutOpts.hideSecondaryNav === 'both';
  const hideSocialBoth    = layoutOpts.hideSocialNav    === 'both';
  const hideCtaBoth       = layoutOpts.hideHeaderCta    === 'both';
  const hideSearchBoth    = layoutOpts.hideHeaderSearch === 'both';

  // Hide hamburger toggler when every nav element is hidden on both viewports
  const hideToggler =
    hidePrimaryBoth && hideCtaBoth && hideSearchBoth && hideSecondaryBoth && hideSocialBoth;

  // ── Navigation ───────────────────────────────────────────────────────
  const primaryNavItems = primaryMenu?.menuItems?.edges?.length
    ? { items: menuItemsToNavItems(primaryMenu.menuItems.edges) }
    : undefined;

  const secondaryNavItems = secondaryMenu?.menuItems?.edges?.length
    ? { items: menuItemsToNavItems(secondaryMenu.menuItems.edges) }
    : undefined;

  const primaryNavCta = acfButtonToProps(
    headerOptions?.headerCta?.headerCta,
    navbarBreakpoint,
    ['header-cta-button'],
  );
  const mobileNavCta = acfButtonToProps(
    headerOptions?.headerCta?.headerMobileCta,
    navbarBreakpoint,
    ['header-cta-button', 'mobile-cta'],
  );

  const socialNavItems: SocialNavItem[] = socialMenu?.menuItems?.edges?.length
    ? socialMenu.menuItems.edges.map(({ node }: any) => ({
        url: node.url || node.path || '#',
        label: node.label || node.title || '',
        target: node.target || '_blank',
        icon: node.cssClasses?.filter(Boolean).join(' ') || undefined,
      }))
    : [];

  const alertContent = headerOptions?.headerAlertMessage
    ? <span dangerouslySetInnerHTML={{ __html: headerOptions.headerAlertMessage }} />
    : undefined;

  return (
    <Header
      navbarBreakpoint={navbarBreakpoint}
      backgroundImage={customizer?.headerImage || undefined}
      otherClasses={layoutClasses.length ? layoutClasses : undefined}
      navbarTogglerClasses={hideToggler ? 'd-none' : undefined}
      brand={brand}
      primaryNav={!hidePrimaryBoth ? primaryNavItems : undefined}
      secondaryNav={!hideSecondaryBoth ? secondaryNavItems : undefined}
      primaryNavCta={!hideCtaBoth ? primaryNavCta : undefined}
      mobileNavCta={!hideCtaBoth ? mobileNavCta : undefined}
      showSearch={!hideSearchBoth}
      socialNavContent={
        !hideSocialBoth && socialNavItems.length
          ? <SocialNav items={socialNavItems} hideLabels />
          : undefined
      }
      alertContent={alertContent}
    />
  );
}

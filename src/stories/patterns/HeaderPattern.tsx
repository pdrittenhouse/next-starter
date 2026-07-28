import { cache } from 'react';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { Header } from '@/stories/organisms/header/Header';
import { SocialNav } from '@/stories/organisms/social-nav/SocialNav';
import type { SocialNavItem } from '@/stories/organisms/social-nav/SocialNav';
import { menuItemsToNavItems } from '@/lib/wp/utils/menuToNavItems';
import { acfButtonToProps } from '@/lib/wp/utils/acfButtonToProps';
import GET_CUSTOMIZER_SETTINGS from '@/lib/wp/queries/customizer-settings';
import { GET_HEADER_OPTIONS } from '@/lib/wp/queries/acf-options';
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
  const { data } = await fetchGraphQL<{
    themeHeaderOptions: any;
    headerNavTop: string | null;
    headerAdditional: string | null;
  }>(print(GET_HEADER_OPTIONS)).catch(() => ({ data: null }));
  return {
    options: (data as any)?.themeHeaderOptions?.settingsHeaderOptions ?? null,
    headerNavTop: (data as any)?.headerNavTop ?? null,
    headerAdditional: (data as any)?.headerAdditional ?? null,
  };
});

const getMenuByLocation = cache(async (location: string) => {
  const { data } = await fetchGraphQL<{ menus: { nodes: any[] } }>(
    print(GET_MENU_BY_LOCATION),
    { location },
  ).catch(() => ({ data: null }));
  return (data as any)?.menus?.nodes?.[0] ?? null;
});

export async function HeaderPattern() {
  const [customizer, { options: headerOptions, headerNavTop, headerAdditional }, primaryMenu, secondaryMenu, socialMenu] = await Promise.all([
    getCustomizerSettings(),
    getHeaderOptions(),
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
  const layout = customizer?.headerLayoutOptions ?? {};
  const menuPos: string = layout.mobileNavMenuPosition ?? '';

  const layoutClasses = [
    layout.fullWidthHeader === 'mobile'  ? 'full-width-mobile'        : null,
    layout.fullWidthHeader === 'desktop' ? 'full-width-desktop'       : null,
    layout.fullWidthHeader === 'both'    ? 'full-width'               : null,
    layout.centerHeaderContent           ? 'center-mobile'            : null,
    layout.desktopLogoRight              ? 'logo-right'               : null,
    layout.showMobileCtaButton           ? 'show-mobile-button'       : null,
    layout.alignMobileCtaButton          ? 'align-mobile-button'      : null,
    layout.fullHeightMobileCtaButton     ? 'full-height-mobile-cta'   : null,
    layout.navToggleRelativeToContainer  ? 'relative-to-container'    : null,
    layout.centerNavToggle               ? 'center-nav-toggle'        : null,
    layout.inlineMobileNavToggle         ? 'inline-toggle'            : null,
    layout.reverseMobileButtons          ? 'reverse-mobile-buttons'   : null,
    menuPos === 'top'                    ? 'mobile-nav-top'           : null,
    menuPos === 'bottom'                 ? 'mobile-nav-bottom'        : null,
    menuPos === 'left'                   ? 'mobile-nav-left'          : null,
    menuPos === 'right'                  ? 'mobile-nav-right'         : null,
    menuPos === 'overlay'                ? 'mobile-nav-overlay'       : null,
    layout.alignNavToContent             ? 'align-to-content'         : null,
    layout.fullScreenNav                 ? 'full-screen-mobile-nav'   : null,
    layout.centerMobileNavContent        ? 'center-mobile-nav-content': null,
  ].filter(Boolean) as string[];

  // ── Visibility toggles ───────────────────────────────────────────────
  const hidePrimaryBoth   = layout.hidePrimaryNav   === 'both';
  const hideSecondaryBoth = layout.hideSecondaryNav === 'both';
  const hideSocialBoth    = layout.hideSocialNav    === 'both';
  const hideCtaBoth       = layout.hideHeaderCta    === 'both';
  const hideSearchBoth    = layout.hideHeaderSearch === 'both';

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

  // ── Slots ────────────────────────────────────────────────────────────
  const alertContent = headerOptions?.headerAlertMessage
    ? <span dangerouslySetInnerHTML={{ __html: headerOptions.headerAlertMessage }} />
    : undefined;

  const navTopContent = headerNavTop
    ? <div dangerouslySetInnerHTML={{ __html: headerNavTop }} />
    : undefined;

  const additionalContent = headerAdditional
    ? <div dangerouslySetInnerHTML={{ __html: headerAdditional }} />
    : undefined;

  return (
    <Header
      navbarBreakpoint={navbarBreakpoint}
      backgroundImage={customizer?.headerImage || undefined}
      otherClasses={layoutClasses.length ? layoutClasses : undefined}
      hamburgerAnimation={headerOptions?.hamburgerAnimation || undefined}
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
      navTopContent={navTopContent}
      additionalContent={additionalContent}
    />
  );
}

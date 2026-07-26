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
  const { data } = await fetchGraphQL<{ customizerSettings: any }>(
    print(GET_CUSTOMIZER_SETTINGS),
  ).catch(() => ({ data: null }));
  return (data as any)?.customizerSettings ?? null;
});

const getHeaderOptions = cache(async () => {
  const { data } = await fetchGraphQL<{ themeHeaderOptions: any }>(
    print(GET_HEADER_OPTIONS),
  ).catch(() => ({ data: null }));
  return (data as any)?.themeHeaderOptions?.settingsHeaderOptions ?? null;
});

const getMenuByLocation = cache(async (location: string) => {
  const { data } = await fetchGraphQL<{ menus: { nodes: any[] } }>(
    print(GET_MENU_BY_LOCATION),
    { location },
  ).catch(() => ({ data: null }));
  return (data as any)?.menus?.nodes?.[0] ?? null;
});

export async function HeaderPattern() {
  const [customizer, headerOptions, primaryMenu, secondaryMenu, socialMenu] = await Promise.all([
    getCustomizerSettings(),
    getHeaderOptions(),
    getMenuByLocation('PRIMARY'),
    getMenuByLocation('SECONDARY'),
    getMenuByLocation('SOCIAL'),
  ]);

  if (headerOptions?.hideHeader) return null;

  const rawBp = Array.isArray(headerOptions?.navbarBreakpoint)
    ? headerOptions.navbarBreakpoint[0]
    : headerOptions?.navbarBreakpoint;
  const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', 'xxl'];
  const navbarBreakpoint = (BREAKPOINTS.includes(rawBp) ? rawBp : 'lg') as NavbarBreakpoint;

  const logoSrc: string | undefined = customizer?.customLogo?.sourceUrl ?? undefined;
  const logoAlt: string | undefined = customizer?.customLogo?.altText ?? undefined;

  const brand = logoSrc
    ? { url: '/', logoImgSrc: logoSrc, siteName: logoAlt }
    : undefined;

  const primaryNav = primaryMenu?.menuItems?.edges?.length
    ? { items: menuItemsToNavItems(primaryMenu.menuItems.edges) }
    : undefined;

  const secondaryNav = secondaryMenu?.menuItems?.edges?.length
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
      brand={brand}
      primaryNav={primaryNav}
      secondaryNav={secondaryNav}
      primaryNavCta={primaryNavCta}
      mobileNavCta={mobileNavCta}
      showSearch
      socialNavContent={socialNavItems.length ? <SocialNav items={socialNavItems} hideLabels /> : undefined}
      alertContent={alertContent}
    />
  );
}

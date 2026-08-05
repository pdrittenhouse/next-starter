import { cache } from 'react';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import styles from './FooterPattern.module.scss';
import { cx } from '@/lib/cx';
import { Footer } from '@/stories/patterns/organisms/footer/Footer';
import { SocialNav } from '@/stories/patterns/organisms/social-nav/SocialNav';
import type { SocialNavItem } from '@/stories/patterns/organisms/social-nav/SocialNav';
import type { ListItem } from '@/stories/patterns/molecules/list/List';
import type { BrandingProps } from '@/stories/patterns/molecules/branding/Branding';
import { menuItemsToNavItems } from '@/lib/wp/utils/menuToNavItems';
import { acfButtonToProps } from '@/lib/wp/utils/acfButtonToProps';
import GET_CUSTOMIZER_SETTINGS from '@/lib/wp/queries/customizer-settings';
import { GET_FOOTER_OPTIONS, GET_FOOTER_LAYOUT_OPTIONS, GET_CO_BRAND } from '@/lib/wp/queries/acf-options';
import { GET_MENU_BY_LOCATION } from '@/lib/wp/queries/menus';
import { GET_WIDGET_AREA_BLOCKS } from '@/lib/wp/queries/widgets';
import { buildBlockTree } from '@/lib/wp/utils/blockTree';
import { BlockRenderer } from '@/stories/templates/partials/block-renderer';

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

const getFooterOptions = cache(async () => {
  const { data } = await fetchGraphQL<{ themeFooterOptions: any }>(
    print(GET_FOOTER_OPTIONS),
  ).catch(() => ({ data: null }));
  return (data as any)?.themeFooterOptions?.settingsFooterOptions ?? null;
});

const getFooterLayoutOptions = cache(async () => {
  const { data } = await fetchGraphQL<{ themeOptions: any }>(
    print(GET_FOOTER_LAYOUT_OPTIONS),
  ).catch(() => ({ data: null }));
  return (data as any)?.themeOptions?.footerLayoutOptions ?? null;
});

const getMenuByLocation = cache(async (location: string) => {
  const { data } = await fetchGraphQL<{ menus: { nodes: any[] } }>(
    print(GET_MENU_BY_LOCATION),
    { location },
  ).catch(() => ({ data: null }));
  return (data as any)?.menus?.nodes?.[0] ?? null;
});

const getWidgetAreaBlocks = cache(async (slug: string) => {
  const { data } = await fetchGraphQL(print(GET_WIDGET_AREA_BLOCKS), { slug }).catch(() => ({ data: null }));
  return (data as any)?.widgetAreaBlocks ?? null;
});

export async function FooterPattern() {
  const [customizer, footerOptions, layout, coBrandData, footerMenu, utilityMenu, socialMenu, footerWidgetBlocks, postFooterWidgetBlocks] = await Promise.all([
    getCustomizerSettings(),
    getFooterOptions(),
    getFooterLayoutOptions(),
    getCoBrand(),
    getMenuByLocation('FOOTER'),
    getMenuByLocation('UTILITY'),
    getMenuByLocation('SOCIAL'),
    getWidgetAreaBlocks('footer_widget_area'),
    getWidgetAreaBlocks('post_footer_widget_area'),
  ]);

  if (footerOptions?.hideFooterContent) return null;

  const layoutOpts = layout ?? {};

  // ── Per-viewport visibility class helper (footer breakpoint is always xxl) ─
  // Mirrors footer.twig — d-none d-xxl-flex for mobile-only, d-xxl-none for
  // desktop-only. 'both' is handled by not passing the element at all.
  const visClassXxl = (val: string | null | undefined): string | undefined => {
    if (val === 'mobile')  return 'd-none d-xxl-flex';
    if (val === 'desktop') return 'd-xxl-none';
    return undefined;
  };

  // ── Footer layout classes ─────────────────────────────────────────────────
  // site-footer-{layout}: from siteFooterLayout ACF clone field (seamless).
  // two-cols / reverse-cols / reverse-meta: from Customizer theme mods.
  const footerLayout: string | null = footerOptions?.siteFooterLayout?.footerLayout ?? null;
  const otherClasses = [
    footerLayout && footerLayout !== 'default' ? `site-footer-${footerLayout}` : null,
    layoutOpts.footerTwoColumnLayout      ? 'two-cols'     : null,
    layoutOpts.footerReverseColumnLayout  ? 'reverse-cols' : null,
    layoutOpts.footerReverseMetaColumns   ? 'reverse-meta' : null,
  ].filter(Boolean) as string[];

  // ── Branding ──────────────────────────────────────────────────────────────
  const hideBrandBoth     = layoutOpts.hideFooterBrand === 'both';
  const brandVisibility   = visClassXxl(layoutOpts.hideFooterBrand);

  const logoSrc: string | undefined        = customizer?.customLogo?.sourceUrl ?? undefined;
  const siteTitle: string                  = customizer?.generalSettings?.title ?? '';
  const siteSlogan: string | undefined     = customizer?.generalSettings?.description ?? undefined;
  const displayHeaderText: boolean         = customizer?.displayHeaderText !== false;
  const isSvgLogo                          = logoSrc?.toLowerCase().endsWith('.svg') ?? false;

  const footerLogoHeight: number | undefined = footerOptions?.footerLogoHeight ?? undefined;

  const brand = !hideBrandBoth && (logoSrc || siteTitle)
    ? {
        url: '/',
        logoSvgInline: isSvgLogo ? logoSrc : undefined,
        logoBgImgSrc:  !isSvgLogo ? logoSrc : undefined,
        height: !isSvgLogo ? (footerLogoHeight ?? 125) : undefined,
        otherClasses: 'footer-brand',
        siteName: siteTitle || undefined,
        siteSlogan,
        hideSiteName: !displayHeaderText,
        hideSiteSlogan: !displayHeaderText,
        colorOriginal: footerOptions?.footerLogoUseOriginalColor ?? false,
      }
    : undefined;

  const coBrandNode = coBrandData?.node;
  const coBrand: BrandingProps | undefined = !hideBrandBoth && coBrandNode?.sourceUrl
    ? {
        logoImgSrc: coBrandNode.sourceUrl,
        otherClasses: 'co-brand',
      }
    : undefined;

  const brandWrapperClasses = brandVisibility;

  // ── Navigation ────────────────────────────────────────────────────────────
  const hideFooterNavBoth   = layoutOpts.hideFooterNav === 'both';
  const footerNavVisibility = visClassXxl(layoutOpts.hideFooterNav);

  const footerNav = !hideFooterNavBoth && footerMenu?.menuItems?.edges?.length
    ? {
        items: menuItemsToNavItems(footerMenu.menuItems.edges),
        navId: 'footerNav',
        navbarBreakpoint: 'md',
        navbarAriaLabel: 'Footer Navigation',
        navOtherClasses: ['footer-nav', footerNavVisibility].filter(Boolean).join(' ') || undefined,
      }
    : undefined;

  const hideUtilityNavBoth    = layoutOpts.hideFooterUtilityNav === 'both';
  const utilityNavVisibility  = visClassXxl(layoutOpts.hideFooterUtilityNav);

  const utilitiesNav = !hideUtilityNavBoth && utilityMenu?.menuItems?.edges?.length
    ? {
        items: menuItemsToNavItems(utilityMenu.menuItems.edges),
        navId: 'utilityNav',
        navbarBreakpoint: 'xs',
        navbarAriaLabel: 'Utility Navigation',
        navOtherClasses: ['utility-nav', utilityNavVisibility].filter(Boolean).join(' ') || undefined,
      }
    : undefined;

  // ── Social nav ────────────────────────────────────────────────────────────
  const hideSocialNavBoth   = layoutOpts.hideFooterSocialNav === 'both';
  const socialNavVisibility = visClassXxl(layoutOpts.hideFooterSocialNav);

  const socialNavItems: SocialNavItem[] = !hideSocialNavBoth && socialMenu?.menuItems?.edges?.length
    ? socialMenu.menuItems.edges.map(({ node }: any) => ({
        url: node.url || node.path || '#',
        label: node.label || node.title || '',
        target: node.target || '_blank',
        icon: node.cssClasses?.filter(Boolean).join(' ') || undefined,
      }))
    : [];

  // ── CTA button ────────────────────────────────────────────────────────────
  const hideCtaBoth    = layoutOpts.hideFooterCta === 'both';
  const ctaVisibility  = visClassXxl(layoutOpts.hideFooterCta);

  const ctaButton = !hideCtaBoth
    ? acfButtonToProps(
        footerOptions?.footerCta,
        'xxl',
        ['footer-cta-button', ctaVisibility].filter(Boolean) as string[],
      )
    : undefined;

  // ── Search ────────────────────────────────────────────────────────────────
  const hideSearchBoth    = layoutOpts.hideFooterSearch === 'both';
  const searchVisibility  = visClassXxl(layoutOpts.hideFooterSearch);
  const showSearch        = !hideSearchBoth;
  const searchWrapperClasses = showSearch ? searchVisibility : undefined;

  // ── Contact info list ─────────────────────────────────────────────────────
  const hideContactInfoBoth    = layoutOpts.hideFooterContactInfo === 'both';
  const contactInfoVisibility  = visClassXxl(layoutOpts.hideFooterContactInfo);

  const contactItems: ListItem[] = [];

  if (!hideContactInfoBoth) {
    const phone   = footerOptions?.footerContactPhone;
    const email   = footerOptions?.footerContactEmail;
    const address = footerOptions?.footerContactAddress;

    if (phone?.phoneNumber) {
      contactItems.push({
        itemText: (
          <>
            {phone.phoneLabel && <strong>{phone.phoneLabel}: </strong>}
            <a href={`tel:${phone.phoneNumber}`}>{phone.phoneNumber}</a>
          </>
        ),
      });
    }
    if (email?.emailAddress) {
      contactItems.push({
        itemText: (
          <>
            {email.emailLabel && <strong>{email.emailLabel}: </strong>}
            <a href={`mailto:${email.emailAddress}`}>{email.emailAddress}</a>
          </>
        ),
      });
    }
    if (address?.address) {
      contactItems.push({
        itemText: (
          <>
            {address.addressLabel && <strong>{address.addressLabel}: </strong>}
            <span dangerouslySetInnerHTML={{ __html: address.address }} />
          </>
        ),
      });
    }
  }

  const contactInfoWrapperClasses = contactInfoVisibility;

  // ── Disclaimer ────────────────────────────────────────────────────────────
  const hideDisclaimerBoth    = layoutOpts.hideFooterDisclaimer === 'both';
  const disclaimerVisibility  = visClassXxl(layoutOpts.hideFooterDisclaimer);

  const disclaimer = !hideDisclaimerBoth && footerOptions?.footerDisclaimer
    ? <div dangerouslySetInnerHTML={{ __html: footerOptions.footerDisclaimer }} />
    : undefined;

  const disclaimerWrapperClasses = disclaimerVisibility;

  // ── Attribution ───────────────────────────────────────────────────────────
  const hideAttributionBoth    = layoutOpts.hideFooterAttribution === 'both';
  const attributionVisibility  = visClassXxl(layoutOpts.hideFooterAttribution);

  const attribution = !hideAttributionBoth && footerOptions?.footerAttribution
    ? <div dangerouslySetInnerHTML={{ __html: footerOptions.footerAttribution }} />
    : undefined;

  const attributionWrapperClasses = attributionVisibility;

  // ── Copyright ─────────────────────────────────────────────────────────────
  // Per-element hide flags add class names to the .copyright div so CSS can
  // selectively hide the label/icon/year/name spans without removing them from
  // the DOM — mirrors footer.twig copyright hide pattern.
  const hideCopyrightBoth    = layoutOpts.hideFooterCopyright === 'both';
  const copyrightVisibility  = visClassXxl(layoutOpts.hideFooterCopyright);

  const copyrightOtherClasses = [
    copyrightVisibility,
    layoutOpts.hideFooterCopyrightLabel    ? 'hide-label' : null,
    layoutOpts.hideFooterCopyrightIcon     ? 'hide-icon'  : null,
    layoutOpts.hideFooterCopyrightYear     ? 'hide-year'  : null,
    layoutOpts.hideFooterCopyrightSiteName ? 'hide-name'  : null,
  ].filter(Boolean).join(' ') || undefined;

  const year = new Date().getFullYear();
  const copyright = !hideCopyrightBoth && siteTitle ? (
    <>
      <span className={cx(styles, 'label')}>Copyright</span>{' '}
      <span className={cx(styles, 'icon')}>©</span>{' '}
      <span className={cx(styles, 'year')}>{year}</span>{' '}
      <span className={cx(styles, 'name')}>{siteTitle}</span>
    </>
  ) : undefined;

  return (
    <Footer
      otherClasses={otherClasses.length ? otherClasses : undefined}
      brand={brand}
      coBrand={coBrand}
      brandWrapperClasses={brandWrapperClasses}
      additionalContent={footerWidgetBlocks?.length ? <BlockRenderer blocks={buildBlockTree(footerWidgetBlocks)} /> : undefined}
      postFooterContent={postFooterWidgetBlocks?.length ? <BlockRenderer blocks={buildBlockTree(postFooterWidgetBlocks)} /> : undefined}
      ctaButton={ctaButton}
      footerNav={footerNav}
      socialNav={
        !hideSocialNavBoth && socialNavItems.length
          ? <SocialNav items={socialNavItems} hideLabels bulletIconSize="18px" otherClasses="footer-social-nav" />
          : undefined
      }
      socialNavWrapperClasses={hideSocialNavBoth ? undefined : socialNavVisibility}
      showSearch={showSearch}
      searchWrapperClasses={searchWrapperClasses}
      contactInfo={contactItems.length ? { items: contactItems, parentOtherClasses: 'site-footer--contact-info' } : undefined}
      contactInfoWrapperClasses={contactInfoWrapperClasses}
      disclaimer={disclaimer}
      disclaimerWrapperClasses={disclaimerWrapperClasses}
      attribution={attribution}
      attributionWrapperClasses={attributionWrapperClasses}
      utilitiesNav={utilitiesNav}
      copyright={copyright}
      copyrightOtherClasses={copyrightOtherClasses}
    />
  );
}

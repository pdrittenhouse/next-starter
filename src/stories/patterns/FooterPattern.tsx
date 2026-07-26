import { cache } from 'react';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { Footer } from '@/stories/organisms/footer/Footer';
import type { ListItem } from '@/stories/molecules/list/List';
import { menuItemsToNavItems } from '@/lib/wp/utils/menuToNavItems';
import { acfButtonToProps } from '@/lib/wp/utils/acfButtonToProps';
import GET_CUSTOMIZER_SETTINGS from '@/lib/wp/queries/customizer-settings';
import { GET_FOOTER_OPTIONS } from '@/lib/wp/queries/acf-options';
import { GET_MENU_BY_LOCATION } from '@/lib/wp/queries/menus';

const getCustomizerSettings = cache(async () => {
  const { data } = await fetchGraphQL<{ customizerSettings: any }>(
    print(GET_CUSTOMIZER_SETTINGS),
  ).catch(() => ({ data: null }));
  return (data as any)?.customizerSettings ?? null;
});

const getFooterOptions = cache(async () => {
  const { data } = await fetchGraphQL<{ themeFooterOptions: any }>(
    print(GET_FOOTER_OPTIONS),
  ).catch(() => ({ data: null }));
  return (data as any)?.themeFooterOptions?.settingsFooterOptions ?? null;
});

const getMenuByLocation = cache(async (location: string) => {
  const { data } = await fetchGraphQL<{ menus: { nodes: any[] } }>(
    print(GET_MENU_BY_LOCATION),
    { location },
  ).catch(() => ({ data: null }));
  return (data as any)?.menus?.nodes?.[0] ?? null;
});

const getSiteTitle = cache(async () => {
  const { data } = await fetchGraphQL<{ generalSettings: { title: string } }>(
    `query { generalSettings { title } }`,
  ).catch(() => ({ data: null }));
  return (data as any)?.generalSettings?.title ?? '';
});

export async function FooterPattern() {
  const [customizer, footerOptions, footerMenu, utilityMenu, siteTitle] = await Promise.all([
    getCustomizerSettings(),
    getFooterOptions(),
    getMenuByLocation('FOOTER'),
    getMenuByLocation('UTILITY'),
    getSiteTitle(),
  ]);

  if (footerOptions?.hideFooterContent) return null;

  const logoSrc: string | undefined = customizer?.customLogo?.sourceUrl ?? undefined;
  const logoAlt: string | undefined = customizer?.customLogo?.altText ?? undefined;

  const brand = logoSrc
    ? { url: '/', logoImgSrc: logoSrc, siteName: logoAlt }
    : undefined;

  const footerNav = footerMenu?.menuItems?.edges?.length
    ? { items: menuItemsToNavItems(footerMenu.menuItems.edges) }
    : undefined;

  const utilitiesNav = utilityMenu?.menuItems?.edges?.length
    ? { items: menuItemsToNavItems(utilityMenu.menuItems.edges) }
    : undefined;

  // Contact info list
  const contactItems: ListItem[] = [];
  const phone = footerOptions?.footerContactPhone;
  const email = footerOptions?.footerContactEmail;
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

  const ctaButton = acfButtonToProps(
    footerOptions?.footerCta,
    'xxl',
    ['footer-cta-button'],
  );

  const disclaimer = footerOptions?.footerDisclaimer
    ? <div dangerouslySetInnerHTML={{ __html: footerOptions.footerDisclaimer }} />
    : undefined;

  const attribution = footerOptions?.footerAttribution
    ? <div dangerouslySetInnerHTML={{ __html: footerOptions.footerAttribution }} />
    : undefined;

  const year = new Date().getFullYear();
  const copyright = siteTitle ? (
    <>
      <span className="label">Copyright</span>{' '}
      <span className="icon">©</span>{' '}
      <span className="year">{year}</span>{' '}
      <span className="name">{siteTitle}</span>
    </>
  ) : undefined;

  return (
    <Footer
      brand={brand}
      footerNav={footerNav}
      ctaButton={ctaButton}
      showSearch
      contactInfo={contactItems.length ? { items: contactItems } : undefined}
      disclaimer={disclaimer}
      attribution={attribution}
      utilitiesNav={utilitiesNav}
      copyright={copyright}
    />
  );
}

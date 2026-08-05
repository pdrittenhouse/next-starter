import type { Meta, StoryObj } from '@storybook/nextjs';
import { Footer } from './Footer';

// ---------------------------------------------------------------------------
// Shared fixture data
// ---------------------------------------------------------------------------

const FOOTER_NAV_ITEMS = [
  { url: '/about', title: 'About Us' },
  { url: '/services', title: 'Services' },
  { url: '/portfolio', title: 'Portfolio' },
  { url: '/blog', title: 'Blog' },
  { url: '/contact', title: 'Contact' },
];

const UTILITIES_NAV_ITEMS = [
  { url: '/privacy', title: 'Privacy Policy' },
  { url: '/terms', title: 'Terms of Service' },
  { url: '/accessibility', title: 'Accessibility' },
  { url: '/sitemap', title: 'Sitemap' },
];

const CONTACT_INFO_ITEMS = [
  { itemText: '123 Blossom Lane, Portland, OR 97201' },
  { itemText: '(503) 555-0142' },
  { itemText: 'hello@naturalrose.com' },
];

const COPYRIGHT = `© ${new Date().getFullYear()} Natural Rose. All rights reserved.`;

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Footer> = {
  title: 'Design System/Organisms/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Footer organism — mirrors `timberland/footer` in Pattern Lab. ' +
          'Renders the full site footer shell with five layout regions: a pre-footer ' +
          'content band, a navigation region (branding, CTA, nav, social nav, search), ' +
          'an info region (contact list, disclaimer, attribution), a meta region ' +
          '(utilities nav + copyright), and a post-footer band. ' +
          'All regions are optional — omitting every prop for a region suppresses it entirely.',
      },
    },
  },
  argTypes: {
    id: {
      control: 'text',
      description: 'HTML `id` for the `<footer>` element.',
    },
    otherClasses: {
      control: 'text',
      description: 'Additional CSS class names appended to the root `<footer>` element.',
    },
    showSearch: {
      control: 'boolean',
      description: 'Render the built-in search form in the `site-footer--search` column.',
    },
    copyright: {
      control: 'text',
      description: 'Copyright line rendered inside `<div class="copyright">`.',
    },
  },
  args: {
    id: 'siteFooter',
    copyright: COPYRIGHT,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default — full footer with all regions populated
// ---------------------------------------------------------------------------

/**
 * The complete footer with branding, CTA button, footer nav, contact info,
 * disclaimer, utilities nav, and copyright.
 */
export const Default: Story = {
  args: {
    brand: {
      url: '/',
      siteName: 'Natural Rose',
      siteSlogan: 'Grown with care, delivered with love',
      nameElement: 'h2',
    },
    ctaButton: {
      variant: 'primary',
      label: 'Shop Now',
      href: '/shop',
      as: 'a',
    },
    footerNav: {
      navbarId: 'footerNav',
      navbarAriaLabel: 'Footer navigation',
      items: FOOTER_NAV_ITEMS,
    },
    contactInfo: {
      items: CONTACT_INFO_ITEMS,
    },
    disclaimer: 'All flowers are sustainably sourced and delivered within 48 hours of harvest.',
    utilitiesNav: {
      navbarId: 'utilitiesNav',
      navbarAriaLabel: 'Utilities navigation',
      items: UTILITIES_NAV_ITEMS,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Full footer with all regions active: branding, CTA button, navigation, ' +
          'contact info list, disclaimer, utilities nav, and copyright.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Minimal — copyright only
// ---------------------------------------------------------------------------

/**
 * Stripped-down footer with only the copyright line — useful for landing pages
 * or logged-in app shells where nav is unnecessary.
 */
export const Minimal: Story = {
  args: {
    brand: undefined,
    ctaButton: undefined,
    footerNav: undefined,
    contactInfo: undefined,
    utilitiesNav: undefined,
    disclaimer: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Only the copyright line is rendered. Every other region is omitted by leaving ' +
          'its prop `undefined` — the corresponding DOM sections are not emitted at all.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// BrandingOnly — logo + slogan, no nav
// ---------------------------------------------------------------------------

/**
 * Footer with branding block and copyright, no navigation columns.
 * Typical for single-page or microsite contexts.
 */
export const BrandingOnly: Story = {
  args: {
    brand: {
      url: '/',
      siteName: 'Natural Rose',
      siteSlogan: 'Grown with care, delivered with love',
      nameElement: 'h2',
    },
    ctaButton: undefined,
    footerNav: undefined,
    contactInfo: undefined,
    utilitiesNav: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The navigation region renders with only the branding block visible. ' +
          'CTA, nav, social nav, and search are all suppressed.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WithSearch — footer search form enabled
// ---------------------------------------------------------------------------

/**
 * Footer with the built-in search form slot visible.
 * The `onSearch` callback fires when the form is submitted.
 */
export const WithSearch: Story = {
  args: {
    brand: {
      url: '/',
      siteName: 'Natural Rose',
      nameElement: 'h2',
    },
    footerNav: {
      navbarId: 'footerNavSearch',
      navbarAriaLabel: 'Footer navigation',
      items: FOOTER_NAV_ITEMS,
    },
    showSearch: true,
    utilitiesNav: {
      navbarId: 'utilitiesNavSearch',
      navbarAriaLabel: 'Utilities navigation',
      items: UTILITIES_NAV_ITEMS,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pass `showSearch={true}` to render the built-in `footer-search` form. ' +
          'Wire `onSearch` to receive the submitted query string.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WithPrePostBands — additional_content and post_footer_content slots
// ---------------------------------------------------------------------------

/**
 * Demonstrates the pre-footer and post-footer content bands — arbitrary JSX
 * passed to `additionalContent` and `postFooterContent`.
 */
export const WithPrePostBands: Story = {
  args: {
    additionalContent: 'Subscribe to our newsletter for seasonal offers.',
    brand: {
      url: '/',
      siteName: 'Natural Rose',
      nameElement: 'h2',
    },
    utilitiesNav: {
      navbarId: 'utilitiesNavBands',
      navbarAriaLabel: 'Utilities navigation',
      items: UTILITIES_NAV_ITEMS,
    },
    postFooterContent: 'Built with the Timberland framework.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `additionalContent` slot renders in the pre-footer band above the main ' +
          'content area; `postFooterContent` renders in the post-footer band below it. ' +
          'Both accept arbitrary React nodes — pass a newsletter sign-up, promo banner, ' +
          'or legal text.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WithAttribution — disclaimer + attribution blocks
// ---------------------------------------------------------------------------

/**
 * Info region with all three columns: contact list, disclaimer text, and
 * an attribution block (e.g. "Powered by …").
 */
export const WithAttribution: Story = {
  args: {
    brand: {
      url: '/',
      siteName: 'Natural Rose',
      nameElement: 'h2',
    },
    contactInfo: {
      items: CONTACT_INFO_ITEMS,
    },
    disclaimer:
      'All flowers are sustainably sourced and delivered within 48 hours of harvest. ' +
      'Prices may vary by season and availability.',
    attribution: 'Powered by the Timberland WordPress framework.',
    utilitiesNav: {
      navbarId: 'utilitiesNavAttr',
      navbarAriaLabel: 'Utilities navigation',
      items: UTILITIES_NAV_ITEMS,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'The info region renders all three columns: contact info list, disclaimer text, ' +
          'and an attribution note. Pass any React node to `disclaimer` and `attribution`.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WithDropdownNav — footer nav with dropdown sub-menus
// ---------------------------------------------------------------------------

/**
 * Footer nav with nested dropdown sub-menus, demonstrating that the Nav
 * molecule's full dropdown capabilities work inside the footer.
 */
export const WithDropdownNav: Story = {
  args: {
    brand: {
      url: '/',
      siteName: 'Natural Rose',
      nameElement: 'h2',
    },
    footerNav: {
      navbarId: 'footerNavDropdown',
      navbarAriaLabel: 'Footer navigation',
      items: [
        { url: '/', title: 'Home' },
        {
          url: '#',
          title: 'Products',
          navId: 'products',
          items: [
            { url: '/roses', title: 'Roses' },
            { url: '/seasonal', title: 'Seasonal Arrangements' },
            { url: '/gifts', title: 'Gift Sets' },
          ],
        },
        {
          url: '#',
          title: 'Company',
          navId: 'company',
          items: [
            { url: '/about', title: 'Our Story' },
            { url: '/growers', title: 'Our Growers' },
            { url: '/sustainability', title: 'Sustainability' },
          ],
        },
        { url: '/contact', title: 'Contact' },
      ],
    },
    utilitiesNav: {
      navbarId: 'utilitiesNavDrop',
      navbarAriaLabel: 'Utilities navigation',
      items: UTILITIES_NAV_ITEMS,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'The footer nav supports the same dropdown capabilities as the Nav molecule. ' +
          'Items with nested `items` arrays render Bootstrap dropdown menus.',
      },
    },
  },
};

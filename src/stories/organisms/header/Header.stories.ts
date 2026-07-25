import type { Meta, StoryObj } from '@storybook/nextjs';
import { Header } from './Header';

// ---------------------------------------------------------------------------
// Shared sample data
// ---------------------------------------------------------------------------

const PRIMARY_NAV_ITEMS = [
  { url: '/about', title: 'About' },
  { url: '/services', title: 'Services', items: [
    { url: '/services/design', title: 'Design' },
    { url: '/services/development', title: 'Development' },
    { url: '/services/strategy', title: 'Strategy' },
  ]},
  { url: '/portfolio', title: 'Portfolio' },
  { url: '/blog', title: 'Blog' },
  { url: '/contact', title: 'Contact' },
];

const SECONDARY_NAV_ITEMS = [
  { url: '/login', title: 'Login' },
  { url: '/support', title: 'Support' },
  { url: '/faq', title: 'FAQ' },
];

const SAMPLE_LOGO_SRC = 'https://picsum.photos/seed/timberland-logo/200/60';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" width="160" height="48" aria-hidden="true">
  <rect width="160" height="48" rx="4" fill="currentColor" opacity="0.15"/>
  <text x="80" y="30" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="currentColor">NATURAL ROSE</text>
</svg>`;

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Header> = {
  title: 'Design System/Organisms/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Header organism — mirrors `timberland/header` in Pattern Lab. ' +
          'Full Bootstrap 5 site header with an optional alert bar, branding, ' +
          'hamburger mobile toggle, primary & secondary Nav slots, a CTA button, ' +
          'social nav slot, optional search form, and an additional content slot. ' +
          'Bootstrap JS handles `data-bs-toggle="collapse"` at runtime.',
      },
    },
  },
  argTypes: {
    navbarBreakpoint: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Bootstrap navbar expand breakpoint (`navbar-expand-{bp}`).',
    },
    headerId: {
      control: 'text',
      description: '`id` attribute on the `<header>` element.',
    },
    backgroundImage: {
      control: 'text',
      description: 'URL for an optional background image on the header.',
    },
    showSearch: {
      control: 'boolean',
      description: 'Render the search form inside `site-header--search`.',
    },
  },
  args: {
    navbarBreakpoint: 'lg',
    headerId: 'siteHeader',
    showSearch: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default header: image logo, site name, primary nav, and a CTA button.
 * Best represents the typical production configuration.
 */
export const Default: Story = {
  args: {
    brand: {
      url: '/',
      logoImgSrc: SAMPLE_LOGO_SRC,
      width: 200,
      height: 60,
      siteName: 'Natural Rose',
      hideSiteSlogan: true,
    },
    primaryNav: {
      navbarId: 'primaryNav',
      navbarAriaLabel: 'Primary navigation',
      items: PRIMARY_NAV_ITEMS,
    },
    primaryNavCta: {
      variant: 'primary',
      as: 'a',
      href: '/get-started',
      label: 'Get Started',
      size: 'sm',
    },
  },
};

/**
 * Full-featured header: alert bar, secondary nav, social nav slot, search,
 * primary nav, and CTA button.
 */
export const FullFeatured: Story = {
  name: 'Full Featured',
  args: {
    alertContent: 'Free shipping on orders over $50 — Use code BLOOM25 at checkout.',
    brand: {
      url: '/',
      logoSvgInline: SAMPLE_SVG,
      siteName: 'Natural Rose',
      siteSlogan: 'Grown with care, delivered with love',
      hideSiteName: false,
      hideSiteSlogan: false,
    },
    secondaryNav: {
      navbarId: 'secondaryNav',
      navbarAriaLabel: 'Secondary navigation',
      items: SECONDARY_NAV_ITEMS,
    },
    primaryNav: {
      navbarId: 'primaryNav',
      navbarAriaLabel: 'Primary navigation',
      items: PRIMARY_NAV_ITEMS,
    },
    primaryNavCta: {
      variant: 'primary',
      as: 'a',
      href: '/shop',
      label: 'Shop Now',
      size: 'sm',
    },
    showSearch: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'All available slots populated: alert bar, SVG logo with slogan, ' +
          'secondary nav, primary nav with CTA, and the search form.',
      },
    },
  },
};

/**
 * Minimal header: SVG logo only, no nav, no CTA. Useful for landing pages
 * or checkout flows that require a distraction-free header.
 */
export const Minimal: Story = {
  args: {
    brand: {
      url: '/',
      logoSvgInline: SAMPLE_SVG,
      hideSiteName: true,
      hideSiteSlogan: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Logo-only header — no navigation, no CTA. Ideal for landing pages ' +
          'or checkout flows where you want to limit user exit points.',
      },
    },
  },
};

/**
 * Header with an alert bar only — demonstrates the alert slot in isolation.
 */
export const WithAlertBar: Story = {
  name: 'With Alert Bar',
  args: {
    alertContent: 'We are experiencing intermittent issues. Thank you for your patience.',
    alertOtherClasses: 'alert-warning',
    brand: {
      url: '/',
      logoImgSrc: SAMPLE_LOGO_SRC,
      width: 200,
      height: 60,
      siteName: 'Natural Rose',
      hideSiteSlogan: true,
    },
    primaryNav: {
      navbarId: 'primaryNav',
      navbarAriaLabel: 'Primary navigation',
      items: PRIMARY_NAV_ITEMS,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pass any `React.ReactNode` to `alertContent` to render the alert bar. ' +
          'The block is omitted when `alertContent` is absent. ' +
          '`alertOtherClasses` appends extra classes (e.g. Bootstrap utility colors) ' +
          'to the alert wrapper.',
      },
    },
  },
};

/**
 * Header with a primary-nav hover dropdown. Hover over "Services" on a wide
 * viewport to see the CSS hover behaviour.
 */
export const WithHoverDropdown: Story = {
  name: 'With Hover Dropdown',
  args: {
    brand: {
      url: '/',
      logoImgSrc: SAMPLE_LOGO_SRC,
      width: 200,
      height: 60,
      siteName: 'Natural Rose',
      hideSiteSlogan: true,
    },
    primaryNav: {
      navbarId: 'primaryNav',
      navbarAriaLabel: 'Primary navigation',
      hoverDropdown: true,
      navbarBreakpoint: 'lg',
      items: PRIMARY_NAV_ITEMS,
    },
    primaryNavCta: {
      variant: 'primary',
      outline: true,
      as: 'a',
      href: '/contact',
      label: 'Contact Us',
      size: 'sm',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pass `hoverDropdown: true` on the `primaryNav` prop to activate ' +
          'CSS hover-based dropdowns. Bootstrap\'s click-toggle still works on mobile.',
      },
    },
  },
};

/**
 * Narrow breakpoint (`sm`) — the hamburger toggle appears even on tablet.
 */
export const SmBreakpoint: Story = {
  name: 'Breakpoint: sm',
  args: {
    navbarBreakpoint: 'sm',
    brand: {
      url: '/',
      logoImgSrc: SAMPLE_LOGO_SRC,
      width: 200,
      height: 60,
      siteName: 'Natural Rose',
      hideSiteSlogan: true,
    },
    primaryNav: {
      navbarId: 'primaryNav',
      navbarAriaLabel: 'Primary navigation',
      items: PRIMARY_NAV_ITEMS,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Setting `navbarBreakpoint` to `"sm"` adds `navbar-expand-sm` to the header ' +
          'element, collapsing the nav on all viewports narrower than 576 px.',
      },
    },
  },
};

/**
 * Header with a background image — demonstrates the `backgroundImage` prop.
 */
export const WithBackgroundImage: Story = {
  name: 'With Background Image',
  args: {
    backgroundImage: 'https://picsum.photos/seed/header-bg/1440/200',
    brand: {
      url: '/',
      logoSvgInline: SAMPLE_SVG,
      hideSiteName: true,
      hideSiteSlogan: true,
    },
    primaryNav: {
      navbarId: 'primaryNav',
      navbarAriaLabel: 'Primary navigation',
      items: PRIMARY_NAV_ITEMS,
    },
    primaryNavCta: {
      variant: 'light',
      as: 'a',
      href: '/shop',
      label: 'Shop Now',
      size: 'sm',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pass a URL to `backgroundImage` to set an inline `background-image` style ' +
          'on the `<header>` element. Pair with custom SCSS for repeat / size / position.',
      },
    },
  },
};

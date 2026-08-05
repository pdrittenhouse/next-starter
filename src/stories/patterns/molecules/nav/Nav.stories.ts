import type { Meta, StoryObj } from '@storybook/nextjs';
import { Nav } from './Nav';

const meta: Meta<typeof Nav> = {
  title: 'Design System/Molecules/Nav',
  component: Nav,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Nav molecule — mirrors the theme\'s Pattern Lab `timberland/nav` pattern. ' +
          'Renders a Bootstrap 5 `<nav>` with recursive dropdown support, mega menus, ' +
          'hover-dropdown CSS injection, and all Bootstrap layout modifiers (tabs, pills, fill, justified). ' +
          'Bootstrap JS is loaded globally; this component uses `data-bs-*` attributes only.',
      },
    },
  },
  argTypes: {
    navbarId: {
      control: 'text',
      description: 'HTML `id` for the `<nav>` wrapper.',
    },
    navbarAriaLabel: {
      control: 'text',
      description: '`aria-label` for the `<nav>` wrapper.',
    },
    navbarBreakpoint: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'xxl', 'none'],
      description: 'Bootstrap navbar expand breakpoint — controls `flex-{bp}-row` on the nav list.',
    },
    hoverDropdown: {
      control: 'boolean',
      description: 'Enable CSS hover-based dropdowns (injects responsive `<style>` block).',
    },
    navTabs: {
      control: 'boolean',
      description: 'Render nav items as Bootstrap tabs.',
    },
    navPills: {
      control: 'boolean',
      description: 'Render nav links as Bootstrap pills.',
    },
    navFill: {
      control: 'boolean',
      description: 'Force nav items to fill available width.',
    },
    navJustified: {
      control: 'boolean',
      description: 'Force nav items to equal width.',
    },
    navElement: {
      control: 'select',
      options: ['ul', 'ol', 'div'],
      description: 'HTML element for the nav list.',
    },
    relativeMegaMenu: {
      control: 'boolean',
      description: 'Position mega menus relative to the item rather than the viewport.',
    },
    containerRelativeMenu: {
      control: 'boolean',
      description: 'Position mega menus relative to a containing element.',
    },
    toggleOpenMenus: {
      control: 'boolean',
      description: 'Add `toggle-open-menus` behaviour class.',
    },
  },
  args: {
    navbarId: 'navbarNav',
    navbarBreakpoint: 'lg',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default — flat nav
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    navbarAriaLabel: 'Main navigation',
    items: [
      { url: '/', title: 'Home' },
      { url: '/about', title: 'About' },
      { url: '/services', title: 'Services' },
      { url: '/blog', title: 'Blog' },
      { url: '/contact', title: 'Contact' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Flat navigation with no dropdowns. Items are stacked on mobile and horizontal at the `lg` breakpoint.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WithDropdown — multi-level nested menus
// ---------------------------------------------------------------------------

export const WithDropdown: Story = {
  name: 'With Dropdown',
  args: {
    navbarAriaLabel: 'Main navigation',
    items: [
      { url: '/', title: 'Home' },
      {
        url: '#',
        title: 'Services',
        navId: 'services',
        items: [
          { url: '/services/web-design', title: 'Web Design' },
          { url: '/services/development', title: 'Development' },
          { url: '/services/seo', title: 'SEO' },
        ],
      },
      {
        url: '#',
        title: 'Company',
        navId: 'company',
        items: [
          { url: '/about', title: 'About Us' },
          {
            url: '#',
            title: 'Leadership',
            navId: 'leadership',
            items: [
              { url: '/team/board', title: 'Board of Directors' },
              { url: '/team/management', title: 'Management Team' },
            ],
          },
          { url: '/careers', title: 'Careers' },
        ],
      },
      { url: '/contact', title: 'Contact' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Nested dropdowns with multi-level support. Items with `items` arrays receive `dropdown` and `dropdown-toggle` classes automatically.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// HoverDropdown — CSS hover menus
// ---------------------------------------------------------------------------

export const HoverDropdown: Story = {
  name: 'Hover Dropdown',
  args: {
    hoverDropdown: true,
    navbarBreakpoint: 'lg',
    navbarAriaLabel: 'Main navigation',
    items: [
      { url: '/', title: 'Home' },
      {
        url: '#',
        title: 'Products',
        navId: 'products',
        items: [
          { url: '/products/starter', title: 'Starter Plan' },
          { url: '/products/pro', title: 'Pro Plan' },
          { url: '/products/enterprise', title: 'Enterprise' },
        ],
      },
      {
        url: '#',
        title: 'Resources',
        navId: 'resources',
        items: [
          { url: '/docs', title: 'Documentation' },
          { url: '/blog', title: 'Blog' },
          { url: '/support', title: 'Support' },
        ],
      },
      { url: '/pricing', title: 'Pricing' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Enables hover-based dropdowns by injecting a responsive `<style>` block. ' +
          'On desktop (above the breakpoint) dropdowns open on hover; on mobile they stack.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// NavTabs — tab-style navigation
// ---------------------------------------------------------------------------

export const NavTabs: Story = {
  name: 'Nav Tabs',
  args: {
    navTabs: true,
    navbarBreakpoint: undefined,
    items: [
      { url: '#overview', title: 'Overview' },
      { url: '#features', title: 'Features' },
      { url: '#pricing', title: 'Pricing' },
      { url: '#faq', title: 'FAQ' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Applies `nav-tabs` to render links as Bootstrap tab buttons.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// NavPills — pill-style navigation
// ---------------------------------------------------------------------------

export const NavPills: Story = {
  name: 'Nav Pills',
  args: {
    navPills: true,
    navbarBreakpoint: undefined,
    items: [
      { url: '#all', title: 'All' },
      { url: '#design', title: 'Design' },
      { url: '#development', title: 'Development' },
      { url: '#marketing', title: 'Marketing' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Applies `nav-pills` to render links with pill-shaped active backgrounds.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WithMegaMenu — mega menu panel
// ---------------------------------------------------------------------------

export const WithMegaMenu: Story = {
  name: 'With Mega Menu',
  args: {
    navbarAriaLabel: 'Main navigation',
    containerRelativeMenu: true,
    items: [
      { url: '/', title: 'Home' },
      {
        url: '#',
        title: 'Solutions',
        linkId: 'solutions-toggle',
        navId: 'solutions',
        megaMenu: {
          enabled: true,
          content: `
            <div class="container py-4">
              <div class="row g-4">
                <div class="col-md-4">
                  <h6 class="fw-bold">For Teams</h6>
                  <ul class="list-unstyled">
                    <li><a href="/teams/design" class="dropdown-item">Design Teams</a></li>
                    <li><a href="/teams/engineering" class="dropdown-item">Engineering</a></li>
                    <li><a href="/teams/marketing" class="dropdown-item">Marketing</a></li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h6 class="fw-bold">By Industry</h6>
                  <ul class="list-unstyled">
                    <li><a href="/industry/healthcare" class="dropdown-item">Healthcare</a></li>
                    <li><a href="/industry/finance" class="dropdown-item">Finance</a></li>
                    <li><a href="/industry/retail" class="dropdown-item">Retail</a></li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h6 class="fw-bold">Resources</h6>
                  <ul class="list-unstyled">
                    <li><a href="/resources/case-studies" class="dropdown-item">Case Studies</a></li>
                    <li><a href="/resources/webinars" class="dropdown-item">Webinars</a></li>
                    <li><a href="/resources/guides" class="dropdown-item">Guides</a></li>
                  </ul>
                </div>
              </div>
            </div>
          `,
        },
      },
      { url: '/pricing', title: 'Pricing' },
      { url: '/contact', title: 'Contact' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Items with `megaMenu.enabled` render a full-width dropdown panel containing arbitrary HTML. ' +
          '`containerRelativeMenu` positions the panel relative to the containing element.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WithDescriptions — items showing a description line
// ---------------------------------------------------------------------------

export const WithDescriptions: Story = {
  name: 'With Item Descriptions',
  args: {
    navbarAriaLabel: 'Feature navigation',
    navbarBreakpoint: 'lg',
    items: [
      {
        url: '/analytics',
        title: 'Analytics',
        description: 'Insights and reporting',
      },
      {
        url: '/automation',
        title: 'Automation',
        description: 'Workflows and triggers',
      },
      {
        url: '/integrations',
        title: 'Integrations',
        description: 'Connect your tools',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Items with a `description` property render a `<span class="item-description">` beneath the label.',
      },
    },
  },
};

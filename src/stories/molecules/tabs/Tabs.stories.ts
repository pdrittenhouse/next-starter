import type { Meta, StoryObj } from '@storybook/nextjs';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Design System/Molecules/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tabs molecule — mirrors the Timberland Pattern Lab tabs pattern. ' +
          'Supports two rendering modes: **bootstrap** (default) using Bootstrap 5 ' +
          'nav-tabs/nav-pills with tab-content panels, and **jquery** using the ' +
          'responsive-tabs plugin markup. Bootstrap JS handles show/hide via ' +
          '`data-bs-*` attributes loaded globally in the theme; no JS import is required.',
      },
    },
  },
  argTypes: {
    tabsType: {
      control: 'select',
      options: ['bootstrap', 'jquery'],
      description: 'Tabs JavaScript library. Default: bootstrap.',
    },
    navPills: {
      control: 'boolean',
      description: 'Use Bootstrap pill style instead of underline tabs.',
    },
    fillJustify: {
      control: 'select',
      options: [undefined, 'fill', 'justified'],
      description: 'Equal-width fill or justified tab alignment.',
    },
    vertical: {
      control: 'boolean',
      description: 'Render tabs vertically (side navigation layout).',
    },
    id: { control: 'text' },
    otherClasses: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default — three Bootstrap tabs, first tab active
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    tabs: [
      {
        title: 'Overview',
        content:
          'Get a high-level summary of the product. This panel is shown by default when the component first renders. Bootstrap JS toggles the active panel via data-bs-* attributes wired at render time.',
      },
      {
        title: 'Features',
        content:
          'Explore the full feature set — unlimited color variants, responsive layouts, accessible markup, and seamless integration with the Timberland design system.',
      },
      {
        title: 'Pricing',
        content:
          'Choose the plan that fits your team. All plans include a 14-day free trial with no credit card required.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Pills — nav-pills variant instead of underline tabs
// ---------------------------------------------------------------------------

export const Pills: Story = {
  name: 'Pills',
  args: {
    navPills: true,
    tabs: [
      {
        title: 'Daily',
        content:
          'A digest of the most important updates from the past 24 hours, curated for your team.',
      },
      {
        title: 'Weekly',
        content:
          'A broader summary covering the full week — trends, highlights, and action items.',
      },
      {
        title: 'Monthly',
        content:
          'A strategic overview of the month. Ideal for leadership and planning discussions.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Filled — equal-width tabs spanning the full nav width
// ---------------------------------------------------------------------------

export const Filled: Story = {
  name: 'Filled (nav-fill)',
  args: {
    fillJustify: 'fill',
    tabs: [
      {
        title: 'Design',
        content:
          'Design tokens, spacing scale, and visual guidelines that underpin the entire design system.',
      },
      {
        title: 'Development',
        content:
          'Component API references, code examples, and integration instructions for the Next.js starter.',
      },
      {
        title: 'Accessibility',
        content:
          'WCAG 2.1 AA compliance notes, keyboard navigation patterns, and screen-reader guidance.',
      },
      {
        title: 'Content',
        content:
          'Tone of voice, writing style, and naming conventions applied across all user-facing copy.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Vertical — Bootstrap tabs stacked on the left side
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  name: 'Vertical',
  args: {
    vertical: true,
    tabs: [
      {
        title: 'Account',
        content:
          'Manage your account details, email address, and password. Changes are saved immediately.',
      },
      {
        title: 'Notifications',
        content:
          'Control which emails and in-app alerts you receive. You can update these settings at any time.',
      },
      {
        title: 'Billing',
        content:
          'View your current plan, upcoming invoice, and payment method. All transactions are encrypted.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// jQuery — responsive-tabs plugin markup
// ---------------------------------------------------------------------------

export const jQuery: Story = {
  name: 'jQuery (Responsive Tabs)',
  args: {
    tabsType: 'jquery',
    tabs: [
      {
        title: 'Introduction',
        content:
          'The jQuery responsive-tabs plugin renders a standard tab interface on wider screens and collapses into an accordion on mobile viewports.',
      },
      {
        title: 'Configuration',
        content:
          'Responsive behavior is controlled via data-* attributes on the wrapper element: data-collapsible, data-activetab, data-animation, and more.',
      },
      {
        title: 'Theming',
        content:
          'Override CSS custom properties (--gray-dark, --white, --black) in your theme to match the responsive-tabs panel styles to your brand palette.',
      },
    ],
  },
};

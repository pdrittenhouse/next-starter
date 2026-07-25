import type { Meta, StoryObj } from '@storybook/nextjs';
import { TravelingCta } from './TravelingCta';

const meta: Meta<typeof TravelingCta> = {
  title: 'Design System/Molecules/TravelingCta',
  component: TravelingCta,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'TravelingCta molecule — a fixed-position call-to-action bar that appears ' +
          'when scrolling past the header. Mirrors the Pattern Lab Twig template at ' +
          'patterns/02-molecules/traveling-cta/_traveling-cta.tpl.twig.',
      },
    },
  },
  argTypes: {
    hideOn: {
      control: 'select',
      options: [undefined, 'mobile', 'desktop', 'both'],
      description: 'Hide the bar on mobile, desktop, or both (both suppresses the component entirely).',
    },
    includeContainer: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    autoWidth: { control: 'boolean' },
    reverseOrder: { control: 'boolean' },
    maxWidthFluidContainer: { control: 'boolean' },
    containerBreakpoint: {
      control: 'select',
      options: ['', 'sm', 'md', 'lg', 'xl', 'xxl'],
    },
    bgThemeColor: {
      control: 'select',
      options: [
        undefined,
        'primary',
        'secondary',
        'light',
        'dark',
        'white',
        'body',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Default ───────────────────────────────────────────────────────────────────
// Two CTA buttons in a stretched bar (autoWidth: false is the default, which
// adds stretch-ctas so buttons grow to fill the bar).

export const Default: Story = {
  args: {
    travelingCtas: [
      {
        label: 'Call Us Today',
        variant: 'primary',
        href: 'tel:+18005551234',
        as: 'a',
      },
      {
        label: 'Get a Free Quote',
        variant: 'secondary',
        href: '#quote',
        as: 'a',
      },
    ],
  },
};

// ── With Container ─────────────────────────────────────────────────────────────
// Wraps the CTA wrapper in a Bootstrap container + row, constraining the bar
// width to the grid max-width. Buttons use autoWidth so they don't stretch.

export const WithContainer: Story = {
  name: 'With Container',
  args: {
    includeContainer: true,
    autoWidth: true,
    alignment: [{ alignment: 'center' }],
    travelingCtas: [
      {
        label: 'Schedule a Demo',
        variant: 'primary',
        size: 'lg',
        href: '#demo',
        as: 'a',
      },
      {
        label: 'View Pricing',
        variant: 'secondary',
        outline: true,
        size: 'lg',
        href: '#pricing',
        as: 'a',
      },
      {
        label: 'Contact Sales',
        variant: 'dark',
        size: 'lg',
        href: '#contact',
        as: 'a',
      },
    ],
  },
};

// ── Hidden On Mobile ──────────────────────────────────────────────────────────
// Adds `d-none d-lg-block` — bar is hidden on small screens and visible lg+.
// Useful when a separate mobile sticky CTA handles small viewports.

export const HiddenOnMobile: Story = {
  name: 'Hidden on Mobile',
  args: {
    hideOn: 'mobile',
    bgThemeColor: 'dark',
    travelingCtas: [
      {
        label: 'Start Free Trial',
        variant: 'primary',
        href: '#trial',
        as: 'a',
      },
      {
        label: 'Watch Demo',
        variant: 'light',
        href: '#demo',
        as: 'a',
      },
    ],
  },
};

// ── Reversed Order ─────────────────────────────────────────────────────────────
// Passes reverseOrder: true — the CTAs array is reversed before rendering.
// Useful when CMS data is ordered by priority but the design needs them flipped.

export const ReversedOrder: Story = {
  name: 'Reversed Order',
  args: {
    reverseOrder: true,
    autoWidth: true,
    alignment: [{ alignment: 'end' }],
    travelingCtas: [
      {
        label: 'Primary Action',
        variant: 'primary',
        href: '#primary',
        as: 'a',
      },
      {
        label: 'Secondary Action',
        variant: 'secondary',
        href: '#secondary',
        as: 'a',
      },
      {
        label: 'Tertiary Action',
        variant: 'link',
        href: '#tertiary',
        as: 'a',
      },
    ],
  },
};

// ── Custom Inline Styles ──────────────────────────────────────────────────────
// Demonstrates sectionStyle + wrapperStyle for custom background, border, and
// padding — equivalent to the Twig tcta_bg_color/tcta_padding/tcta_border props.

export const CustomStyles: Story = {
  name: 'Custom Inline Styles',
  args: {
    sectionStyle: {
      backgroundColor: '#1a1a2e',
      borderTopWidth: '3px',
      borderTopStyle: 'solid',
      borderTopColor: '#e94560',
    },
    wrapperStyle: {
      paddingTop: '12px',
      paddingBottom: '12px',
      paddingLeft: '16px',
      paddingRight: '16px',
    },
    autoWidth: true,
    alignment: [{ alignment: 'between' }],
    travelingCtas: [
      {
        label: 'Book Now',
        variant: 'danger',
        size: 'lg',
        href: '#book',
        as: 'a',
        inlineStyle: { borderRadius: '0' },
      },
      {
        label: 'Learn More',
        variant: 'light',
        size: 'lg',
        href: '#learn',
        as: 'a',
        inlineStyle: { borderRadius: '0' },
      },
    ],
  },
};

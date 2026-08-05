import type { Meta, StoryObj } from '@storybook/nextjs';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Design System/Atoms/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Breadcrumb atom — mirrors the theme\'s Pattern Lab `timberland/breadcrumb` pattern. ' +
          'Renders an accessible `<nav>` with an ordered list of trail items. The last item ' +
          'is always the current page and receives `aria-current="page"`. Supports custom ' +
          'dividers via the Bootstrap 5 CSS variable `--bs-breadcrumb-divider`.',
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
    },
    divider: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
  },
  args: {
    items: [
      { text: 'Home', url: '/' },
      { text: 'Blog', url: '/blog' },
      { text: 'Getting Started', url: '/blog/getting-started' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleItem: Story = {
  args: {
    items: [
      { text: 'About Us', url: '/about' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'A single-item breadcrumb where the only entry is the current page. No anchor is rendered.',
      },
    },
  },
};

export const TwoLevels: Story = {
  args: {
    items: [
      { text: 'Home', url: '/' },
      { text: 'Products', url: '/products' },
    ],
  },
};

export const DeepNavigation: Story = {
  name: 'Deep Navigation (5 levels)',
  args: {
    items: [
      { text: 'Home', url: '/' },
      { text: 'Shop', url: '/shop' },
      { text: 'Women', url: '/shop/women' },
      { text: 'Outerwear', url: '/shop/women/outerwear' },
      { text: 'Rain Jackets', url: '/shop/women/outerwear/rain-jackets' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Five-level trail demonstrating how the component handles deeper navigation hierarchies.',
      },
    },
  },
};

export const CustomDivider: Story = {
  args: {
    items: [
      { text: 'Home', url: '/' },
      { text: 'Resources', url: '/resources' },
      { text: 'Documentation', url: '/resources/docs' },
    ],
    divider: '>',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom divider rendered via the Bootstrap 5 CSS variable `--bs-breadcrumb-divider` on the `<nav>` element.',
      },
    },
  },
};

export const ArrowDivider: Story = {
  args: {
    items: [
      { text: 'Home', url: '/' },
      { text: 'Support', url: '/support' },
      { text: 'FAQs', url: '/support/faqs' },
    ],
    divider: '→',
  },
};

export const WithLabel: Story = {
  args: {
    items: [
      { text: 'Home', url: '/' },
      { text: 'News', url: '/news' },
      { text: 'Annual Report 2024', url: '/news/annual-report-2024' },
    ],
    label: 'Current:',
  },
  parameters: {
    docs: {
      description: {
        story: 'The `label` prop prepends a text prefix (with a trailing space) to the current/last item.',
      },
    },
  },
};

export const WithExtraClass: Story = {
  args: {
    items: [
      { text: 'Home', url: '/' },
      { text: 'Events', url: '/events' },
      { text: 'Conference 2025', url: '/events/conference-2025' },
    ],
    className: 'bg-light p-2 rounded',
  },
  parameters: {
    docs: {
      description: {
        story: 'Additional Bootstrap utility classes applied to the `<ol>` element via `className`.',
      },
    },
  },
};

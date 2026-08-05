import type { Meta, StoryObj } from '@storybook/nextjs';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Design System/Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Badge atom — mirrors the theme\'s Pattern Lab badge pattern. Wraps a ' +
          'Bootstrap 5 badge with support for color variants, pill shape, and ' +
          'anchor rendering for linked badges.',
      },
    },
  },
  argTypes: {
    element: {
      control: 'select',
      options: ['span', 'a'],
      description: 'HTML element type. Use "a" with href for linked badges.',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
      description: 'Background color variant.',
    },
    pill: {
      control: 'boolean',
      description: 'Applies rounded-pill shape.',
    },
    href: {
      control: 'text',
      description: 'URL for linked badges (requires element="a").',
    },
    text: {
      control: 'text',
      description: 'Badge display text. Children override this when both are provided.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names.',
    },
  },
  args: {
    text: 'New',
    color: 'primary',
    element: 'span',
    pill: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pill: Story = {
  args: {
    pill: true,
    text: 'Featured',
  },
  parameters: {
    docs: {
      description: {
        story: 'Applies Bootstrap 5 `rounded-pill` class for a capsule-shaped badge.',
      },
    },
  },
};

export const Linked: Story = {
  args: {
    element: 'a',
    href: '#',
    text: 'View all',
    color: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders an `<a>` element. Set element="a" and provide an href.',
      },
    },
  },
};

export const LinkedPill: Story = {
  name: 'Linked + Pill',
  args: {
    element: 'a',
    href: '#',
    text: 'View all',
    color: 'primary',
    pill: true,
  },
};

export const Secondary: Story = {
  args: { color: 'secondary', text: 'Updated' },
};

export const Success: Story = {
  args: { color: 'success', text: 'Active' },
};

export const Danger: Story = {
  args: { color: 'danger', text: 'Expired' },
};

export const Warning: Story = {
  args: { color: 'warning', text: 'Pending' },
};

export const Info: Story = {
  args: { color: 'info', text: 'Draft' },
};

export const Light: Story = {
  args: { color: 'light', text: 'Default' },
};

export const Dark: Story = {
  args: { color: 'dark', text: 'Archived' },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { SkipNav } from './SkipNav';

const meta: Meta<typeof SkipNav> = {
  title: 'Design System/Atoms/SkipNav',
  component: SkipNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'SkipNav atom — mirrors the theme\'s Pattern Lab `timberland/skip-nav` pattern. ' +
          'Renders an off-screen anchor that becomes visible on focus, allowing keyboard users ' +
          'to bypass the main navigation and jump directly to page content.',
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Text for the skip nav link.',
    },
    skipNavClasses: {
      control: 'object',
      description: 'Additional CSS class names as an array.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names as a string.',
    },
    href: {
      control: 'text',
      description: 'Link target anchor. Defaults to `#content`.',
    },
    children: {
      control: false,
      description: 'Slot content — overrides `text` when provided.',
    },
  },
  args: {
    text: 'Skip to main content',
    href: '#content',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomText: Story = {
  args: {
    text: 'Skip to primary content',
  },
  parameters: {
    docs: {
      description: {
        story: 'Override the default link text for sites with non-standard landmark labels.',
      },
    },
  },
};

export const CustomTarget: Story = {
  args: {
    text: 'Skip to main content',
    href: '#main',
  },
  parameters: {
    docs: {
      description: {
        story: 'Point to a different anchor when the page\'s main landmark uses an id other than `content`.',
      },
    },
  },
};

export const WithExtraClasses: Story = {
  args: {
    skipNavClasses: ['my-skip-nav'],
    className: 'fw-bold',
  },
  parameters: {
    docs: {
      description: {
        story: 'Additional classes are merged after the base `skip-nav screen-reader-text` classes, mirroring the Twig `skip_nav_classes` / `skip_nav_other_classes` variables.',
      },
    },
  },
};

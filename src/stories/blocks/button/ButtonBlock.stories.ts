import type { Meta, StoryObj } from '@storybook/nextjs';
import { ButtonBlock } from './ButtonBlock';

const meta = {
  title: 'Design System/Blocks/Button',
  component: ButtonBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Button block. Wraps the Button atom with ACF field mapping for variant, size, outline, toggle, tooltip/popover, close button, and block-level spacing styles.',
      },
    },
  },
} satisfies Meta<typeof ButtonBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/button',
      clientId: 'button-1',
      renderedHtml:
        '<div class="button-block"><a href="/learn-more" class="btn btn-primary">Learn More</a></div>',
    },
  },
};

export const Outline: Story = {
  args: {
    block: {
      name: 'acf/button',
      clientId: 'button-2',
      renderedHtml:
        '<div class="button-block"><a href="/learn-more" class="btn btn-outline-primary">Learn More</a></div>',
    },
  },
};

export const Large: Story = {
  args: {
    block: {
      name: 'acf/button',
      clientId: 'button-3',
      renderedHtml:
        '<div class="button-block"><a href="/get-started" class="btn btn-secondary btn-lg">Get Started</a></div>',
    },
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { BreadcrumbBlock } from './BreadcrumbBlock';

const meta = {
  title: 'Design System/Blocks/Breadcrumb',
  component: BreadcrumbBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Breadcrumb block. Resolves the trail from an ACF repeater (headless-explicit items) or falls back to a single home link when no repeater items are set.',
      },
    },
  },
} satisfies Meta<typeof BreadcrumbBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/breadcrumb',
      clientId: 'breadcrumb-1',
      renderedHtml:
        '<div class="block-breadcrumb"><nav aria-label="breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="/">Home</a></li><li class="breadcrumb-item"><a href="/about">About</a></li><li class="breadcrumb-item active" aria-current="page">Our Team</li></ol></nav></div>',
    },
  },
};

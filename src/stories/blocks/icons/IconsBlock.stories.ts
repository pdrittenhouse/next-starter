import type { Meta, StoryObj } from '@storybook/nextjs';
import { IconsBlock } from './IconsBlock';

const meta = {
  title: 'Design System/Blocks/Icons',
  component: IconsBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Icon group block. Supports `display` (inline / grid) and `text_align` ACF fields; wraps icons in a `.icon-group` container.',
      },
    },
  },
} satisfies Meta<typeof IconsBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  args: {
    block: {
      name: 'acf/icons',
      clientId: 'icons-1',
      attributesJSON: JSON.stringify({ data: { display: 'inline', text_align: 'center' } }),
      renderedHtml:
        '<div class="icon-group icon-group--inline" style="text-align:center"><span class="icon">★</span><span class="icon">♦</span><span class="icon">●</span></div>',
    },
  },
};

export const Grid: Story = {
  args: {
    block: {
      name: 'acf/icons',
      clientId: 'icons-2',
      attributesJSON: JSON.stringify({ data: { display: 'grid', text_align: 'left' } }),
      renderedHtml:
        '<div class="icon-group icon-group--grid"><span class="icon">★</span><span class="icon">♦</span><span class="icon">●</span></div>',
    },
  },
};

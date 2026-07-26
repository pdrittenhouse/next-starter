import type { Meta, StoryObj } from '@storybook/nextjs';
import { RowBlock } from './RowBlock';

const meta = {
  title: 'Design System/Blocks/Row',
  component: RowBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Bootstrap grid row. Reads `vert_gutters`, `hor_gutters`, `align_items`, and `justify_content` ACF repeater fields to build `gy-*`, `gx-*`, `align-items-*`, and `justify-content-*` classes.',
      },
    },
  },
} satisfies Meta<typeof RowBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/row',
      clientId: 'row-1',
      attributesJSON: JSON.stringify({
        data: {
          vert_gutters: [{ breakpoint: '', size: '3' }],
          hor_gutters: [{ breakpoint: '', size: '3' }],
        },
      }),
      renderedHtml:
        '<div class="row gy-3 gx-3"><div class="col-md-6"><p>Column one</p></div><div class="col-md-6"><p>Column two</p></div></div>',
    },
  },
};

export const AlignedAndJustified: Story = {
  args: {
    block: {
      name: 'acf/row',
      clientId: 'row-2',
      attributesJSON: JSON.stringify({
        data: {
          vert_gutters: [{ breakpoint: '', size: '4' }],
          hor_gutters: [{ breakpoint: '', size: '4' }],
          align_items: [{ breakpoint: '', value: 'center' }],
          justify_content: [{ breakpoint: '', value: 'between' }],
        },
      }),
      renderedHtml:
        '<div class="row gy-4 gx-4 align-items-center justify-content-between"><div class="col-auto"><p>Left</p></div><div class="col-auto"><p>Right</p></div></div>',
    },
  },
};

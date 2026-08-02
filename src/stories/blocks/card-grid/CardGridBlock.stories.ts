import type { Meta, StoryObj } from '@storybook/nextjs';
import { CardGridBlock } from './CardGridBlock';

const meta = {
  title: 'Design System/Blocks/Card Grid',
  component: CardGridBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Card grid block. Uses an ACF repeater for headless card data; falls back to renderedHtml when the repeater is absent. Supports grid/row/group/deck layout types, column count, placecard, single-row, mobile columns, vertical offset, and numbered cards.',
      },
    },
  },
} satisfies Meta<typeof CardGridBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/card-grid',
      clientId: 'card-grid-1',
      renderedHtml:
        '<div class="card-grid"><div class="row row-cols-1 row-cols-md-3 g-4"><div class="col"><div class="card h-100"><div class="card-body"><h5 class="card-title">Card One</h5><p class="card-text">First card with a brief description of the item or feature.</p></div></div></div><div class="col"><div class="card h-100"><div class="card-body"><h5 class="card-title">Card Two</h5><p class="card-text">Second card with a brief description of the item or feature.</p></div></div></div><div class="col"><div class="card h-100"><div class="card-body"><h5 class="card-title">Card Three</h5><p class="card-text">Third card with a brief description of the item or feature.</p></div></div></div></div></div>',
    },
  },
};

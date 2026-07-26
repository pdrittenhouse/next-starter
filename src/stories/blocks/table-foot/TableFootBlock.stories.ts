import type { Meta, StoryObj } from '@storybook/nextjs';
import { TableFootBlock } from './TableFootBlock';

const meta = {
  title: 'Design System/Blocks/Table Foot',
  component: TableFootBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Semantic `<tfoot>` block. Applies `table-{color}` class and custom `backgroundColor` inline style from `section_variant` ACF field.',
      },
    },
  },
} satisfies Meta<typeof TableFootBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/table-foot',
      clientId: 'table-foot-1',
      renderedHtml:
        '<tfoot><tr><td colspan="3">Footer content</td></tr></tfoot>',
    },
  },
};

export const WithPaletteColor: Story = {
  args: {
    block: {
      name: 'acf/table-foot',
      clientId: 'table-foot-2',
      attributesJSON: JSON.stringify({
        data: { section_variant: { color: 'dark' } },
      }),
      renderedHtml:
        '<tfoot class="table-dark"><tr><td colspan="3">Dark footer</td></tr></tfoot>',
    },
  },
};

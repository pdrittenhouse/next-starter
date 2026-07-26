import type { Meta, StoryObj } from '@storybook/nextjs';
import { TableRowBlock } from './TableRowBlock';

const meta = {
  title: 'Design System/Blocks/Table Row',
  component: TableRowBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Semantic `<tr>` block. Builds `table-{color}` and `table-active` classes from `row_variant` ACF field; supports custom `backgroundColor` inline style.',
      },
    },
  },
} satisfies Meta<typeof TableRowBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/table-row',
      clientId: 'table-row-1',
      renderedHtml: '<tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr>',
    },
  },
};

export const WithPaletteColor: Story = {
  args: {
    block: {
      name: 'acf/table-row',
      clientId: 'table-row-2',
      attributesJSON: JSON.stringify({
        data: { row_variant: { color: 'success', active: false } },
      }),
      renderedHtml:
        '<tr class="table-success"><td>Success</td><td>Row</td><td>Data</td></tr>',
    },
  },
};

export const Active: Story = {
  args: {
    block: {
      name: 'acf/table-row',
      clientId: 'table-row-3',
      attributesJSON: JSON.stringify({
        data: { row_variant: { color: 'primary', active: true } },
      }),
      renderedHtml:
        '<tr class="table-primary table-active"><td>Active</td><td>Row</td><td>Data</td></tr>',
    },
  },
};

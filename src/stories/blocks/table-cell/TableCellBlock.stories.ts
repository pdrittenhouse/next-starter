import type { Meta, StoryObj } from '@storybook/nextjs';
import { TableCellBlock } from './TableCellBlock';

const meta = {
  title: 'Design System/Blocks/Table Cell',
  component: TableCellBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Table cell block. Renders as `<td>` or `<th>` based on the `element` ACF field. Supports `padding`, `width`, and `text_align` inline style fields.',
      },
    },
  },
} satisfies Meta<typeof TableCellBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DataCell: Story = {
  args: {
    block: {
      name: 'acf/table-cell',
      clientId: 'table-cell-1',
      attributesJSON: JSON.stringify({
        data: { element: 'td', text_align: 'left' },
      }),
      renderedHtml: '<td>Cell content</td>',
    },
  },
};

export const HeaderCell: Story = {
  args: {
    block: {
      name: 'acf/table-cell',
      clientId: 'table-cell-2',
      attributesJSON: JSON.stringify({
        data: { element: 'th', text_align: 'center', width: '200px' },
      }),
      renderedHtml: '<th style="text-align:center;width:200px">Header</th>',
    },
  },
};

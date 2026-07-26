import type { Meta, StoryObj } from '@storybook/nextjs';
import { TableBodyBlock } from './TableBodyBlock';

const meta = {
  title: 'Design System/Blocks/Table Body',
  component: TableBodyBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Semantic `<tbody>` block. Applies `table-{color}` class and custom `backgroundColor` inline style from `section_variant` ACF field.',
      },
    },
  },
} satisfies Meta<typeof TableBodyBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/table-body',
      clientId: 'table-body-1',
      renderedHtml:
        '<tbody><tr><td>Row 1, Cell 1</td><td>Row 1, Cell 2</td></tr><tr><td>Row 2, Cell 1</td><td>Row 2, Cell 2</td></tr></tbody>',
    },
  },
};

export const WithPaletteColor: Story = {
  args: {
    block: {
      name: 'acf/table-body',
      clientId: 'table-body-2',
      attributesJSON: JSON.stringify({
        data: { section_variant: { color: 'primary' } },
      }),
      renderedHtml:
        '<tbody class="table-primary"><tr><td>Styled row 1</td><td>Data</td></tr></tbody>',
    },
  },
};

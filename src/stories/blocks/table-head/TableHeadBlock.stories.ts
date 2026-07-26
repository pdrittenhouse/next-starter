import type { Meta, StoryObj } from '@storybook/nextjs';
import { TableHeadBlock } from './TableHeadBlock';

const meta = {
  title: 'Design System/Blocks/Table Head',
  component: TableHeadBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Semantic `<thead>` block. Applies `table-{color}` class and custom `backgroundColor` inline style from `section_variant` ACF field.',
      },
    },
  },
} satisfies Meta<typeof TableHeadBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/table-head',
      clientId: 'table-head-1',
      renderedHtml:
        '<thead><tr><th>Column A</th><th>Column B</th><th>Column C</th></tr></thead>',
    },
  },
};

export const WithPaletteColor: Story = {
  args: {
    block: {
      name: 'acf/table-head',
      clientId: 'table-head-2',
      attributesJSON: JSON.stringify({
        data: { section_variant: { color: 'dark' } },
      }),
      renderedHtml:
        '<thead class="table-dark"><tr><th>Column A</th><th>Column B</th><th>Column C</th></tr></thead>',
    },
  },
};

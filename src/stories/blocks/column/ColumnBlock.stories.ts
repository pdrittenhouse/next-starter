import type { Meta, StoryObj } from '@storybook/nextjs';
import { ColumnBlock } from './ColumnBlock';

const meta = {
  title: 'Design System/Blocks/Column',
  component: ColumnBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Bootstrap grid column. Reads `col_width` repeater (breakpoint + width) to build `col-{bp}-{n}` classes. Inner blocks or renderedHtml provides the column content.',
      },
    },
  },
} satisfies Meta<typeof ColumnBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/column',
      clientId: 'column-1',
      attributesJSON: JSON.stringify({
        data: {
          col_width: [
            { breakpoint: '', width: '12' },
            { breakpoint: 'md', width: '6' },
            { breakpoint: 'lg', width: '4' },
          ],
        },
      }),
      renderedHtml: '<div class="col-12 col-md-6 col-lg-4"><p>Column content</p></div>',
    },
  },
};

export const FullWidth: Story = {
  args: {
    block: {
      name: 'acf/column',
      clientId: 'column-2',
      attributesJSON: JSON.stringify({
        data: { col_width: [{ breakpoint: '', width: '12' }] },
      }),
      renderedHtml: '<div class="col-12"><p>Full-width column content</p></div>',
    },
  },
};

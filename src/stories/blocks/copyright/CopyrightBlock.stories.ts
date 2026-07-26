import type { Meta, StoryObj } from '@storybook/nextjs';
import { CopyrightBlock } from './CopyrightBlock';

const meta = {
  title: 'Design System/Blocks/Copyright',
  component: CopyrightBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders site copyright text. Output is fully WordPress-managed via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof CopyrightBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/copyright',
      clientId: 'copyright-1',
      renderedHtml: '<p class="copyright">&copy; 2026 Site Name. All rights reserved.</p>',
    },
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { GroupBlock } from './GroupBlock';

const meta = {
  title: 'Design System/Blocks/Group',
  component: GroupBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Generic block container. Concatenates inner blocks or falls back to renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof GroupBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/group',
      clientId: 'group-1',
      renderedHtml:
        '<div class="block-group"><h2>Group Heading</h2><p>Group body content.</p></div>',
    },
  },
};

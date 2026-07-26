import type { Meta, StoryObj } from '@storybook/nextjs';
import { TabBlock } from './TabBlock';

const meta = {
  title: 'Design System/Blocks/Tab',
  component: TabBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Inner block rendered recursively by TabsBlock. When rendered standalone it falls back to renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof TabBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/tab',
      clientId: 'tab-1',
      attributesJSON: JSON.stringify({ data: { tab_label: 'Tab One' } }),
      renderedHtml:
        '<div class="tab-pane show active" id="tab-one" role="tabpanel"><p>Tab one content.</p></div>',
    },
  },
};

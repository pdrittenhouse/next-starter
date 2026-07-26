import type { Meta, StoryObj } from '@storybook/nextjs';
import { PatternBlock } from './PatternBlock';

const meta = {
  title: 'Design System/Blocks/Pattern',
  component: PatternBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders a WordPress block pattern. Output is fully WordPress-managed via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof PatternBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/pattern',
      clientId: 'pattern-1',
      renderedHtml:
        '<div class="pattern-wrapper"><h2>Pattern Heading</h2><p>Reusable block pattern content.</p></div>',
    },
  },
};

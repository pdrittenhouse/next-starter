import type { Meta, StoryObj } from '@storybook/nextjs';
import { SlideBlock } from './SlideBlock';

const meta = {
  title: 'Design System/Blocks/Slide',
  component: SlideBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Inner block rendered recursively by SliderBlock. Wraps its content in a `.carousel-cell` div when rendered standalone.',
      },
    },
  },
} satisfies Meta<typeof SlideBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/slide',
      clientId: 'slide-1',
      renderedHtml:
        '<div class="carousel-cell"><img src="/slide-image.jpg" alt="Slide" width="1200" height="600" /><div class="carousel-cell-caption"><h2>Slide Heading</h2><p>Slide description text.</p></div></div>',
    },
  },
};

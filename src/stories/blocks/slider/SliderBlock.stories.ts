import type { Meta, StoryObj } from '@storybook/nextjs';
import { SliderBlock } from './SliderBlock';

const meta = {
  title: 'Design System/Blocks/Slider',
  component: SliderBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Carousel/slider block containing Slide inner blocks. Output is fully WordPress-managed via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof SliderBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/slider',
      clientId: 'slider-1',
      renderedHtml:
        '<div class="main-carousel" data-flickity=\'{"cellAlign":"left","contain":true}\'><div class="carousel-cell"><img src="/slide-1.jpg" alt="Slide 1" width="1200" height="500" /></div><div class="carousel-cell"><img src="/slide-2.jpg" alt="Slide 2" width="1200" height="500" /></div></div>',
    },
  },
};

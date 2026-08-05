import type { Meta, StoryObj } from '@storybook/nextjs';
import { FlickityCarousel } from './FlickityCarousel';

const SAMPLE_SLIDES = [
  '<div style="background:#4a90e2;height:300px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;">Slide 1</div>',
  '<div style="background:#7b68ee;height:300px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;">Slide 2</div>',
  '<div style="background:#50c878;height:300px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;">Slide 3</div>',
  '<div style="background:#ff6b6b;height:300px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;">Slide 4</div>',
];

const meta: Meta<typeof FlickityCarousel> = {
  title: 'Design System/Molecules/FlickityCarousel',
  component: FlickityCarousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Flickity carousel — mirrors the Timberland `timberland/flickity-carousel` pattern. ' +
          'Renders markup with `data-*` attributes that Flickity JS picks up at runtime. ' +
          'The carousel will not animate in Storybook without Flickity loaded globally.',
      },
    },
  },
  argTypes: {
    columns: { control: { type: 'select' }, options: [1, 2, 3, 4, 5, 6] },
    cellAlign: { control: { type: 'select' }, options: ['left', 'center', 'right'] },
    autoPlay: { control: 'number' },
  },
  args: {
    slides: SAMPLE_SLIDES as unknown as React.ReactNode[],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    wrapAround: true,
    prevNextButtons: true,
    pageDots: true,
  },
};

export const WithCustomControls: Story = {
  args: {
    showControls: true,
    wrapAround: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the custom prev/next/dot controls rendered below the carousel track.',
      },
    },
  },
};

export const MultiColumn: Story = {
  name: '3-Column',
  args: {
    columns: 3,
    wrapAround: false,
    contain: true,
    prevNextButtons: true,
  },
};

export const AutoPlay: Story = {
  args: {
    autoPlay: 3000,
    wrapAround: true,
    pauseAutoPlayOnHover: true,
    pageDots: true,
  },
};

export const FadeTransition: Story = {
  args: {
    fade: true,
    wrapAround: true,
    prevNextButtons: true,
    pageDots: true,
  },
};

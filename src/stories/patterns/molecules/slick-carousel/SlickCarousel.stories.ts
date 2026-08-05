import type { Meta, StoryObj } from '@storybook/nextjs';
import { SlickCarousel } from './SlickCarousel';

const SAMPLE_SLIDES = [
  '<div style="background:#4a90e2;height:300px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;">Slide 1</div>',
  '<div style="background:#7b68ee;height:300px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;">Slide 2</div>',
  '<div style="background:#50c878;height:300px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;">Slide 3</div>',
  '<div style="background:#ff6b6b;height:300px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;">Slide 4</div>',
];

const meta: Meta<typeof SlickCarousel> = {
  title: 'Design System/Molecules/SlickCarousel',
  component: SlickCarousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Slick carousel — mirrors the Timberland `timberland/slick-carousel` pattern. ' +
          'Renders markup with `data-*` attributes that Slick JS picks up at runtime. ' +
          'The carousel will not animate in Storybook without Slick loaded globally.',
      },
    },
  },
  argTypes: {
    slidesToShow: { control: { type: 'number', min: 1, max: 6 } },
    slidesToScroll: { control: { type: 'number', min: 1, max: 6 } },
    speed: { control: 'number' },
    autoplaySpeed: { control: 'number' },
    cssEase: { control: 'text' },
  },
  args: {
    slides: SAMPLE_SLIDES as unknown as React.ReactNode[],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  },
};

export const MultiSlide: Story = {
  name: '3 Slides Visible',
  args: {
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    infinite: true,
  },
};

export const AutoPlay: Story = {
  args: {
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    dots: true,
    infinite: true,
  },
};

export const CenterMode: Story = {
  args: {
    centerMode: true,
    centerPadding: '60px',
    slidesToShow: 3,
    dots: true,
  },
};

export const FadeTransition: Story = {
  args: {
    fade: true,
    dots: true,
    infinite: true,
  },
};

export const WithCustomControls: Story = {
  args: {
    customControls: true,
    dots: false,
    arrows: false,
    infinite: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Hides built-in arrows/dots and exposes `.slick-carousel-controls` for custom UI injection.',
      },
    },
  },
};

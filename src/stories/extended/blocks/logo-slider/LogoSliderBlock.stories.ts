import type { Meta, StoryObj } from '@storybook/nextjs';
import { LogoSliderBlock } from './LogoSliderBlock';

const meta = {
  title: 'Design System/Blocks/Extended/Logo Slider',
  component: LogoSliderBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Logo Slider block from the timberland-extended plugin. Renders a Slick or Flickity carousel of logos with configurable autoplay, loop, arrows, dot nav, and responsive breakpoints. Each slide supports a link and custom dimensions. Currently a stub — renders WP server-side HTML via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof LogoSliderBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/logo-slider',
      clientId: 'logo-slider-1',
      renderedHtml:
        '<div class="block-logo-slider" data-pattern="timberland/logo-slider"><div class="logo-slider slick-slider"><div class="slick-track"><div class="slick-slide"><img src="https://placehold.co/160x80" alt="Logo" width="160" height="80" loading="lazy" /></div><div class="slick-slide"><img src="https://placehold.co/160x80" alt="Logo" width="160" height="80" loading="lazy" /></div><div class="slick-slide"><img src="https://placehold.co/160x80" alt="Logo" width="160" height="80" loading="lazy" /></div><div class="slick-slide"><img src="https://placehold.co/160x80" alt="Logo" width="160" height="80" loading="lazy" /></div></div></div></div>',
    },
  },
};

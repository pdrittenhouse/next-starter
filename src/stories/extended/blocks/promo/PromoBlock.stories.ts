import type { Meta, StoryObj } from '@storybook/nextjs';
import { PromoBlock } from './PromoBlock';

const meta = {
  title: 'Design System/Blocks/Extended/Promo',
  component: PromoBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Promo block from the timberland-extended plugin. Renders 1–2 promotional panels side by side, each with an image, title, body text, and one or more buttons. Supports background/text color, border, border radius, box shadow, and container options. Currently a stub — renders WP server-side HTML via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof PromoBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: {
    block: {
      name: 'acf/promo',
      clientId: 'promo-1',
      renderedHtml:
        '<div class="block-promo promo-1-up"><div class="promo promo-1"><img src="https://placehold.co/800x400" alt="Promo image" width="800" height="400" loading="lazy" /><div class="promo-content"><h3 class="promo-title">Promo Heading</h3><p>Promotional body text that supports the heading and drives a call to action.</p><a href="/shop-now" class="btn btn-primary">Shop Now</a></div></div></div>',
    },
  },
};

export const Double: Story = {
  args: {
    block: {
      name: 'acf/promo',
      clientId: 'promo-2',
      renderedHtml:
        '<div class="block-promo promo-2-up"><div class="row"><div class="col-md-6"><div class="promo promo-1"><img src="https://placehold.co/600x400" alt="Promo 1" width="600" height="400" loading="lazy" /><div class="promo-content"><h3 class="promo-title">First Promo</h3><a href="/explore" class="btn btn-primary">Explore</a></div></div></div><div class="col-md-6"><div class="promo promo-2"><img src="https://placehold.co/600x400" alt="Promo 2" width="600" height="400" loading="lazy" /><div class="promo-content"><h3 class="promo-title">Second Promo</h3><a href="/discover" class="btn btn-secondary">Discover</a></div></div></div></div></div>',
    },
  },
};

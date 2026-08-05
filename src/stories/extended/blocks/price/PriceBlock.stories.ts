import type { Meta, StoryObj } from '@storybook/nextjs';
import { PriceBlock } from './PriceBlock';

const meta = {
  title: 'Design System/Blocks/Extended/Price',
  component: PriceBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Price block from the timberland-extended plugin. Renders a structured pricing display with currency symbol, whole and decimal amounts, frequency, and optional label and terms. Supports style variants and text alignment. Currently a stub — renders WP server-side HTML via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof PriceBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/price',
      clientId: 'price-1',
      renderedHtml:
        '<div class="block-price price" style="text-align: center;" data-pattern="timberland/price"><div class="price-wrapper"><div class="amount"><div class="price-main"><span class="symbol">$</span><span class="whole">49</span><span class="separator">.</span><span class="change">99</span></div><div class="price-frequency"><span class="frequency-separator">/</span><span class="frequency">month</span></div></div><span class="terms">Billed annually. Cancel anytime.</span></div></div>',
    },
  },
};

export const WithLabel: Story = {
  args: {
    block: {
      name: 'acf/price',
      clientId: 'price-2',
      renderedHtml:
        '<div class="block-price price" style="text-align: center;" data-pattern="timberland/price"><div class="price-wrapper"><span class="label">Pro Plan</span><div class="amount"><div class="price-main"><span class="symbol">$</span><span class="whole">99</span></div><div class="price-frequency"><span class="frequency-separator">/</span><span class="frequency">month</span></div></div></div></div>',
    },
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { ButtonTextBlock } from './ButtonTextBlock';

const meta = {
  title: 'Design System/Blocks/Button Text',
  component: ButtonTextBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders a button label as a plain text span. Uses the `button_text` ACF field when present; falls back to renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof ButtonTextBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FromACFField: Story = {
  args: {
    block: {
      name: 'acf/button-text',
      clientId: 'button-text-1',
      attributesJSON: JSON.stringify({ data: { button_text: 'Learn More' } }),
    },
  },
};

export const FromRenderedHtml: Story = {
  args: {
    block: {
      name: 'acf/button-text',
      clientId: 'button-text-2',
      renderedHtml: '<span>Get Started</span>',
    },
  },
};

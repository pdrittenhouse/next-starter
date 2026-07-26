import type { Meta, StoryObj } from '@storybook/nextjs';
import { QuoteBlock } from './QuoteBlock';

const meta = {
  title: 'Design System/Blocks/Quote',
  component: QuoteBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Bootstrap blockquote. Uses `quote`, `citation_name`, and `citation_title` ACF fields to build a semantic `<figure><blockquote>/<figcaption>` structure; falls back to renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof QuoteBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithACFFields: Story = {
  args: {
    block: {
      name: 'acf/quote',
      clientId: 'quote-1',
      attributesJSON: JSON.stringify({
        data: {
          quote: 'Design is not just what it looks like and feels like. Design is how it works.',
          citation_name: 'Steve Jobs',
          citation_title: 'Co-founder, Apple',
        },
      }),
    },
  },
};

export const FromRenderedHtml: Story = {
  args: {
    block: {
      name: 'acf/quote',
      clientId: 'quote-2',
      renderedHtml:
        '<figure><blockquote class="blockquote"><p>The best way to predict the future is to invent it.</p></blockquote><figcaption class="blockquote-footer">Alan Kay</figcaption></figure>',
    },
  },
};

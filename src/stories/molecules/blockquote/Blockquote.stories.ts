import type { Meta, StoryObj } from '@storybook/nextjs';
import { Blockquote } from './Blockquote';

const meta: Meta<typeof Blockquote> = {
  title: 'Design System/Molecules/Blockquote',
  component: Blockquote,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Blockquote molecule — mirrors the `timberland/blockquote` Pattern Lab pattern. ' +
          'Renders a styled `<blockquote>` with an optional `<q>` text and `<cite>` attribution. ' +
          'The citation can appear before or after the quote and optionally includes an author image.',
      },
    },
  },
  argTypes: {
    citationPosition: {
      control: 'radio',
      options: ['before', 'after'],
      description: "Controls whether the citation renders above ('before') or below ('after') the quote text.",
    },
  },
  args: {
    quote: 'The only way to do great work is to love what you do.',
    citation: 'Steve Jobs',
    citationPosition: 'after',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — citation below the quote (citation-bottom).
 */
export const Default: Story = {};

/**
 * CitationBefore — citation positioned above the quote (citation-top).
 */
export const CitationBefore: Story = {
  name: 'Citation Before Quote',
  args: {
    citationPosition: 'before',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting `citationPosition='before'` moves the `<cite>` element above the `<q>` text " +
          'and applies the `citation-top` class to the `<blockquote>`.',
      },
    },
  },
};

/**
 * WithCitationImage — citation includes an author avatar via the Image atom.
 */
export const WithCitationImage: Story = {
  name: 'With Citation Image',
  args: {
    quote: 'Design is not just what it looks like and feels like. Design is how it works.',
    citation: 'Steve Jobs, Co-founder of Apple',
    citationPosition: 'after',
    citationImage: {
      src: 'https://picsum.photos/seed/author/64/64',
      alt: 'Author portrait',
      width: 64,
      height: 64,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'When `citationImage.src` is provided the Image atom is rendered inside a ' +
          '`<span class="cite-img">` wrapper within the `<cite>` element.',
      },
    },
  },
};

/**
 * WithCitationImageBefore — image + citation positioned above the quote.
 */
export const WithCitationImageBefore: Story = {
  name: 'With Citation Image — Before',
  args: {
    quote: 'Simplicity is the ultimate sophistication.',
    citation: 'Leonardo da Vinci',
    citationPosition: 'before',
    citationImage: {
      src: 'https://picsum.photos/seed/davinci/64/64',
      alt: 'Leonardo da Vinci portrait',
      width: 64,
      height: 64,
    },
  },
};

/**
 * WithCitationLink — sets the cite="" attribute on the blockquote element.
 */
export const WithCitationLink: Story = {
  name: 'With Citation Link',
  args: {
    quote: 'An investment in knowledge pays the best interest.',
    citation: 'Benjamin Franklin',
    citationLink: 'https://en.wikiquote.org/wiki/Benjamin_Franklin',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Providing `citationLink` sets the native `cite=""` attribute on the `<blockquote>` ' +
          'element — useful for SEO and accessible machine-readable attribution.',
      },
    },
  },
};

/**
 * QuoteOnly — no citation text; the cite element is omitted entirely.
 */
export const QuoteOnly: Story = {
  name: 'Quote Only (No Citation)',
  args: {
    quote: 'Stay hungry, stay foolish.',
    citation: undefined,
    citationImage: undefined,
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { Testimonial } from './Testimonial';

const meta: Meta<typeof Testimonial> = {
  title: 'Design System/Molecules/Testimonial',
  component: Testimonial,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Testimonial molecule — mirrors the `timberland/testimonial` Pattern Lab pattern. ' +
          'Renders a styled testimonial block with an optional image, title, pullquote, ' +
          'author attribution, and organizational descriptor. ' +
          'Uses a two-column grid layout at the `md` breakpoint when an image is present.',
      },
    },
  },
  argTypes: {
    image: {
      description: 'Image object passed to the Image atom. Omit to render a text-only testimonial.',
    },
    title: {
      control: 'text',
      description: 'Optional heading displayed above the quote.',
    },
    quote: {
      control: 'text',
      description: 'The testimonial quote text — rendered inside a <blockquote> with decorative quote icons.',
    },
    author: {
      control: 'text',
      description: 'Author name displayed in the testimonial meta section.',
    },
    descriptor: {
      control: 'text',
      description: "Author's organization or role displayed below the author name.",
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names appended to the root <div>.',
    },
  },
  args: {
    quote: 'Working with this team transformed our digital presence. The results exceeded every expectation we had going into the project.',
    author: 'Sarah Mitchell',
    descriptor: 'VP of Marketing, Acme Corporation',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — quote, author, and descriptor; no image or title.
 */
export const Default: Story = {};

/**
 * WithImage — testimonial includes an author portrait via the Image atom.
 * Triggers the two-column grid layout at the md breakpoint.
 */
export const WithImage: Story = {
  name: 'With Image',
  args: {
    image: {
      src: 'https://picsum.photos/seed/testimonial/400/500',
      alt: 'Sarah Mitchell headshot',
      width: 400,
      height: 500,
    },
    quote: 'Working with this team transformed our digital presence. The results exceeded every expectation we had going into the project.',
    author: 'Sarah Mitchell',
    descriptor: 'VP of Marketing, Acme Corporation',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Providing `image.src` renders the Image atom inside a `<figure class="testimonial-image">` ' +
          'element and activates the two-column grid at the `md` breakpoint.',
      },
    },
  },
};

/**
 * WithTitle — includes an optional heading above the quote.
 */
export const WithTitle: Story = {
  name: 'With Title',
  args: {
    image: {
      src: 'https://picsum.photos/seed/testimonial2/400/500',
      alt: 'James Okafor headshot',
      width: 400,
      height: 500,
    },
    title: 'A Game-Changing Partnership',
    quote: 'From the very first meeting it was clear we were in expert hands. The platform they delivered is fast, reliable, and our customers love it.',
    author: 'James Okafor',
    descriptor: 'Chief Technology Officer, NovaTech',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `title` prop renders an `<h2 class="testimonial-title">` element above the quote, ' +
          'adding a named heading to the testimonial block.',
      },
    },
  },
};

/**
 * QuoteOnly — only the quote text; no image, title, author, or descriptor.
 */
export const QuoteOnly: Story = {
  name: 'Quote Only',
  args: {
    image: undefined,
    title: undefined,
    quote: 'Five stars — I would recommend this to any organization looking to modernize their web platform.',
    author: undefined,
    descriptor: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'All optional fields can be omitted. When neither `author` nor `descriptor` is provided ' +
          'the `testimonial-meta` div is suppressed entirely.',
      },
    },
  },
};

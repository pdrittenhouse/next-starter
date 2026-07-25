import type { Meta, StoryObj } from '@storybook/nextjs';
import { Image } from './Image';

const SAMPLE_SRC = 'https://picsum.photos/seed/timberland/800/600';
const TALL_SRC   = 'https://picsum.photos/seed/timberland/600/800';

const meta: Meta<typeof Image> = {
  title: 'Design System/Atoms/Image',
  component: Image,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Image atom — mirrors the theme\'s Pattern Lab image pattern. Wraps next/image ' +
          'with consistent class names and supports four rendering variants: primary, ' +
          'picture, aspect-ratio, and bg (CSS background-image).',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'picture', 'aspect-ratio', 'bg'],
    },
    loading: {
      control: 'select',
      options: ['lazy', 'eager'],
    },
    fetchPriority: {
      control: 'select',
      options: ['auto', 'high', 'low'],
    },
  },
  args: {
    src: SAMPLE_SRC,
    alt: 'Sample image',
    width: 800,
    height: 600,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Variants ---

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Picture: Story = {
  args: {
    variant: 'picture',
  },
  parameters: {
    docs: {
      description: {
        story: 'Identical output to Primary — next/image delivers WebP automatically so no separate `<picture>` element is needed. The `image--picture` class is applied for CSS targeting.',
      },
    },
  },
};

export const AspectRatio16x9: Story = {
  name: 'Aspect Ratio 16:9',
  args: {
    variant: 'aspect-ratio',
    width: 16,
    height: 9,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'width/height are ratio units, not pixel dimensions. The wrapper div gets an `ar-{w}-{h}` class that triggers the SCSS aspect-ratio mixin.',
      },
    },
  },
};

export const AspectRatio4x3: Story = {
  name: 'Aspect Ratio 4:3',
  args: {
    variant: 'aspect-ratio',
    width: 4,
    height: 3,
  },
  parameters: { layout: 'padded' },
};

export const AspectRatio1x1: Story = {
  name: 'Aspect Ratio 1:1',
  args: {
    variant: 'aspect-ratio',
    width: 1,
    height: 1,
  },
  parameters: { layout: 'padded' },
};

export const Background: Story = {
  name: 'BG (CSS background-image)',
  args: {
    variant: 'bg',
    width: 800,
    height: 400,
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders a `<div>` with an inline `background-image` style. next/image cannot handle this variant — a plain div is used instead.',
      },
    },
  },
};

// --- Loading ---

export const EagerLoading: Story = {
  args: {
    variant: 'primary',
    loading: 'eager',
    fetchPriority: 'high',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use `loading="eager"` and `fetchPriority="high"` for above-the-fold LCP images.',
      },
    },
  },
};

// --- No explicit dimensions ---

export const NoDimensions: Story = {
  args: {
    variant: 'primary',
    src: TALL_SRC,
    width: undefined,
    height: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'When width/height are omitted the image falls back to fill mode inside a relative wrapper. Prefer providing dimensions from WP GraphQL `mediaDetails` when available.',
      },
    },
  },
};

// --- With responsive sizes ---

export const WithSizes: Story = {
  args: {
    variant: 'primary',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
  },
  parameters: {
    layout: 'padded',
  },
};

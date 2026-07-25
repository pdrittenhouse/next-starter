import type { Meta, StoryObj } from '@storybook/nextjs';
import { Carousel } from './Carousel';

const SLIDE_1_SRC = 'https://picsum.photos/seed/carousel-1/1200/600';
const SLIDE_2_SRC = 'https://picsum.photos/seed/carousel-2/1200/600';
const SLIDE_3_SRC = 'https://picsum.photos/seed/carousel-3/1200/600';

const meta: Meta<typeof Carousel> = {
  title: 'Design System/Molecules/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Carousel molecule — mirrors the theme\'s Pattern Lab `timberland/carousel` pattern. ' +
          'Composes the Image atom for slides and the Button atom for controls. Bootstrap\'s ' +
          'carousel JS is loaded globally; this component emits the static HTML and `data-bs-*` ' +
          'attributes required for it to function.',
      },
    },
  },
  argTypes: {
    interval: {
      control: 'text',
      description: 'Delay between slides in ms, or the string `\'false\'` to disable auto-cycle.',
    },
    pause: {
      control: 'select',
      options: ['hover', 'false'],
    },
    ride: {
      control: 'text',
      description: '`true`, `false`, or `\'carousel\'` to autoplay on load.',
    },
  },
  args: {
    arrows: true,
    indicators: true,
    crossfade: false,
    dark: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    slides: [
      {
        image: { src: SLIDE_1_SRC, alt: 'Mountain landscape at dawn', width: 1200, height: 600 },
        label: 'Explore the Highlands',
        caption: 'Discover trails and hidden valleys waiting to be found.',
        active: true,
      },
      {
        image: { src: SLIDE_2_SRC, alt: 'Coastal cliffs at sunset', width: 1200, height: 600 },
        label: 'Coastal Escapes',
        caption: 'Sea breeze, rugged cliffs, and a horizon without end.',
      },
      {
        image: { src: SLIDE_3_SRC, alt: 'Dense forest trail in autumn', width: 1200, height: 600 },
        label: 'Into the Forest',
        caption: 'Ancient trees and dappled light make every path an adventure.',
      },
    ],
  },
};

// ── Crossfade ─────────────────────────────────────────────────────────────────

export const Crossfade: Story = {
  args: {
    crossfade: true,
    slides: [
      {
        image: { src: SLIDE_1_SRC, alt: 'Mountain landscape at dawn', width: 1200, height: 600 },
        label: 'Smooth Transitions',
        caption: 'The crossfade variant dissolves between slides instead of sliding.',
        active: true,
      },
      {
        image: { src: SLIDE_2_SRC, alt: 'Coastal cliffs at sunset', width: 1200, height: 600 },
        label: 'Second Slide',
        caption: 'Each slide fades in and out seamlessly.',
      },
      {
        image: { src: SLIDE_3_SRC, alt: 'Dense forest trail in autumn', width: 1200, height: 600 },
        label: 'Third Slide',
        caption: 'Set `crossfade={true}` to enable this mode.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Adds `carousel-fade` to the root element class. Slides fade in and out rather than sliding horizontally.',
      },
    },
  },
};

// ── Dark controls ─────────────────────────────────────────────────────────────

export const DarkControls: Story = {
  args: {
    dark: true,
    slides: [
      {
        image: {
          src: 'https://picsum.photos/seed/carousel-light/1200/600',
          alt: 'Bright alpine meadow',
          width: 1200,
          height: 600,
        },
        label: 'Dark Controls',
        caption: 'Use `dark={true}` on light-toned images for better contrast on controls.',
        active: true,
      },
      {
        image: {
          src: 'https://picsum.photos/seed/carousel-pale/1200/600',
          alt: 'Misty lake at morning',
          width: 1200,
          height: 600,
        },
        label: 'Improved Readability',
        caption: 'Bootstrap\'s `carousel-dark` class darkens indicators and arrows.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Adds `carousel-dark` to the root element. Suitable for carousels placed over light backgrounds.',
      },
    },
  },
};

// ── No controls ───────────────────────────────────────────────────────────────

export const NoControls: Story = {
  args: {
    arrows: false,
    indicators: false,
    ride: 'carousel',
    interval: 3000,
    slides: [
      {
        image: { src: SLIDE_1_SRC, alt: 'Mountain landscape at dawn', width: 1200, height: 600 },
        active: true,
      },
      {
        image: { src: SLIDE_2_SRC, alt: 'Coastal cliffs at sunset', width: 1200, height: 600 },
      },
      {
        image: { src: SLIDE_3_SRC, alt: 'Dense forest trail in autumn', width: 1200, height: 600 },
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'No arrows or indicators — auto-cycles via `ride="carousel"` and a 3 s interval. Useful for purely decorative banner rotations.',
      },
    },
  },
};

// ── Captions only ─────────────────────────────────────────────────────────────

export const CaptionsOnly: Story = {
  args: {
    slides: [
      {
        image: { src: SLIDE_1_SRC, alt: 'Mountain landscape', width: 1200, height: 600 },
        caption: 'A caption without a label — use when a heading would be redundant.',
        active: true,
      },
      {
        image: { src: SLIDE_2_SRC, alt: 'Coastal cliffs', width: 1200, height: 600 },
        caption: 'Only the `caption` field is set on this slide.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Slides with `caption` but no `label`. The `.carousel-caption` container is still rendered; the `<h5>` is omitted.',
      },
    },
  },
};

// ── Images only ───────────────────────────────────────────────────────────────

export const ImagesOnly: Story = {
  args: {
    slides: [
      {
        image: { src: SLIDE_1_SRC, alt: 'Mountain landscape', width: 1200, height: 600 },
        active: true,
      },
      {
        image: { src: SLIDE_2_SRC, alt: 'Coastal cliffs', width: 1200, height: 600 },
      },
      {
        image: { src: SLIDE_3_SRC, alt: 'Forest trail', width: 1200, height: 600 },
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Slides with images but no `label` or `caption`. The `.carousel-caption` container is omitted entirely.',
      },
    },
  },
};

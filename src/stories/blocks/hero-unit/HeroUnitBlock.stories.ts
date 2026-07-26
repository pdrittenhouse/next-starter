import type { Meta, StoryObj } from '@storybook/nextjs';
import { HeroUnitBlock } from './HeroUnitBlock';

const meta = {
  title: 'Design System/Blocks/Hero Unit',
  component: HeroUnitBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-width hero block. Supports palette background/text colors via `section_variant.color` and a custom hex `section_bg_color` via inline style.',
      },
    },
  },
} satisfies Meta<typeof HeroUnitBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/hero-unit',
      clientId: 'hero-unit-1',
      renderedHtml:
        '<div class="block-hero-unit"><h1>Welcome to the Site</h1><p class="lead">A short description about the purpose of this site.</p></div>',
    },
  },
};

export const WithPaletteBackground: Story = {
  args: {
    block: {
      name: 'acf/hero-unit',
      clientId: 'hero-unit-2',
      attributesJSON: JSON.stringify({
        data: {
          section_variant: { color: 'primary' },
        },
        className: 'bg-primary',
      }),
      renderedHtml:
        '<div class="block-hero-unit bg-primary"><h1>Primary Hero</h1><p class="lead">Hero with palette background.</p></div>',
    },
  },
};

export const WithCustomBackground: Story = {
  args: {
    block: {
      name: 'acf/hero-unit',
      clientId: 'hero-unit-3',
      attributesJSON: JSON.stringify({
        data: {
          section_variant: { type: 'custom', color: 'custom' },
          section_bg_color: '#1a1a2e',
        },
      }),
      renderedHtml:
        '<div class="block-hero-unit" style="background-color:#1a1a2e"><h1>Custom Background</h1><p class="lead">Hero with a custom hex background.</p></div>',
    },
  },
};

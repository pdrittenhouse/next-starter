import type { Meta, StoryObj } from '@storybook/nextjs';
import { SectionBlock } from './SectionBlock';

const meta = {
  title: 'Design System/Blocks/Section',
  component: SectionBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page section block. Builds `block-section`, `section-layout-*`, `bg-*`, and `text-*` classes from ACF fields. Supports a `margin` group field for custom spacing via inline style.',
      },
    },
  },
} satisfies Meta<typeof SectionBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/section',
      clientId: 'section-1',
      renderedHtml:
        '<section class="block-section"><div class="container"><h2>Section Heading</h2><p>Section body content.</p></div></section>',
    },
  },
};

export const WithPaletteBackground: Story = {
  args: {
    block: {
      name: 'acf/section',
      clientId: 'section-2',
      attributesJSON: JSON.stringify({
        data: {
          section_bg_color: { type: 'palette', color: 'light' },
          text_align: 'center',
        },
      }),
      renderedHtml:
        '<section class="block-section bg-light text-center"><div class="container"><h2>Light Section</h2><p>Centered text on a light background.</p></div></section>',
    },
  },
};

export const WithCustomBackground: Story = {
  args: {
    block: {
      name: 'acf/section',
      clientId: 'section-3',
      attributesJSON: JSON.stringify({
        data: {
          section_bg_color: { type: 'custom', color: '#0d1b2a' },
        },
      }),
      renderedHtml:
        '<section class="block-section" style="background-color:#0d1b2a"><div class="container"><h2>Dark Section</h2></div></section>',
    },
  },
};

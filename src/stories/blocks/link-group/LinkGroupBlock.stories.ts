import type { Meta, StoryObj } from '@storybook/nextjs';
import { LinkGroupBlock } from './LinkGroupBlock';

const meta = {
  title: 'Design System/Blocks/Link Group',
  component: LinkGroupBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Group of links with optional palette or custom background and text colors via `section_variant.color`.',
      },
    },
  },
} satisfies Meta<typeof LinkGroupBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/link-group',
      clientId: 'link-group-1',
      renderedHtml:
        '<div class="block-link-group"><a href="#">Link One</a><a href="#">Link Two</a><a href="#">Link Three</a></div>',
    },
  },
};

export const WithPaletteColors: Story = {
  args: {
    block: {
      name: 'acf/link-group',
      clientId: 'link-group-2',
      attributesJSON: JSON.stringify({
        data: {
          section_variant: { color: 'secondary' },
        },
      }),
      renderedHtml:
        '<div class="block-link-group bg-secondary"><a href="#">Link One</a><a href="#">Link Two</a></div>',
    },
  },
};

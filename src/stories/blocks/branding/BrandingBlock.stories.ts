import type { Meta, StoryObj } from '@storybook/nextjs';
import { BrandingBlock } from './BrandingBlock';

const meta = {
  title: 'Design System/Blocks/Branding',
  component: BrandingBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders the site logo and branding. Output is fully WordPress-managed via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof BrandingBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/branding',
      clientId: 'branding-1',
      renderedHtml:
        '<div class="site-branding"><a class="navbar-brand" href="/"><img src="/logo.svg" alt="Site Logo" width="120" height="40" /></a></div>',
    },
  },
};

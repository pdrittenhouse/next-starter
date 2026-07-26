import type { Meta, StoryObj } from '@storybook/nextjs';
import { MenuBlock } from './MenuBlock';

const meta = {
  title: 'Design System/Blocks/Menu',
  component: MenuBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Navigation menu block. Wraps WordPress-rendered nav markup in a `<nav>` element.',
      },
    },
  },
} satisfies Meta<typeof MenuBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/menu',
      clientId: 'menu-1',
      renderedHtml:
        '<ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="/">Home</a></li><li class="nav-item"><a class="nav-link" href="/about">About</a></li><li class="nav-item"><a class="nav-link" href="/contact">Contact</a></li></ul>',
    },
  },
};

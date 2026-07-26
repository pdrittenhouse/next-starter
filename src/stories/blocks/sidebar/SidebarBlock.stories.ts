import type { Meta, StoryObj } from '@storybook/nextjs';
import { SidebarBlock } from './SidebarBlock';

const meta = {
  title: 'Design System/Blocks/Sidebar',
  component: SidebarBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'WordPress widget sidebar block. Wraps the rendered sidebar markup in a semantic `<aside>` element.',
      },
    },
  },
} satisfies Meta<typeof SidebarBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/sidebar',
      clientId: 'sidebar-1',
      renderedHtml:
        '<div class="widget widget_search"><form class="search-form"><input type="search" placeholder="Search&hellip;" /></form></div><div class="widget widget_recent_entries"><h3>Recent Posts</h3><ul><li><a href="#">Post One</a></li><li><a href="#">Post Two</a></li></ul></div>',
    },
  },
};

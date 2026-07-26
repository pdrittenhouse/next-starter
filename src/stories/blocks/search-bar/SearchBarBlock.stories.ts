import type { Meta, StoryObj } from '@storybook/nextjs';
import { SearchBarBlock } from './SearchBarBlock';

const meta = {
  title: 'Design System/Blocks/Search Bar',
  component: SearchBarBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Search form block. Output is fully WordPress-managed via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof SearchBarBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/search-bar',
      clientId: 'search-bar-1',
      renderedHtml:
        '<form class="search-form d-flex" role="search" action="/search"><input class="form-control me-2" type="search" placeholder="Search&hellip;" aria-label="Search" name="s" /><button class="btn btn-outline-primary" type="submit">Search</button></form>',
    },
  },
};

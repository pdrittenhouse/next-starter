import type { Meta, StoryObj } from '@storybook/nextjs';
import { PostsLoopBlock } from './PostsLoopBlock';

const meta = {
  title: 'Design System/Blocks/Posts Loop',
  component: PostsLoopBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Dynamic posts loop / query block. Output is fully WordPress-managed via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof PostsLoopBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/posts-loop',
      clientId: 'posts-loop-1',
      renderedHtml:
        '<div class="posts-loop row"><article class="col-md-4"><h3><a href="/post-1">Post Title One</a></h3><p>Excerpt for post one.</p></article><article class="col-md-4"><h3><a href="/post-2">Post Title Two</a></h3><p>Excerpt for post two.</p></article></div>',
    },
  },
};

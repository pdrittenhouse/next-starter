import type { Meta, StoryObj } from '@storybook/nextjs';
import { PostMetaBlock } from './PostMetaBlock';

const meta = {
  title: 'Design System/Blocks/Post Meta',
  component: PostMetaBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders post metadata (date, author, categories, tags). Output is fully WordPress-managed via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof PostMetaBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/post-meta',
      clientId: 'post-meta-1',
      renderedHtml:
        '<div class="post-meta"><time datetime="2026-01-15">January 15, 2026</time><span class="post-author">By Jane Doe</span><a href="/category/news" class="post-category">News</a></div>',
    },
  },
};

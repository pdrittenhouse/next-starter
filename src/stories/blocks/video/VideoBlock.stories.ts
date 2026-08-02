import type { Meta, StoryObj } from '@storybook/nextjs';
import { VideoBlock } from './VideoBlock';

const meta = {
  title: 'Design System/Blocks/Video',
  component: VideoBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Video block. Renders the Video atom with ACF-driven source, format (YouTube, Vimeo, HTML5, etc.), poster image, aspect ratio, autoplay, loop, muted, controls, and player-specific options. File-based poster images are resolved via WPGraphQL.',
      },
    },
  },
} satisfies Meta<typeof VideoBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/video',
      clientId: 'video-1',
      renderedHtml:
        '<div class="video-block"><div class="ratio ratio-16x9"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Sample Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>',
    },
  },
};

export const Vimeo: Story = {
  args: {
    block: {
      name: 'acf/video',
      clientId: 'video-2',
      renderedHtml:
        '<div class="video-block"><div class="ratio ratio-16x9"><iframe src="https://player.vimeo.com/video/76979871?dnt=1" title="Vimeo Sample" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div></div>',
    },
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { ImageBlock } from './ImageBlock';

const meta = {
  title: 'Design System/Blocks/Image',
  component: ImageBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Image block. Handles file-type images (resolving the attachment ID via WPGraphQL) and URL-type images. Supports aspect-ratio, picture, and raw variants; optional caption, link wrapper, overlay text, and block-level spacing styles.',
      },
    },
  },
} satisfies Meta<typeof ImageBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/image',
      clientId: 'image-1',
      renderedHtml:
        '<div class="image-block"><picture><source srcset="https://placehold.co/800x450.webp" type="image/webp" /><img src="https://placehold.co/800x450" alt="A descriptive image caption" width="800" height="450" loading="lazy" /></picture></div>',
    },
  },
};

export const WithCaption: Story = {
  args: {
    block: {
      name: 'acf/image',
      clientId: 'image-2',
      renderedHtml:
        '<div class="image-block"><picture><img src="https://placehold.co/800x450" alt="Mountain landscape at sunrise" width="800" height="450" loading="lazy" /></picture><figcaption class="image-caption">Mountain landscape at sunrise — shot on location in Colorado.</figcaption></div>',
    },
  },
};

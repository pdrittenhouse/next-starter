import type { Meta, StoryObj } from '@storybook/nextjs';
import { SocialShareBlock } from './SocialShareBlock';

const meta = {
  title: 'Design System/Blocks/Social Share',
  component: SocialShareBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Social sharing links block. Output is fully WordPress-managed via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof SocialShareBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/social-share',
      clientId: 'social-share-1',
      renderedHtml:
        '<div class="social-share"><a href="#" class="social-share__link social-share__link--twitter" aria-label="Share on Twitter">Twitter</a><a href="#" class="social-share__link social-share__link--facebook" aria-label="Share on Facebook">Facebook</a><a href="#" class="social-share__link social-share__link--linkedin" aria-label="Share on LinkedIn">LinkedIn</a></div>',
    },
  },
};

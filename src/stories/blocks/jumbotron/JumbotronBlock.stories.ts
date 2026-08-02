import type { Meta, StoryObj } from '@storybook/nextjs';
import { JumbotronBlock } from './JumbotronBlock';

const meta = {
  title: 'Design System/Blocks/Jumbotron',
  component: JumbotronBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Jumbotron block. Supports a background image, inline side image, label, title, subtitle, body text, and CTA button. Resolves file-based images via WPGraphQL; supports fluid/container mode and vertical centering.',
      },
    },
  },
} satisfies Meta<typeof JumbotronBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/jumbotron',
      clientId: 'jumbotron-1',
      renderedHtml:
        '<div class="jumbotron block-jumbotron"><div class="container"><p class="jumbotron-label">New Release</p><h1 class="display-4">Build faster with Timberland</h1><p class="lead">A powerful WordPress framework that pairs seamlessly with a headless Next.js front end.</p><hr class="my-4" /><p>Start with a solid foundation and ship production-ready sites in record time.</p><a class="btn btn-primary btn-lg" href="/get-started">Get Started</a></div></div>',
    },
  },
};

export const WithBackground: Story = {
  args: {
    block: {
      name: 'acf/jumbotron',
      clientId: 'jumbotron-2',
      renderedHtml:
        '<div class="jumbotron jumbotron-fluid block-jumbotron" style="background-image: url(https://placehold.co/1600x600); background-size: cover; background-position: center;"><span class="jumbotron-overlay"></span><div class="container"><h1 class="display-4 text-white">Welcome to the Platform</h1><p class="lead text-white">A full-width hero with a background image and overlay for maximum visual impact.</p><a class="btn btn-light btn-lg" href="/explore">Explore</a></div></div>',
    },
  },
};

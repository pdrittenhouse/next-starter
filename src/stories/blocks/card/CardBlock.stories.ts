import type { Meta, StoryObj } from '@storybook/nextjs';
import { CardBlock } from './CardBlock';

const meta = {
  title: 'Design System/Blocks/Card',
  component: CardBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Card block. Resolves file-based card and background images via WPGraphQL, then renders the Card organism with ACF-driven title, body, footer, link, button, image, flip, background color, text color, and border settings.',
      },
    },
  },
} satisfies Meta<typeof CardBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/card',
      clientId: 'card-1',
      renderedHtml:
        '<div class="card block-card"><img src="https://placehold.co/600x400" class="card-img-top" alt="Card image" width="600" height="400" loading="lazy" /><div class="card-body"><h5 class="card-title">Card Title</h5><p class="card-text">Some quick example text to build on the card title and make up the bulk of the card\'s content.</p><a href="/read-more" class="btn btn-primary">Read More</a></div></div>',
    },
  },
};

export const WithBackground: Story = {
  args: {
    block: {
      name: 'acf/card',
      clientId: 'card-2',
      renderedHtml:
        '<div class="card block-card bg-primary text-white"><div class="card-body"><h5 class="card-title">Featured Card</h5><p class="card-text">A card with a palette background color and matching text color applied via ACF variant fields.</p><a href="/learn-more" class="btn btn-outline-light">Learn More</a></div><div class="card-footer text-white-50">Last updated 3 mins ago</div></div>',
    },
  },
};

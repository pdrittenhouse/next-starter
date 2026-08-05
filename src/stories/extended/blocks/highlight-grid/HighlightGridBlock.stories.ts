import type { Meta, StoryObj } from '@storybook/nextjs';
import { HighlightGridBlock } from './HighlightGridBlock';

const meta = {
  title: 'Design System/Blocks/Extended/Highlight Grid',
  component: HighlightGridBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Highlight Grid block from the timberland-extended plugin. Renders a grid of highlight items, each with an optional image, title, and label. Item type toggles between image-first and text-first display. Currently a stub — renders WP server-side HTML via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof HighlightGridBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/highlight-grid',
      clientId: 'highlight-grid-1',
      renderedHtml:
        '<div class="block-highlight-grid"><div class="row"><div class="col-md-4"><div class="highlight-item"><img src="https://placehold.co/400x300" alt="Highlight 1" width="400" height="300" loading="lazy" /><span class="label">Label</span><h3>Highlight One</h3></div></div><div class="col-md-4"><div class="highlight-item"><img src="https://placehold.co/400x300" alt="Highlight 2" width="400" height="300" loading="lazy" /><span class="label">Label</span><h3>Highlight Two</h3></div></div><div class="col-md-4"><div class="highlight-item"><img src="https://placehold.co/400x300" alt="Highlight 3" width="400" height="300" loading="lazy" /><span class="label">Label</span><h3>Highlight Three</h3></div></div></div></div>',
    },
  },
};

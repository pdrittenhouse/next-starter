import type { Meta, StoryObj } from '@storybook/nextjs';
import { FeatureBlock } from './FeatureBlock';

const meta = {
  title: 'Design System/Blocks/Extended/Feature',
  component: FeatureBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Feature block from the timberland-extended plugin. Renders a full-width or contained feature panel with image, heading, subtitle, body text, and an optional button. Supports vertical layout, background/text color, padding, margin, border, and box shadow. Currently a stub — renders WP server-side HTML via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof FeatureBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/feature',
      clientId: 'feature-1',
      renderedHtml:
        '<div class="block-feature"><div class="feature-inner"><div class="feature-content"><span class="label">Category</span><h2 class="feature-title">Feature Heading</h2><p class="feature-subtitle">A supporting subtitle line below the main heading.</p><div class="feature-text"><p>Body copy describing the feature in detail. This text supports rich HTML output from the WYSIWYG field.</p></div><a href="/learn-more" class="btn btn-primary">Learn More</a></div><div class="feature-image"><img src="https://placehold.co/600x400" alt="Feature image" width="600" height="400" loading="lazy" /></div></div></div>',
    },
  },
};

export const Vertical: Story = {
  args: {
    block: {
      name: 'acf/feature',
      clientId: 'feature-2',
      renderedHtml:
        '<div class="block-feature feature-vertical"><div class="feature-inner"><div class="feature-image"><img src="https://placehold.co/1200x400" alt="Feature image" width="1200" height="400" loading="lazy" /></div><div class="feature-content"><h2 class="feature-title">Vertical Feature Layout</h2><p>Image stacked above the content in a vertical orientation.</p><a href="/read-more" class="btn btn-secondary">Read More</a></div></div></div>',
    },
  },
};

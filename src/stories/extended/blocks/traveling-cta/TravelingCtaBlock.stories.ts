import type { Meta, StoryObj } from '@storybook/nextjs';
import { TravelingCtaBlock } from './TravelingCtaBlock';

const meta = {
  title: 'Design System/Blocks/Extended/Traveling CTA',
  component: TravelingCtaBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Traveling CTA block from the timberland-extended plugin. Renders a sticky call-to-action bar that appears when the user scrolls past a waypoint. Supports container width, reverse order, background color, border, border radius, alignment, padding, and per-item auto width. Currently a stub — renders WP server-side HTML via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof TravelingCtaBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/traveling-cta',
      clientId: 'traveling-cta-1',
      renderedHtml:
        '<div class="block-traveling-cta traveling-cta" data-pattern="timberland/traveling-cta"><div class="traveling-cta-inner container"><div class="traveling-cta-items"><div class="traveling-cta-item"><p>Ready to get started?</p></div><div class="traveling-cta-item"><a href="/contact" class="btn btn-primary">Get in Touch</a></div></div></div></div>',
    },
  },
};

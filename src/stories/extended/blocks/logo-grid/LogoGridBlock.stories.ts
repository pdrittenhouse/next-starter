import type { Meta, StoryObj } from '@storybook/nextjs';
import { LogoGridBlock } from './LogoGridBlock';

const meta = {
  title: 'Design System/Blocks/Extended/Logo Grid',
  component: LogoGridBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Logo Grid block from the timberland-extended plugin. Renders a static grid of client or partner logos with optional title and intro text. Each logo supports custom width/height and an optional grayscale filter. Currently a stub — renders WP server-side HTML via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof LogoGridBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/logo-grid',
      clientId: 'logo-grid-1',
      renderedHtml:
        '<div class="logo-grid-block" data-pattern="timberland/logo-grid"><h2 class="logo-grid-title">Our Partners</h2><p class="logo-grid-intro">Trusted by leading organizations worldwide.</p><div class="row logo-grid"><div class="col-6 col-md-3"><img src="https://placehold.co/160x80" alt="Partner logo" width="160" height="80" loading="lazy" /></div><div class="col-6 col-md-3"><img src="https://placehold.co/160x80" alt="Partner logo" width="160" height="80" loading="lazy" /></div><div class="col-6 col-md-3"><img src="https://placehold.co/160x80" alt="Partner logo" width="160" height="80" loading="lazy" /></div><div class="col-6 col-md-3"><img src="https://placehold.co/160x80" alt="Partner logo" width="160" height="80" loading="lazy" /></div></div></div>',
    },
  },
};

export const Grayscale: Story = {
  args: {
    block: {
      name: 'acf/logo-grid',
      clientId: 'logo-grid-2',
      renderedHtml:
        '<div class="logo-grid-block grayscale" data-pattern="timberland/logo-grid"><div class="row logo-grid"><div class="col-6 col-md-3"><img src="https://placehold.co/160x80" alt="Partner logo" width="160" height="80" loading="lazy" style="filter:grayscale(1)" /></div><div class="col-6 col-md-3"><img src="https://placehold.co/160x80" alt="Partner logo" width="160" height="80" loading="lazy" style="filter:grayscale(1)" /></div><div class="col-6 col-md-3"><img src="https://placehold.co/160x80" alt="Partner logo" width="160" height="80" loading="lazy" style="filter:grayscale(1)" /></div><div class="col-6 col-md-3"><img src="https://placehold.co/160x80" alt="Partner logo" width="160" height="80" loading="lazy" style="filter:grayscale(1)" /></div></div></div>',
    },
  },
};

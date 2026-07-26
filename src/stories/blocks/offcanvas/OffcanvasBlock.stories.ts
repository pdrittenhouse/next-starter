import type { Meta, StoryObj } from '@storybook/nextjs';
import { OffcanvasBlock } from './OffcanvasBlock';

const meta = {
  title: 'Design System/Blocks/Offcanvas',
  component: OffcanvasBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Bootstrap offcanvas panel block. Output is fully WordPress-managed via renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof OffcanvasBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/offcanvas',
      clientId: 'offcanvas-1',
      renderedHtml:
        '<div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNav"><div class="offcanvas-header"><h5 class="offcanvas-title">Menu</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body"><ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="/">Home</a></li></ul></div></div>',
    },
  },
};

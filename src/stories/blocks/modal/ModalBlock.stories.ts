import type { Meta, StoryObj } from '@storybook/nextjs';
import { ModalBlock } from './ModalBlock';

const meta = {
  title: 'Design System/Blocks/Modal',
  component: ModalBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Modal block. Renders a Bootstrap modal with optional trigger button, configurable size, fullscreen breakpoint, center alignment, backdrop, header/footer close buttons, and palette-based background and text colors.',
      },
    },
  },
} satisfies Meta<typeof ModalBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/modal',
      clientId: 'modal-1',
      renderedHtml:
        '<div class="block-modal"><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal1">Open Modal</button><div class="modal fade" id="modal1" tabindex="-1" aria-labelledby="modal1Label" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="modal1Label">Modal Title</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><p>This is the modal body content. Place any information or form elements here.</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button type="button" class="btn btn-primary">Save changes</button></div></div></div></div></div>',
    },
  },
};

export const Large: Story = {
  args: {
    block: {
      name: 'acf/modal',
      clientId: 'modal-2',
      renderedHtml:
        '<div class="block-modal"><button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#modal2">Open Large Modal</button><div class="modal fade" id="modal2" tabindex="-1" aria-labelledby="modal2Label" aria-hidden="true"><div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="modal2Label">Large Centered Modal</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><p>A large, vertically centered modal is useful for displaying forms, images, or expanded content without leaving the current page context.</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Dismiss</button></div></div></div></div></div>',
    },
  },
};

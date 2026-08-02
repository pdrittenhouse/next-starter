import type { Meta, StoryObj } from '@storybook/nextjs';
import { ButtonGroupBlock } from './ButtonGroupBlock';

const meta = {
  title: 'Design System/Blocks/Button Group',
  component: ButtonGroupBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Button group block. Maps the button_groups ACF repeater to the ButtonGroup molecule, supporting toolbar mode, vertical orientation, per-group gap, and wrapper width/margin/alignment styles.',
      },
    },
  },
} satisfies Meta<typeof ButtonGroupBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/button-group',
      clientId: 'button-group-1',
      renderedHtml:
        '<div class="button-group-block"><div class="btn-group" role="group" aria-label="Primary actions"><a href="/save" class="btn btn-primary">Save</a><a href="/cancel" class="btn btn-secondary">Cancel</a><a href="/delete" class="btn btn-danger">Delete</a></div></div>',
    },
  },
};

export const Toolbar: Story = {
  args: {
    block: {
      name: 'acf/button-group',
      clientId: 'button-group-2',
      renderedHtml:
        '<div class="button-group-block"><div class="btn-toolbar" role="toolbar" aria-label="Text formatting toolbar"><div class="btn-group me-2" role="group"><button type="button" class="btn btn-outline-secondary">Bold</button><button type="button" class="btn btn-outline-secondary">Italic</button><button type="button" class="btn btn-outline-secondary">Underline</button></div><div class="btn-group" role="group"><button type="button" class="btn btn-outline-secondary">Left</button><button type="button" class="btn btn-outline-secondary">Center</button><button type="button" class="btn btn-outline-secondary">Right</button></div></div></div>',
    },
  },
};

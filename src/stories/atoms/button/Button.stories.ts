import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Button atom — mirrors the theme\'s Pattern Lab button. Supports all Bootstrap 5 ' +
          'button features: color variants, outlines, sizes, element types, toggles, ' +
          'tooltips, popovers, close button, and ARIA attributes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary', 'secondary', 'tertiary', 'quaternary', 'quinary',
        'senary', 'septenary', 'octonary', 'nonary', 'denary',
        'success', 'info', 'warning', 'danger', 'light', 'dark', 'link',
      ],
    },
    size: { control: 'select', options: ['sm', 'lg'] },
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    toggle: { control: 'select', options: ['button', 'collapse', 'dropdown', 'modal', 'tab'] },
    as: { control: 'select', options: ['button', 'a', 'input'] },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Variants ---

export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Secondary Button',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    label: 'Tertiary Button',
  },
};

export const Quaternary: Story = {
  args: {
    variant: 'quaternary',
    label: 'Quaternary Button',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    label: 'Success',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    label: 'Danger',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    label: 'Warning',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    label: 'Info',
  },
};

export const Light: Story = {
  args: {
    variant: 'light',
    label: 'Light',
  },
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    label: 'Dark',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    label: 'Link Button',
  },
};

// --- Outline ---

export const OutlinePrimary: Story = {
  args: {
    variant: 'primary',
    outline: true,
    label: 'Outline Primary',
  },
};

export const OutlineSecondary: Story = {
  args: {
    variant: 'secondary',
    outline: true,
    label: 'Outline Secondary',
  },
};

export const OutlineDanger: Story = {
  args: {
    variant: 'danger',
    outline: true,
    label: 'Outline Danger',
  },
};

// --- Sizes ---

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small Button',
  },
};

// --- Block ---

export const Block: Story = {
  args: {
    block: true,
    label: 'Full-Width Block Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// --- States ---

export const Active: Story = {
  args: {
    active: true,
    label: 'Active / Pressed',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled Button',
  },
};

// --- Element Types ---

export const AnchorButton: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    label: 'Anchor Button',
  },
};

export const InputButton: Story = {
  args: {
    as: 'input',
    type: 'submit',
    value: 'Submit Input',
    label: 'Submit',
  },
};

// --- Close Button ---

export const Close: Story = {
  args: {
    closeButton: true,
  },
};

export const CloseWhite: Story = {
  args: {
    closeButton: 'white',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// --- Tooltip ---

export const WithTooltip: Story = {
  args: {
    label: 'Hover for Tooltip',
    tooltip: 'This is a <strong>tooltip</strong>',
    placement: 'top',
  },
};

// --- Popover ---

export const WithPopover: Story = {
  args: {
    label: 'Click for Popover',
    popoverTitle: 'Popover Title',
    popoverContent: 'This is the popover body content.',
    placement: 'right',
  },
};

// --- Toggle ---

export const CollapseToggle: Story = {
  args: {
    label: 'Toggle Collapse',
    toggle: 'collapse',
    target: '#collapseExample',
    expanded: false,
    controls: 'collapseExample',
  },
};

export const ModalToggle: Story = {
  args: {
    label: 'Open Modal',
    toggle: 'modal',
    target: '#exampleModal',
  },
};

// --- No Wrap ---

export const NoWrap: Story = {
  args: {
    nowrap: true,
    label: 'This button text will not wrap to multiple lines',
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { ButtonGroup } from './ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Design System/Molecules/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ButtonGroup molecule — mirrors the Pattern Lab button-group template. ' +
          'Renders one or more Bootstrap button groups inside a configurable wrapper, ' +
          'with optional title, description, toolbar mode, size, and vertical orientation. ' +
          'Composes the Button atom for each individual button.',
      },
    },
  },
  argTypes: {
    wrapperDisplay: {
      control: 'select',
      options: ['inline', 'inline-block', 'grid', 'block', 'flex', 'inline-flex'],
    },
    size: {
      control: 'select',
      options: ['sm', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Default ---

export const Default: Story = {
  args: {
    groups: [
      {
        label: 'Primary actions',
        buttons: [
          { variant: 'primary', label: 'Save' },
          { variant: 'secondary', label: 'Preview' },
          { variant: 'outline-secondary' as any, label: 'Discard' },
        ],
      },
    ],
  },
};

// --- Inline group (btn-group, not d-grid) ---

export const InlineGroup: Story = {
  name: 'Inline Group',
  args: {
    groups: [
      {
        displayGrid: false,
        label: 'Text formatting',
        buttons: [
          { variant: 'secondary', label: 'Bold' },
          { variant: 'secondary', label: 'Italic' },
          { variant: 'secondary', label: 'Underline' },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `displayGrid: false` on a group to use Bootstrap btn-group ' +
          '(inline layout) instead of the default d-grid block layout.',
      },
    },
  },
};

// --- Toolbar (multiple groups side by side) ---

export const Toolbar: Story = {
  args: {
    toolbar: true,
    toolbarLabel: 'Document toolbar',
    wrapperDisplay: 'block',
    groups: [
      {
        label: 'Font style',
        buttons: [
          { variant: 'outline-secondary' as any, label: 'Bold' },
          { variant: 'outline-secondary' as any, label: 'Italic' },
          { variant: 'outline-secondary' as any, label: 'Underline' },
        ],
      },
      {
        label: 'Alignment',
        className: 'ms-2',
        buttons: [
          { variant: 'outline-secondary' as any, label: 'Left' },
          { variant: 'outline-secondary' as any, label: 'Center' },
          { variant: 'outline-secondary' as any, label: 'Right' },
        ],
      },
      {
        label: 'Actions',
        className: 'ms-2',
        buttons: [
          { variant: 'outline-primary' as any, label: 'Save' },
          { variant: 'outline-danger' as any, label: 'Delete' },
        ],
      },
    ],
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Setting `toolbar: true` wraps all groups inside a `btn-toolbar` element ' +
          'and forces `displayGrid: false` on every group, producing an inline ' +
          'side-by-side layout matching Bootstrap\'s toolbar pattern.',
      },
    },
  },
};

// --- Vertical ---

export const Vertical: Story = {
  args: {
    wrapperDisplay: 'inline-flex',
    vertical: true,
    groups: [
      {
        displayGrid: false,
        label: 'Navigation',
        buttons: [
          { variant: 'primary', label: 'Dashboard' },
          { variant: 'secondary', label: 'Reports' },
          { variant: 'secondary', label: 'Settings' },
          { variant: 'secondary', label: 'Sign out' },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `vertical: true` to stack all groups using `btn-group-vertical`, ' +
          'suitable for side navigation or stacked action menus.',
      },
    },
  },
};

// --- With title and description ---

export const WithHeading: Story = {
  name: 'With Heading',
  args: {
    wrapperDisplay: 'block',
    title: 'Quick Actions',
    description: 'Perform common tasks without leaving this page.',
    groups: [
      {
        gap: 2,
        buttons: [
          { variant: 'primary', label: 'Publish' },
          { variant: 'secondary', label: 'Save Draft' },
          { variant: 'outline-secondary' as any, label: 'Archive' },
        ],
      },
    ],
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Providing `title` and/or `description` renders a `button-group--heading` ' +
          'section above the groups. The `gap` property maps to Bootstrap gap-* utilities.',
      },
    },
  },
};

// --- Sized ---

export const LargeSize: Story = {
  name: 'Large Size',
  args: {
    size: 'lg',
    groups: [
      {
        displayGrid: false,
        label: 'Page actions',
        buttons: [
          { variant: 'primary', label: 'Get Started' },
          { variant: 'outline-primary' as any, label: 'Learn More' },
        ],
      },
    ],
  },
};

export const SmallSize: Story = {
  name: 'Small Size',
  args: {
    size: 'sm',
    groups: [
      {
        displayGrid: false,
        label: 'Row actions',
        buttons: [
          { variant: 'secondary', label: 'Edit' },
          { variant: 'secondary', label: 'Duplicate' },
          { variant: 'danger', label: 'Delete' },
        ],
      },
    ],
  },
};

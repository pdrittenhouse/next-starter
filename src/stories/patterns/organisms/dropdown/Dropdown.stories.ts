import type { Meta, StoryObj } from '@storybook/nextjs';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Design System/Organisms/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dropdown organism — mirrors the Pattern Lab dropdown template at ' +
          '`03-organisms/dropdown/_dropdown.tpl.twig`. ' +
          'Renders a Bootstrap 5 toggle button with a positioned menu of items. ' +
          'Supports all four open directions, dark mode, background/text color utilities, ' +
          'positional offsets, auto-close behaviour, menu alignment, and an optional ' +
          'btn-group wrapper mode for action-button dropdowns. ' +
          'Items can be anchors, buttons, section headings (h1–h6), or dividers (hr).',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['down', 'up', 'left', 'right'],
      description: 'Direction the menu opens relative to the toggle button.',
    },
    menuAlign: {
      control: 'radio',
      options: ['start', 'end'],
      description: 'Align the menu to the start (left) or end (right).',
    },
    autoClose: {
      control: 'select',
      options: ['true', 'false', 'inside', 'outside'],
      description: 'data-bs-auto-close value passed to the toggle button.',
    },
    buttonGroupSize: {
      control: 'radio',
      options: ['sm', 'lg'],
      description: 'btn-group size applied when buttonGroup is true.',
    },
    buttonGroupDisplay: {
      control: 'select',
      options: ['inline', 'inline-block', 'grid', 'block', 'flex', 'inline-flex'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    button: {
      variant: 'primary',
      label: 'Actions',
    },
    items: [
      { text: 'View profile' },
      { text: 'Edit settings' },
      { element: 'hr' },
      { text: 'Sign out', link: '/logout' },
    ],
  },
};

// ─── With Dividers and Header ────────────────────────────────────────────────

export const WithDividersAndHeader: Story = {
  name: 'With Dividers & Header',
  args: {
    button: {
      variant: 'secondary',
      label: 'User menu',
    },
    items: [
      { element: 'h6', text: 'Account' },
      { text: 'Profile', link: '/profile' },
      { text: 'Billing', link: '/billing' },
      { text: 'Settings', link: '/settings' },
      { element: 'hr' },
      { element: 'h6', text: 'Support' },
      { text: 'Help center', link: '/help' },
      { text: 'Contact us', link: '/contact' },
      { element: 'hr' },
      { text: 'Sign out', link: '/logout' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Items with `element: "h6"` render as `dropdown-header` headings. ' +
          'Items with `element: "hr"` render as `dropdown-divider` rules. ' +
          'Both are wrapped in <li> elements per Bootstrap spec.',
      },
    },
  },
};

// ─── Dark Mode ────────────────────────────────────────────────────────────────

export const DarkMenu: Story = {
  name: 'Dark Menu',
  args: {
    button: {
      variant: 'dark',
      label: 'Dark dropdown',
    },
    dark: true,
    items: [
      { text: 'Dashboard', link: '/dashboard' },
      { text: 'Reports', link: '/reports' },
      { element: 'hr' },
      { text: 'Sign out', link: '/logout' },
    ],
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story:
          'Set `dark: true` to add `dropdown-menu-dark` to the menu element. ' +
          'Pairs well with a dark variant trigger button.',
      },
    },
  },
};

// ─── Direction: Up ───────────────────────────────────────────────────────────

export const DirectionUp: Story = {
  name: 'Direction: Up (Dropup)',
  args: {
    button: {
      variant: 'primary',
      label: 'Open up',
    },
    direction: 'up',
    items: [
      { text: 'Option one', link: '#' },
      { text: 'Option two', link: '#' },
      { text: 'Option three', link: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `direction: "up"` to add the `dropup` class to the wrapper, ' +
          'causing the menu to open above the toggle button.',
      },
    },
  },
};

// ─── Direction: End ──────────────────────────────────────────────────────────

export const DirectionRight: Story = {
  name: 'Direction: Right (Dropend)',
  args: {
    button: {
      variant: 'primary',
      label: 'Open right',
    },
    direction: 'right',
    items: [
      { text: 'Option one', link: '#' },
      { text: 'Option two', link: '#' },
      { text: 'Option three', link: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `direction: "right"` to add the `dropend` class to the wrapper, ' +
          'opening the menu to the right of the button.',
      },
    },
  },
};

// ─── Menu Align End ──────────────────────────────────────────────────────────

export const MenuAlignEnd: Story = {
  name: 'Menu Aligned End (Right)',
  args: {
    button: {
      variant: 'secondary',
      outline: true,
      label: 'Right-aligned menu',
    },
    menuAlign: 'end',
    items: [
      { text: 'Action', link: '#' },
      { text: 'Another action', link: '#' },
      { text: 'Something else', link: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Setting `menuAlign: "end"` adds `dropdown-menu-end` to the menu, ' +
          'aligning its right edge with the toggle button.',
      },
    },
  },
};

// ─── Button Items ─────────────────────────────────────────────────────────────

export const ButtonItems: Story = {
  name: 'Button Items',
  args: {
    button: {
      variant: 'primary',
      label: 'Choose action',
    },
    items: [
      { element: 'h6', text: 'File operations' },
      { element: 'button', text: 'Save' },
      { element: 'button', text: 'Save as…' },
      { element: 'hr' },
      { element: 'button', text: 'Delete', className: 'text-danger' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `element: "button"` to render menu items as `<button type="button">` ' +
          'elements (Bootstrap dropdown-item buttons). Useful when menu actions ' +
          'trigger JS behaviours rather than navigating.',
      },
    },
  },
};

// ─── Outline Variant ─────────────────────────────────────────────────────────

export const OutlineVariant: Story = {
  name: 'Outline Button',
  args: {
    button: {
      variant: 'primary',
      outline: true,
      label: 'More options',
    },
    items: [
      { text: 'Export CSV', link: '#' },
      { text: 'Export PDF', link: '#' },
      { element: 'hr' },
      { text: 'Print view', link: '#' },
    ],
  },
};

// ─── Small Size ──────────────────────────────────────────────────────────────

export const SmallButton: Story = {
  name: 'Small Button',
  args: {
    button: {
      variant: 'secondary',
      size: 'sm',
      label: 'Options',
    },
    items: [
      { text: 'Edit', link: '#' },
      { text: 'Duplicate', link: '#' },
      { text: 'Archive', link: '#' },
      { element: 'hr' },
      { text: 'Delete', link: '#', className: 'text-danger' },
    ],
  },
};

// ─── Button Group Mode ────────────────────────────────────────────────────────

export const ButtonGroupMode: Story = {
  name: 'Button Group Mode',
  args: {
    button: {
      variant: 'success',
      label: 'Publish',
    },
    buttonGroup: true,
    items: [
      { text: 'Publish now', link: '#' },
      { text: 'Schedule…', link: '#' },
      { text: 'Save as draft', link: '#' },
      { element: 'hr' },
      { text: 'Discard', link: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `buttonGroup: true` to wrap the button and menu inside a ' +
          '`btn-group` element instead of a plain `<div class="dropdown">`. ' +
          'Use `buttonGroupSize` for `btn-group-sm` / `btn-group-lg`.',
      },
    },
  },
};

// ─── Auto-Close: Inside Only ─────────────────────────────────────────────────

export const AutoCloseInside: Story = {
  name: 'Auto-Close: Inside',
  args: {
    button: {
      variant: 'primary',
      label: 'Auto-close inside',
    },
    autoClose: 'inside',
    items: [
      { text: 'Click me (closes)', link: '#' },
      { text: 'Click me (closes)', link: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '`autoClose: "inside"` sets `data-bs-auto-close="inside"` on the toggle button, ' +
          'so the menu only closes when clicking inside it — not when clicking outside.',
      },
    },
  },
};

// ─── With Custom Offset ──────────────────────────────────────────────────────

export const WithOffset: Story = {
  name: 'With Offset',
  args: {
    button: {
      variant: 'primary',
      label: 'Offset menu',
    },
    offsetX: 10,
    offsetY: 10,
    items: [
      { text: 'Item A', link: '#' },
      { text: 'Item B', link: '#' },
      { text: 'Item C', link: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `offsetX` and `offsetY` to shift the menu position. ' +
          'These map to `data-bs-offset="x,y"` on the toggle button.',
      },
    },
  },
};

// ─── Colored Menu ────────────────────────────────────────────────────────────

export const ColoredMenu: Story = {
  name: 'Colored Menu',
  args: {
    button: {
      variant: 'primary',
      label: 'Colored menu',
    },
    backgroundColor: 'primary',
    textColor: 'white',
    items: [
      { text: 'Home', link: '#' },
      { text: 'About', link: '#' },
      { text: 'Contact', link: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `backgroundColor` and `textColor` to apply Bootstrap ' +
          '`bg-*` and `text-*` utilities to the menu element.',
      },
    },
  },
};

// ─── Disabled Toggle ─────────────────────────────────────────────────────────

export const DisabledToggle: Story = {
  name: 'Disabled Toggle',
  args: {
    button: {
      variant: 'primary',
      label: 'Unavailable',
      disabled: true,
    },
    items: [
      { text: 'Option one', link: '#' },
      { text: 'Option two', link: '#' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Pass `disabled: true` inside the `button` prop to disable the toggle.',
      },
    },
  },
};

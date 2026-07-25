import type { Meta, StoryObj } from '@storybook/nextjs';
import { ListGroup } from './ListGroup';

const FRUIT_ITEMS = [
  { itemContent: 'Apples' },
  { itemContent: 'Bananas' },
  { itemContent: 'Cherries' },
  { itemContent: 'Dates' },
  { itemContent: 'Elderberries' },
];

const meta: Meta<typeof ListGroup> = {
  title: 'Design System/Atoms/ListGroup',
  component: ListGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'ListGroup atom — mirrors the theme\'s Pattern Lab `timberland/list-group` pattern. ' +
          'Renders a Bootstrap 5 list group with support for flush, horizontal, contextual ' +
          'variants, active/disabled states, and action items (links or buttons).',
      },
    },
  },
  argTypes: {
    listGroupElement: {
      control: 'select',
      options: ['ul', 'ol', 'div'],
      description: 'Root HTML element for the list group.',
    },
    listGroupFlush: {
      control: 'boolean',
      description: 'Remove outer borders and border-radius to render flush with parent edge.',
    },
    listGroupHorizontal: {
      control: 'boolean',
      description: 'Display list group items side by side.',
    },
    itemElement: {
      control: 'select',
      options: ['li', 'a', 'button', 'div', 'label'],
      description:
        'Default element for each item. Setting to `a` or `button` also adds `list-group-item-action`.',
    },
    listGroupOtherClasses: {
      control: 'text',
      description: 'Additional class names applied to the list group root.',
    },
  },
  args: {
    items: FRUIT_ITEMS,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Flush: Story = {
  args: {
    listGroupFlush: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Adds `list-group-flush` to remove outer borders and rounded corners.',
      },
    },
  },
};

export const Horizontal: Story = {
  args: {
    listGroupHorizontal: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Adds `list-group-horizontal` to display items side by side.',
      },
    },
  },
};

export const ActionLinks: Story = {
  args: {
    listGroupElement: 'div',
    itemElement: 'a',
    items: [
      { itemContent: 'Dashboard', itemElement: 'a', itemOtherAttributes: { href: '#' } },
      { itemContent: 'Profile', itemElement: 'a', itemOtherAttributes: { href: '#' } },
      { itemContent: 'Settings', itemElement: 'a', itemOtherAttributes: { href: '#' }, itemActive: true },
      { itemContent: 'Billing', itemElement: 'a', itemOtherAttributes: { href: '#' }, itemDisabled: true },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `itemElement="a"` (with `listGroupElement="div"`) for linked list groups. ' +
          'Items automatically receive `list-group-item-action`.',
      },
    },
  },
};

export const ActionButtons: Story = {
  args: {
    listGroupElement: 'div',
    itemElement: 'button',
    items: [
      { itemContent: 'Save draft', itemElement: 'button' },
      { itemContent: 'Publish', itemElement: 'button', itemActive: true },
      { itemContent: 'Archive', itemElement: 'button' },
      { itemContent: 'Delete', itemElement: 'button', itemDisabled: true },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Button items automatically receive `type="button"` to prevent unintended form submission.',
      },
    },
  },
};

export const WithActiveAndDisabled: Story = {
  name: 'Active & Disabled States',
  args: {
    items: [
      { itemContent: 'First item' },
      { itemContent: 'Second item (active)', itemActive: true },
      { itemContent: 'Third item (disabled)', itemDisabled: true },
      { itemContent: 'Fourth item' },
    ],
  },
};

export const ContextualVariants: Story = {
  args: {
    items: [
      { itemContent: 'Primary', contextualClass: 'primary' },
      { itemContent: 'Secondary', contextualClass: 'secondary' },
      { itemContent: 'Success', contextualClass: 'success' },
      { itemContent: 'Danger', contextualClass: 'danger' },
      { itemContent: 'Warning', contextualClass: 'warning' },
      { itemContent: 'Info', contextualClass: 'info' },
      { itemContent: 'Light', contextualClass: 'light' },
      { itemContent: 'Dark', contextualClass: 'dark' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'One contextual color variant per Bootstrap contextual class.',
      },
    },
  },
};

export const OrderedList: Story = {
  args: {
    listGroupElement: 'ol',
    items: FRUIT_ITEMS,
  },
  parameters: {
    docs: {
      description: {
        story: 'Use `listGroupElement="ol"` for numbered lists.',
      },
    },
  },
};

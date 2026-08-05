import type { Meta, StoryObj } from '@storybook/nextjs';
import { List } from './List';

const meta: Meta<typeof List> = {
  title: 'Design System/Molecules/List',
  component: List,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'List molecule — mirrors the theme\'s Pattern Lab `timberland/list` pattern. ' +
          'Renders a `<ul>` or `<ol>` with optional icon bullets (Font Awesome or SVG), ' +
          'configurable icon positions, per-item overrides, and recursive nested list support. ' +
          'Classes are merged and sorted to produce deterministic output matching the Twig template.',
      },
    },
  },
  argTypes: {
    parentElement: {
      control: 'select',
      options: ['ul', 'ol'],
      description: 'HTML element for the list container.',
    },
    listId: {
      control: 'text',
      description: 'HTML `id` attribute. Also adds `list-id--{id}` CSS class.',
    },
    bulletIcons: {
      control: 'boolean',
      description: 'Replace native bullets/numbers with icons.',
    },
    bulletIconPosition: {
      control: 'select',
      options: [undefined, 'before', 'after'],
      description: 'Global icon position. Overrides per-item `iconPosition`.',
    },
    bulletIconSize: {
      control: 'text',
      description: 'Global icon size (e.g. `1.25rem`). Overrides per-item dimensions.',
    },
    parentOtherClasses: {
      control: 'text',
      description: 'Additional classes appended to the list container.',
    },
  },
  args: {
    parentElement: 'ul',
    bulletIcons: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    listId: 'list-default',
    items: [
      { itemText: 'Design tokens are shared via npm' },
      { itemText: 'Components mirror Pattern Lab Twig templates 1:1' },
      { itemText: 'Bootstrap 5 utility classes are available globally' },
      { itemText: 'SCSS lives in the global stylesheet, not CSS modules' },
      { itemText: 'Storybook is the primary development environment' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic unordered list (`<ul>`) with five plain text items.',
      },
    },
  },
};

// ─── Ordered ──────────────────────────────────────────────────────────────────

export const Ordered: Story = {
  args: {
    parentElement: 'ol',
    listId: 'list-ordered',
    items: [
      { itemText: 'Clone the repository and run `npm install`' },
      { itemText: 'Copy `.env.example` to `.env.local` and fill in credentials' },
      { itemText: 'Run `npm run dev` to start the local development server' },
      { itemText: 'Open Storybook with `npm run storybook`' },
      { itemText: 'Deploy to production via `npm run build && npm start`' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Ordered list (`<ol>`) adds `list-type--ordered` to the class string. ' +
          'Use for sequential steps where order matters.',
      },
    },
  },
};

// ─── Icon Bullets — Font Awesome (before) ─────────────────────────────────────

export const IconsBefore: Story = {
  name: 'Icon Bullets — FA before',
  args: {
    listId: 'list-icons-before',
    bulletIcons: true,
    bulletIconPosition: 'before',
    bulletIconSize: '1rem',
    items: [
      {
        itemText: 'Unlimited bandwidth on all plans',
        itemIcon: 'fas fa-check',
        iconColor: 'success',
      },
      {
        itemText: '99.9% uptime SLA guarantee',
        itemIcon: 'fas fa-check',
        iconColor: 'success',
      },
      {
        itemText: '24/7 priority support',
        itemIcon: 'fas fa-check',
        iconColor: 'success',
      },
      {
        itemText: 'Automated daily backups',
        itemIcon: 'fas fa-check',
        iconColor: 'success',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Font Awesome icons positioned before each item\'s text. ' +
          '`bulletIcons: true` adds the `bullet-icons` and `bullet-icons--before` CSS classes. ' +
          '`bulletIconSize` sets a uniform `font-size` on every icon span.',
      },
    },
  },
};

// ─── Icon Bullets — Font Awesome (after) ──────────────────────────────────────

export const IconsAfter: Story = {
  name: 'Icon Bullets — FA after',
  args: {
    listId: 'list-icons-after',
    bulletIcons: true,
    bulletIconPosition: 'after',
    bulletIconSize: '0.875rem',
    items: [
      {
        itemText: 'Visit our homepage',
        itemIcon: 'fas fa-arrow-right',
        iconColor: 'primary',
      },
      {
        itemText: 'Read the documentation',
        itemIcon: 'fas fa-arrow-right',
        iconColor: 'primary',
      },
      {
        itemText: 'Browse the component library',
        itemIcon: 'fas fa-arrow-right',
        iconColor: 'primary',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Icon positioned after text via `bulletIconPosition: "after"`. ' +
          'Adds `bullet-icons--after` CSS class. The global SCSS at ' +
          '`src/scss/patterns/molecules/_list.scss` uses `padding-right` and ' +
          '`absolute` positioning for after-icons.',
      },
    },
  },
};

// ─── Mixed per-item icon positions ────────────────────────────────────────────

export const MixedIconPositions: Story = {
  name: 'Mixed — per-item icon positions',
  args: {
    listId: 'list-mixed',
    bulletIcons: false,
    items: [
      {
        itemText: 'Feature included',
        itemIcon: 'fas fa-check-circle',
        iconPosition: 'before',
        iconColor: 'success',
        iconWidth: '1.1rem',
        iconHeight: '1.1rem',
      },
      {
        itemText: 'Not available',
        itemIcon: 'fas fa-times-circle',
        iconPosition: 'before',
        iconColor: 'danger',
        iconWidth: '1.1rem',
        iconHeight: '1.1rem',
      },
      {
        itemText: 'Coming soon',
        itemIcon: 'fas fa-clock',
        iconPosition: 'before',
        iconColor: 'warning',
        iconWidth: '1.1rem',
        iconHeight: '1.1rem',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Per-item icon control without a global `bulletIconPosition`. Each item ' +
          'sets its own `iconPosition`, `iconColor`, and explicit `iconWidth`/`iconHeight`. ' +
          'The `line-height` style on each `<li>` is driven by `iconHeight`.',
      },
    },
  },
};

// ─── Nested list ──────────────────────────────────────────────────────────────

export const Nested: Story = {
  args: {
    listId: 'list-nested',
    items: [
      {
        itemText: 'Frontend',
        items: [
          { itemText: 'Next.js' },
          { itemText: 'TypeScript' },
          { itemText: 'Storybook' },
        ],
      },
      {
        itemText: 'Backend',
        items: [
          { itemText: 'WordPress REST API' },
          { itemText: 'WPGraphQL' },
        ],
      },
      {
        itemText: 'Design System',
        items: [
          { itemText: 'Pattern Lab (Twig)' },
          { itemText: 'Timberland design tokens' },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Nested lists via per-item `items` array. Each nested list renders its ' +
          'own `List` component recursively. Nested lists do not inherit the parent\'s ' +
          '`bulletIcons` or `bulletIconPosition` unless explicitly set on the item.',
      },
    },
  },
};

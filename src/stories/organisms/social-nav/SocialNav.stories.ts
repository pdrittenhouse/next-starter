import type { Meta, StoryObj } from '@storybook/nextjs';
import { SocialNav } from './SocialNav';

// ─── Shared fixture data ───────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    url: 'https://twitter.com/example',
    label: 'Twitter',
    icon: 'bi bi-twitter-x',
    target: '_blank',
  },
  {
    url: 'https://facebook.com/example',
    label: 'Facebook',
    icon: 'bi bi-facebook',
    target: '_blank',
  },
  {
    url: 'https://instagram.com/example',
    label: 'Instagram',
    icon: 'bi bi-instagram',
    target: '_blank',
  },
  {
    url: 'https://linkedin.com/in/example',
    label: 'LinkedIn',
    icon: 'bi bi-linkedin',
    target: '_blank',
  },
  {
    url: 'https://youtube.com/@example',
    label: 'YouTube',
    icon: 'bi bi-youtube',
    target: '_blank',
  },
];

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof SocialNav> = {
  title: 'Design System/Organisms/SocialNav',
  component: SocialNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'SocialNav organism — mirrors the theme\'s Pattern Lab `timberland/social-nav` pattern. ' +
          'Renders a horizontal or vertical list of social media icon links. ' +
          'Supports Bootstrap Icons (`bi bi-*`) and Font Awesome (`fab fa-*`) icon class strings, ' +
          'with label/icon visibility toggles and custom per-icon color theming.',
      },
    },
  },
  argTypes: {
    navDirection: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction — `horizontal` (flex row, default) or `vertical` (stacked column).',
    },
    hideLabels: {
      control: 'boolean',
      description:
        'Hide visible label text (icon-only mode). Labels remain accessible via `aria-label` and `title` on the anchor. Adds `hide-labels` class.',
    },
    hideIcons: {
      control: 'boolean',
      description: 'Hide all icons (text-only mode). Adds `hide-icons` class.',
    },
    customColors: {
      control: 'boolean',
      description:
        'Enable per-icon custom color tokens via `iconColor`. Adds `custom-colors` class, which disables the default uniform icon color.',
    },
    bulletIconPosition: {
      control: 'select',
      options: ['before', 'after'],
      description: 'Global icon position for all items. Overrides per-item `iconPosition`.',
    },
    bulletIconSize: {
      control: 'text',
      description:
        'Global icon size as a CSS value (e.g. `1.5rem`). Sets `font-size` on icon spans and `padding-top`/`min-width` on anchors.',
    },
    navId: {
      control: 'text',
      description: 'HTML `id` attribute for the nav container.',
    },
    otherClasses: {
      control: 'text',
      description: 'Additional CSS class string appended to the container.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default — horizontal layout ──────────────────────────────────────────────

export const Default: Story = {
  args: {
    navDirection: 'horizontal',
    bulletIconSize: '1.25rem',
    items: DEFAULT_ITEMS,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default horizontal layout with Bootstrap Icons. ' +
          'Each item shows an icon (`bi` class string) before the label. ' +
          '`bulletIconSize` sets a uniform `font-size` on every icon span.',
      },
    },
  },
};

// ─── Vertical ─────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  args: {
    navDirection: 'vertical',
    bulletIconSize: '1.25rem',
    items: DEFAULT_ITEMS,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vertical stacked layout. Set `navDirection` to `"vertical"` to stack items ' +
          'top-to-bottom. Adds `nav-direction-vertical` class to the container.',
      },
    },
  },
};

// ─── Icon Only ────────────────────────────────────────────────────────────────

export const IconOnly: Story = {
  name: 'Icon Only',
  args: {
    navDirection: 'horizontal',
    hideLabels: true,
    bulletIconSize: '1.5rem',
    items: DEFAULT_ITEMS,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Icon-only mode via `hideLabels: true`. ' +
          'Label text is visually hidden via `hide-labels` CSS class. ' +
          'Each anchor retains its `aria-label` and `title` attributes for screen readers.',
      },
    },
  },
};

// ─── Text Only ────────────────────────────────────────────────────────────────

export const TextOnly: Story = {
  name: 'Text Only',
  args: {
    navDirection: 'horizontal',
    hideIcons: true,
    items: DEFAULT_ITEMS,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Text-only mode via `hideIcons: true`. ' +
          'All icon spans are hidden; only label text is rendered. ' +
          'Adds `hide-icons` class to the container.',
      },
    },
  },
};

// ─── Custom Colors ────────────────────────────────────────────────────────────

export const CustomColors: Story = {
  name: 'Custom Colors',
  args: {
    navDirection: 'horizontal',
    hideLabels: true,
    customColors: true,
    bulletIconSize: '1.5rem',
    items: [
      {
        url: 'https://twitter.com',
        label: 'Twitter',
        icon: 'bi bi-twitter-x',
        target: '_blank',
        iconColor: 'dark',
      },
      {
        url: 'https://facebook.com',
        label: 'Facebook',
        icon: 'bi bi-facebook',
        target: '_blank',
        iconColor: 'primary',
      },
      {
        url: 'https://instagram.com',
        label: 'Instagram',
        icon: 'bi bi-instagram',
        target: '_blank',
        iconColor: 'danger',
      },
      {
        url: 'https://linkedin.com',
        label: 'LinkedIn',
        icon: 'bi bi-linkedin',
        target: '_blank',
        iconColor: 'info',
      },
      {
        url: 'https://youtube.com',
        label: 'YouTube',
        icon: 'bi bi-youtube',
        target: '_blank',
        iconColor: 'danger',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Per-icon color theming via `iconColor` and `customColors: true`. ' +
          'Bootstrap Icon color tokens map to `text-{color}` Bootstrap utility classes. ' +
          'The `custom-colors` class on the container disables the default uniform color override.',
      },
    },
  },
};

// ─── Font Awesome Icons ───────────────────────────────────────────────────────

export const FontAwesome: Story = {
  name: 'Font Awesome Icons',
  args: {
    navDirection: 'horizontal',
    hideLabels: true,
    bulletIconSize: '1.25rem',
    items: [
      {
        url: 'https://twitter.com',
        label: 'Twitter',
        icon: 'fab fa-twitter',
        target: '_blank',
      },
      {
        url: 'https://facebook.com',
        label: 'Facebook',
        icon: 'fab fa-facebook',
        target: '_blank',
      },
      {
        url: 'https://instagram.com',
        label: 'Instagram',
        icon: 'fab fa-instagram',
        target: '_blank',
      },
      {
        url: 'https://linkedin.com',
        label: 'LinkedIn',
        icon: 'fab fa-linkedin',
        target: '_blank',
      },
      {
        url: 'https://github.com',
        label: 'GitHub',
        icon: 'fab fa-github',
        target: '_blank',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Font Awesome icons are detected automatically from class strings containing `fab`, `fas`, `far`, `fal`, or `fad`. ' +
          'Detected FA icons render as `<i class="fab fa-…">` inside a `.icon` span with `font-size` driven by `bulletIconSize`.',
      },
    },
  },
};

// ─── Icon After ───────────────────────────────────────────────────────────────

export const IconAfter: Story = {
  name: 'Icon After',
  args: {
    navDirection: 'horizontal',
    bulletIconPosition: 'after',
    bulletIconSize: '1.25rem',
    items: DEFAULT_ITEMS.slice(0, 4),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Icon positioned after the label via `bulletIconPosition: "after"`. ' +
          'Adds `bullet-icons--after` class to the container. ' +
          'Per-item `iconPosition` can override this globally if needed.',
      },
    },
  },
};

// ─── Vertical with Custom Colors ──────────────────────────────────────────────

export const VerticalWithColors: Story = {
  name: 'Vertical — Custom Colors',
  args: {
    navDirection: 'vertical',
    customColors: true,
    bulletIconSize: '1.25rem',
    items: [
      {
        url: 'https://twitter.com',
        label: 'Twitter',
        icon: 'bi bi-twitter-x',
        target: '_blank',
        iconColor: 'dark',
      },
      {
        url: 'https://facebook.com',
        label: 'Facebook',
        icon: 'bi bi-facebook',
        target: '_blank',
        iconColor: 'primary',
      },
      {
        url: 'https://instagram.com',
        label: 'Instagram',
        icon: 'bi bi-instagram',
        target: '_blank',
        iconColor: 'danger',
      },
      {
        url: 'https://linkedin.com',
        label: 'LinkedIn',
        icon: 'bi bi-linkedin',
        target: '_blank',
        iconColor: 'info',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vertical layout with per-icon color tokens. Combines `navDirection: "vertical"`, ' +
          '`customColors: true`, and per-item `iconColor` for a labelled stacked layout ' +
          'suitable for footer social sections.',
      },
    },
  },
};

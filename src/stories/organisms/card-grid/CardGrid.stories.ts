import type { Meta, StoryObj } from '@storybook/nextjs';
import { CardGrid } from './CardGrid';
import type { CardProps } from './CardGrid';

// ---------------------------------------------------------------------------
// Shared card fixture helpers
// ---------------------------------------------------------------------------

/**
 * Generates a realistic card object for story fixtures.
 * `seed` keeps picsum images deterministic across hot-reloads.
 */
const makeCard = (
  n: number,
  overrides: Partial<CardProps> = {}
): CardProps => ({
  card_title: `Card Title ${n}`,
  card_subtitle: 'Category · 5 min read',
  card_text:
    'This is the card body copy. It provides a brief summary of the linked article or content item.',
  card_image_location: 'top',
  card_image: {
    src: `https://picsum.photos/seed/card${n}/800/500`,
    alt: `Placeholder image ${n}`,
    width: 800,
    height: 500,
  },
  card_label: 'Feature',
  card_footer: `<small class="text-muted">Published July ${n + 14}, 2026</small>`,
  card_link: '#',
  card_link_text: 'Read More',
  card_link_target: '_self',
  card_button: {
    label: 'Learn More',
    variant: 'primary',
    href: '#',
    as: 'a',
  },
  ...overrides,
});

const linkedCard = (n: number): CardProps => ({
  ...makeCard(n),
  card_linked: true,
  card_button: undefined,
  card_link_text: undefined,
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CardGrid> = {
  title: 'Design System/Organisms/CardGrid',
  component: CardGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'CardGrid organism — mirrors the `timberland/card-grid` Pattern Lab pattern. ' +
          'Renders an array of Card organisms inside a responsive grid wrapper. ' +
          'Supports four layout strategies (`grid`, `row`, `group`, `deck`), ' +
          '2–6 columns, optional single-row lock, mobile-column preservation, ' +
          'vertical-offset stagger, and placecard fill spans.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['grid', 'row', 'group', 'deck'],
      description:
        'Layout strategy. `grid` uses a custom flex-grid; `row` uses Bootstrap `.row` + `row-cols-{n}`.',
    },
    columns: {
      control: { type: 'select' },
      options: [2, 3, 4, 5, 6],
      description: 'Number of columns (2–6).',
    },
    card_grid_title: {
      control: 'text',
      description: 'Optional `<h2>` heading rendered above the grid.',
    },
    placecard: {
      control: 'boolean',
      description:
        'Append invisible placecard spans to fill the last flex-grid row. Only meaningful for `type=grid`.',
    },
    singlerow: {
      control: 'boolean',
      description: 'Lock the grid to a single horizontal row.',
    },
    mobilecolumns: {
      control: 'boolean',
      description: 'Preserve columns on mobile (no stacking).',
    },
    vertical_offset: {
      control: 'select',
      options: ['', 'left', 'right'],
      description:
        'Stagger card vertical positions. `left` descends left→right; `right` ascends.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names on the outer wrapper.',
    },
    gridClassName: {
      control: 'text',
      description: 'Additional CSS class names on the inner grid element.',
    },
  },
  args: {
    type: 'grid',
    columns: 3,
    placecard: false,
    singlerow: false,
    mobilecolumns: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default 3-column grid with image-top cards and CTA buttons.
 */
export const Default: Story = {
  args: {
    card_grid_title: 'Latest Articles',
    columns: 3,
    cards: [makeCard(1), makeCard(2), makeCard(3)],
  },
};

/**
 * 2-column grid — wide cards, useful for featured content pairs.
 */
export const TwoColumns: Story = {
  name: 'Two Columns',
  args: {
    card_grid_title: 'Featured Stories',
    columns: 2,
    cards: [makeCard(4), makeCard(5)],
  },
  parameters: {
    docs: {
      description: {
        story:
          'A two-column `grid` layout. Cards fill the available width equally.',
      },
    },
  },
};

/**
 * 4-column grid — compact cards suited to a blog listing or product grid.
 */
export const FourColumns: Story = {
  name: 'Four Columns',
  args: {
    card_grid_title: 'Browse Topics',
    columns: 4,
    cards: [makeCard(1), makeCard(2), makeCard(3), makeCard(4), makeCard(5)],
    placecard: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Five cards across a 4-column grid. `placecard=true` appends 2 invisible fill spans ' +
          'so the last-row card does not stretch to full width.',
      },
    },
  },
};

/**
 * Bootstrap row layout — uses `row` + `row-cols-{n}` Bootstrap classes.
 */
export const RowLayout: Story = {
  name: 'Row Layout',
  args: {
    type: 'row',
    columns: 3,
    card_grid_title: 'Services',
    cards: [makeCard(6), makeCard(7), makeCard(8)],
  },
  parameters: {
    docs: {
      description: {
        story:
          '`type="row"` maps to Bootstrap `.row.row-cols-3`, giving equal-height cards ' +
          'without custom flex-grid mixins.',
      },
    },
  },
};

/**
 * Bootstrap card-group — cards share equal height and flush borders.
 */
export const GroupLayout: Story = {
  name: 'Group Layout',
  args: {
    type: 'group',
    card_grid_title: 'Our Packages',
    cards: [
      makeCard(9, { card_background: undefined }),
      makeCard(10, { card_background: undefined }),
      makeCard(11, { card_background: undefined }),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '`type="group"` renders Bootstrap `.card-group`. Cards sit flush side-by-side ' +
          'with shared equal height and no gutter between them.',
      },
    },
  },
};

/**
 * Fully linked cards — the entire card surface is a clickable link.
 */
export const LinkedCards: Story = {
  name: 'Linked Cards',
  args: {
    card_grid_title: 'Click Any Card',
    columns: 3,
    cards: [linkedCard(12), linkedCard(13), linkedCard(14)],
  },
  parameters: {
    docs: {
      description: {
        story:
          '`card_linked=true` wraps the entire card in an `<a>` tag (`.card--linked`). ' +
          'No inline link or button is rendered inside the body.',
      },
    },
  },
};

/**
 * Cards with category icons and colored backgrounds.
 */
export const IconAndColor: Story = {
  name: 'Icon + Color Variants',
  args: {
    card_grid_title: 'Our Services',
    columns: 3,
    cards: [
      makeCard(15, {
        card_icon: { className: 'bi bi-rocket-takeoff-fill', ariaLabel: 'Rocket icon' },
        card_background: 'primary',
        inherit_color: true,
        card_image: undefined,
        card_image_location: undefined,
      }),
      makeCard(16, {
        card_icon: { className: 'bi bi-shield-check', ariaLabel: 'Shield icon' },
        card_background: 'success',
        inherit_color: true,
        card_image: undefined,
        card_image_location: undefined,
      }),
      makeCard(17, {
        card_icon: { className: 'bi bi-graph-up-arrow', ariaLabel: 'Graph icon' },
        card_background: 'info',
        inherit_color: true,
        card_image: undefined,
        card_image_location: undefined,
      }),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '`card_background` sets a Bootstrap contextual color. `inherit_color=true` ' +
          'resets child text colors so they contrast against the background. ' +
          '`card_icon.className` renders an icon font glyph (Bootstrap Icons shown here).',
      },
    },
  },
};

/**
 * Vertical-offset stagger — cards descend in height from left to right.
 */
export const VerticalOffsetLeft: Story = {
  name: 'Vertical Offset — Left',
  args: {
    columns: 3,
    singlerow: true,
    vertical_offset: 'left',
    cards: [makeCard(18), makeCard(19), makeCard(20)],
  },
  parameters: {
    docs: {
      description: {
        story:
          '`vertical_offset="left"` combined with `singlerow=true` staggers cards so each ' +
          'subsequent card sits lower than the previous one, creating a stepped cascade effect.',
      },
    },
  },
};

/**
 * No-image, text-only cards — no `card_image` provided.
 */
export const TextOnly: Story = {
  name: 'Text Only',
  args: {
    card_grid_title: 'Quick Facts',
    columns: 3,
    cards: [
      {
        card_title: 'Flexible Architecture',
        card_text:
          'Built on a modular pattern system that scales from small blogs to enterprise sites.',
        card_button: { label: 'Learn More', variant: 'primary', outline: true, href: '#', as: 'a' },
      },
      {
        card_title: 'Design Token Driven',
        card_text:
          'Every color, spacing value, and typographic scale is controlled by design tokens.',
        card_button: { label: 'See Tokens', variant: 'primary', outline: true, href: '#', as: 'a' },
      },
      {
        card_title: 'Headless Ready',
        card_text:
          'Decoupled frontend consumes WordPress content via WPGraphQL for blazing-fast delivery.',
        card_button: { label: 'View Docs', variant: 'primary', outline: true, href: '#', as: 'a' },
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Cards without images. The `card-header` slot is omitted entirely when no image or icon is provided.',
      },
    },
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { Offcanvas } from './Offcanvas';

const meta: Meta<typeof Offcanvas> = {
  title: 'Design System/Molecules/Offcanvas',
  component: Offcanvas,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Offcanvas molecule — Bootstrap 5 off-canvas panel with a trigger button. ' +
          'Mirrors `02-molecules/offcanvas/_offcanvas.tpl.twig`. Bootstrap JS is loaded ' +
          'globally in the theme; this component renders the required static HTML and ' +
          '`data-bs-*` attributes.',
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
      description: 'Which edge the panel enters from.',
    },
    breakpoint: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Panel is always-visible at or above this breakpoint.',
    },
    closeButton: {
      control: 'select',
      options: ['close', 'white'],
      description: "Render a close button in the panel header ('close' or 'white').",
    },
    backdrop: {
      control: 'boolean',
      description: 'Show/hide the background backdrop.',
    },
    scroll: {
      control: 'boolean',
      description: 'Allow page scroll while the panel is open.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    button: {
      variant: 'primary',
      label: 'Open Menu',
    },
    title: 'Site Navigation',
    content: 'Add navigation links or other content here. The panel slides in from the left edge by default.',
    closeButton: 'close',
    placement: 'left',
    backdrop: true,
    scroll: false,
  },
};

// ---------------------------------------------------------------------------
// Variant: slides in from the right
// ---------------------------------------------------------------------------

export const FromRight: Story = {
  args: {
    button: {
      variant: 'secondary',
      label: 'Open Sidebar',
    },
    title: 'Details Sidebar',
    content: 'This panel slides in from the right side of the viewport. Useful for secondary navigation or contextual details.',
    closeButton: 'close',
    placement: 'right',
    backdrop: true,
    scroll: false,
  },
};

// ---------------------------------------------------------------------------
// Variant: dark background with white close button
// ---------------------------------------------------------------------------

export const DarkPanel: Story = {
  args: {
    button: {
      variant: 'dark',
      label: 'Open Dark Panel',
    },
    title: 'Dark Theme Panel',
    content: 'This offcanvas panel uses a dark background and white text for high-contrast presentation.',
    closeButton: 'white',
    placement: 'left',
    backgroundColor: 'dark',
    textColor: 'white',
    backdrop: true,
    scroll: false,
  },
};

// ---------------------------------------------------------------------------
// Variant: no backdrop, body scroll allowed
// ---------------------------------------------------------------------------

export const ScrollableNoBackdrop: Story = {
  args: {
    button: {
      variant: 'primary',
      outline: true,
      label: 'Open Without Backdrop',
    },
    title: 'Scrollable Panel',
    content: 'Body scrolling is enabled and there is no backdrop. The page content stays interactive while this panel is open.',
    closeButton: 'close',
    placement: 'left',
    backdrop: false,
    scroll: true,
  },
};

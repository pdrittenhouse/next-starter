import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Grid } from './Grid';

const PLACEHOLDER_CHILD = React.createElement(
  'p',
  { style: { margin: 0, padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' } },
  'Column 1 content'
);

const meta: Meta<typeof Grid> = {
  title: 'Design System/Atoms/Grid',
  component: Grid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Grid atom — mirrors the theme\'s Pattern Lab grid pattern. Renders a Bootstrap ' +
          'row/col wrapper with optional container classes. Acts as the outer shell for ' +
          'page-level or section-level layouts.',
      },
    },
  },
  argTypes: {
    container: {
      control: 'boolean',
      description: 'Adds Bootstrap `.container` class.',
    },
    containerFluid: {
      control: 'boolean',
      description: 'Adds Bootstrap `.container-fluid` class. Takes precedence over `container`.',
    },
    containerBreakpoint: {
      control: 'select',
      options: [undefined, 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Breakpoint suffix for `.container-{breakpoint}`. Requires `container: true`.',
    },
    maxWidthFluidContainer: {
      control: 'boolean',
      description: 'Adds `.max-width-fluid-container` when `containerFluid` is true.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names appended to the root element.',
    },
  },
  args: {
    container: false,
    containerFluid: false,
    maxWidthFluidContainer: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (args) => React.createElement(Grid, args, PLACEHOLDER_CHILD),
};

export const WithContainer: Story = {
  args: {
    container: true,
  },
  render: (args) => React.createElement(Grid, args, PLACEHOLDER_CHILD),
  parameters: {
    docs: {
      description: {
        story: 'Adds Bootstrap `.container` — fixed-max-width centered layout.',
      },
    },
  },
};

export const WithContainerFluid: Story = {
  args: {
    containerFluid: true,
  },
  render: (args) => React.createElement(Grid, args, PLACEHOLDER_CHILD),
  parameters: {
    docs: {
      description: {
        story: 'Adds Bootstrap `.container-fluid` — full-width layout with gutters.',
      },
    },
  },
};

export const WithContainerBreakpoint: Story = {
  name: 'Container Breakpoint (md)',
  args: {
    container: true,
    containerBreakpoint: 'md',
  },
  render: (args) => React.createElement(Grid, args, PLACEHOLDER_CHILD),
  parameters: {
    docs: {
      description: {
        story:
          'Adds `.container-md` — fluid below the breakpoint, fixed-max-width at and above it.',
      },
    },
  },
};

export const FluidWithMaxWidth: Story = {
  name: 'Container Fluid + Max Width',
  args: {
    containerFluid: true,
    maxWidthFluidContainer: true,
  },
  render: (args) => React.createElement(Grid, args, PLACEHOLDER_CHILD),
  parameters: {
    docs: {
      description: {
        story:
          'Combines `.container-fluid` and `.max-width-fluid-container` for a full-bleed ' +
          'layout that still enforces a maximum content width.',
      },
    },
  },
};

export const WithExtraClass: Story = {
  args: {
    container: true,
    className: 'my-custom-section',
  },
  render: (args) => React.createElement(Grid, args, PLACEHOLDER_CHILD),
  parameters: {
    docs: {
      description: {
        story: 'Any extra classes passed via `className` are appended to the root `<div>`.',
      },
    },
  },
};

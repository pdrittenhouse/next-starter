import type { Meta, StoryObj } from '@storybook/nextjs';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Design System/Atoms/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Spinner atom — mirrors the theme\'s Pattern Lab `timberland/spinner` pattern. ' +
          'Renders a Bootstrap 5 loading indicator in either border (ring) or grow (pulse) style ' +
          'with optional color, size, and accessible label.',
      },
    },
  },
  argTypes: {
    spinnerStyle: {
      control: 'select',
      options: ['border', 'grow'],
    },
    spinnerColor: {
      control: 'text',
    },
    spinnerSmall: {
      control: 'boolean',
    },
    width: {
      control: 'text',
    },
    height: {
      control: 'text',
    },
    spinnerLabel: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
  },
  args: {
    spinnerStyle: 'border',
    spinnerLabel: 'Loading...',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GrowStyle: Story = {
  name: 'Grow Style',
  args: {
    spinnerStyle: 'grow',
  },
  parameters: {
    docs: {
      description: {
        story: 'The grow variant pulses in and out rather than spinning.',
      },
    },
  },
};

export const ColoredBorder: Story = {
  name: 'Colored — Border',
  args: {
    spinnerStyle: 'border',
    spinnerColor: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Pass any Bootstrap contextual color token (primary, secondary, success, danger, warning, info, light, dark) via `spinnerColor`.',
      },
    },
  },
};

export const ColoredGrow: Story = {
  name: 'Colored — Grow',
  args: {
    spinnerStyle: 'grow',
    spinnerColor: 'danger',
  },
};

export const SmallBorder: Story = {
  name: 'Small — Border',
  args: {
    spinnerSmall: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Applies `spinner-border-sm` for an inline-sized indicator.',
      },
    },
  },
};

export const SmallGrow: Story = {
  name: 'Small — Grow',
  args: {
    spinnerStyle: 'grow',
    spinnerSmall: true,
  },
};

export const CustomSize: Story = {
  name: 'Custom Size',
  args: {
    width: '4rem',
    height: '4rem',
    spinnerColor: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use `width` and `height` to override size with any valid CSS value.',
      },
    },
  },
};

export const NoLabel: Story = {
  name: 'No Accessible Label',
  args: {
    spinnerLabel: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Omitting `spinnerLabel` renders no hidden text. Only use this if the loading context is clear from surrounding content.',
      },
    },
  },
};

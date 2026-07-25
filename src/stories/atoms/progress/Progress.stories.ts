import type { Meta, StoryObj } from '@storybook/nextjs';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Design System/Atoms/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Progress atom — mirrors the theme\'s Pattern Lab `timberland/progress` pattern. ' +
          'Supports two modes: Bootstrap 5 styled progress bars (default) and native HTML5 ' +
          '`<progress>` elements. Bootstrap mode supports stacked bars, contextual colors, ' +
          'striped gradients, and animations. HTML5 mode outputs semantic `<label>` + `<progress>` pairs.',
      },
    },
  },
  argTypes: {
    bootstrapProgress: {
      control: 'boolean',
      description: 'When true (default) renders Bootstrap 5 bars; when false renders native HTML5 <progress> elements.',
    },
    height: {
      control: 'text',
      description: 'Inline height applied to the Bootstrap .progress wrapper or each HTML5 .progress--container.',
    },
    className: {
      control: 'text',
      description: 'Additional class names on the outermost wrapper element.',
    },
    progressBars: {
      control: 'object',
      description: 'Array of bar configuration objects.',
    },
  },
  args: {
    bootstrapProgress: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    progressBars: [
      { progressBarValue: 60 },
    ],
  },
};

export const WithLabel: Story = {
  args: {
    progressBars: [
      { progressBarValue: 75, progressBarLabel: '75%' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Label text rendered inside the Bootstrap bar at `aria-valuenow` position.',
      },
    },
  },
};

export const ContextualColors: Story = {
  args: {
    progressBars: [
      { progressBarValue: 25, color: 'success' },
      { progressBarValue: 50, color: 'info' },
      { progressBarValue: 75, color: 'warning' },
      { progressBarValue: 90, color: 'danger' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Stacked bars using Bootstrap contextual color tokens (`bg-success`, `bg-info`, `bg-warning`, `bg-danger`). Each bar shares the same wrapper `<div class="progress">`.',
      },
    },
  },
};

export const Striped: Story = {
  args: {
    progressBars: [
      { progressBarValue: 55, color: 'primary', striped: true },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Adds `progress-bar-striped` to the bar element.',
      },
    },
  },
};

export const StripedAnimated: Story = {
  args: {
    progressBars: [
      { progressBarValue: 55, color: 'primary', striped: true, animate: true },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Adds both `progress-bar-striped` and `progress-bar-animated`. `animate` has no effect unless `striped` is also true.',
      },
    },
  },
};

export const CustomHeight: Story = {
  args: {
    height: '20px',
    progressBars: [
      { progressBarValue: 40, color: 'success' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Inline height applied to the `.progress` wrapper via the `height` prop.',
      },
    },
  },
};

export const Stacked: Story = {
  args: {
    progressBars: [
      { progressBarValue: 15, color: 'success', progressBarLabel: '15%' },
      { progressBarValue: 30, color: 'warning', progressBarLabel: '30%' },
      { progressBarValue: 20, color: 'danger',  progressBarLabel: '20%' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple bars share the same `.progress` container for a stacked layout. Each bar renders as a separate `.progress-bar` div.',
      },
    },
  },
};

export const Html5Default: Story = {
  name: 'HTML5 — Default',
  args: {
    bootstrapProgress: false,
    progressBars: [
      {
        progressBarId: 'bar-upload',
        progressBarValue: 45,
        progressBarMax: 100,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Native `<progress>` element with BEM class `progress--bar`. Provide `progressBarId` so the element has a stable accessible ID.',
      },
    },
  },
};

export const Html5WithLabel: Story = {
  name: 'HTML5 — With Label',
  args: {
    bootstrapProgress: false,
    progressBars: [
      {
        progressBarId: 'bar-download',
        progressBarLabel: 'Download progress',
        progressBarValue: 70,
        progressBarMax: 100,
        showLabel: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'When `showLabel` is true a `<label>` is rendered above the `<progress>` element, linked by `for`/`id`. `aria-labelledby` is always added regardless of `showLabel`.',
      },
    },
  },
};

export const Html5Multiple: Story = {
  name: 'HTML5 — Multiple Bars',
  args: {
    bootstrapProgress: false,
    progressBars: [
      {
        progressBarId: 'bar-cpu',
        progressBarLabel: 'CPU usage',
        progressBarValue: 82,
        progressBarMax: 100,
        showLabel: true,
      },
      {
        progressBarId: 'bar-memory',
        progressBarLabel: 'Memory usage',
        progressBarValue: 55,
        progressBarMax: 100,
        showLabel: true,
      },
      {
        progressBarId: 'bar-disk',
        progressBarLabel: 'Disk usage',
        progressBarValue: 38,
        progressBarMax: 100,
        showLabel: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'In HTML5 mode each bar renders its own `.progress--container` wrapper. Multiple bars produce multiple independent container+label+progress groups.',
      },
    },
  },
};

export const Html5FallbackText: Story = {
  name: 'HTML5 — Fallback Text',
  args: {
    bootstrapProgress: false,
    progressBars: [
      {
        progressBarId: 'bar-legacy',
        progressBarValue: 60,
        progressBarMax: 100,
        progressBarText: '60 of 100 steps completed',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: '`progressBarText` renders inside the `<progress>` element for browsers that do not support the native element.',
      },
    },
  },
};

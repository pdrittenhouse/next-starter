import type { Meta, StoryObj } from '@storybook/nextjs';
import { AlertBlock } from './AlertBlock';

const meta = {
  title: 'Design System/Blocks/Alert',
  component: AlertBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Alert block. Reads ACF fields to render a Bootstrap alert with optional title, message, footer, link, dismissal, and text alignment. Supports info, success, warning, and danger statuses.',
      },
    },
  },
} satisfies Meta<typeof AlertBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/alert',
      clientId: 'alert-1',
      renderedHtml:
        '<div class="alert alert-info block-alert" role="alert"><h4 class="alert-heading">Heads up!</h4><p class="alert-message">This is an informational alert — review before continuing.</p><hr /><p class="mb-0 alert-footer">Visit the <a href="/docs" class="alert-link">documentation</a> for more details.</p></div>',
    },
  },
};

export const Success: Story = {
  args: {
    block: {
      name: 'acf/alert',
      clientId: 'alert-2',
      renderedHtml:
        '<div class="alert alert-success block-alert" role="alert"><h4 class="alert-heading">Well done!</h4><p class="alert-message">Your changes have been saved successfully.</p></div>',
    },
  },
};

export const Warning: Story = {
  args: {
    block: {
      name: 'acf/alert',
      clientId: 'alert-3',
      renderedHtml:
        '<div class="alert alert-warning block-alert" role="alert"><h4 class="alert-heading">Warning!</h4><p class="alert-message">Please review your input before submitting — some fields may be incomplete.</p></div>',
    },
  },
};

export const Danger: Story = {
  args: {
    block: {
      name: 'acf/alert',
      clientId: 'alert-4',
      renderedHtml:
        '<div class="alert alert-danger alert-dismissible fade show block-alert" role="alert"><h4 class="alert-heading">Error</h4><p class="alert-message">An unexpected error occurred. Please try again or contact support.</p><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>',
    },
  },
};

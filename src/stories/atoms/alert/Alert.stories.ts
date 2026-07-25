import type { Meta, StoryObj } from '@storybook/nextjs';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Design System/Atoms/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Alert atom — mirrors the theme\'s Pattern Lab `timberland/alert` pattern. ' +
          'Wraps Bootstrap 5 alert classes with typed props for status, ARIA semantics, ' +
          'dismiss behavior, and text alignment.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger', 'primary', 'secondary', 'light', 'dark'],
    },
    alertType: {
      control: 'select',
      options: ['status', 'warning', 'error'],
    },
    closePosition: {
      control: 'select',
      options: ['top', 'bottom'],
    },
    alertTextAlign: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
    alertTitle: { control: 'text' },
    alertPrimary: { control: 'text' },
    alertSecondary: { control: 'text' },
    alertLink: { control: 'text' },
    dismissable: { control: 'boolean' },
    className: { control: 'text' },
  },
  args: {
    status: 'info',
    alertType: 'status',
    dismissable: false,
    closePosition: 'top',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Status variants ---

export const Default: Story = {
  args: {
    alertTitle: 'Your changes have been saved.',
  },
};

export const TitleOnly: Story = {
  name: 'Title Only',
  args: {
    alertTitle: 'A simple informational alert — no body text needed.',
  },
  parameters: {
    docs: {
      description: {
        story: 'When only `alertTitle` is set the wrapper receives `d-flex` and the title renders as a `<p>` instead of `<h2>`.',
      },
    },
  },
};

export const PrimaryOnly: Story = {
  name: 'Primary Text Only',
  args: {
    alertPrimary: 'Your session will expire in 5 minutes. Save your work to avoid losing progress.',
  },
  parameters: {
    docs: {
      description: {
        story: 'When only `alertPrimary` is set the paragraph receives `d-inline-block w-100` and the wrapper receives `d-flex`.',
      },
    },
  },
};

export const TitleAndPrimary: Story = {
  name: 'Title + Primary',
  args: {
    alertTitle: 'Heads up!',
    alertPrimary: 'This action will permanently delete the selected records. You cannot undo this.',
  },
};

export const FullAlert: Story = {
  name: 'Title + Primary + Secondary',
  args: {
    alertTitle: 'Before you continue',
    alertPrimary: 'Completing this step will submit your application for review.',
    alertSecondary: 'Allow 3–5 business days for a response.',
  },
  parameters: {
    docs: {
      description: {
        story: '`alertSecondary` is preceded by a horizontal rule and renders as a closing `<p class="mb-0">`.',
      },
    },
  },
};

// --- Link variants ---

export const WithLinkOnTitle: Story = {
  name: 'With Link (title)',
  args: {
    alertTitle: 'Update available — click to learn more.',
    alertPrimary: 'Version 4.2.0 includes security patches and performance improvements.',
    alertLink: '#release-notes',
  },
  parameters: {
    docs: {
      description: {
        story: 'When both `alertTitle` and `alertLink` are set the link wraps the title heading.',
      },
    },
  },
};

export const WithLinkOnPrimary: Story = {
  name: 'With Link (primary, no title)',
  args: {
    alertPrimary: 'Read the full terms and conditions before proceeding.',
    alertLink: '#terms',
  },
  parameters: {
    docs: {
      description: {
        story: 'When `alertLink` is set without `alertTitle` the link wraps the primary paragraph instead.',
      },
    },
  },
};

// --- Dismissable variants ---

export const DismissableTop: Story = {
  name: 'Dismissable (close top)',
  args: {
    alertTitle: 'File uploaded successfully.',
    alertPrimary: 'Your file has been processed and is ready to view.',
    dismissable: true,
    closePosition: 'top',
  },
};

export const DismissableBottom: Story = {
  name: 'Dismissable (close bottom)',
  args: {
    alertTitle: 'Maintenance scheduled',
    alertPrimary: 'The system will be unavailable on Sunday, August 3 from 2:00–4:00 AM UTC.',
    alertSecondary: 'Contact support if you need access during this window.',
    dismissable: true,
    closePosition: 'bottom',
  },
};

// --- Status color variants ---

export const Success: Story = {
  args: {
    status: 'success',
    alertTitle: 'Payment confirmed.',
    alertPrimary: 'Your order has been placed and a receipt has been sent to your email.',
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
    alertType: 'warning',
    alertTitle: 'Storage almost full.',
    alertPrimary: 'You have used 92% of your allotted storage. Upgrade your plan to continue uploading.',
  },
};

export const Danger: Story = {
  args: {
    status: 'danger',
    alertType: 'error',
    alertTitle: 'Unable to process your request.',
    alertPrimary: 'The server returned a 500 error. Please try again or contact support if the problem persists.',
  },
  parameters: {
    docs: {
      description: {
        story: '`alertType="error"` sets `role="alert"` on the wrapper for immediate screen-reader announcement.',
      },
    },
  },
};

export const Info: Story = {
  args: {
    status: 'info',
    alertTitle: 'Two-factor authentication is now required.',
    alertPrimary: 'Set up an authenticator app or SMS verification to keep your account secure.',
    alertLink: '#security-settings',
  },
};

// --- ARIA type variant ---

export const LivePolite: Story = {
  name: 'ARIA: polite (default)',
  args: {
    alertType: 'status',
    alertTitle: 'Draft auto-saved.',
  },
  parameters: {
    docs: {
      description: {
        story: 'All `alertType` values except `"error"` render `aria-live="polite"` — non-interrupting announcement.',
      },
    },
  },
};

export const LiveAlert: Story = {
  name: 'ARIA: role=alert (error)',
  args: {
    status: 'danger',
    alertType: 'error',
    alertTitle: 'Login failed.',
    alertPrimary: 'The email or password you entered is incorrect.',
  },
  parameters: {
    docs: {
      description: {
        story: '`alertType="error"` renders `role="alert"` — immediately announced by screen readers.',
      },
    },
  },
};

// --- Text alignment ---

export const TextCenter: Story = {
  name: 'Text: centered',
  args: {
    alertTextAlign: 'center',
    alertTitle: 'Welcome back!',
    alertPrimary: 'You last signed in on Thursday, July 10 at 9:41 AM.',
  },
};

// --- Dismissable single-element ---

export const DismissableTitleOnly: Story = {
  name: 'Dismissable: title only',
  args: {
    alertTitle: 'Profile updated.',
    dismissable: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Single-element alert with dismiss — the close button receives `d-inline-block` to stay in-flow alongside the flex title.',
      },
    },
  },
};

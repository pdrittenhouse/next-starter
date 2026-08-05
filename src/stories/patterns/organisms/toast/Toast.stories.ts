import type { Meta, StoryObj } from '@storybook/nextjs';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Design System/Organisms/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Positioned notification toasts with optional trigger buttons. Mirrors the Pattern Lab Twig template at `03-organisms/toast/_toast.tpl.twig`.',
      },
    },
  },
  argTypes: {
    verticalPosition: {
      control: 'select',
      options: ['top', 'bottom', 'middle'],
      description: 'Vertical placement of the toast container.',
    },
    horizontalPosition: {
      control: 'select',
      options: ['left', 'right', 'center'],
      description: 'Horizontal placement of the toast container.',
    },
    buttonGroupDisplay: {
      control: 'select',
      options: ['inline', 'inline-block', 'grid', 'block', 'flex', 'inline-flex'],
      description: 'Bootstrap display utility for the controls ButtonGroup wrapper.',
    },
    buttonGroupSize: {
      control: 'select',
      options: [undefined, 'sm', 'lg'],
      description: 'Size variant for the controls ButtonGroup.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default — single toast, bottom-right
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Default',
  args: {
    verticalPosition: 'bottom',
    horizontalPosition: 'right',
    toasts: [
      {
        title: 'Notification',
        meta: 'Just now',
        toastCloseButton: 'close',
        toastContent: 'Your changes have been saved successfully.',
        autohide: false,
        toastDisplay: 'show',
        button: {
          variant: 'primary',
          label: 'Show Toast',
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Top Center — positioned at top center
// ---------------------------------------------------------------------------

export const TopCenter: Story = {
  name: 'Top Center',
  args: {
    verticalPosition: 'top',
    horizontalPosition: 'center',
    toasts: [
      {
        title: 'Update Available',
        meta: '1 min ago',
        toastCloseButton: 'close',
        toastContent: 'A new version is ready. Refresh the page to apply the update.',
        autohide: false,
        toastDisplay: 'show',
        button: {
          variant: 'secondary',
          label: 'Show Update Toast',
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Success — green background, white text
// ---------------------------------------------------------------------------

export const Success: Story = {
  name: 'Success',
  args: {
    verticalPosition: 'bottom',
    horizontalPosition: 'right',
    toasts: [
      {
        title: 'Success',
        meta: 'Now',
        icon: { name: 'check-circle-fill' },
        toastCloseButton: 'white',
        toastContent: 'Your profile has been updated.',
        autohide: false,
        toastDisplay: 'show',
        backgroundColor: 'success',
        textColor: 'white',
        headerBackgroundColor: 'success',
        headerTextColor: 'white',
        button: {
          variant: 'success',
          label: 'Show Success Toast',
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Error — danger background, white text
// ---------------------------------------------------------------------------

export const Error: Story = {
  name: 'Error',
  args: {
    verticalPosition: 'bottom',
    horizontalPosition: 'right',
    toasts: [
      {
        title: 'Error',
        meta: 'Just now',
        icon: { name: 'exclamation-triangle-fill' },
        toastCloseButton: 'white',
        toastContent: 'Something went wrong. Please try again.',
        autohide: false,
        toastDisplay: 'show',
        backgroundColor: 'danger',
        textColor: 'white',
        headerBackgroundColor: 'danger',
        headerTextColor: 'white',
        button: {
          variant: 'danger',
          label: 'Show Error Toast',
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Warning — warning background
// ---------------------------------------------------------------------------

export const Warning: Story = {
  name: 'Warning',
  args: {
    verticalPosition: 'bottom',
    horizontalPosition: 'right',
    toasts: [
      {
        title: 'Warning',
        meta: 'Just now',
        icon: { name: 'exclamation-circle' },
        toastCloseButton: 'close',
        toastContent: 'Your session will expire in 5 minutes.',
        autohide: false,
        toastDisplay: 'show',
        backgroundColor: 'warning',
        button: {
          variant: 'warning',
          label: 'Show Warning Toast',
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Info — info background, white text
// ---------------------------------------------------------------------------

export const Info: Story = {
  name: 'Info',
  args: {
    verticalPosition: 'top',
    horizontalPosition: 'right',
    toasts: [
      {
        title: 'Did you know?',
        meta: '2 mins ago',
        icon: { name: 'info-circle' },
        toastCloseButton: 'white',
        toastContent: 'You can customise your dashboard from the settings panel.',
        autohide: false,
        toastDisplay: 'show',
        backgroundColor: 'info',
        textColor: 'white',
        headerBackgroundColor: 'info',
        headerTextColor: 'white',
        button: {
          variant: 'info',
          label: 'Show Info Toast',
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// With Image — thumbnail in the header
// ---------------------------------------------------------------------------

export const WithImage: Story = {
  name: 'With Image',
  args: {
    verticalPosition: 'bottom',
    horizontalPosition: 'right',
    toasts: [
      {
        title: 'New Message',
        meta: '5 mins ago',
        image: {
          src: 'https://picsum.photos/seed/toast/32/32',
          alt: 'User avatar',
          width: 32,
          height: 32,
          className: 'rounded',
        },
        toastCloseButton: 'close',
        toastContent: 'Alex sent you a new message: "Are you available for a call?"',
        autohide: false,
        toastDisplay: 'show',
        button: {
          variant: 'primary',
          outline: true,
          label: 'Show Message Toast',
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Autohide — demonstrates autohide delay setting
// ---------------------------------------------------------------------------

export const AutohideWithDelay: Story = {
  name: 'Autohide (3 s delay)',
  args: {
    verticalPosition: 'bottom',
    horizontalPosition: 'right',
    toasts: [
      {
        title: 'Auto-dismissing',
        meta: 'Now',
        toastCloseButton: 'close',
        toastContent: 'This toast will hide automatically after 3 seconds.',
        autohide: true,
        delay: 3000,
        toastDisplay: 'show',
        button: {
          variant: 'secondary',
          label: 'Trigger Auto-hide Toast',
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Multiple Toasts — stacked notifications
// ---------------------------------------------------------------------------

export const MultipleToasts: Story = {
  name: 'Multiple Toasts',
  args: {
    verticalPosition: 'bottom',
    horizontalPosition: 'right',
    buttonGroupDisplay: 'flex',
    buttonGroupGap: 2,
    toasts: [
      {
        title: 'Order Confirmed',
        meta: 'Just now',
        icon: { name: 'bag-check' },
        toastCloseButton: 'close',
        toastContent: 'Your order #8821 has been placed.',
        autohide: false,
        toastDisplay: 'show',
        backgroundColor: 'success',
        textColor: 'white',
        headerBackgroundColor: 'success',
        headerTextColor: 'white',
        button: {
          variant: 'success',
          size: 'sm',
          label: 'Order',
        },
      },
      {
        title: 'Shipping Update',
        meta: '2 mins ago',
        icon: { name: 'truck' },
        toastCloseButton: 'close',
        toastContent: 'Your package is out for delivery today.',
        autohide: false,
        toastDisplay: 'show',
        button: {
          variant: 'primary',
          size: 'sm',
          label: 'Shipping',
        },
      },
      {
        title: 'Promo Code Ready',
        meta: '10 mins ago',
        icon: { name: 'tag' },
        toastCloseButton: 'close',
        toastContent: 'Use code SAVE20 at checkout for 20% off.',
        autohide: false,
        toastDisplay: 'show',
        backgroundColor: 'warning',
        button: {
          variant: 'warning',
          size: 'sm',
          label: 'Promo',
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// No Controls — toasts shown without trigger buttons
// ---------------------------------------------------------------------------

export const NoControls: Story = {
  name: 'No Controls',
  args: {
    verticalPosition: 'top',
    horizontalPosition: 'left',
    toasts: [
      {
        title: 'System Alert',
        meta: 'Now',
        toastCloseButton: 'close',
        toastContent: 'Scheduled maintenance begins in 15 minutes.',
        autohide: false,
        toastDisplay: 'show',
        // No `button` prop — controls section will not render
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Bottom Left
// ---------------------------------------------------------------------------

export const BottomLeft: Story = {
  name: 'Bottom Left',
  args: {
    verticalPosition: 'bottom',
    horizontalPosition: 'left',
    toasts: [
      {
        title: 'Cookie Preferences',
        toastCloseButton: 'close',
        toastContent: 'We use cookies to improve your experience. Accept or customise your settings.',
        autohide: false,
        toastDisplay: 'show',
        button: {
          variant: 'secondary',
          label: 'Cookie Notice',
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Middle Center
// ---------------------------------------------------------------------------

export const MiddleCenter: Story = {
  name: 'Middle Center',
  args: {
    verticalPosition: 'middle',
    horizontalPosition: 'center',
    toasts: [
      {
        title: 'Confirmation Required',
        toastCloseButton: 'close',
        toastContent: 'Are you sure you want to delete this item? This action cannot be undone.',
        autohide: false,
        toastDisplay: 'show',
        button: {
          variant: 'danger',
          label: 'Delete Confirmation',
        },
      },
    ],
  },
};

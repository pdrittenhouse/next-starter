import type { Meta, StoryObj } from '@storybook/nextjs';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Design System/Molecules/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Modal molecule — mirrors the theme\'s Pattern Lab `timberland/modal` pattern. ' +
          'Wraps Bootstrap 5 modal markup with typed props for size, backdrop, animation, ' +
          'header/footer close buttons, and an optional trigger button. ' +
          'Bootstrap JS (loaded globally) handles open/close via `data-bs-*` attributes.',
      },
    },
  },
  argTypes: {
    modalSize: {
      control: 'select',
      options: [undefined, 'sm', 'lg'],
    },
    modalFullscreenBreakpoint: {
      control: 'select',
      options: [undefined, 'sm', 'md', 'lg', 'xl', 'xxl'],
    },
    animate: { control: 'boolean' },
    backdrop: { control: 'boolean' },
    backdropStatic: { control: 'boolean' },
    backdropColor: { control: 'text' },
    backgroundColor: { control: 'text' },
    textColor: { control: 'text' },
    modalCenter: { control: 'boolean' },
    modalFullscreen: { control: 'boolean' },
    modalTitle: { control: 'text' },
    modalCloseHeader: { control: 'boolean' },
    showModalFooterClose: { control: 'boolean' },
    showModalButton: { control: 'boolean' },
    className: { control: 'text' },
    modalDialogClassName: { control: 'text' },
    modalContentClassName: { control: 'text' },
    modalTitleClassName: { control: 'text' },
    modalBodyClassName: { control: 'text' },
  },
  args: {
    animate: true,
    backdrop: true,
    backdropStatic: false,
    modalCenter: false,
    modalFullscreen: false,
    modalCloseHeader: true,
    showModalFooterClose: false,
    showModalButton: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Default ---

export const Default: Story = {
  name: 'Default',
  args: {
    modalTitle: 'Example modal',
    modalContent: '<p>Modal body text goes here. Add your content, images, or forms.</p>',
    modalButton: {
      label: 'Open modal',
      variant: 'primary',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Standard modal with a header title, close button, and body content. ' +
          'A trigger button is rendered before the `.modal` element.',
      },
    },
  },
};

// --- With footer close button ---

export const WithFooterClose: Story = {
  name: 'With Footer Close Button',
  args: {
    modalTitle: 'Confirm your action',
    modalContent:
      '<p>This action is permanent and cannot be undone. Are you sure you want to continue?</p>',
    showModalFooterClose: true,
    modalCloseFooter: {
      label: 'Cancel',
      variant: 'secondary',
    },
    modalButton: {
      label: 'Open confirmation dialog',
      variant: 'danger',
      outline: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '`showModalFooterClose=true` renders a dismiss button in the modal footer. ' +
          'Configure its label and variant via `modalCloseFooter`.',
      },
    },
  },
};

// --- With footer content + actions ---

export const WithFooterContent: Story = {
  name: 'Footer Content + Close Button',
  args: {
    modalTitle: 'Terms of service',
    modalContent:
      '<p>Please read the terms carefully before accepting. By clicking Accept you agree to our policies.</p>',
    modalFooter: '<p class="text-muted small mb-0">Last updated July 2026.</p>',
    showModalFooterClose: true,
    modalCloseFooter: {
      label: 'Close',
      variant: 'secondary',
    },
    modalButton: {
      label: 'View terms',
      variant: 'link',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'When both `modalFooter` content and `showModalFooterClose` are set, the content renders ' +
          'inside `.modal-footer-content` and the close button renders in `.modal-actions`.',
      },
    },
  },
};

// --- Size variants ---

export const SizeSmall: Story = {
  name: 'Size: Small (sm)',
  args: {
    modalTitle: 'Quick note',
    modalContent: '<p>This is a compact modal — ideal for brief confirmations or alerts.</p>',
    modalSize: 'sm',
    showModalFooterClose: true,
    modalButton: {
      label: 'Open small modal',
      variant: 'secondary',
      size: 'sm',
    },
  },
};

export const SizeLarge: Story = {
  name: 'Size: Large (lg)',
  args: {
    modalTitle: 'Detailed information',
    modalContent:
      '<p>Use the large modal variant when you need to display more content — such as data tables, ' +
      'multi-step forms, or rich media.</p>' +
      '<p>The <code>.modal-lg</code> class sets a max-width of 800&nbsp;px on the dialog.</p>',
    modalSize: 'lg',
    showModalFooterClose: true,
    modalButton: {
      label: 'Open large modal',
      variant: 'primary',
      size: 'lg',
    },
  },
};

// --- Centered ---

export const Centered: Story = {
  name: 'Vertically Centered',
  args: {
    modalTitle: 'Vertically centered',
    modalContent:
      '<p>The <code>modalCenter</code> prop adds <code>.modal-dialog-centered</code>, which uses ' +
      'flexbox to center the dialog in the viewport.</p>',
    modalCenter: true,
    showModalFooterClose: true,
    modalButton: {
      label: 'Open centered modal',
      variant: 'primary',
    },
  },
  parameters: {
    docs: {
      description: {
        story: '`modalCenter=true` adds `modal-dialog-centered` to the dialog element.',
      },
    },
  },
};

// --- Static backdrop ---

export const StaticBackdrop: Story = {
  name: 'Static Backdrop',
  args: {
    modalTitle: 'Important: review required',
    modalContent:
      '<p>Click outside this modal or press Escape — nothing happens. ' +
      'The user must dismiss the modal via the close button or the footer action.</p>',
    backdrop: true,
    backdropStatic: true,
    showModalFooterClose: true,
    modalCloseFooter: {
      label: 'I understand',
      variant: 'primary',
    },
    modalButton: {
      label: 'Open static-backdrop modal',
      variant: 'warning',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '`backdropStatic=true` sets `data-bs-backdrop="static"`. Clicking the backdrop or pressing ' +
          'Escape will not close the modal — users must use the provided dismiss controls.',
      },
    },
  },
};

// --- No animation ---

export const NoAnimation: Story = {
  name: 'No Animation',
  args: {
    modalTitle: 'Modal without fade',
    modalContent: '<p>The <code>animate=false</code> prop omits the <code>.fade</code> class, making the modal appear instantly.</p>',
    animate: false,
    showModalFooterClose: true,
    modalButton: {
      label: 'Open (no animation)',
      variant: 'secondary',
    },
  },
};

// --- Fullscreen ---

export const Fullscreen: Story = {
  name: 'Fullscreen',
  args: {
    modalTitle: 'Fullscreen modal',
    modalContent:
      '<p>The <code>modalFullscreen</code> prop applies <code>.modal-fullscreen</code>, expanding ' +
      'the dialog to cover the entire viewport.</p>',
    modalFullscreen: true,
    showModalFooterClose: true,
    modalButton: {
      label: 'Open fullscreen modal',
      variant: 'dark',
    },
  },
};

export const FullscreenBreakpoint: Story = {
  name: 'Fullscreen Below Breakpoint',
  args: {
    modalTitle: 'Fullscreen below lg',
    modalContent:
      '<p>The <code>modalFullscreenBreakpoint="lg"</code> prop applies ' +
      '<code>.modal-fullscreen-lg-down</code> — fullscreen on viewports narrower than the ' +
      '<code>lg</code> breakpoint, regular dialog above it.</p>',
    modalFullscreen: true,
    modalFullscreenBreakpoint: 'lg',
    showModalFooterClose: true,
    modalButton: {
      label: 'Open responsive fullscreen modal',
      variant: 'primary',
    },
  },
};

// --- No trigger button ---

export const NoTriggerButton: Story = {
  name: 'No Trigger Button',
  args: {
    modalTitle: 'Programmatically opened',
    modalContent:
      '<p>When <code>showModalButton=false</code> no trigger button is rendered. ' +
      'The modal can be opened programmatically via Bootstrap JS or a custom trigger.</p>',
    showModalButton: false,
    showModalFooterClose: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`showModalButton=false` omits the trigger button. Use this variant when ' +
          'a trigger button is rendered separately (e.g. inside a card or nav).',
      },
    },
  },
};

// --- Color theming ---

export const DarkModal: Story = {
  name: 'Dark Background',
  args: {
    modalTitle: 'Dark themed modal',
    modalContent:
      '<p>Use <code>backgroundColor</code> and <code>textColor</code> to apply Bootstrap ' +
      'utility classes to the modal content area.</p>',
    backgroundColor: 'dark',
    textColor: 'white',
    showModalFooterClose: true,
    modalCloseFooter: {
      label: 'Close',
      variant: 'light',
    },
    modalCloseHeaderButton: {
      whiteClose: true,
    },
    modalButton: {
      label: 'Open dark modal',
      variant: 'dark',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '`backgroundColor="dark"` and `textColor="white"` apply `bg-dark` and `text-white` to ' +
          'the `.modal-content` element. Use `modalCloseHeaderButton.whiteClose=true` to switch ' +
          'the header X icon to its white variant.',
      },
    },
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { Collapse } from './Collapse';

const meta: Meta<typeof Collapse> = {
  title: 'Design System/Organisms/Collapse',
  component: Collapse,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Collapse organism — mirrors the Pattern Lab collapse template at ' +
          '`03-organisms/collapse/_collapse.tpl.twig`. ' +
          'Renders a ButtonGroup that toggles one or more Bootstrap collapse panels. ' +
          'A shared collapse ID is auto-generated so buttons and panels are wired ' +
          'together without any extra props. Provide explicit `target` on buttons and ' +
          '`collapseId` on panels to create multiple independent targets.',
      },
    },
  },
  argTypes: {
    buttonGroupDisplay: {
      control: 'select',
      options: ['inline', 'inline-block', 'grid', 'block', 'flex', 'inline-flex'],
      description: 'Bootstrap display utility applied to the ButtonGroup wrapper.',
    },
    buttonGroupSize: {
      control: 'select',
      options: ['sm', 'lg'],
      description: 'Size variant for the button group.',
    },
    buttonGroupDisplayGrid: {
      control: 'boolean',
      description: 'Render buttons as d-grid block group (true) or inline btn-group (false).',
    },
    buttonGroupVertical: {
      control: 'boolean',
      description: 'Render buttons vertically using btn-group-vertical.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Default: single toggle button, single collapse panel ---

export const Default: Story = {
  name: 'Default',
  args: {
    buttonGroupDisplay: 'inline-block',
    buttonGroupDisplayGrid: false,
    buttons: [
      {
        variant: 'primary',
        label: 'Toggle Content',
      },
    ],
    content: [
      {
        content:
          'This content is hidden by default and revealed when the toggle button is clicked. ' +
          'The button and panel are automatically linked by a shared collapse ID ' +
          'generated at render time.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'The simplest case: one button wired to one collapse panel. ' +
          'No explicit IDs are needed — the component auto-generates and links them.',
      },
    },
  },
};

// --- Multiple buttons sharing one panel ---

export const MultipleButtons: Story = {
  name: 'Multiple Buttons, One Panel',
  args: {
    buttonGroupDisplay: 'inline-block',
    buttonGroupDisplayGrid: false,
    buttonGroupLabel: 'Panel controls',
    buttons: [
      { variant: 'primary', label: 'Show Details' },
      { variant: 'outline-secondary' as any, label: 'Toggle' },
    ],
    content: [
      {
        content:
          'Both buttons above control this single panel — they share the same auto-generated ' +
          'collapse target, matching the Twig template\'s default behaviour.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multiple buttons can target the same panel when no explicit IDs are set. ' +
          'All buttons in the group receive the shared `data-bs-target` automatically.',
      },
    },
  },
};

// --- Multiple independent panels (explicit IDs required) ---

export const MultipleIndependentPanels: Story = {
  name: 'Multiple Independent Panels',
  args: {
    buttonGroupDisplay: 'block',
    buttonGroupDisplayGrid: true,
    buttonGroupGap: 2,
    buttonGroupLabel: 'FAQ sections',
    buttons: [
      {
        variant: 'outline-primary' as any,
        label: 'What is your return policy?',
        target: '#faq-returns',
        toggle: 'collapse',
        controls: 'faq-returns',
        expanded: false,
      },
      {
        variant: 'outline-primary' as any,
        label: 'How long does shipping take?',
        target: '#faq-shipping',
        toggle: 'collapse',
        controls: 'faq-shipping',
        expanded: false,
      },
      {
        variant: 'outline-primary' as any,
        label: 'Do you offer international delivery?',
        target: '#faq-international',
        toggle: 'collapse',
        controls: 'faq-international',
        expanded: false,
      },
    ],
    content: [
      {
        collapseId: 'faq-returns',
        content:
          'We offer a 30-day no-questions-asked return policy on all items. ' +
          'Items must be in original packaging and unused condition.',
      },
      {
        collapseId: 'faq-shipping',
        content:
          'Standard shipping takes 3–5 business days. ' +
          'Express shipping (1–2 days) is available at checkout for an additional fee.',
      },
      {
        collapseId: 'faq-international',
        content:
          'Yes — we ship to over 50 countries. ' +
          'Delivery times and rates vary by destination; full details appear at checkout.',
      },
    ],
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'When each button provides an explicit `target` and each panel provides a ' +
          'matching `collapseId`, every button independently controls its own panel. ' +
          'This is the recommended pattern for FAQ sections or tabbed disclosure lists.',
      },
    },
  },
};

// --- Panel with background and text color ---

export const WithBackground: Story = {
  name: 'With Background Color',
  args: {
    buttonGroupDisplay: 'inline-block',
    buttonGroupDisplayGrid: false,
    buttons: [
      { variant: 'dark', label: 'Reveal Info' },
    ],
    content: [
      {
        backgroundColor: 'dark',
        textColor: 'white',
        content:
          'This panel uses Bootstrap bg-dark and text-white utilities applied ' +
          'directly to the .collapse element via the backgroundColor and textColor props.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pass `backgroundColor` and `textColor` on a panel item to apply Bootstrap ' +
          '`bg-*` and `text-*` utilities to the collapse element.',
      },
    },
  },
};

// --- Large button group size ---

export const LargeButtons: Story = {
  name: 'Large Button Size',
  args: {
    buttonGroupDisplay: 'inline-block',
    buttonGroupDisplayGrid: false,
    buttonGroupSize: 'lg',
    buttons: [
      { variant: 'success', label: 'View Full Details' },
    ],
    content: [
      {
        backgroundColor: 'light',
        content:
          'Using `buttonGroupSize="lg"` passes `btn-group-lg` to the ButtonGroup, ' +
          'rendering all buttons at Bootstrap\'s large size.',
      },
    ],
  },
};

// --- Block-grid layout ---

export const BlockGrid: Story = {
  name: 'Block Grid Layout',
  args: {
    buttonGroupDisplay: 'block',
    buttonGroupDisplayGrid: true,
    buttonGroupGap: 2,
    buttons: [
      { variant: 'primary', label: 'Section A' },
      { variant: 'secondary', label: 'Section B' },
    ],
    content: [
      {
        content:
          'When `buttonGroupDisplayGrid` is true (the default), buttons are rendered ' +
          'in a full-width d-grid layout with gap-2 between them. Both buttons above ' +
          'share this single panel.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `buttonGroupDisplayGrid: true` and `buttonGroupDisplay: "block"` for ' +
          'a full-width stacked button layout — useful for mobile-first disclosure sections.',
      },
    },
  },
};

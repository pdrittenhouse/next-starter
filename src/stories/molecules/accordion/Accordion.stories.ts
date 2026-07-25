import type { Meta, StoryObj } from '@storybook/nextjs';
import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Design System/Molecules/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Accordion molecule — mirrors the Timberland Pattern Lab accordion. ' +
          'Composes the Button atom for each panel trigger. Bootstrap 5 JS handles ' +
          'collapse/expand via `data-bs-*` attributes (loaded globally in the theme); ' +
          'no JS import is required.',
      },
    },
  },
  argTypes: {
    flush: { control: 'boolean' },
    id: { control: 'text' },
    otherClasses: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default — three items, first item open
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    items: [
      {
        button: { label: 'What is an accordion?' },
        active: true,
        content:
          'An accordion is a vertically stacked set of interactive headings that each contain a title and a content panel. Clicking a heading reveals its associated panel.',
      },
      {
        button: { label: 'When should I use an accordion?' },
        content:
          'Use accordions when you need to display a large amount of content in a limited space, or when users need quick access to specific sections without scrolling through a long page.',
      },
      {
        button: { label: 'How does Bootstrap handle the collapse?' },
        content:
          'Bootstrap uses its built-in Collapse plugin triggered by `data-bs-toggle="collapse"` and `data-bs-target` attributes wired up at render time. No extra JavaScript setup is needed.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Flush — edge-to-edge variant; no borders or rounded corners
// ---------------------------------------------------------------------------

export const Flush: Story = {
  args: {
    flush: true,
    items: [
      {
        button: { label: 'Flush accordion — item one' },
        active: true,
        content:
          'The `accordion-flush` modifier removes the outer border and rounded corners so the accordion sits flush against its container.',
      },
      {
        button: { label: 'Flush accordion — item two' },
        content:
          'This is useful inside card bodies, sidebars, or any container that already provides its own visual boundary.',
      },
      {
        button: { label: 'Flush accordion — item three' },
        content: 'Each panel body still respects the standard `accordion-body` padding.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// AlwaysOpen — each panel is independent (no data-bs-parent binding)
// ---------------------------------------------------------------------------

export const AlwaysOpen: Story = {
  name: 'Always Open (Independent Panels)',
  args: {
    items: [
      {
        button: { label: 'Panel A — open by default' },
        active: true,
        alwaysOpen: true,
        content:
          'Because `alwaysOpen` is true, opening another panel does not close this one. Each panel is collapsed/expanded independently.',
      },
      {
        button: { label: 'Panel B' },
        alwaysOpen: true,
        content:
          'Try opening Panel A and Panel B at the same time — they stay open simultaneously.',
      },
      {
        button: { label: 'Panel C' },
        alwaysOpen: true,
        content: 'All three panels can be open at once when `alwaysOpen` is set on each item.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// FAQ — realistic content example
// ---------------------------------------------------------------------------

export const FAQ: Story = {
  name: 'FAQ Example',
  args: {
    id: 'faq-accordion',
    items: [
      {
        button: { label: 'What payment methods do you accept?' },
        headerElement: 'h3',
        content:
          'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for orders over $500.',
      },
      {
        button: { label: 'How long does shipping take?' },
        headerElement: 'h3',
        content:
          'Standard shipping takes 5–7 business days. Expedited options (2-day, overnight) are available at checkout.',
      },
      {
        button: { label: 'Can I return or exchange an item?' },
        headerElement: 'h3',
        content:
          'Yes — items may be returned within 30 days of receipt in original condition. Exchanges are processed within 3–5 business days once we receive the item.',
      },
      {
        button: { label: 'Do you ship internationally?' },
        headerElement: 'h3',
        content:
          'We currently ship to the US, Canada, the UK, and the EU. Additional regions are coming soon.',
      },
    ],
  },
};

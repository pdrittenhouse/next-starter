import type { Meta, StoryObj } from '@storybook/nextjs';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Design System/Organisms/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Card organism — mirrors the theme\'s Pattern Lab `timberland/card` pattern at ' +
          '`src/design-system/patterns/03-organisms/card/_card.tpl.twig`. ' +
          'Supports Bootstrap 5 color variants, border styles, width utilities, ' +
          'top/bottom images, icon + label header lead, Button and List atom/molecule composition, ' +
          'full-card linking, and 3D flip-card front/back faces.',
      },
    },
  },
  argTypes: {
    background: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
      description: 'Background color variant — adds bg-{color} Bootstrap class.',
    },
    border: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
      description: 'Border color variant — adds border border-{color} Bootstrap classes.',
    },
    textColor: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'muted', 'white'],
      description: 'Text color variant — adds text-{color} Bootstrap class.',
    },
    textAlignment: {
      control: 'select',
      options: [undefined, 'center', 'start', 'end', 'justify'],
      description: 'Text alignment — adds text-{alignment} Bootstrap class.',
    },
    width: {
      control: 'select',
      options: [undefined, 25, 50, 75],
      description: 'Card width as a Bootstrap w-{n} percentage.',
    },
    imageLocation: {
      control: 'select',
      options: [undefined, 'top', 'bottom'],
      description: "Image position within the card. 'top' renders in the header; 'bottom' renders in the footer.",
    },
    element: {
      control: 'select',
      options: ['div', 'article', 'section'],
      description: 'HTML element tag for the card wrapper. Ignored when linked is true.',
    },
    linked: {
      control: 'boolean',
      description: 'Wrap the entire card in an <a> element. Requires the link prop.',
    },
    flipCard: {
      control: 'boolean',
      description: 'Enable flip-card 3D structure.',
    },
    noBorder: {
      control: 'boolean',
      description: 'Remove card border.',
    },
    inheritColor: {
      control: 'boolean',
      description: 'Reset label, title, subtitle, and text colors to inherit from parent.',
    },
    noHeaderPadding: {
      control: 'boolean',
      description: 'Remove padding from the card header.',
    },
    noBodyPadding: {
      control: 'boolean',
      description: 'Remove padding from the card body area.',
    },
    noFooterPadding: {
      control: 'boolean',
      description: 'Remove padding from the card footer.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    title: 'Getting Started with Timberland',
    subtitle: 'A headless WordPress framework',
    text: 'Timberland is a component-driven WordPress theme framework built on Bootstrap 5, Timber, and Twig. Every pattern maps 1:1 between the design system and the WordPress front-end.',
    button: {
      variant: 'primary',
      label: 'Read the docs',
      href: '#',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic card with title, subtitle, body text, and a primary Button atom in the body.',
      },
    },
  },
};

// ─── With Image Top ───────────────────────────────────────────────────────────

export const WithImageTop: Story = {
  name: 'With Image — Top',
  args: {
    image: {
      src: 'https://placehold.co/800x450/0d6efd/ffffff?text=Card+Image',
      alt: 'A placeholder card image',
      width: 800,
      height: 450,
    },
    imageLocation: 'top',
    title: 'Design System Patterns',
    text: 'Each organism is built to match the corresponding Twig pattern exactly, including class names, structure, and data attributes.',
    button: {
      variant: 'primary',
      label: 'Explore patterns',
      href: '#',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with an Image atom rendered at the top position inside .card-header. Adds has-img and card-img-top classes.',
      },
    },
  },
};

// ─── With Image Bottom ────────────────────────────────────────────────────────

export const WithImageBottom: Story = {
  name: 'With Image — Bottom',
  args: {
    title: 'Component Architecture',
    text: 'Components follow an atomic design hierarchy: atoms → molecules → organisms → templates → pages.',
    footer: 'Published July 2026',
    image: {
      src: 'https://placehold.co/800x300/6610f2/ffffff?text=Footer+Image',
      alt: 'A placeholder footer image',
      width: 800,
      height: 300,
    },
    imageLocation: 'bottom',
  },
  parameters: {
    docs: {
      description: {
        story: "Card with an Image atom rendered at the bottom position inside .card-footer. Footer text and image coexist in the footer region.",
      },
    },
  },
};

// ─── With Label and Icon ──────────────────────────────────────────────────────

export const WithLabelAndIcon: Story = {
  name: 'With Label + Icon',
  args: {
    icon: 'bi bi-star-fill',
    label: 'Featured',
    title: 'Timberland Design Tokens',
    text: 'Design tokens are distributed as an npm package and consumed via SCSS @use with() overrides at the theme level.',
    button: {
      variant: 'secondary',
      label: 'View tokens',
      href: '#',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with an icon class string and label text rendered in the .card-lead area inside .card-header.',
      },
    },
  },
};

// ─── With Header Text ─────────────────────────────────────────────────────────

export const WithHeaderText: Story = {
  name: 'With Header Text',
  args: {
    header: 'Latest Update',
    label: 'Release',
    title: 'Version 3.0 Released',
    text: 'This release introduces a fully headless Next.js starter that mirrors Pattern Lab 1:1, with auto-generated Storybook docs.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with a header text string rendered inside .card-header alongside a label. The header prop also acts as a conditional flag to show .card-header.',
      },
    },
  },
};

// ─── Linked Card ─────────────────────────────────────────────────────────────

export const LinkedCard: Story = {
  name: 'Linked (Full Card)',
  args: {
    linked: true,
    link: '#linked-card',
    linkTarget: '_self',
    image: {
      src: 'https://placehold.co/800x400/198754/ffffff?text=Linked+Card',
      alt: 'A linked card image',
      width: 800,
      height: 400,
    },
    imageLocation: 'top',
    label: 'Case Study',
    title: 'Migrating to Headless WordPress',
    text: 'Learn how the Timberland framework enables teams to migrate to a headless architecture while preserving Pattern Lab component parity.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Full-card link mode: the card wrapper becomes an <a> element with aria-label derived from the title. Adds card--linked class.',
      },
    },
  },
};

// ─── Color Variant ────────────────────────────────────────────────────────────

export const ColorVariant: Story = {
  name: 'Color Variant — Primary',
  args: {
    background: 'primary',
    textColor: 'white',
    inheritColor: true,
    border: 'primary',
    title: 'Primary Card',
    subtitle: 'Background + text color variant',
    text: 'Use background, textColor, and inheritColor together to create fully branded card variants that match Bootstrap theme colors.',
    button: {
      variant: 'light',
      label: 'Learn more',
      href: '#',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with bg-primary, text-white, and border-primary Bootstrap classes applied. inheritColor resets label, title, subtitle, and text to inherit white.',
      },
    },
  },
};

// ─── Danger Bordered ─────────────────────────────────────────────────────────

export const DangerBordered: Story = {
  name: 'Border Variant — Danger',
  args: {
    border: 'danger',
    textColor: 'danger',
    title: 'Validation Error',
    text: 'One or more required fields are missing. Please review the form and correct any highlighted errors before submitting.',
    button: {
      variant: 'danger',
      outline: true,
      label: 'Review errors',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with border-danger and text-danger applied. Useful for alert-style cards in forms or status displays.',
      },
    },
  },
};

// ─── With List ────────────────────────────────────────────────────────────────

export const WithList: Story = {
  name: 'With List Molecule',
  args: {
    icon: 'bi bi-check-circle-fill',
    label: 'What\'s included',
    title: 'Pro Plan',
    subtitle: 'Everything you need',
    list: {
      bulletIcons: true,
      bulletIconPosition: 'before',
      bulletIconSize: '1rem',
      items: [
        { itemText: 'Unlimited projects', itemIcon: 'fas fa-check', iconColor: 'success' },
        { itemText: 'Priority support', itemIcon: 'fas fa-check', iconColor: 'success' },
        { itemText: 'Custom domain', itemIcon: 'fas fa-check', iconColor: 'success' },
        { itemText: 'Advanced analytics', itemIcon: 'fas fa-check', iconColor: 'success' },
        { itemText: 'Team collaboration', itemIcon: 'fas fa-check', iconColor: 'success' },
      ],
    },
    button: {
      variant: 'primary',
      block: true,
      label: 'Get started',
      href: '#',
    },
    footer: 'Cancel anytime. No hidden fees.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card composing a List molecule in the card body alongside icon-bulleted items. The List parentClasses receive inheritColor when the prop is set.',
      },
    },
  },
};

// ─── With Footer ─────────────────────────────────────────────────────────────

export const WithFooter: Story = {
  name: 'With Footer',
  args: {
    label: 'Tutorial',
    title: 'Bootstrap 5 Integration',
    text: 'All Bootstrap 5 utility classes are available globally. Component-level styles live in the global SCSS; CSS modules are reserved for Storybook-only overrides.',
    footer: 'Last updated: July 2026 · 8 min read',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with a footer content string rendered inside .card-footer-content.',
      },
    },
  },
};

// ─── Inline Link ─────────────────────────────────────────────────────────────

export const InlineLink: Story = {
  name: 'Inline Link (Non-linked)',
  args: {
    title: 'Pattern Lab Reference',
    text: 'The Twig source for every pattern lives in the Timberland theme at src/design-system/patterns. Each React component\'s class output matches the Twig template exactly.',
    link: 'https://patternlab.io',
    linkText: 'Visit Pattern Lab',
    linkTarget: '_blank',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with an inline .card-link anchor inside the body. Only rendered when linked is false. The full card is NOT wrapped in an <a> element.',
      },
    },
  },
};

// ─── Fixed Width ─────────────────────────────────────────────────────────────

export const FixedWidth: Story = {
  name: 'Fixed Width — 50%',
  args: {
    width: 50,
    title: 'Half-width Card',
    text: 'The width prop applies Bootstrap w-{n} classes (w-25, w-50, w-75). Useful when placing a single card inside a container without a grid column wrapper.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with width={50} applying the Bootstrap w-50 class. Width props of 25 and 75 are also available.',
      },
    },
  },
};

// ─── No Border ───────────────────────────────────────────────────────────────

export const NoBorder: Story = {
  name: 'No Border',
  args: {
    noBorder: true,
    title: 'Borderless Card',
    text: 'Setting noBorder removes the card border via the no-border CSS class. Often combined with a background color variant or used inside a colored container.',
    button: {
      variant: 'primary',
      outline: true,
      label: 'View details',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with noBorder={true} adding the no-border class, which removes the border via !important in the global SCSS.',
      },
    },
  },
};

// ─── Image Overlay ────────────────────────────────────────────────────────────

export const ImageOverlayText: Story = {
  name: 'Image Overlay Text',
  args: {
    image: {
      src: 'https://placehold.co/800x450/212529/6c757d?text=',
      alt: 'Dark card background image',
      width: 800,
      height: 450,
    },
    imageLocation: 'top',
    imageOverlayText: 'Exclusive Preview',
    title: 'New Component Library',
    text: 'The 2026 release adds 12 new organisms including Card Grid, Collapse, Dropdown, and Toast patterns.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with imageOverlayText rendering a centered text overlay on the card image via .card-img-overlay--text. Adds has-overlay-text to the card wrapper.',
      },
    },
  },
};

// ─── Flip Card ────────────────────────────────────────────────────────────────

export const FlipCard: Story = {
  name: 'Flip Card',
  args: {
    flipCard: true,
    backgroundImage: 'https://placehold.co/400x500/0d6efd/ffffff?text=Front',
    backBackgroundImage: 'https://placehold.co/400x500/6610f2/ffffff?text=Back',
    backContent: 'Hover to reveal the back face. The flip-card class triggers 3D perspective transforms via the global _card.scss.',
    width: 25,
  },
  parameters: {
    docs: {
      description: {
        story: 'Flip-card variant with front and back faces. On hover, CSS transforms rotate the card 180deg via perspective-3d styles in the global SCSS. Adds flip-card class.',
      },
    },
  },
};

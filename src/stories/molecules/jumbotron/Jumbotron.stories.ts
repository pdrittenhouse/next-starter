import type { Meta, StoryObj } from '@storybook/nextjs';
import { Jumbotron } from './Jumbotron';

const meta: Meta<typeof Jumbotron> = {
  title: 'Design System/Molecules/Jumbotron',
  component: Jumbotron,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Jumbotron molecule — full-width hero section with headline, body copy, ' +
          'optional background image, optional inline side image, and a CTA button. ' +
          'Mirrors the Pattern Lab Twig template at ' +
          'patterns/02-molecules/jumbotron/_jumbotron.tpl.twig.',
      },
    },
  },
  argTypes: {
    fluid: { control: 'boolean' },
    removeContainer: { control: 'boolean' },
    verticalCenter: { control: 'boolean' },
    imageLeft: { control: 'boolean' },
    maxWidthFluidContainer: { control: 'boolean' },
    containerBreakpoint: {
      control: 'select',
      options: ['', 'sm', 'md', 'lg', 'xl', 'xxl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    title: 'Welcome to Our Platform',
    subtitle: 'Everything you need, all in one place',
    text: '<p>Discover a powerful set of tools designed to help you build, launch, and grow with confidence. Our platform adapts to your workflow so you can focus on what matters most.</p>',
    cta: {
      label: 'Get Started',
      variant: 'primary',
      size: 'lg',
      href: '#',
    },
  },
};

// ── Background Image ──────────────────────────────────────────────────────────

export const WithBackgroundImage: Story = {
  name: 'With Background Image',
  args: {
    title: 'Adventure Awaits',
    subtitle: 'Explore the world on your terms',
    text: '<p>Book your next journey and experience the freedom of travel like never before. Over 10,000 destinations across 6 continents.</p>',
    bgImage: 'https://picsum.photos/seed/jumbotron/1600/600',
    cta: {
      label: 'Explore Destinations',
      variant: 'light',
      size: 'lg',
      href: '#',
    },
    className: 'text-white',
  },
};

// ── With Inline Image ─────────────────────────────────────────────────────────

export const WithInlineImage: Story = {
  name: 'With Inline Image',
  args: {
    title: 'Meet Our Team',
    subtitle: 'The people who make it happen',
    text: '<p>Our diverse and talented team is dedicated to delivering exceptional results for every client. We bring together expertise from design, engineering, and strategy.</p>',
    image: {
      src: 'https://picsum.photos/seed/team/600/400',
      alt: 'Team photo',
      width: 600,
      height: 400,
      variant: 'primary',
    },
    cta: {
      label: 'Learn More About Us',
      variant: 'secondary',
      href: '#',
    },
  },
};

// ── Image Left ─────────────────────────────────────────────────────────────────

export const ImageLeft: Story = {
  name: 'Image Left',
  args: {
    title: 'Built for Scale',
    subtitle: 'Infrastructure that grows with you',
    text: '<p>From a single server to global clusters, our architecture handles it all. Zero-downtime deployments, automatic failover, and 99.99% uptime guaranteed.</p>',
    image: {
      src: 'https://picsum.photos/seed/infra/600/400',
      alt: 'Infrastructure diagram',
      width: 600,
      height: 400,
      variant: 'primary',
    },
    imageLeft: true,
    cta: {
      label: 'View Architecture',
      variant: 'primary',
      href: '#',
    },
  },
};

// ── No Container ──────────────────────────────────────────────────────────────

export const NoContainer: Story = {
  name: 'No Container',
  args: {
    title: 'Full-Bleed Layout',
    subtitle: 'No container or row wrapper',
    text: '<p>This variant removes the Bootstrap container and row elements, giving you a truly edge-to-edge layout suitable for custom grid frameworks.</p>',
    removeContainer: true,
    bgImage: 'https://picsum.photos/seed/fullbleed/1600/600',
    cta: {
      label: 'Discover More',
      variant: 'dark',
      size: 'lg',
      href: '#',
    },
  },
};

// ── With Eyebrow Label ────────────────────────────────────────────────────────

export const WithLabel: Story = {
  name: 'With Eyebrow Label',
  args: {
    label: 'New Feature',
    title: 'Introducing Smart Workflows',
    subtitle: 'Automate the repetitive, amplify the important',
    text: '<p>Smart Workflows connects your tools, triggers actions based on events, and keeps your team in sync — without writing a single line of code.</p>',
    cta: {
      label: 'Try It Free',
      variant: 'primary',
      size: 'lg',
      href: '#',
    },
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { VideoPromo } from './VideoPromo';

const meta: Meta<typeof VideoPromo> = {
  title: 'Design System/Molecules/VideoPromo',
  component: VideoPromo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'VideoPromo molecule — promotional section combining an optional text header, ' +
          'a video (HTML5 native or embedded), and an array of CTA buttons. ' +
          'Mirrors the Pattern Lab Twig template at ' +
          'patterns/02-molecules/video-promo/_video-promo.tpl.twig.',
      },
    },
  },
  argTypes: {
    bgColor: {
      control: 'select',
      options: ['', 'primary', 'secondary', 'dark', 'light', 'white'],
      description: 'Bootstrap bg-{color} utility applied to header and body',
    },
    titleColor: {
      control: 'select',
      options: ['', 'white', 'primary', 'secondary', 'dark', 'muted'],
      description: 'Bootstrap text-{color} utility for the title',
    },
    subtitleColor: {
      control: 'select',
      options: ['', 'white', 'primary', 'secondary', 'dark', 'muted'],
      description: 'Bootstrap text-{color} utility for the subtitle',
    },
    introColor: {
      control: 'select',
      options: ['', 'white', 'primary', 'secondary', 'dark', 'muted'],
      description: 'Bootstrap text-{color} utility for the intro block',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Default — HTML5 video with play button overlay ────────────────────────────

export const Default: Story = {
  name: 'Default (HTML5 Video)',
  args: {
    title: 'See It in Action',
    subtitle: 'Watch how it works',
    intro: '<p>Our platform is intuitive by design. Explore how teams get up and running in minutes.</p>',
    video: {
      source: 'https://www.w3schools.com/html/mov_bbb.mp4',
      poster: 'https://picsum.photos/seed/videopromo/1280/720',
      controls: true,
      muted: true,
      loop: false,
      // format omitted → HTML5 native; play-button overlay is rendered
    },
  },
};

// ── YouTube Embed with CTAs ───────────────────────────────────────────────────

export const YouTubeWithCTAs: Story = {
  name: 'YouTube Embed + CTAs',
  args: {
    title: 'Why Choose Us',
    subtitle: 'Trusted by thousands of teams worldwide',
    bgColor: 'dark',
    titleColor: 'white',
    subtitleColor: 'white',
    video: {
      format: 'youtube',
      source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      controls: true,
      fullscreen: true,
    },
    ctas: [
      {
        label: 'Start Free Trial',
        variant: 'primary',
        size: 'lg',
        href: '#',
      },
      {
        label: 'View Pricing',
        variant: 'secondary',
        size: 'lg',
        href: '#',
      },
      {
        label: 'Talk to Sales',
        variant: 'link',
        size: 'lg',
        href: '#',
        className: 'text-white',
      },
    ],
  },
};

// ── Video + CTAs (no header) ──────────────────────────────────────────────────

export const VideoWithCTAsNoHeader: Story = {
  name: 'Video + CTAs (No Header)',
  args: {
    video: {
      source: 'https://www.w3schools.com/html/mov_bbb.mp4',
      poster: 'https://picsum.photos/seed/nohdr/1280/720',
      controls: true,
      muted: true,
    },
    ctas: [
      {
        label: 'Learn More',
        variant: 'primary',
        href: '#',
      },
      {
        label: 'Get a Demo',
        variant: 'primary',
        outline: true,
        href: '#',
      },
    ],
  },
};

// ── CTAs Only (no video) ──────────────────────────────────────────────────────

export const CTAsOnly: Story = {
  name: 'CTAs Only (No Video)',
  args: {
    title: 'Ready to Get Started?',
    subtitle: 'Join over 50,000 teams already on the platform',
    intro: '<p>No credit card required. Set up in under 5 minutes. Cancel any time.</p>',
    bgColor: 'primary',
    titleColor: 'white',
    subtitleColor: 'white',
    introColor: 'white',
    ctas: [
      {
        label: 'Sign Up Free',
        variant: 'light',
        size: 'lg',
        href: '#',
      },
      {
        label: 'See All Features',
        variant: 'light',
        outline: true,
        size: 'lg',
        href: '#',
      },
    ],
  },
};

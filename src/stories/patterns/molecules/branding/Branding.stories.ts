import type { Meta, StoryObj } from '@storybook/nextjs';
import { Branding } from './Branding';

const SAMPLE_LOGO_SRC = 'https://picsum.photos/seed/timberland-logo/200/60';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" width="160" height="48" aria-hidden="true">
  <rect width="160" height="48" rx="4" fill="currentColor" opacity="0.15"/>
  <text x="80" y="30" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="currentColor">TIMBERLAND</text>
</svg>`;

const meta: Meta<typeof Branding> = {
  title: 'Design System/Molecules/Branding',
  component: Branding,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Branding molecule — mirrors `timberland/branding` in Pattern Lab. ' +
          'Renders a site logo (inline SVG, background image, or `<img>`), an optional ' +
          'site name heading, and an optional slogan. The logo and name link to `url` ' +
          'when provided; otherwise they render as non-interactive `<span>` elements.',
      },
    },
  },
  argTypes: {
    nameElement: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p'],
    },
    target: {
      control: 'select',
      options: ['_self', '_blank'],
    },
  },
  args: {
    url: '/',
    siteName: 'Natural Rose',
    siteSlogan: 'Grown with care, delivered with love',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Stories ---

/** Default: site name and slogan with an image logo. */
export const Default: Story = {
  args: {
    logoImgSrc: SAMPLE_LOGO_SRC,
    width: 200,
    height: 60,
  },
};

/** Inline SVG logo — adds the `logo-type--svg` class on the wrapper. */
export const SvgLogo: Story = {
  name: 'SVG Logo',
  args: {
    logoSvgInline: SAMPLE_SVG,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pass raw SVG markup to `logoSvgInline`. The wrapper gains the `logo-type--svg` class ' +
          'and the SVG is injected via `dangerouslySetInnerHTML` inside a `<span role="img">`. ' +
          'The SVG should use `currentColor` so it adapts to the theme colour.',
      },
    },
  },
};

/** CSS background-image logo — adds `logo-type--bg` class. */
export const BackgroundImageLogo: Story = {
  name: 'Background Image Logo',
  args: {
    logoBgImgSrc: SAMPLE_LOGO_SRC,
    width: 200,
    height: 60,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pass a URL to `logoBgImgSrc` to render the logo as a CSS `background-image` div ' +
          '(via the Image atom `variant="bg"`). The wrapper gains the `logo-type--bg` class.',
      },
    },
  },
};

/** Logo only — site name and slogan hidden. */
export const LogoOnly: Story = {
  args: {
    logoImgSrc: SAMPLE_LOGO_SRC,
    width: 200,
    height: 60,
    hideSiteName: true,
    hideSiteSlogan: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `hideSiteName` and `hideSiteSlogan` to `true` to display just the logo mark. ' +
          'Useful when the site name is baked into the SVG itself.',
      },
    },
  },
};

/** Name + slogan only — no logo image supplied. */
export const TextOnly: Story = {
  args: {
    logoImgSrc: undefined,
    siteName: 'Natural Rose',
    siteSlogan: 'Grown with care, delivered with love',
  },
  parameters: {
    docs: {
      description: {
        story:
          'When no logo prop is supplied the logo block renders empty. ' +
          'Useful for text-mark brands or during development.',
      },
    },
  },
};

/** Downgraded heading element for use inside existing `<h1>` contexts. */
export const H2SiteName: Story = {
  name: 'Site Name as h2',
  args: {
    logoImgSrc: SAMPLE_LOGO_SRC,
    width: 200,
    height: 60,
    nameElement: 'h2',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `nameElement` to change the heading level when the Branding block is nested ' +
          'inside an `<h1>` or when the page already has a primary `<h1>`.',
      },
    },
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { Video } from './Video';

const SAMPLE_MP4 = 'https://www.w3schools.com/html/mov_bbb.mp4';
const SAMPLE_OGG = 'https://www.w3schools.com/html/mov_bbb.ogg';
const SAMPLE_YT  = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const SAMPLE_VIMEO = 'https://player.vimeo.com/video/76979871';

const meta: Meta<typeof Video> = {
  title: 'Design System/Atoms/Video',
  component: Video,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Video atom — mirrors the theme\'s Pattern Lab `timberland/video` pattern. ' +
          'Renders a native HTML5 video element or an iframe embed for YouTube, Vimeo, ' +
          'or a generic iframe URL. Class names, embed URL params, and HTML structure ' +
          'match the Twig template output 1:1.',
      },
    },
  },
  argTypes: {
    format: {
      control: 'select',
      options: [undefined, 'youtube', 'vimeo', 'iframe'],
      description: 'Embed format. Omit for a native HTML5 video element.',
    },
    aspectRatio: {
      control: 'select',
      options: [undefined, 'wide', '3-4', '1920-1080'],
      description: "'wide' → 16:9 class. Any other string → aspect-ratio--{value} class.",
    },
    preload: {
      control: 'select',
      options: [undefined, 'none', 'auto', 'meta'],
    },
    quality: {
      control: 'select',
      options: [undefined, 'auto', '240p', '360p', '540p', '720p', '1080p', '2k', '4k'],
      description: 'Vimeo video quality.',
    },
    listType: {
      control: 'select',
      options: [undefined, 'playlist', 'user_uploads'],
    },
    width: {
      control: 'text',
      description: 'CSS width value (e.g. "100%", "640px"). Defaults to auto.',
    },
    source: { control: 'text' },
    oggSource: { control: 'text' },
    webmSource: { control: 'text' },
    flvSource: { control: 'text' },
    threegpSource: { control: 'text' },
    poster: { control: 'text' },
    ccSrc: { control: 'text' },
    ccLabel: { control: 'text' },
    ccLang: { control: 'text' },
    origin: { control: 'text' },
    playlist: { control: 'text' },
    list: { control: 'text' },
    color: { control: 'text' },
  },
  args: {
    source: SAMPLE_MP4,
    controls: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- HTML5 video ---

export const Default: Story = {
  args: {
    source: SAMPLE_MP4,
    controls: true,
  },
};

export const HTML5WithFallbacks: Story = {
  name: 'HTML5 — With Fallback Sources',
  args: {
    source: SAMPLE_MP4,
    oggSource: SAMPLE_OGG,
    controls: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the primary mp4 source plus ogg/webm/3gp source elements as fallbacks for older browsers.',
      },
    },
  },
};

export const HTML5WithPoster: Story = {
  name: 'HTML5 — With Poster',
  args: {
    source: SAMPLE_MP4,
    poster: 'https://picsum.photos/seed/video-poster/800/450',
    controls: true,
  },
};

export const HTML5BackgroundVideo: Story = {
  name: 'HTML5 — Background Video (autoplay/loop/muted)',
  args: {
    source: SAMPLE_MP4,
    autoplay: true,
    loop: true,
    muted: true,
    playsinline: true,
    controls: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Background video pattern — autoplay requires muted in most browsers. ' +
          'Adds the has-autoplay class to the wrapper.',
      },
    },
  },
};

export const HTML5WithCaptions: Story = {
  name: 'HTML5 — With Closed Captions',
  args: {
    source: SAMPLE_MP4,
    controls: true,
    closedCaptions: true,
    ccSrc: '/captions/video-en.vtt',
    ccLabel: 'English',
    ccLang: 'en-us',
    ccDefault: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Adds a track element for closed captions with a WebVTT source.',
      },
    },
  },
};

export const HTML5WithStartEnd: Story = {
  name: 'HTML5 — Start/End Time Fragment',
  args: {
    source: SAMPLE_MP4,
    controls: true,
    start: 5,
    end: 15,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Appends a #t={start},{end} media fragment to all source URLs so playback begins and ends at the specified seconds.',
      },
    },
  },
};

// --- YouTube embed ---

export const YouTube: Story = {
  name: 'YouTube Embed',
  args: {
    format: 'youtube',
    source: SAMPLE_YT,
    title: 'Sample YouTube Video',
    controls: true,
    fullscreen: true,
    modestbranding: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'YouTube embed. The component extracts the video ID from any standard YouTube URL and builds the embed URL. ' +
          'When autoplay is off, an srcdoc thumbnail is injected so the iframe requests the video only on play.',
      },
    },
  },
};

export const YouTubeAutoplay: Story = {
  name: 'YouTube — Autoplay',
  args: {
    format: 'youtube',
    source: SAMPLE_YT,
    autoplay: true,
    muted: true,
    loop: true,
    controls: false,
    fullscreen: false,
    modestbranding: true,
  },
};

export const YouTubeWide: Story = {
  name: 'YouTube — 16:9 (wide)',
  args: {
    format: 'youtube',
    source: SAMPLE_YT,
    controls: true,
    fullscreen: true,
    aspectRatio: 'wide',
    modestbranding: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "aspectRatio='wide' applies the 'wide' class, which triggers the 16:9 responsive-video mixin in SCSS.",
      },
    },
  },
};

export const YouTubeWithTitle: Story = {
  name: 'YouTube — With Heading',
  args: {
    format: 'youtube',
    source: SAMPLE_YT,
    title: 'Never Gonna Give You Up',
    controls: true,
    fullscreen: true,
    modestbranding: true,
  },
};

export const YouTubeMinimalChrome: Story = {
  name: 'YouTube — Minimal Chrome',
  args: {
    format: 'youtube',
    source: SAMPLE_YT,
    controls: false,
    info: false,
    modestbranding: true,
    related: false,
    suggested: false,
    fullscreen: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hides the player chrome as much as the YouTube API allows: no controls, no info bar, modest branding, no related/suggested videos.',
      },
    },
  },
};

// --- Vimeo embed ---

export const Vimeo: Story = {
  name: 'Vimeo Embed',
  args: {
    format: 'vimeo',
    source: SAMPLE_VIMEO,
    title: 'Sample Vimeo Video',
    controls: true,
    fullscreen: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vimeo embed. Pass the player.vimeo.com embed URL directly as source — the component appends Vimeo API params to it.',
      },
    },
  },
};

export const VimeoMinimalChrome: Story = {
  name: 'Vimeo — Minimal Chrome',
  args: {
    format: 'vimeo',
    source: SAMPLE_VIMEO,
    byline: false,
    portrait: false,
    showTitle: false,
    dnt: true,
    controls: true,
    fullscreen: true,
  },
};

// --- With title + aspect ratio ---

export const WithTitleAndAspectRatio: Story = {
  name: 'With Title and Custom Aspect Ratio',
  args: {
    format: 'youtube',
    source: SAMPLE_YT,
    title: 'Product Overview',
    controls: true,
    fullscreen: true,
    aspectRatio: '1920-1080',
    modestbranding: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "aspectRatio='1920-1080' adds the 'aspect-ratio--1920-1080' class, matching the SCSS mixin override for that ratio.",
      },
    },
  },
};

// --- Constrained width ---

export const ConstrainedWidth: Story = {
  name: 'Constrained Width',
  args: {
    format: 'youtube',
    source: SAMPLE_YT,
    controls: true,
    fullscreen: true,
    width: '480px',
    modestbranding: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'width prop applies an inline style to the wrapper div.',
      },
    },
  },
};

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Svg } from './Svg';

const SAMPLE_SVG_PATH = '/icons/sample.svg';
const SAMPLE_FALLBACK = '/icons/sample.png';

// Inline SVG React elements — created without JSX so this file stays .ts.
// Real usage passes an imported React SVG component (e.g. from @svgr/webpack) as children.
const CircleIcon = React.createElement('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  'aria-hidden': 'true',
}, React.createElement('circle', { cx: 12, cy: 12, r: 10, stroke: 'currentColor', strokeWidth: 2, fill: 'none' }));

const CheckIcon = React.createElement('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  'aria-hidden': 'true',
}, React.createElement('polyline', { points: '20 6 9 17 4 12', stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }));

const StarIcon = React.createElement('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  'aria-hidden': 'true',
}, React.createElement('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2', stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinejoin: 'round' }));

const ColoredCircleIcon = React.createElement('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
},
  React.createElement('circle', { cx: 12, cy: 12, r: 10, fill: '#E74C3C' }),
  React.createElement('circle', { cx: 12, cy: 12, r: 5, fill: '#3498DB' }),
);

const meta: Meta<typeof Svg> = {
  title: 'Design System/Atoms/Svg',
  component: Svg,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Svg atom — mirrors the theme\'s Pattern Lab `timberland/svg` pattern. ' +
          'Supports three rendering types: inline (span wrapper with SVG children), ' +
          'object (external SVG via <object>), and picture (<picture> with SVG source). ' +
          'When colorOriginal is false (default) svg--colorable is applied so all fills ' +
          'inherit currentColor, enabling colour control via Bootstrap text-colour utilities.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['inline', 'object', 'picture'],
      description: 'Rendering type. Defaults to inline.',
    },
    path: {
      control: 'text',
      description: 'SVG file path — used as the data attribute for object and srcSet for picture types.',
    },
    colorOriginal: {
      control: 'boolean',
      description: 'Preserve the SVG\'s original colours. When false, svg--colorable is added so fills inherit currentColor.',
    },
    fallback: {
      control: 'text',
      description: 'Path to a fallback image shown when the SVG cannot be rendered.',
    },
    alt: {
      control: 'text',
      description: 'Alt text for the fallback image.',
    },
    fill: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark', 'light'],
      description: 'Bootstrap text-colour name applied as text-{fill} class (e.g. "primary" → "text-primary").',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names — maps to svg_other_classes in the Twig pattern.',
    },
  },
  args: {
    type: 'inline',
    colorOriginal: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Inline ---

export const Default: Story = {
  render: (args) => React.createElement(Svg, args, CircleIcon),
  parameters: {
    docs: {
      description: {
        story: 'Default inline rendering — an SVG React element is passed as children inside a span wrapper.',
      },
    },
  },
};

export const InlineCheck: Story = {
  name: 'Inline — Check Icon',
  render: (args) => React.createElement(Svg, args, CheckIcon),
  args: {
    colorOriginal: false,
  },
};

export const InlineWithFill: Story = {
  name: 'Inline — With Bootstrap Fill Colour',
  render: (args) => React.createElement(Svg, args, StarIcon),
  args: {
    fill: 'primary',
    colorOriginal: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'The `fill` prop maps to a Bootstrap `text-{colour}` utility class. Combined with `svg--colorable`, path fills inherit `currentColor` and pick up the text colour.',
      },
    },
  },
};

export const InlineColorOriginal: Story = {
  name: 'Inline — Preserve Original Colours',
  render: (args) => React.createElement(Svg, args, ColoredCircleIcon),
  args: {
    colorOriginal: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'When `colorOriginal` is true the `svg--colorable` class is omitted so the SVG retains its embedded fill colours.',
      },
    },
  },
};

export const InlineIconModifier: Story = {
  name: 'Inline — Icon Modifier (svg--icon)',
  render: (args) => React.createElement(Svg, args, CheckIcon),
  args: {
    className: 'svg--icon',
    colorOriginal: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pass `svg--icon` via `className` to apply the icon-size display rules from the global SCSS (30px fixed width, block svg inside).',
      },
    },
  },
};

// --- Object ---

export const ObjectType: Story = {
  name: 'Object — External SVG File',
  args: {
    type: 'object',
    path: SAMPLE_SVG_PATH,
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders an `<object>` element pointing to an external SVG file. The browser loads and renders the file natively.',
      },
    },
  },
};

export const ObjectWithFallback: Story = {
  name: 'Object — With Fallback Image',
  args: {
    type: 'object',
    path: SAMPLE_SVG_PATH,
    fallback: SAMPLE_FALLBACK,
    alt: 'Sample icon',
  },
  parameters: {
    docs: {
      description: {
        story: 'When `fallback` is provided an `<img>` is rendered inside the `<object>` as fallback content for browsers that cannot render the SVG.',
      },
    },
  },
};

// --- Picture ---

export const PictureType: Story = {
  name: 'Picture — SVG with Raster Fallback',
  args: {
    type: 'picture',
    path: SAMPLE_SVG_PATH,
    fallback: SAMPLE_FALLBACK,
    alt: 'Sample icon',
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders a `<picture>` element with an SVG `<source>` and an `<img>` fallback. Browsers that support SVG in picture use the vector; others fall back to the raster image.',
      },
    },
  },
};

export const PictureNoFallback: Story = {
  name: 'Picture — No Fallback',
  args: {
    type: 'picture',
    path: SAMPLE_SVG_PATH,
  },
  parameters: {
    docs: {
      description: {
        story: 'Picture type without a fallback image — the `<img>` child is omitted when `fallback` is not provided.',
      },
    },
  },
};

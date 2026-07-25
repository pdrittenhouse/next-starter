import type { Meta, StoryObj } from '@storybook/nextjs';
import { Figure } from './Figure';

const meta: Meta<typeof Figure> = {
  title: 'Design System/Atoms/Figure',
  component: Figure,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Figure atom — mirrors the theme\'s Pattern Lab `timberland/figure` pattern. ' +
          'Wraps slotted content in a semantic `<figure>` element with an optional ' +
          '`<figcaption>` that can appear before or after the content block.',
      },
    },
  },
  argTypes: {
    caption: {
      control: 'text',
    },
    captionPosition: {
      control: 'select',
      options: ['before', 'after'],
    },
    figureOtherClasses: {
      control: 'text',
    },
  },
  args: {
    caption: 'A view of the Timberland forest at dusk.',
    captionPosition: 'after',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CaptionBefore: Story = {
  name: 'Caption Before',
  args: {
    captionPosition: 'before',
  },
  parameters: {
    docs: {
      description: {
        story: 'Caption rendered above the content block via `captionPosition="before"`.',
      },
    },
  },
};

export const CaptionAfter: Story = {
  name: 'Caption After',
  args: {
    captionPosition: 'after',
  },
  parameters: {
    docs: {
      description: {
        story: 'Caption rendered below the content block via `captionPosition="after"` (default).',
      },
    },
  },
};

export const NoCaption: Story = {
  name: 'No Caption',
  args: {
    caption: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Figure with no caption — only the slotted content is rendered.',
      },
    },
  },
};

export const WithAdditionalClasses: Story = {
  name: 'Additional Classes',
  args: {
    figureOtherClasses: 'my-custom-class',
    figureClasses: ['figure--highlighted'],
  },
  parameters: {
    docs: {
      description: {
        story:
          '`figureClasses` (array) and `figureOtherClasses` (string) both append to the ' +
          'root `<figure>` element. Classes are sorted alphabetically to match the Twig ' +
          'template\'s `sort` filter.',
      },
    },
  },
};

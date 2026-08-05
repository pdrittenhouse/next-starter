import type { Meta, StoryObj } from '@storybook/nextjs';
import { Form } from './Form';

const meta: Meta<typeof Form> = {
  title: 'Design System/Atoms/Form',
  component: Form,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Form atom — mirrors the theme\'s Pattern Lab form pattern. Renders the form ' +
          'shell: heading, intro, slotted children, and footer. Not a form builder — ' +
          'compose field components inside it.',
      },
    },
  },
  argTypes: {
    method: {
      control: 'select',
      options: ['get', 'post'],
    },
    enctype: {
      control: 'select',
      options: [
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain',
      ],
    },
    target: {
      control: 'select',
      options: ['_blank', '_self', '_parent', '_top'],
    },
    autocomplete: {
      control: 'boolean',
    },
    noValidate: {
      control: 'boolean',
    },
  },
  args: {
    action: '/submit',
    method: 'post',
    autocomplete: false,
    noValidate: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHeading: Story = {
  args: {
    heading: 'Contact Us',
  },
  parameters: {
    docs: {
      description: {
        story: 'Adds a `<header>` block with an `<h2 class="form-title">` when a heading string is provided.',
      },
    },
  },
};

export const WithHeadingAndIntro: Story = {
  name: 'With Heading + Intro',
  args: {
    heading: 'Request a Quote',
    intro: 'Fill out the fields below and we\'ll get back to you within one business day.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Both heading and intro render inside a shared `<header>` element. Intro maps to `<div class="form-intro">`.',
      },
    },
  },
};

export const WithFooter: Story = {
  args: {
    heading: 'Newsletter Sign-up',
    footer: 'We respect your privacy. Unsubscribe at any time.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer content is rendered inside a `<footer>` element at the end of the form.',
      },
    },
  },
};

export const FileUpload: Story = {
  name: 'File Upload (multipart)',
  args: {
    heading: 'Upload Your Resume',
    method: 'post',
    enctype: 'multipart/form-data',
  },
  parameters: {
    docs: {
      description: {
        story: '`enctype="multipart/form-data"` is required for file inputs. The prop is only written to the DOM when `method="post"`.',
      },
    },
  },
};

export const OpenInNewTab: Story = {
  name: 'Opens in New Tab',
  args: {
    heading: 'External Search',
    action: 'https://example.com/search',
    method: 'get',
    target: '_blank',
  },
};

export const BrowserValidationDisabled: Story = {
  name: 'No Native Validation',
  args: {
    heading: 'Custom-validated Form',
    noValidate: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sets the `novalidate` attribute, delegating all validation to client-side JavaScript.',
      },
    },
  },
};

export const AutocompleteOn: Story = {
  name: 'Autocomplete On',
  args: {
    heading: 'Checkout',
    autocomplete: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Defaults to `autocomplete="off"`. Pass `autocomplete={true}` to enable browser autofill.',
      },
    },
  },
};

import type { Preview } from "@storybook/react";
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { MockedProvider } from '@apollo/client/testing';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import '../src/index.scss';
import { gql } from "@apollo/client";
import { sampleData } from '../src/stories/utils/sample-data'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['*', ['Protons', 'Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages', '*']],
        locales: 'en-US',
      },
    },
    fetchMock: {
      debug: true,
    },
    apolloClient: {
      MockedProvider,
      globalMocks: sampleData,
    },
  },
};

export default preview;

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-bs-theme',
  }),
];
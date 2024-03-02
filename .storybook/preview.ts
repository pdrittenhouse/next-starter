import type { Preview } from "@storybook/react";
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { MockedProvider } from '@apollo/client/testing';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import '../src/scss/global.scss';
import '../src/stories/storybook.scss';
import { menusData } from '../src/stories/data/menus-data';

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
      globalMocks: [
          menusData
      ],
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
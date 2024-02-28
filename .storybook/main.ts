import type { StorybookConfig } from "@storybook/nextjs";
import deeperSortSetup from "storybook-deeper-sort";

deeperSortSetup(['*', ['Protons', 'Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages', '*']]);

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links", // @link https://storybook.js.org/addons/@storybook/addon-links
    "@storybook/addon-essentials", // @link https://storybook.js.org/docs/essentials
    "@storybook/addon-interactions", // @link https://storybook.js.org/addons/@storybook/addon-interactions
    "@storybook/addon-themes", // @link https://storybook.js.org/addons/@storybook/addon-themes
    "@storybook/addon-designs", // @link https://storybook.js.org/docs/sharing/design-integrations#embed-storybook-in-figma-with-the-plugin
    "@storybook/addon-a11y", // @link https://storybook.js.org/addons/@storybook/addon-a11y
    'storybook-addon-fetch-mock', // @link https://storybook.js.org/addons/storybook-addon-fetch-mock
    "storybook-addon-apollo-client", // @link https://storybook.js.org/addons/storybook-addon-apollo-client/
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;

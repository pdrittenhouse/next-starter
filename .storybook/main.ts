import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";
import { fileURLToPath } from "url";
import deeperSortSetup from "storybook-deeper-sort";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

deeperSortSetup(['*', ['Protons', 'Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages', '*']]);

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links", // @link https://storybook.js.org/addons/@storybook/addon-links
    "@storybook/addon-docs", // @link https://storybook.js.org/docs/writing-docs
    "@storybook/addon-themes", // @link https://storybook.js.org/addons/@storybook/addon-themes
    "@storybook/addon-designs", // @link https://storybook.js.org/docs/sharing/design-integrations#embed-storybook-in-figma-with-the-plugin
    "@storybook/addon-a11y", // @link https://storybook.js.org/addons/@storybook/addon-a11y
"storybook-addon-apollo-client", // @link https://storybook.js.org/addons/storybook-addon-apollo-client/
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
      };
    }
    return config;
  },
};
export default config;

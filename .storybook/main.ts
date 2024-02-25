import type { StorybookConfig } from "@storybook/nextjs";
import deeperSortSetup from "storybook-deeper-sort";

deeperSortSetup(['*', ['Protons', 'Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages', '*']]);

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
    "@storybook/addon-designs",
    "@storybook/addon-a11y",
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

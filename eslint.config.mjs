import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import storybookPlugin from 'eslint-plugin-storybook';

export default [
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...storybookPlugin.configs['flat/recommended'],
];

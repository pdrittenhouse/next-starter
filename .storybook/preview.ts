import type { Preview } from "@storybook/react";
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { MockedProvider } from '@apollo/client/testing';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import '../src/scss/global.scss';
import '../src/stories/storybook.scss';
import { allSettingsData, generalSettingsData, readingSettingsData, discussionSettingsData, writingSettingsData } from '../src/stories/data/settings-data';
import { usersData } from '../src/stories/data/users-data';
import { allCategoriesData, categoryBySlugData } from '../src/stories/data/categories-data';
import { allTagsData, tagBySlugData } from '../src/stories/data/tags-data';
import { allTaxonomiesData, taxonomyByIdData, termsByTaxonomyData } from '../src/stories/data/taxonomies-data';
import { menusData } from '../src/stories/data/menus-data';
import { allPagesData, allPagesWithContentData, pageByUriData } from '../src/stories/data/pages-data';
import { allPostsData, allPostsWithContentData, postBySlugData, postsByCategoryIdData, postsByAuthorSlugData } from '../src/stories/data/posts-data';

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
        allSettingsData,
        usersData,
        generalSettingsData,
        readingSettingsData,
        discussionSettingsData,
        writingSettingsData,
        allCategoriesData,
        categoryBySlugData,
        allTagsData,
        tagBySlugData,
        allTaxonomiesData,
        taxonomyByIdData,
        termsByTaxonomyData,
        menusData,
        allPagesData,
        allPagesWithContentData,
        pageByUriData,
        allPostsData,
        allPostsWithContentData,
        postBySlugData,
        postsByCategoryIdData,
        postsByAuthorSlugData,
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
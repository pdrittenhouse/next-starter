import type { Decorator, Preview } from "@storybook/react";
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { MockedProviderProps, MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { addons } from 'storybook/preview-api';
import { print } from 'graphql';
import { useEffect } from 'react';
import type { ApolloClientAddonState } from 'storybook-addon-apollo-client';
import { EVENTS } from 'storybook-addon-apollo-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import '../src/scss/global.scss';
import '../src/stories/storybook.scss';
import '@phosphor-icons/web/regular';
import { allSettingsData, generalSettingsData, readingSettingsData, discussionSettingsData, writingSettingsData } from '../src/stories/data/settings-data';
import { usersData } from '../src/stories/data/users-data';
import { allCategoriesData, categoryBySlugData } from '../src/stories/data/categories-data';
import { allTagsData, tagBySlugData } from '../src/stories/data/tags-data';
import { allTaxonomiesData, taxonomyByIdData, termsByTaxonomyData } from '../src/stories/data/taxonomies-data';
import { menusData } from '../src/stories/data/menus-data';
import { allPagesData, allPagesWithContentData, pageByUriData } from '../src/stories/data/pages-data';
import { allPostsData, allPostsWithContentData, postBySlugData, postsByCategoryIdData, postsByAuthorSlugData } from '../src/stories/data/posts-data';

// ---------------------------------------------------------------------------
// Apollo Client v10 addon helpers
// ---------------------------------------------------------------------------

const getMockName = (mock: MockedResponse): string => {
  if (mock.request.operationName) return mock.request.operationName;
  const def = mock.request.query.definitions.find(
    (d) => d.kind === 'OperationDefinition',
  ) as { name?: { value: string } } | undefined;
  return def?.name?.value ?? 'Unnamed';
};

function safeStringify(value: unknown): string | undefined {
  try { return JSON.stringify(value, null, 2); } catch { return undefined; }
}

function buildAddonState(mocks: MockedResponse[], activeIndex: number): ApolloClientAddonState {
  const mock = mocks[activeIndex];
  if (!mock) {
    return { activeIndex: -1, options: mocks.map(getMockName), query: undefined, variables: undefined, extensions: undefined, context: undefined, result: undefined, error: undefined };
  }
  return {
    options: mocks.map(getMockName),
    activeIndex,
    query: print(mock.request.query),
    variables: safeStringify(mock.request.variables),
    extensions: safeStringify(mock.request.extensions),
    context: safeStringify(mock.request.context),
    result: safeStringify(mock.result),
    error: safeStringify(mock.error),
  };
}

const ApolloDecorator: Decorator = (Story, context) => {
  const apolloParams = context.parameters.apolloClient as (MockedProviderProps & { mocks?: MockedResponse[] }) | undefined;

  useEffect(() => {
    const mocks: MockedResponse[] = apolloParams?.mocks ?? [];
    const channel = addons.getChannel();
    const handleRequest = (activeIndex: number) => channel.emit(EVENTS.RESULT, buildAddonState(mocks, activeIndex));
    handleRequest(mocks.length ? 0 : -1);
    channel.on(EVENTS.REQUEST, handleRequest);
    return () => { channel.off(EVENTS.REQUEST, handleRequest); };
  }, [apolloParams]);

  if (!apolloParams) return <Story />;

  return (
    <MockedProvider {...apolloParams}>
      <Story />
    </MockedProvider>
  );
};

// ---------------------------------------------------------------------------
// Preview config
// ---------------------------------------------------------------------------

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: (a, b) => globalThis.deeperSort(a, b),
    },
apolloClient: {
      mocks: [
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

export const decorators: Decorator[] = [
  ApolloDecorator,
  withThemeByDataAttribute({
    themes: { light: 'light', dark: 'dark' },
    defaultTheme: 'light',
    attributeName: 'data-bs-theme',
  }),
];

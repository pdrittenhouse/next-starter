import { cache } from 'react';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_CONTENT_WRAPPER_OPTIONS } from '@/lib/wp/queries/acf-options';

export interface ContentWrapperOptions {
  removeContentContainers?: boolean | null;
}

// React cache() deduplicates this call within a single server request, so both
// SectionBlock and RowBlock can call it independently without redundant fetches.
export const getContentWrapperOptions = cache(async (): Promise<ContentWrapperOptions> => {
  const { data } = await fetchGraphQL<any>(
    print(GET_CONTENT_WRAPPER_OPTIONS),
  ).catch(() => ({ data: null }));
  return (data as any)?.themeGeneralOptions?.settingsThemeGeneralOptions ?? {};
});

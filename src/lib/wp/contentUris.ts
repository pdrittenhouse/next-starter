/**
 * The list of published content URIs, shared by everything that needs it.
 *
 * Two consumers that must not disagree:
 *
 *   - `app/[[...uri]]/page.tsx#generateStaticParams` — what to prerender
 *   - `app/sitemap.xml/route.ts` — what to advertise to crawlers
 *
 * A sitemap listing URLs the build never produced, or a build prerendering
 * pages the sitemap omits, are both silent inconsistencies. One implementation
 * avoids them.
 */

import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_ALL_CONTENT_URIS } from '@/lib/wp/queries';

export interface ContentUri {
  databaseId: number;
  uri: string;
  contentTypeName: string;
  modified?: string | null;
}

/**
 * Every published content URI — retried, then fatal.
 *
 * Throws rather than returning an empty list. It used to `.catch()` into
 * `{ data: null }` with no log at all, so a WordPress hiccup produced a build
 * that exited 0 having prerendered nothing but the front page.
 *
 * The retries absorb the transient failures a local WordPress produces under
 * the load of the build itself (405s and 504s, both observed). Anything
 * surviving three attempts is real and stops the caller.
 */
export async function listContentUris(): Promise<ContentUri[]> {
  const attempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const { data, errors } = await fetchGraphQL<{
        contentNodes: { nodes: { databaseId: number; uri: string; contentTypeName: string }[] };
      }>(print(GET_ALL_CONTENT_URIS));

      if (errors?.length) {
        throw new Error(errors.map((e) => e.message).join('; '));
      }
      const nodes = data?.contentNodes?.nodes;
      if (!nodes) {
        throw new Error('response contained no contentNodes');
      }
      return nodes;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        const waitMs = attempt * 2000;
        console.warn(
          `[build] listing content URIs failed (attempt ${attempt}/${attempts}), ` +
          `retrying in ${waitMs}ms: ${error instanceof Error ? error.message : String(error)}`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw new Error(
    '[build] could not list content URIs from WordPress after ' + attempts + ' attempts. ' +
    'Refusing to build a site with no content. Last error: ' +
    (lastError instanceof Error ? lastError.message : String(lastError)),
  );
}

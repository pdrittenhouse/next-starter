import { fetchWpRest } from '@/lib/wp/client';

/**
 * Module-level cache — detection runs once per process (cold start) and is
 * reused for every subsequent call. The WP block-styles endpoint is queried
 * only the first time; after that the promise is resolved from the cache.
 */
let cachedResult: Promise<boolean> | null = null;

interface BlockStylesResponse {
  slugs?: string[];
  [key: string]: unknown;
}

/**
 * Returns true when the timberland-extended WordPress plugin is active.
 *
 * Detection strategy: fetch /timberland/v1/block-styles and check whether
 * the `slugs` array includes 'feature' — a plugin-only slug that is never
 * registered by the base framework.
 *
 * The result is cached at module level so the REST call happens at most once
 * per process (server cold start). Errors are caught and treated as "not active"
 * so a missing plugin never breaks the render path.
 */
export function isTimberlandExtendedActive(): Promise<boolean> {
  if (cachedResult !== null) {
    return cachedResult;
  }

  cachedResult = fetchWpRest<BlockStylesResponse>('/timberland/v1/block-styles')
    .then((data) => {
      return Array.isArray(data?.slugs) && data.slugs.includes('feature');
    })
    .catch((err) => {
      console.warn('[timberland-extended] Plugin detection failed — treating as inactive.', err);
      return false;
    });

  return cachedResult;
}

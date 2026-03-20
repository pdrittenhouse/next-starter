/**
 * Framework-agnostic GraphQL client factory for WordPress.
 *
 * This module provides a plain `fetch`-based GraphQL client that works
 * in any JS runtime (Next.js, Astro, Node, edge workers, etc.).
 *
 * For React/Apollo usage, see the framework-specific ApolloClientProvider.
 * This client is intended for:
 *   - Server-side data fetching (getStaticProps, Astro frontmatter, etc.)
 *   - Non-React contexts
 *   - Build-time data fetching
 */

import { getWpConfig, buildAuthHeader, type WpConfig } from './config';

export interface GraphQLResponse<T = Record<string, unknown>> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown[]; path?: unknown[] }>;
}

export interface FetchGraphQLOptions {
  /** Pass `true` to include Basic Auth headers (for introspection, etc.) */
  useAuth?: boolean;
  /** Additional headers to include in the request. */
  headers?: Record<string, string>;
  /** Optional AbortSignal for request cancellation. */
  signal?: AbortSignal;
  /** Next.js fetch options (revalidate, tags, etc.) */
  next?: Record<string, unknown>;
}

/**
 * Execute a GraphQL query against the WordPress endpoint.
 *
 * @example
 * ```ts
 * import { fetchGraphQL } from '@/lib/wp/client';
 * import { GET_ALL_POSTS } from '@/lib/wp/queries/posts';
 * import { print } from 'graphql';
 *
 * const { data } = await fetchGraphQL(print(GET_ALL_POSTS));
 * ```
 */
export async function fetchGraphQL<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>,
  options: FetchGraphQLOptions = {},
): Promise<GraphQLResponse<T>> {
  const config = getWpConfig();

  if (!config.graphqlUrl) {
    throw new Error('[wp] No GraphQL URL configured. Set WP_GRAPHQL_URL in your environment.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.useAuth) {
    const authHeader = buildAuthHeader(config);
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
  }

  const fetchOptions: RequestInit & { next?: Record<string, unknown> } = {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    signal: options.signal,
  };

  if (options.next) {
    fetchOptions.next = options.next;
  }

  const response = await fetch(config.graphqlUrl, fetchOptions);

  if (!response.ok) {
    throw new Error(`[wp] GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<GraphQLResponse<T>>;
}

/**
 * Create a pre-configured client instance with custom defaults.
 * Useful when you want to bind a specific config or default options.
 */
export function createWpClient(configOverride?: Partial<WpConfig>) {
  const baseConfig = { ...getWpConfig(), ...configOverride };

  return {
    config: baseConfig,
    fetch: <T = Record<string, unknown>>(
      query: string,
      variables?: Record<string, unknown>,
      options: FetchGraphQLOptions = {},
    ): Promise<GraphQLResponse<T>> => {
      const config = getWpConfig();
      const mergedConfig = { ...config, ...configOverride };

      if (!mergedConfig.graphqlUrl) {
        throw new Error('[wp] No GraphQL URL configured.');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (options.useAuth) {
        const authHeader = buildAuthHeader(mergedConfig);
        if (authHeader) {
          headers['Authorization'] = authHeader;
        }
      }

      const fetchOptions: RequestInit & { next?: Record<string, unknown> } = {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
        signal: options.signal,
      };

      if (options.next) {
        fetchOptions.next = options.next;
      }

      return fetch(mergedConfig.graphqlUrl, fetchOptions)
        .then((res) => {
          if (!res.ok) throw new Error(`[wp] GraphQL request failed: ${res.status} ${res.statusText}`);
          return res.json() as Promise<GraphQLResponse<T>>;
        });
    },
  };
}

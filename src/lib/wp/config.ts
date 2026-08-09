/**
 * WordPress GraphQL configuration.
 * Framework-agnostic — no React, Next.js, or Astro dependencies.
 */

export interface WpSiteEntry {
  host: string;
  graphql: string;
}

export interface WpConfig {
  graphqlUrl: string;
  restUrl: string;
  authUser?: string;
  authPassword?: string;
  sites?: WpSiteEntry[];
}

/**
 * Reads WP config from environment variables.
 * Works with any framework that exposes env vars at build/runtime.
 *
 * Next.js: NEXT_PUBLIC_WP_*
 * Astro:   PUBLIC_WP_*
 * Node:    WP_*
 */
// Next.js/webpack requires literal process.env.NEXT_PUBLIC_* access for static replacement.
// Dynamic access like process.env[key] does NOT work in client bundles.
export function getWpConfig(): WpConfig {
  const graphqlUrl =
    process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ??
    '';

  const restUrl = graphqlUrl.replace(/\/graphql$/, '');

  const authUser =
    process.env.NEXT_PUBLIC_WP_AUTH_USER;

  const authPassword =
    process.env.NEXT_PUBLIC_WP_AUTH_APP_PASSWORD;

  let sites: WpSiteEntry[] | undefined;
  const sitesRaw = process.env.NEXT_PUBLIC_WP_SITES ?? '';
  if (sitesRaw) {
    try {
      sites = JSON.parse(sitesRaw);
    } catch {
      console.warn('[wp] Failed to parse NEXT_PUBLIC_WP_SITES as JSON.');
    }
  }

  if (!graphqlUrl) {
    console.warn('[wp] No WP_GRAPHQL_URL found in environment variables.');
  }

  return { graphqlUrl, restUrl, authUser, authPassword, sites };
}

/**
 * Resolve the GraphQL endpoint and REST base URL for a given request host.
 * Falls back to the default graphqlUrl when the host is not found in the sites map.
 */
export function resolveGraphqlUrl(host: string): string {
  const config = getWpConfig();
  if (config.sites?.length) {
    const match = config.sites.find(s => s.host === host);
    if (match) return match.graphql;
  }
  return config.graphqlUrl;
}

export function resolveRestUrl(host: string): string {
  return resolveGraphqlUrl(host).replace(/\/graphql$/, '');
}

/**
 * Build a Basic Auth header value from credentials.
 * Returns undefined if credentials are missing.
 */
export function buildAuthHeader(config: WpConfig): string | undefined {
  if (!config.authUser || !config.authPassword) return undefined;
  const token = typeof btoa === 'function'
    ? btoa(`${config.authUser}:${config.authPassword}`)
    : Buffer.from(`${config.authUser}:${config.authPassword}`).toString('base64');
  return `Basic ${token}`;
}

/**
 * WordPress GraphQL configuration.
 * Framework-agnostic — no React, Next.js, or Astro dependencies.
 */

export interface WpConfig {
  graphqlUrl: string;
  authUser?: string;
  authPassword?: string;
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

  const authUser =
    process.env.NEXT_PUBLIC_WP_AUTH_USER;

  const authPassword =
    process.env.NEXT_PUBLIC_WP_AUTH_APP_PASSWORD;

  if (!graphqlUrl) {
    console.warn('[wp] No WP_GRAPHQL_URL found in environment variables.');
  }

  return { graphqlUrl, authUser, authPassword };
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

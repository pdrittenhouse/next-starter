/**
 * Shared WordPress utility functions.
 * Framework-agnostic — no React, Next.js, or Astro dependencies.
 */

/** Lowercase the first character of a string. */
export const lcFirst = (s: string): string =>
  s.charAt(0).toLowerCase() + s.slice(1);

/** Uppercase the first character of a string. */
export const ucFirst = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Convert a camelCase string to a human-readable label.
 * e.g. "themeHeaderOptions" → "Theme Header Options"
 */
export const camelToLabel = (s: string): string =>
  s.replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

/**
 * Build a taxonomy label from a WPGraphQL taxonomy edge.
 * Falls back to capitalizing the slug if no label is set.
 */
export const taxonomyLabel = (label: string | null | undefined, name: string): string =>
  label || ucFirst(name);

/** WPGraphQL standard connection fields we skip during introspection. */
export const CONTENT_NODE_SKIP_FIELDS = new Set([
  '__typename', 'id', 'databaseId', 'slug', 'date', 'modified', 'status',
  'uri', 'title', 'content', 'excerpt', 'featuredImage', 'author',
  'terms', 'contentType', 'template', 'isPreview', 'previewRevisionDatabaseId',
  'previewRevisionId', 'guid', 'enclosure', 'isRestricted', 'link',
  'desiredSlug', 'editingLockedBy', 'isContentNode', 'isTermNode',
  'enqueuedScripts', 'enqueuedStylesheets', 'contentTypeName',
  'dateGmt', 'modifiedGmt', 'lastEditedBy', 'editorBlocks', 'seo',
]);

/**
 * Check if a URI has a redirect configured in WordPress.
 *
 * Makes a GET request (with immediate abort) to the WordPress site and checks
 * if WP responds with a 3xx redirect. Uses GET instead of HEAD because many
 * redirect plugins (Redirection, Yoast, etc.) only intercept GET requests.
 * The AbortController cancels the request as soon as headers are received
 * to avoid downloading the response body.
 *
 * @param uri - The URI path to check (e.g. "/old-page/")
 * @param wpBaseUrl - The WordPress site URL (derived from GraphQL URL)
 */
export async function checkRedirects(
  uri: string,
  wpBaseUrl: string,
): Promise<{ to: string; statusCode: number } | null> {
  if (!wpBaseUrl) return null;

  const controller = new AbortController();

  try {
    const checkUrl = new URL(uri, wpBaseUrl).toString();
    const response = await fetch(checkUrl, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
    });

    // Abort immediately — we only need the status + headers
    controller.abort();

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        // Convert absolute WP URL to relative path for the headless frontend
        try {
          const locationUrl = new URL(location);
          const wpUrl = new URL(wpBaseUrl);
          // If the redirect target is on the same WP host, convert to relative path
          if (locationUrl.host === wpUrl.host) {
            return { to: locationUrl.pathname + locationUrl.search, statusCode: response.status };
          }
          // External redirect — pass through as-is
          return { to: location, statusCode: response.status };
        } catch {
          return { to: location, statusCode: response.status };
        }
      }
    }
  } catch {
    // Silently fail — don't block page rendering if redirect check fails
  }
  return null;
}

/** ACF options pages used in the Timberland theme. */
export const THEME_OPTIONS_FIELDS = [
  'themeGeneralOptions',
  'themeHeaderOptions',
  'themeFooterOptions',
  'cacheOptions',
  'menuWidgetOptions',
  'fontOptions',
  'blockModules',
] as const;

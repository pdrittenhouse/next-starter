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

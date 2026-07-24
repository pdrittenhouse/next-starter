import type { ComponentType, ReactNode } from 'react';

export type PatternComponent = ComponentType<{ children?: ReactNode }>;

// Maps Timberland pattern slugs to headless React components.
// Unregistered slugs (null) are silently skipped by TemplateRenderer.
// Add entries here as components are built — pattern slug is the same value
// as the data-pattern attribute in the Twig template.
export const PATTERN_MAP: Record<string, PatternComponent | null> = {
  'timberland/skip-nav': null,
  'timberland/header': null,
  'timberland/branding': null,
  'timberland/nav': null,
  'timberland/traveling-cta': null,
  'timberland/footer': null,
};

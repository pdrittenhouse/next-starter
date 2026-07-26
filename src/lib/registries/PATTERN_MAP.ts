import type { ComponentType, ReactNode } from 'react';
import { HeaderPattern } from '@/stories/patterns/HeaderPattern';
import { FooterPattern } from '@/stories/patterns/FooterPattern';

export type PatternComponent = ComponentType<{ children?: ReactNode }>;

// Maps Timberland pattern slugs to headless React components.
// null = render generic HTML shell from manifest element/className/id.
// Nested patterns (branding, nav) are handled internally by HeaderPattern
// and FooterPattern — no separate entries needed for those slugs.
export const PATTERN_MAP: Record<string, PatternComponent | null> = {
  'timberland/skip-nav':      null,
  'timberland/header':        HeaderPattern as PatternComponent,
  'timberland/branding':      null,
  'timberland/nav':           null,
  'timberland/traveling-cta': null,
  'timberland/footer':        FooterPattern as PatternComponent,
};

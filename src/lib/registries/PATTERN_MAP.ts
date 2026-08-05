import type { ComponentType, ReactNode } from 'react';
import { HeaderPattern } from '@/stories/templates/partials/wrapper/HeaderPattern';
import { FooterPattern } from '@/stories/templates/partials/wrapper/FooterPattern';
import { TravelingCtaPattern } from '@/stories/templates/partials/wrapper/TravelingCtaPattern';
import { isTimberlandExtendedActive } from '@/lib/wp/detection';
import { EXTENDED_PATTERN_MAP } from '@/lib/registries/EXTENDED_PATTERN_MAP';

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
  'timberland/traveling-cta': TravelingCtaPattern as PatternComponent,
  'timberland/footer':        FooterPattern as PatternComponent,
};

export async function getPatternMap(): Promise<Record<string, PatternComponent | null>> {
  const isExtended = await isTimberlandExtendedActive();
  return isExtended ? { ...PATTERN_MAP, ...EXTENDED_PATTERN_MAP } : PATTERN_MAP;
}

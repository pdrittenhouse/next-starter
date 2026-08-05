import type { PatternComponent } from '@/lib/registries/PATTERN_MAP';

// Plugin molecule patterns are wired up at the component level (e.g. the
// traveling-cta block component renders the TravelingCta molecule directly)
// rather than as top-level template patterns driven by the manifest tree.
// This map is intentionally empty — it exists so getPatternMap() can merge it
// in cleanly when the plugin is active, and to provide a place to add entries
// as plugin template patterns are added in the future.
export const EXTENDED_PATTERN_MAP: Record<string, PatternComponent | null> = {};

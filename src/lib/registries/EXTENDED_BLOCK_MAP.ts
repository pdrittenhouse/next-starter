import type { BlockComponent } from '@/lib/registries/BLOCK_MAP';
import { FeatureBlock } from '@/stories/blocks/extended/feature/FeatureBlock';
import { HighlightGridBlock } from '@/stories/blocks/extended/highlight-grid/HighlightGridBlock';
import { LogoGridBlock } from '@/stories/blocks/extended/logo-grid/LogoGridBlock';
import { LogoSliderBlock } from '@/stories/blocks/extended/logo-slider/LogoSliderBlock';
import { PriceBlock } from '@/stories/blocks/extended/price/PriceBlock';
import { PromoBlock } from '@/stories/blocks/extended/promo/PromoBlock';
import { TravelingCtaBlock } from '@/stories/blocks/extended/traveling-cta/TravelingCtaBlock';

// Maps the 7 timberland-extended plugin block slugs to headless React components.
// Merged into BLOCK_MAP at runtime (via getBlockMap()) when the plugin is active.
// key: WP block name  e.g. 'acf/feature'
// value: React component (async server component) that accepts { block }
export const EXTENDED_BLOCK_MAP: Record<string, BlockComponent> = {
  'acf/feature':        FeatureBlock,
  'acf/highlight-grid': HighlightGridBlock,
  'acf/logo-grid':      LogoGridBlock,
  'acf/logo-slider':    LogoSliderBlock,
  'acf/price':          PriceBlock,
  'acf/promo':          PromoBlock,
  'acf/traveling-cta':  TravelingCtaBlock,
};

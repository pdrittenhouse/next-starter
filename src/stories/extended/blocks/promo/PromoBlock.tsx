import { Promo } from '@/stories/extended/patterns/molecules/Promo';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './promo.module.scss';
import { cx } from '@/lib/cx';

interface PromoImageData {
  image_type?: 'file' | 'url' | null;
  image?: { url?: string | null; alt?: string | null; width?: number | null; height?: number | null } | null;
  image_url?: string | null;
}

interface PromoButtonData {
  button?: {
    link?: { title?: string | null; url?: string | null; target?: string | null } | null;
    style?: string | null;
    size?: string | null;
    outline?: boolean;
  } | null;
}

interface PromoBlockData {
  promo_count?: '1' | '2' | null;
  include_container?: boolean;
  full_width?: boolean;
  max_width_fluid_container?: boolean;
  container_breakpoint?: { breakpoint?: string | null } | null;
  promo_1_image?: PromoImageData | null;
  promo_1_title?: string | null;
  promo_1_text?: string | null;
  promo_1_buttons?: PromoButtonData[] | null;
  promo_2_image?: PromoImageData | null;
  promo_2_title?: string | null;
  promo_2_text?: string | null;
  promo_2_buttons?: PromoButtonData[] | null;
}

function resolveImageSrc(img?: PromoImageData | null) {
  if (!img) return undefined;
  return img.image_type === 'file' ? (img.image?.url ?? undefined) : (img.image_url ?? undefined);
}

function resolveButtons(buttons?: PromoButtonData[] | null) {
  if (!buttons?.length) return undefined;
  return buttons.flatMap((b) => {
    if (!b.button?.link?.title && !b.button?.link?.url) return [];
    return [{
      label: b.button.link?.title ?? undefined,
      href: b.button.link?.url ?? undefined,
      target: b.button.link?.target ?? undefined,
      variant: (b.button.style && b.button.style !== 'custom' ? b.button.style : undefined) as any,
      size: b.button.size as any,
      outline: b.button.outline,
    }];
  });
}

export async function PromoBlock({ block }: { block: EditorBlock }) {
  const attrs = parseBlockAttributes(block) as { data?: PromoBlockData; className?: string };
  const data: PromoBlockData = attrs?.data ?? {};

  if (!data.promo_1_title && !data.promo_1_image && !data.promo_1_text) {
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />;
  }

  const className = cx(styles, 'block-promo', attrs.className);

  const promo1Src = resolveImageSrc(data.promo_1_image);
  const promo2Src = resolveImageSrc(data.promo_2_image);
  const showPromo2 = data.promo_count === '2' && (data.promo_2_title || promo2Src || data.promo_2_text);

  return (
    <div className={className}>
      <Promo
        container={data.include_container && !data.full_width}
        containerFluid={data.full_width}
        containerBreakpoint={data.container_breakpoint?.breakpoint ?? undefined}
        maxWidthFluidContainer={data.max_width_fluid_container}
        promo1={{
          image: promo1Src
            ? { src: promo1Src, alt: data.promo_1_image?.image?.alt ?? '', loading: 'lazy' as const }
            : undefined,
          title: data.promo_1_title ?? undefined,
          text: data.promo_1_text ?? undefined,
          buttonGroup: resolveButtons(data.promo_1_buttons),
        }}
        promo2={showPromo2 ? {
          image: promo2Src
            ? { src: promo2Src, alt: data.promo_2_image?.image?.alt ?? '', loading: 'lazy' as const }
            : undefined,
          title: data.promo_2_title ?? undefined,
          text: data.promo_2_text ?? undefined,
          buttonGroup: resolveButtons(data.promo_2_buttons),
        } : undefined}
      />
    </div>
  );
}

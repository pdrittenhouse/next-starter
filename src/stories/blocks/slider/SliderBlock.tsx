import { FlickityCarousel } from '@/stories/molecules/flickity-carousel/FlickityCarousel';
import { SlickCarousel } from '@/stories/molecules/slick-carousel/SlickCarousel';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './slider.module.scss';

interface SliderBlockData {
  slider?: 'bootstrap' | 'flickity' | 'slick' | null;
  equal_height_slides?: boolean;
  // Shared options
  arrows?: boolean;
  dots?: boolean;
  fade?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  autoplay_speed?: number | null;
  pause_on_hover?: boolean;
  initial_slide?: number | null;
  adaptive_height?: boolean;
  as_nav_for?: string | null;
  right_to_left?: boolean;
  // Flickity-specific
  draggable?: boolean;
  free_scroll?: boolean;
  group_cells?: boolean;
  full_screen?: boolean;
  cell_selector?: string | null;
  set_gallery_size?: boolean;
  cell_align?: 'left' | 'center' | 'right' | null;
  contain?: boolean;
  drag_threshold?: number | null;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | null;
  // Slick-specific
  swipe?: boolean;
  keyboard?: boolean;
  slides_to_show?: number | null;
  slides_to_scroll?: number | null;
}

interface SliderBlockProps {
  block: EditorBlock;
}

export async function SliderBlock({ block }: SliderBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: SliderBlockData; className?: string };
  const data: SliderBlockData = attrs?.data ?? {};

  const rawInner = (block as unknown as Record<string, unknown>).innerBlocks;
  const innerBlocks = Array.isArray(rawInner) ? (rawInner as EditorBlock[]) : [];

  const blockClasses = [
    attrs.className,
    'block-slider',
    data.equal_height_slides ? 'equal-height-slides' : null,
  ]
    .filter(Boolean)
    .join(' ');

  // Each inner slide block becomes a .carousel-cell div
  const slides = innerBlocks.map((b, i) => (
    <div
      key={i}
      className="carousel-cell"
      dangerouslySetInnerHTML={{ __html: b.renderedHtml ?? '' }}
    />
  ));

  if (data.slider === 'flickity') {
    return (
      <FlickityCarousel
        slides={slides}
        className={blockClasses || undefined}
        draggable={data.draggable}
        freeScroll={data.free_scroll}
        wrapAround={data.loop}
        autoPlay={
          data.autoplay && data.autoplay_speed ? data.autoplay_speed : data.autoplay
        }
        pauseAutoPlayOnHover={data.pause_on_hover}
        prevNextButtons={data.arrows}
        pageDots={data.dots}
        fade={data.fade}
        groupCells={data.group_cells}
        fullscreen={data.full_screen}
        adaptiveHeight={data.adaptive_height}
        asNavFor={data.as_nav_for ?? undefined}
        cellSelector={data.cell_selector ?? undefined}
        initialIndex={data.initial_slide ?? undefined}
        setGallerySize={data.set_gallery_size}
        cellAlign={data.cell_align ?? undefined}
        contain={data.contain}
        rightToLeft={data.right_to_left}
        dragThreshold={data.drag_threshold ?? undefined}
        columns={data.columns ?? undefined}
      />
    );
  }

  if (data.slider === 'slick') {
    return (
      <SlickCarousel
        slides={slides}
        className={blockClasses || undefined}
        arrows={data.arrows}
        dots={data.dots}
        fade={data.fade}
        infinite={data.loop}
        autoplay={data.autoplay}
        autoplaySpeed={data.autoplay_speed ?? undefined}
        adaptiveHeight={data.adaptive_height}
        asNavFor={data.as_nav_for ?? undefined}
        initialSlide={data.initial_slide ?? undefined}
        slidesToShow={data.slides_to_show ?? undefined}
        slidesToScroll={data.slides_to_scroll ?? undefined}
        swipe={data.swipe}
        rtl={data.right_to_left}
        pauseOnHover={data.pause_on_hover}
      />
    );
  }

  // Bootstrap carousel — Carousel molecule expects ImageSlide objects, not arbitrary JSX;
  // fall back to WordPress-rendered HTML for the bootstrap slider type.
  if (!block.renderedHtml) return null;
  return (
    <div
      className={blockClasses || undefined}
      dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
    />
  );
}

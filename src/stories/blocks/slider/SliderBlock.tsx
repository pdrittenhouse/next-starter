import type React from 'react';
import { FlickityCarousel } from '@/stories/patterns/molecules/flickity-carousel/FlickityCarousel';
import { SlickCarousel } from '@/stories/patterns/molecules/slick-carousel/SlickCarousel';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './slider.module.scss';
import { cx } from '@/lib/cx';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';

interface SliderBlockData extends Pick<AcfBlockStyleData, 'width' | 'padding' | 'margin'> {
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
  // Flickity additional
  selected_attraction?: number | null;
  friction?: number | null;
  free_scroll_friction?: number | null;
  percent_position?: boolean;
  arrow_shape?: string | null;
  show_custom_controls?: boolean;
  // Slick additional
  rows?: number | null;
  slides_per_row?: number | null;
  center_mode?: boolean;
  center_padding?: { value?: number | null; unit?: string | null };
  vertical?: boolean;
  vertical_swiping?: boolean;
  focus_on_select?: boolean;
  pause_on_focus?: boolean;
  pause_on_dots_hover?: boolean;
  swipe_to_slide?: boolean;
  touch_move?: boolean;
  speed?: number | null;
  variable_width?: boolean;
  edge_friction?: number | null;
  easing?: string | null;
  css_ease?: string | null;
  // Slick responsive breakpoints (ACF repeater)
  responsive?: Array<{
    breakpoint?: number | null;
    settings?: Array<{
      setting?: string | null;
      value_type?: string | null;
      value?: string | number | null;
    }>;
  }>;
}

interface SliderBlockProps {
  block: EditorBlock;
}

function buildSlickResponsive(
  responsive: SliderBlockData['responsive'],
): Array<{ breakpoint: number; settings: Record<string, unknown> }> {
  if (!responsive?.length) return [];
  return responsive
    .filter(item => item.breakpoint != null)
    .map(item => {
      const settings: Record<string, unknown> = {};
      for (const s of item.settings ?? []) {
        if (!s.setting) continue;
        settings[s.setting] = s.value_type === 'int' ? Number(s.value) : s.value;
      }
      return { breakpoint: item.breakpoint!, settings };
    });
}

export async function SliderBlock({ block }: SliderBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: SliderBlockData; className?: string };
  const data: SliderBlockData = attrs?.data ?? {};

  const rawInner = (block as unknown as Record<string, unknown>).innerBlocks;
  const innerBlocks = Array.isArray(rawInner) ? (rawInner as EditorBlock[]) : [];

  const { style: wrapperStyle } = buildAcfBlockStyle({
    width: data.width,
    padding: data.padding,
    margin: data.margin,
  });

  const blockClasses = cx(
    styles,
    attrs.className,
    'block-slider',
    data.equal_height_slides ? 'equal-height-slides' : null,
  );

  // Each inner slide block becomes a .carousel-cell div
  const slides = innerBlocks.map((b, i) => (
    <div
      key={i}
      className={cx(styles, 'carousel-cell')}
      dangerouslySetInnerHTML={{ __html: b.renderedHtml ?? '' }}
    />
  ));

  let carousel: React.ReactElement | null = null;

  if (data.slider === 'flickity') {
    carousel = (
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
        selectedAttraction={data.selected_attraction ?? undefined}
        friction={data.friction ?? undefined}
        freeScrollFriction={data.free_scroll_friction ?? undefined}
        percentPosition={data.percent_position}
        showControls={data.show_custom_controls}
      />
    );
  } else if (data.slider === 'slick') {
    carousel = (
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
        rows={data.rows ?? undefined}
        slidesPerRow={data.slides_per_row ?? undefined}
        centerMode={data.center_mode}
        centerPadding={data.center_padding?.value != null ? `${data.center_padding.value}${data.center_padding.unit ?? 'px'}` : undefined}
        vertical={data.vertical}
        verticalSwiping={data.vertical_swiping}
        focusOnSelect={data.focus_on_select}
        pauseOnFocus={data.pause_on_focus}
        pauseOnDotsHover={data.pause_on_dots_hover}
        swipeToSlide={data.swipe_to_slide}
        touchMove={data.touch_move}
        speed={data.speed ?? undefined}
        variableWidth={data.variable_width}
        edgeFriction={data.edge_friction ?? undefined}
        easing={data.easing ?? undefined}
        cssEase={data.css_ease ?? undefined}
        customControls={data.show_custom_controls}
        responsive={buildSlickResponsive(data.responsive)}
      />
    );
  } else if (block.renderedHtml) {
    // Bootstrap carousel — Carousel molecule expects ImageSlide objects, not arbitrary JSX;
    // fall back to WordPress-rendered HTML for the bootstrap slider type.
    carousel = (
      <div
        className={blockClasses || undefined}
        dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
      />
    );
  }

  if (!carousel) return null;
  if (wrapperStyle) return <div style={wrapperStyle}>{carousel}</div>;
  return carousel;
}

import type React from 'react';
import { SlickCarousel } from '@/stories/molecules/slick-carousel/SlickCarousel';
import { FlickityCarousel } from '@/stories/molecules/flickity-carousel/FlickityCarousel';
import { Image } from '@/stories/atoms/image/Image';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './logo-slider.module.scss';
import { cx } from '@/lib/cx';

interface LogoSlide {
  logo?: {
    url?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  width?: number | null;
  height?: number | null;
  link?: string | null;
  open_in_new_tab?: boolean;
}

interface LogoSliderBlockData {
  logos?: LogoSlide[] | null;
  slider?: 'slick' | 'flickity' | null;
  logo_count?: number | null;
  scroll_count?: number | null;
  grayscale_images?: boolean;
  draggable?: boolean;
  free_scroll?: boolean;
  loop?: boolean;
  auto_play?: boolean;
  autoplay_speed?: number | null;
  pause_on_hover?: boolean;
  fade?: boolean;
  adaptive_height?: boolean;
  show_arrows?: boolean;
  show_dot_nav?: boolean;
  speed?: number | null;
  center_mode?: boolean;
  variable_width?: boolean;
  vertical?: boolean;
  vertical_swiping?: boolean;
  alignment?: string | null;
}

export async function LogoSliderBlock({ block }: { block: EditorBlock }) {
  const attrs = parseBlockAttributes(block) as { data?: LogoSliderBlockData; className?: string };
  const data: LogoSliderBlockData = attrs?.data ?? {};

  if (!data.logos?.length) {
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />;
  }

  const className = cx(styles, 'block-logo-slider', attrs.className);

  const slides = data.logos.map((item, i) => {
    if (!item.logo?.url) return null;
    const img = (
      <Image
        src={item.logo.url}
        alt={item.logo.alt ?? ''}
        width={item.width ?? item.logo.width ?? undefined}
        height={item.height ?? item.logo.height ?? undefined}
        loading="lazy"
        className="logo"
      />
    );
    return item.link ? (
      <a key={i} href={item.link} target={item.open_in_new_tab ? '_blank' : undefined} rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}>
        {img}
      </a>
    ) : <span key={i}>{img}</span>;
  }).filter(Boolean) as React.ReactNode[];

  if (data.slider === 'slick') {
    return (
      <div className={className} data-pattern="timberland/logo-slider">
        <SlickCarousel
          slides={slides}
          slidesToShow={data.logo_count ?? 1}
          slidesToScroll={data.scroll_count ?? 1}
          draggable={data.draggable}
          infinite={data.loop}
          autoplay={data.auto_play}
          autoplaySpeed={data.autoplay_speed ?? undefined}
          arrows={data.show_arrows}
          dots={data.show_dot_nav}
          fade={data.fade}
          adaptiveHeight={data.adaptive_height}
          speed={data.speed ?? undefined}
          centerMode={data.center_mode}
          variableWidth={data.variable_width}
          vertical={data.vertical}
          verticalSwiping={data.vertical_swiping}
        />
      </div>
    );
  }

  const grayscaleClass = data.grayscale_images ? 'bw-imgs' : null;
  const countClass = data.logo_count ? `count-${data.logo_count}` : null;

  return (
    <div className={className} data-pattern="timberland/logo-slider">
      <FlickityCarousel
        slides={slides}
        className={[countClass, grayscaleClass, 'equal-height-slides'].filter(Boolean).join(' ') || undefined}
        draggable={data.draggable}
        freeScroll={data.free_scroll}
        wrapAround={data.loop}
        autoPlay={data.auto_play && data.autoplay_speed ? data.autoplay_speed : data.auto_play}
        pauseAutoPlayOnHover={data.pause_on_hover}
        fade={data.fade}
        adaptiveHeight={data.adaptive_height}
        cellAlign={(data.alignment as 'left' | 'center' | 'right' | undefined) ?? 'center'}
        contain
        prevNextButtons={data.show_arrows}
        pageDots={data.show_dot_nav}
        percentPosition
      />
    </div>
  );
}


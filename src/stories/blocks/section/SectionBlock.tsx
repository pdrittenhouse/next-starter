import type { CSSProperties, ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './section.module.scss';
import { cx } from '@/lib/cx';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';
import { getContentWrapperOptions } from '@/lib/wp/utils/getContentWrapperOptions';

type BgColor = AcfBlockStyleData['bg_color'];

/**
 * The section block's margin field uses a shallower nesting than the standard
 * margin clone used by other blocks (fields.margin.top / fields.margin.bottom
 * rather than fields.margin.margin.top / fields.margin.margin.bottom), and only
 * exposes top + bottom.
 */
interface SectionMargin {
  top?: { top?: number | null; auto?: boolean };
  bottom?: { bottom?: number | null; auto?: boolean };
}

interface SectionBlockData {
  section_layout?: { section_layout?: string | null };
  section_bg_color?: AcfBlockStyleData['bg_color'];
  section_border?: AcfBlockStyleData['border'];
  section_border_radius?: AcfBlockStyleData['border_radius'];
  section_box_shadow?: AcfBlockStyleData['box_shadow'];
  height?: AcfBlockStyleData['height'];
  padding?: AcfBlockStyleData['padding'];
  margin?: SectionMargin | null;
  color?: string | null;
  theme_color?: string | null;
  custom_color?: string | null;
  container?: boolean;
  full_width?: boolean;
  container_breakpoint?: { breakpoint?: string | null };
  max_width_fluid_container?: boolean;
  container_bg_color?: BgColor;
  include_overlay?: boolean;
  overlay_bg?: { bg_color?: string | null; bg_theme_color?: string | null; bg_custom_color?: string | null };
  gradient_overlay?: boolean;
  overlay_opacity?: number | null;
  col_gap?: { value?: number | string | null; unit?: string | null };
  vertical_alignment?: {
    vert_align?: Array<{ breakpoint?: string | null; alignment?: string | null }>;
  };
  bg_image?: {
    bg_image_type?: 'file' | 'url' | null;
    bg_image?: { url?: string | null } | null;
    bg_image_url?: string | null;
    bg_horizontal_position?: string | null;
    custom_bg_horizontal_position?: string | null;
    bg_vertical_position?: string | null;
    custom_bg_vertical_position?: string | null;
    bg_size?: string | null;
    custom_bg_size?: string | null;
    bg_repeat?: string | null;
    bg_attachment?: string | null;
  };
  bg_video?: boolean;
  bg_mp4?: string | null;
  bg_webm?: string | null;
  bg_ogv?: string | null;
  jumbotron_bg_image?: {
    bg_image_type?: 'file' | 'url' | null;
    bg_image?: { url?: string | null } | null;
    bg_image_url?: string | null;
  };
  bg_loop?: boolean;
  bg_muted?: boolean;
  bg_autoplay?: boolean;
  bg_auto_resize?: boolean;
  bg_horizontal_position?: number | null;
  bg_vertical_position?: number | null;
  jumbotron_bg_color?: {
    bg_color?: string | null;
    bg_theme_color?: string | null;
    bg_custom_color?: string | null;
  };
  bg_video_classes?: string | null;
}

interface SectionBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

function resolveSectionMargin(margin: SectionMargin | null | undefined): CSSProperties {
  if (!margin) return {};
  const style: CSSProperties = {};
  if (margin.top?.auto) style.marginTop = 'auto';
  else if (margin.top?.top != null && margin.top.top >= 0) style.marginTop = `${margin.top.top}px`;
  if (margin.bottom?.auto) style.marginBottom = 'auto';
  else if (margin.bottom?.bottom != null && margin.bottom.bottom >= 0) style.marginBottom = `${margin.bottom.bottom}px`;
  return style;
}

// Mirrors Twig section.twig container_classes logic
function buildContainerClasses(data: SectionBlockData): string {
  const bp = data.container_breakpoint?.breakpoint ? `-${data.container_breakpoint.breakpoint}` : '';
  const base = data.full_width ? 'container-fluid' : `container${bp}`;
  const maxWidth = data.max_width_fluid_container ? 'max-width-fluid-container' : null;
  const bgCls =
    data.container_bg_color?.bg_color === 'palette' && data.container_bg_color?.bg_theme_color
      ? `bg-${data.container_bg_color.bg_theme_color}`
      : null;
  return [base, maxWidth, bgCls].filter(Boolean).join(' ');
}

function buildOverlayStyle(
  data: SectionBlockData,
  blockStyleGradient: string | null,
): CSSProperties {
  const style: CSSProperties = {};
  if (data.overlay_bg?.bg_color === 'custom' && data.overlay_bg?.bg_custom_color) {
    style.backgroundColor = data.overlay_bg.bg_custom_color;
  }
  if (data.gradient_overlay === true && blockStyleGradient) {
    style.background = blockStyleGradient;
  }
  if (data.overlay_opacity != null) {
    style.opacity = data.overlay_opacity;
  }
  return style;
}

function buildBgImageStyle(
  bgImage: SectionBlockData['bg_image'],
  isBgVideo: boolean,
): CSSProperties {
  if (isBgVideo || !bgImage) return {};
  const style: CSSProperties = {};
  const url =
    bgImage.bg_image_type === 'file' && bgImage.bg_image?.url
      ? bgImage.bg_image.url
      : bgImage.bg_image_type === 'url' && bgImage.bg_image_url
        ? bgImage.bg_image_url
        : null;
  if (url) style.backgroundImage = `url('${url}')`;
  const size = bgImage.bg_size === 'custom' && bgImage.custom_bg_size
    ? bgImage.custom_bg_size
    : bgImage.bg_size ?? undefined;
  if (size) style.backgroundSize = size;
  const hPos = bgImage.bg_horizontal_position === 'custom' && bgImage.custom_bg_horizontal_position
    ? bgImage.custom_bg_horizontal_position
    : bgImage.bg_horizontal_position ?? undefined;
  const vPos = bgImage.bg_vertical_position === 'custom' && bgImage.custom_bg_vertical_position
    ? bgImage.custom_bg_vertical_position
    : bgImage.bg_vertical_position ?? undefined;
  if (hPos || vPos) style.backgroundPosition = `${hPos ?? ''} ${vPos ?? ''}`.trim();
  if (bgImage.bg_repeat) style.backgroundRepeat = bgImage.bg_repeat;
  if (bgImage.bg_attachment) style.backgroundAttachment = bgImage.bg_attachment;
  return style;
}

function buildBgVideoProps(data: SectionBlockData): Record<string, string> {
  if (!data.bg_video) return {};
  const props: Record<string, string> = {};
  if (data.bg_mp4) props['data-mp4'] = data.bg_mp4;
  if (data.bg_webm) props['data-webm'] = data.bg_webm;
  if (data.bg_ogv) props['data-ogv'] = data.bg_ogv;
  const poster =
    data.jumbotron_bg_image?.bg_image_type === 'file' && data.jumbotron_bg_image?.bg_image?.url
      ? data.jumbotron_bg_image.bg_image.url
      : data.jumbotron_bg_image?.bg_image_type === 'url' && data.jumbotron_bg_image?.bg_image_url
        ? data.jumbotron_bg_image.bg_image_url
        : null;
  if (poster) props['data-poster'] = poster;
  props['data-loop'] = data.bg_loop === true ? 'true' : 'false';
  props['data-muted'] = data.bg_muted === true ? 'true' : 'false';
  props['data-autoplay'] = data.bg_autoplay === true ? 'true' : 'false';
  props['data-resizing'] = data.bg_auto_resize === true ? 'true' : 'false';
  const hpos = data.bg_horizontal_position ?? 0;
  const vpos = data.bg_vertical_position ?? 0;
  props['data-position'] = `${hpos}% ${vpos}%`;
  const bgColor =
    data.jumbotron_bg_color?.bg_color === 'custom' && data.jumbotron_bg_color.bg_custom_color
      ? data.jumbotron_bg_color.bg_custom_color
      : data.jumbotron_bg_color?.bg_color === 'palette' && data.jumbotron_bg_color.bg_theme_color
        ? `var(--${data.jumbotron_bg_color.bg_theme_color})`
        : 'transparent';
  props['data-bg-color'] = bgColor;
  if (data.bg_video_classes) props['data-video-classes'] = data.bg_video_classes;
  return props;
}

function buildVerticalAlignmentClasses(va: SectionBlockData['vertical_alignment']): string[] {
  if (!va?.vert_align?.length) return [];
  return va.vert_align
    .filter(item => item.alignment)
    .map(item => {
      const bp = item.breakpoint ? `-${item.breakpoint}` : '';
      return `align-items${bp}-${item.alignment}`;
    });
}

export async function SectionBlock({ block, children }: SectionBlockProps) {
  const attrs = parseBlockAttributes(block) as {
    data?: SectionBlockData;
    className?: string;
    gradient?: string | null;
    style?: { color?: { gradient?: string | null } };
  };
  const data: SectionBlockData = attrs?.data ?? {};
  const blockGradient = attrs.gradient ?? null;
  const blockStyleGradient = attrs.style?.color?.gradient ?? null;

  const layoutMod =
    data.section_layout?.section_layout && data.section_layout.section_layout !== 'default'
      ? `section-layout-${data.section_layout.section_layout}`
      : null;

  // Remap section-specific field names to standard AcfBlockStyleData shape
  const { style: acfStyle, bgClass: acfBgClass } = buildAcfBlockStyle({
    height:        data.height,
    padding:       data.padding,
    border:        data.section_border,
    border_radius: data.section_border_radius,
    box_shadow:    data.section_box_shadow,
    bg_color:      data.section_bg_color,
  });
  const bgClass = data.bg_video ? null : acfBgClass;

  // Section uses a shallower margin structure (top/bottom only, no inner margin wrapper)
  const marginStyle = resolveSectionMargin(data.margin);

  const textClass =
    data.color === 'palette' && data.theme_color ? `text-${data.theme_color}` : null;

  const bgImageStyle = buildBgImageStyle(data.bg_image, data.bg_video ?? false);
  const bgVideoProps = buildBgVideoProps(data);
  const vaClasses = buildVerticalAlignmentClasses(data.vertical_alignment);
  const colGapStyle: CSSProperties = data.col_gap?.value != null
    ? { columnGap: `${data.col_gap.value}${data.col_gap.unit ?? ''}` }
    : {};

  const sectionClasses = cx(styles, 'block-section', layoutMod, bgClass, textClass, attrs.className);

  const sectionStyle: CSSProperties = {
    ...acfStyle,
    ...marginStyle,
    ...bgImageStyle,
    ...(data.color === 'custom' && data.custom_color ? { color: data.custom_color } : {}),
  };

  const innerBlocks: EditorBlock[] = block.innerBlocks ?? [];
  const fallbackHtml = block.renderedHtml ?? '';

  // The container div renders when either the global "Disable Content Containers" option
  // is on, OR the per-post remove_content_container field overrides it for this page.
  // Mirrors framework: fields.container == true AND (options.remove_content_containers
  // OR block_post.custom['remove_content_container'])
  const { removeContentContainers: globalRCC } = await getContentWrapperOptions();
  const perPostRCC = (block as any)._context?.removeContentContainerPerPost === true;
  const removeContentContainers = (globalRCC === true) || perPostRCC;
  const showContainer = data.container === true && removeContentContainers;

  // When this section adds a container, render inner blocks directly with
  // parentContainerSet context so nested RowBlocks skip their own container.
  // Also preserve perPostRCC so deeply-nested blocks still self-supply containers.
  // Dynamic import breaks the SectionBlock → BlockRenderer → BLOCK_MAP →
  // SectionBlock circular dependency at module-init time.
  let innerContent: ReactNode;
  if (showContainer && innerBlocks.length > 0) {
    const { BlockRenderer } = await import('@/stories/templates/partials/block-renderer');
    innerContent = <BlockRenderer blocks={innerBlocks} context={{ parentContainerSet: true, removeContentContainerPerPost: perPostRCC }} />;
  } else {
    innerContent = children ?? (fallbackHtml ? <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} /> : null);
  }

  if (!innerContent) return null;

  const containerClasses = showContainer ? buildContainerClasses(data) : null;

  const overlayBgClass =
    data.overlay_bg?.bg_color === 'palette' && data.overlay_bg?.bg_theme_color
      ? `bg-${data.overlay_bg.bg_theme_color}`
      : null;
  const overlayGradientClass =
    data.gradient_overlay === true && blockGradient ? `gradient-${blockGradient}` : null;
  const overlayStyle = buildOverlayStyle(data, blockStyleGradient);

  const Tag = (data.section_element === 'div' || data.section_element === 'aside')
    ? data.section_element
    : 'section';

  return (
    <Tag
      className={sectionClasses || undefined}
      style={Object.keys(sectionStyle).length > 0 ? sectionStyle : undefined}
      {...bgVideoProps}
    >
      {data.include_overlay && (
        <span
          className={cx(styles, 'overlay', overlayBgClass, overlayGradientClass)}
          style={Object.keys(overlayStyle).length > 0 ? overlayStyle : undefined}
        />
      )}
      <div
        className={cx(styles, 'block-section--wrapper', ...vaClasses)}
        style={Object.keys(colGapStyle).length > 0 ? colGapStyle : undefined}
      >
        {containerClasses ? (
          <div className={containerClasses}>
            {innerContent}
          </div>
        ) : innerContent}
      </div>
    </Tag>
  );
}

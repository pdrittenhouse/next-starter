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
  const { style: acfStyle, bgClass } = buildAcfBlockStyle({
    height:        data.height,
    padding:       data.padding,
    border:        data.section_border,
    border_radius: data.section_border_radius,
    box_shadow:    data.section_box_shadow,
    bg_color:      data.section_bg_color,
  });

  // Section uses a shallower margin structure (top/bottom only, no inner margin wrapper)
  const marginStyle = resolveSectionMargin(data.margin);

  const textClass =
    data.color === 'palette' && data.theme_color ? `text-${data.theme_color}` : null;

  const sectionClasses = cx(styles, 'block-section', layoutMod, bgClass, textClass, attrs.className);

  const sectionStyle: CSSProperties = {
    ...acfStyle,
    ...marginStyle,
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

  return (
    <section
      className={sectionClasses || undefined}
      style={Object.keys(sectionStyle).length > 0 ? sectionStyle : undefined}
    >
      {data.include_overlay && (
        <span
          className={cx(styles, 'overlay', overlayBgClass, overlayGradientClass)}
          style={Object.keys(overlayStyle).length > 0 ? overlayStyle : undefined}
        />
      )}
      <div className={cx(styles, 'block-section--wrapper')}>
        {containerClasses ? (
          <div className={containerClasses}>
            {innerContent}
          </div>
        ) : innerContent}
      </div>
    </section>
  );
}

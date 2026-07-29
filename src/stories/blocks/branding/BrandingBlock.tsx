import { Branding } from '@/stories/molecules/branding/Branding';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';
import styles from './branding.module.scss';

interface BrandingBlockData {
  use_site_logo?: boolean;
  branding_image?: {
    url?: string | null;
  };
  branding_link?: string | null;
  open_in_new_window?: boolean;
  branding_name?: string | null;
  branding_slogan?: string | null;
  hide_branding_name?: boolean;
  hide_branding_slogan?: boolean;
  svg_options?: {
    use_original_color?: boolean;
  };
  non_svg_options?: {
    use_bg_image?: boolean;
    branding_height?: number | null;
    branding_width?: number | null;
  };
  alignment?: {
    text_align?: string | null;
  };
  color?: {
    color?: string | null;
    theme_color?: string | null;
    custom_color?: string | null;
  };
  branding_wrapper_width?: AcfBlockStyleData['width'];
  branding_wrapper_height?: AcfBlockStyleData['height'];
  margin?: AcfBlockStyleData['margin'];
}

interface BrandingBlockProps {
  block: EditorBlock;
}

export async function BrandingBlock({ block }: BrandingBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: BrandingBlockData; className?: string };
  const data: BrandingBlockData = attrs?.data ?? {};

  const brandUrl = data.branding_image?.url ?? null;

  const { style: wrapperStyle } = buildAcfBlockStyle({
    width:  data.branding_wrapper_width,
    height: data.branding_wrapper_height,
    margin: data.margin,
  });

  if (!brandUrl && !data.branding_name && !data.branding_slogan) {
    if (!block.renderedHtml) return null;
    return <div style={wrapperStyle} dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
  }

  // Mirror Twig text-align logic (left → text-start, right → text-end, else text-{value})
  const textAlignClass = data.alignment?.text_align
    ? data.alignment.text_align === 'left'
      ? 'text-start'
      : data.alignment.text_align === 'right'
      ? 'text-end'
      : `text-${data.alignment.text_align}`
    : null;

  const otherClasses = ['block-branding', textAlignClass, attrs.className]
    .filter(Boolean)
    .join(' ');

  // Resolve logo variant: SVG inline (fetched) → bg-image → img
  let logoSvgInline: string | undefined;
  let logoBgImgSrc: string | undefined;
  let logoImgSrc: string | undefined;

  if (brandUrl?.endsWith('.svg')) {
    try {
      const res = await fetch(brandUrl);
      logoSvgInline = res.ok ? await res.text() : undefined;
    } catch {
      // fall through to img
    }
    if (!logoSvgInline) logoImgSrc = brandUrl;
  } else if (brandUrl && data.non_svg_options?.use_bg_image) {
    logoBgImgSrc = brandUrl;
  } else if (brandUrl) {
    logoImgSrc = brandUrl;
  }

  const brandingEl = (
    <Branding
      url={data.branding_link ?? undefined}
      target={data.open_in_new_window ? '_blank' : undefined}
      logoSvgInline={logoSvgInline}
      logoBgImgSrc={logoBgImgSrc}
      logoImgSrc={logoImgSrc}
      width={data.non_svg_options?.branding_width ?? undefined}
      height={data.non_svg_options?.branding_height ?? undefined}
      siteName={data.branding_name ?? undefined}
      hideSiteName={data.hide_branding_name}
      siteSlogan={data.branding_slogan ?? undefined}
      hideSiteSlogan={data.hide_branding_slogan}
      colorOriginal={data.svg_options?.use_original_color}
      otherClasses={otherClasses || undefined}
    />
  );

  if (wrapperStyle) return <div style={wrapperStyle}>{brandingEl}</div>;
  return brandingEl;
}

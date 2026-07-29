import { Blockquote } from '@/stories/molecules/blockquote/Blockquote';
import type { CitationImageProps } from '@/stories/molecules/blockquote/Blockquote';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './quote.module.scss';

interface QuoteBlockData {
  quote?: string | null;
  citation?: string | null;
  citation_image?: {
    image_type?: string | null;
    image?: {
      url?: string | null;
      alt?: string | null;
      sizes?: Record<string, string> | null;
    } | null;
    image_url?: string | null;
  } | null;
  citation_position?: 'before' | 'after' | null;
  layout?: string | null;
}

interface QuoteBlockProps {
  block: EditorBlock;
}

export async function QuoteBlock({ block }: QuoteBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: QuoteBlockData; className?: string; align?: string };
  const data: QuoteBlockData = attrs?.data ?? {};

  if (!data.quote) {
    if (!block.renderedHtml) return null;
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
  }

  // Build citation image from ACF file or URL image type
  let citationImage: CitationImageProps | undefined;
  const imageType = data.citation_image?.image_type ?? 'file';
  const imageSrc =
    imageType === 'file'
      ? (data.citation_image?.image?.sizes?.['thumbnail-small'] ?? data.citation_image?.image?.url)
      : data.citation_image?.image_url;

  if (imageSrc) {
    citationImage = {
      src: imageSrc,
      alt: data.citation_image?.image?.alt ?? '',
      loading: 'lazy',
    };
  }

  // Mirror Twig blockquote_classes: 'block-quote' + layout variant + block className
  const layoutClass = data.layout && data.layout !== 'default' ? data.layout : null;
  const alignClass = attrs.align ? `align-${attrs.align}` : null;
  const className = ['block-quote', layoutClass, alignClass, attrs.className].filter(Boolean).join(' ');

  return (
    <Blockquote
      quote={data.quote ?? undefined}
      citation={data.citation ?? undefined}
      citationImage={citationImage}
      citationPosition={data.citation_position ?? 'after'}
      className={className}
    />
  );
}

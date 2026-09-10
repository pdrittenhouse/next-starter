import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_MEDIA_ITEM_BY_ID } from '@/lib/wp/queries';
import { Image } from '@/stories/patterns/atoms/image/Image';
import type { EditorBlock } from '@/types/blocks';

/**
 * `core/image` — the one core block worth giving a component.
 *
 * Every other core block is fine as WordPress's own server-rendered markup:
 * a paragraph, heading, quote or list comes back correct, carries the right
 * `wp-block-*` classes, and reimplementing ~90 core blocks across two
 * frameworks would buy nothing. This one is different because the fallback
 * markup was measurably the worst thing on the page:
 *
 *     <figure class="wp-block-image size-full"><img
 *       src="http://wp/wp-content/uploads/…/8f71a687….png" alt=""
 *       class="wp-image-3334"/></figure>
 *
 * A 1.4 MB full-size PNG — 22% of the page's total bytes and almost certainly
 * the LCP element — with no `srcset`, no `width`/`height` (so it also shifts
 * layout) and no `loading`. Routing it through `next/image` gets WebP, a real
 * srcset and intrinsic dimensions. Measured on astro-starter's equivalent:
 * 1,472 kB to 170 kB.
 *
 * ─── Where the data comes from ───────────────────────────────────────────────
 *
 * `attributesJSON` is thin: `{"id":3334,"sizeSlug":"full","linkDestination":"none"}`.
 * No URL, no alt, no dimensions. But the attachment id is enough — the same
 * `GET_MEDIA_ITEM_BY_ID` query the ACF image block uses returns sourceUrl,
 * altText and mediaDetails.width/height.
 *
 * The caption is read from `renderedHtml`'s `<figcaption>` rather than from the
 * attachment, because a block caption can differ from the attachment's own and
 * the block's is what the editor actually typed.
 *
 * Falls back to `renderedHtml` whenever anything is missing — no attributes, no
 * id, or a media lookup that comes back empty — so a broken lookup degrades to
 * exactly the previous behaviour rather than to a blank space.
 */

interface CoreImageBlockProps {
  block: EditorBlock;
}

interface CoreImageAttrs {
  id?: number;
  sizeSlug?: string;
  linkDestination?: string;
  href?: string;
  linkTarget?: string;
  rel?: string;
  align?: string;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export async function CoreImageBlock({ block }: CoreImageBlockProps) {
  let attrs: CoreImageAttrs = {};
  try {
    attrs = block.attributesJSON ? (JSON.parse(block.attributesJSON) as CoreImageAttrs) : {};
  } catch {
    // Malformed attributes — fall through to renderedHtml below.
  }

  const rendered = block.renderedHtml ?? '';

  /** The editor's caption, if any. Left as HTML; it is WordPress-escaped already. */
  const captionMatch = rendered.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
  const caption = captionMatch?.[1]?.trim() || null;

  let src: string | null = null;
  let alt = attrs.alt ?? '';
  let width: number | undefined = attrs.width;
  let height: number | undefined = attrs.height;

  if (attrs.id) {
    const { data } = await fetchGraphQL<{
      mediaItem: {
        sourceUrl?: string;
        altText?: string;
        mediaDetails?: { width?: number; height?: number };
      } | null;
    }>(
      print(GET_MEDIA_ITEM_BY_ID),
      { id: String(attrs.id) },
      { next: { revalidate: 60 } },
    ).catch(() => ({ data: null }));

    const media = data?.mediaItem;
    if (media?.sourceUrl) {
      src = media.sourceUrl;
      alt = alt || media.altText || '';
      width = width ?? media.mediaDetails?.width;
      height = height ?? media.mediaDetails?.height;
    }
  }

  // WordPress's own classes, so the bundled wp-block CSS still applies.
  const figureClasses = [
    'wp-block-image',
    attrs.sizeSlug ? `size-${attrs.sizeSlug}` : null,
    attrs.align ? `align${attrs.align}` : null,
    attrs.className ?? null,
  ].filter(Boolean).join(' ');

  // core/image supports linking the image to its attachment page or a custom URL.
  const linkHref = attrs.linkDestination && attrs.linkDestination !== 'none'
    ? attrs.href ?? null
    : null;

  if (!src) {
    // No attributes, no id, or an empty media lookup — degrade to exactly the
    // previous behaviour rather than to a blank space.
    return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
  }

  const img = <Image src={src} alt={alt} width={width} height={height} loading="lazy" />;

  return (
    <figure className={figureClasses}>
      {linkHref ? (
        <a href={linkHref} target={attrs.linkTarget || undefined} rel={attrs.rel || undefined}>
          {img}
        </a>
      ) : img}
      {caption && (
        <figcaption
          className="wp-element-caption"
          dangerouslySetInnerHTML={{ __html: caption }}
        />
      )}
    </figure>
  );
}

import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_MEDIA_ITEM_BY_ID } from '@/lib/wp/queries';
import { CardGrid } from '@/stories/patterns/organisms/card-grid/CardGrid';
import type { CardProps, CardImageProps } from '@/stories/patterns/organisms/card-grid/CardGrid';
import type { ButtonProps, ButtonVariant } from '@/stories/patterns/atoms/button/Button';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { buildAcfBlockStyle, type AcfBlockStyleData } from '@/lib/wp/utils/buildAcfBlockStyle';
import styles from './card-grid.module.scss';
import { cx } from '@/lib/cx';

// ─── ACF field interfaces ──────────────────────────────────────────────────────

/**
 * Image sub-field group as stored by ACF inside a repeater row.
 * Mirrors the AcfCardImageField shape used in CardBlock.
 */
interface CardGridItemImageField {
  /** 'file' fetches from the media library; 'url' uses the stored URL directly. */
  image_type?: 'file' | 'url';
  /** Attachment ID when image_type === 'file'. */
  image?: number | string | null;
  image_url?: string | null;
}

/**
 * Button sub-field group stored inside each repeater item.
 * Mirrors the button group shape on the card block (CardBlockData.button).
 */
interface CardGridItemButtonField {
  /** Bootstrap variant name (e.g. 'primary', 'secondary'). */
  style?: string;
  size?: '' | 'sm' | 'lg';
  outline?: boolean;
  full_width?: boolean;
}

/**
 * One row of the `items` repeater field — represents a single card in the grid.
 *
 * The card-grid block uses InnerBlocks (acf/card) in the WordPress editor.
 * For headless delivery this ACF repeater is populated instead, mirroring the
 * same sub-set of fields that CardBlock (acf/card) exposes. When `items` is
 * absent or empty the block falls back to `block.renderedHtml` so the inner
 * blocks' server-rendered output is preserved.
 */
interface CardGridItemData {
  // ─── Content ────────────────────────────────────────────────────────────────
  card_title?: string | null;
  card_subtitle?: string | null;
  /** Rich HTML body content rendered inside .card-text. */
  card_text?: string | null;
  /** Text shown in .card-header above the image and body. */
  card_header?: string | null;
  /** Rich HTML rendered inside .card-footer-content. */
  card_footer?: string | null;
  /** Category label beside the icon. */
  card_label?: string | null;

  // ─── Image ──────────────────────────────────────────────────────────────────
  image?: CardGridItemImageField | null;
  image_position?: 'top' | 'bottom';
  image_overlay?: boolean;
  image_overlay_text?: string | null;

  // ─── Link ───────────────────────────────────────────────────────────────────
  /** ACF link field — url/title/target object. */
  card_link?: { url?: string; title?: string; target?: string } | null;
  /** Wrap the entire card in an anchor element. */
  card_linked?: boolean;

  // ─── Button ─────────────────────────────────────────────────────────────────
  /** Show a Button atom in the card body instead of a plain inline link. */
  show_button?: boolean;
  button?: CardGridItemButtonField | null;

  // ─── Appearance ─────────────────────────────────────────────────────────────
  /** Bootstrap contextual background color suffix (e.g. 'primary', 'light'). */
  card_background?: string | null;
  /** Bootstrap contextual border color suffix. */
  card_border?: string | null;
  no_border?: boolean;
  text_alignment?: 'start' | 'center' | 'end' | null;
  text_color?: string | null;
  /** Semantic element for the card root. Defaults to 'div'. */
  card_element?: 'div' | 'article' | 'section';
}

/**
 * ACF field values for the card-grid block, as they appear in attributesJSON.data.
 *
 * Fields mirror what card-grid.twig reads from `fields.*`:
 *   fields.type              — layout strategy
 *   fields.column_count      — number of columns (2–6)
 *   fields.placecard         — adds .has-placecard and invisible filler spans
 *   fields.single_row        — locks to a single horizontal row
 *   fields.mobile_columns    — preserve multi-column layout on mobile
 *   fields.vertical_offset   — stagger cards vertically left/right
 *   fields.numbered_cards    — add 'card-count' class to the inner grid
 *   fields.title             — optional heading above the grid
 *   fields.items             — headless-only repeater of card data (see above)
 *
 * Fields intentionally not mapped (CardGrid pattern component has no matching
 * prop; set via WordPress inline-style output in the Twig layer):
 *   fields.card_grid_id      — HTML id attribute on wrapper
 *   fields.alignment         — justify-content on the inner grid
 *   fields.equal_height      — align-items: stretch on the inner grid
 *   fields.gutter            — custom per-column gutter px value
 *   fields.row_column_count  — Bootstrap row-cols-{n} responsive classes
 *   fields.row_gutter        — Bootstrap g-{n} responsive gutter classes
 */
interface CardGridBlockData {
  type?: 'grid' | 'row' | 'group' | 'deck';
  column_count?: 2 | 3 | 4 | 5 | 6;
  card_grid_width?: AcfBlockStyleData['width'];
  card_grid_margin?: AcfBlockStyleData['margin'];
  placecard?: boolean;
  single_row?: boolean;
  mobile_columns?: boolean;
  vertical_offset?: 'left' | 'right';
  numbered_cards?: boolean;
  title?: string | null;
  /** Pre-built card items — populated via ACF repeater for headless delivery. */
  items?: CardGridItemData[] | null;
}

interface CardGridBlockProps {
  block: EditorBlock;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** WPGraphQL media item shape returned by GET_MEDIA_ITEM_BY_ID. */
interface MediaItem {
  sourceUrl: string;
  altText?: string;
  mediaDetails?: { width?: number; height?: number };
}

/** Fetch a single media item by its WordPress attachment ID. */
async function fetchMediaItem(id: number | string): Promise<MediaItem | null> {
  const { data } = await fetchGraphQL<{ mediaItem: MediaItem | null }>(
    print(GET_MEDIA_ITEM_BY_ID),
    { id: String(id) },
  );
  return data?.mediaItem ?? null;
}

/**
 * Map a single repeater item to CardProps.
 * `media` is the pre-fetched MediaItem for the card image (null when absent or URL type).
 */
function buildCardProps(item: CardGridItemData, media: MediaItem | null): CardProps {
  // ─── Card image ────────────────────────────────────────────────────────────
  let cardImage: CardImageProps | undefined;
  const imageField = item.image;

  if (imageField) {
    let src: string | null = null;
    let alt = '';
    let width: number | undefined;
    let height: number | undefined;

    if (imageField.image_type === 'url' && imageField.image_url) {
      src = imageField.image_url;
    } else if (imageField.image_type === 'file' && media) {
      src = media.sourceUrl;
      alt = media.altText ?? '';
      width = media.mediaDetails?.width;
      height = media.mediaDetails?.height;
    }

    if (src) {
      cardImage = {
        variant: 'picture',
        src,
        alt,
        width,
        height,
        sizes: '(max-width: 768px) 100vw, 960px',
        loading: 'lazy',
      };
    }
  }

  // ─── Button ────────────────────────────────────────────────────────────────
  let cardButton: ButtonProps | undefined;
  if (item.show_button && item.card_link?.url) {
    const btn = item.button ?? {};
    const variant: ButtonVariant | undefined =
      btn.style && btn.style !== 'custom'
        ? (btn.style as ButtonVariant)
        : undefined;
    const size = btn.size === 'sm' || btn.size === 'lg' ? btn.size : undefined;

    cardButton = {
      ...(variant ? { variant } : {}),
      ...(size ? { size } : {}),
      outline: btn.outline ?? false,
      block: btn.full_width ?? false,
      href: item.card_link.url,
      target: item.card_link.target,
      label: item.card_link.title,
      className: 'card-button',
    };
  }

  return {
    card_element: item.card_element,
    card_title: item.card_title ?? undefined,
    card_subtitle: item.card_subtitle ?? undefined,
    card_text: item.card_text ?? undefined,
    card_header: item.card_header ?? undefined,
    card_footer: item.card_footer ?? undefined,
    card_label: item.card_label ?? undefined,
    card_image: cardImage,
    card_image_location: item.image_position,
    card_image_overlay: item.image_overlay,
    card_image_overlay_text: item.image_overlay_text ?? undefined,
    card_link: item.card_link?.url ?? undefined,
    card_link_text: item.card_link?.title ?? undefined,
    card_link_target: (item.card_link?.target as CardProps['card_link_target']) ?? undefined,
    card_linked: item.card_linked,
    card_background: item.card_background ?? undefined,
    card_border: item.card_border ?? undefined,
    no_border: item.no_border,
    text_alignment: item.text_alignment ?? undefined,
    text_color: item.text_color ?? undefined,
    card_button: cardButton,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CardGrid block — mirrors `src/templates/blocks/card-grid/card-grid.twig`.
 *
 * Mirrors the Twig block's relationship with the card-grid organism: just as the
 * Twig block embeds `@organisms/card-grid/_card-grid.tpl.twig`, this component
 * renders the CardGrid organism.
 *
 * Card data strategy (same approach as BreadcrumbBlock's `fields.items`):
 *   1. `fields.items` ACF repeater — if populated, builds CardProps from each
 *      row and resolves any file-based card images via GET_MEDIA_ITEM_BY_ID.
 *   2. `block.renderedHtml` — if `fields.items` is absent or empty, the
 *      WordPress-rendered inner blocks HTML is injected directly. This covers
 *      the traditional InnerBlocks (acf/card) flow without requiring the
 *      headless repeater to be populated.
 *
 * Registered in BLOCK_MAP as 'acf/card-grid'.
 */
export async function CardGridBlock({ block }: CardGridBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: CardGridBlockData; className?: string };
  const data: CardGridBlockData = attrs?.data ?? {};

  // ─── Grid-level ACF fields → CardGridProps ──────────────────────────────────
  const type = data.type ?? 'grid';
  const columns = data.column_count;

  const { style: wrapperStyle } = buildAcfBlockStyle({
    width:  data.card_grid_width,
    margin: data.card_grid_margin,
  });

  // Outer wrapper classes — mirrors Twig block_classes:
  //   fields.placecard → 'has-placecard'
  //   block['className'] → WordPress editor-assigned class
  const wrapperClassName = cx(styles, data.placecard ? 'has-placecard' : null, attrs.className ?? null) || undefined;

  // Inner grid classes — mirrors Twig grid_classes:
  //   fields.numbered_cards → 'card-count'
  const gridClassName = data.numbered_cards ? cx(styles, 'card-count') : undefined;

  // ─── Card items: headless repeater path ─────────────────────────────────────
  const items = data.items;

  if (!Array.isArray(items) || items.length === 0) {
    // No headless repeater data — fall back to WordPress-rendered inner blocks.
    // The block renderer's comment notes that inner blocks are included in
    // renderedHtml; this preserves that output when items are not pre-built.
    if (!block.renderedHtml) return null;
    return <div style={wrapperStyle} dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
  }

  // ─── Resolve all card images in parallel ────────────────────────────────────
  const mediaItems = await Promise.all(
    items.map((item) => {
      if (item.image?.image_type === 'file' && item.image.image) {
        return fetchMediaItem(item.image.image);
      }
      return Promise.resolve(null);
    }),
  );

  // ─── Build CardProps array ───────────────────────────────────────────────────
  const cards: CardProps[] = items.map((item, index) =>
    buildCardProps(item, mediaItems[index]),
  );

  const cardGridEl = (
    <CardGrid
      type={type}
      columns={columns}
      card_grid_title={data.title ?? undefined}
      placecard={data.placecard}
      singlerow={data.single_row}
      mobilecolumns={data.mobile_columns}
      vertical_offset={data.vertical_offset}
      cards={cards}
      className={wrapperClassName}
      gridClassName={gridClassName}
    />
  );

  if (wrapperStyle) return <div style={wrapperStyle}>{cardGridEl}</div>;
  return cardGridEl;
}

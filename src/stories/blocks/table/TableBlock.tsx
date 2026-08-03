import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { Table } from '@/stories/atoms/table/Table';
import { buildAcfBlockStyle } from '@/lib/wp/utils/buildAcfBlockStyle';
import type { TableVariant, TableResponsive, VerticalAlign } from '@/stories/atoms/table/Table';
import styles from './table.module.scss';
import { cx } from '@/lib/cx';

/**
 * ACF field values for the table block, as they appear in attributesJSON.data.
 *
 * All Bootstrap table options are top-level fields (table_striped, table_hover, …).
 * Caption fields are grouped under the `caption_group` clone:
 *   caption_group.caption, caption_group.caption_top
 * The variant uses a nested structure:
 *   table_variant.color ('palette' | 'custom'), table_variant.theme_color, table_variant.custom_color
 * Table ID comes from a clone field:
 *   table_id.id (explicit) or table_id.id_gen (auto-generated slug)
 * Margin, padding, and width are nested clone groups that mirror the shared
 * spacing/sizing clones used across block types in the Timberland framework.
 *
 * NOTE: The table's structural content (thead, tbody, tfoot rows) is provided by
 * InnerBlocks (acf/table-head, acf/table-body, acf/table-foot) and is therefore
 * NOT available from this block's ACF fields. To render actual table content in a
 * full headless implementation, resolve those sub-blocks from block.innerBlocks and
 * pass them as thead/tbody/tfoot props to the Table component.
 */
interface TableBlockData {
  // Table ID clone
  table_id?: {
    id?: string;
    id_gen?: string;
  };

  // Bootstrap table modifiers
  table_striped?: boolean;
  table_hover?: boolean;
  table_bordered?: boolean;
  table_small?: boolean;
  table_borderless?: boolean;
  table_responsive?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  table_vertical_align?: VerticalAlign;

  // Border behaviour
  table_border_collapse?: boolean;
  table_border_spacing?: number;

  // Color variant (palette or custom hex)
  table_variant?: {
    color?: 'palette' | 'custom';
    /** Bootstrap contextual class name, e.g. 'primary', 'dark'. Used when color === 'palette'. */
    theme_color?: string;
    /** Hex / CSS color value. Used when color === 'custom'. */
    custom_color?: string;
  };

  // Caption clone group
  caption_group?: {
    caption?: string;
    caption_top?: boolean;
  };

  // Margin clone group — matches the shared margin clone field structure
  margin?: {
    margin?: {
      top?: { auto?: boolean; top?: number };
      bottom?: { auto?: boolean; bottom?: number };
      left?: { auto?: boolean; left?: number };
      right?: { auto?: boolean; right?: number };
    };
  };

  // Padding clone group
  padding?: {
    padding?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
  };

  // Width clone group
  width?: {
    width?: {
      width?: { value?: string; unit?: string };
      min_width?: number | null;
      max_width?: number | null;
    };
  };
}

interface TableBlockProps {
  block: EditorBlock;
}


/**
 * Resolve the Bootstrap contextual variant from the ACF variant field.
 * Only returns a value when `color === 'palette'` and a theme color is set.
 * Custom hex colors are not supported by the Table component's current API —
 * see the NOTE below if Table.tsx gains a `tableStyle` prop.
 */
function resolveTableVariant(
  variantField?: TableBlockData['table_variant'],
): TableVariant | undefined {
  if (!variantField) return undefined;
  if (variantField.color === 'palette' && variantField.theme_color) {
    return variantField.theme_color as TableVariant;
  }
  // NOTE: When color === 'custom', the Twig applies `background-color: <hex>` as an
  // inline style on the <table> element. The Table component does not yet accept an
  // arbitrary tableStyle prop, so custom_color is currently a no-op here. Extend
  // Table.tsx with a `tableStyle?: React.CSSProperties` prop to support it.
  return undefined;
}

/**
 * Table block — mirrors `src/templates/blocks/table/table.twig`.
 *
 * Maps ACF styling fields (striped, hover, bordered, responsive, variant, caption,
 * margin/padding/width) from `block.attributesJSON` to the Table atom's props.
 * The block wrapper <div> carries block-level spacing and sizing as inline styles,
 * matching the Twig `block_styles` variable.
 *
 * Table structural content (thead / tbody / tfoot) is provided by InnerBlocks
 * (acf/table-head, acf/table-body, acf/table-foot). Resolving those sub-blocks and
 * wiring their rows into the Table component requires separate block processors and
 * is outside the scope of this wrapper. Without row data, Table.tsx returns null,
 * which causes the block renderer to fall through to `renderedHtml` for content.
 *
 * Registered in BLOCK_MAP as 'acf/table'.
 */
export async function TableBlock({ block }: TableBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: TableBlockData; className?: string };
  const data: TableBlockData = attrs?.data ?? {};

  // Return null early if there is truly no data to work with
  if (!attrs.data) return null;

  // Resolve table ID: prefer an explicit ACF text id, fall back to auto-generated slug
  const tableId: string | undefined = data.table_id?.id
    ? data.table_id.id
    : data.table_id?.id_gen
      ? `table-${data.table_id.id_gen}`
      : undefined;

  const tableVariant = resolveTableVariant(data.table_variant);

  const { style: blockStyle } = buildAcfBlockStyle({
    width: data.width,
    padding: data.padding,
    margin: data.margin,
  });
  const hasBlockStyle = !!blockStyle;

  const blockClasses = cx(styles, 'table-block', attrs.className);

  const caption = data.caption_group?.caption;
  const captionTop = data.caption_group?.caption_top;

  const responsive = data.table_responsive as TableResponsive | undefined;

  return (
    <div
      className={blockClasses || undefined}
      style={hasBlockStyle ? blockStyle : undefined}
    >
      <Table
        tableId={tableId}
        striped={data.table_striped}
        hover={data.table_hover}
        bordered={data.table_bordered}
        borderless={data.table_borderless}
        small={data.table_small}
        variant={tableVariant}
        responsive={responsive}
        verticalAlign={data.table_vertical_align}
        borderCollapse={data.table_border_collapse}
        borderSpacing={data.table_border_spacing}
        caption={caption}
        captionTop={captionTop}
        // InnerBlocks content (thead/tbody/tfoot rows) is not available from ACF
        // fields and must be resolved from block.innerBlocks in a full implementation.
        // Table returns null when no rows are present; the block renderer falls
        // through to renderedHtml for the actual table markup in that case.
      />
    </div>
  );
}

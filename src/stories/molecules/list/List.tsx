import React from 'react';

/**
 * Font Awesome class detection — mirrors the Twig pattern's regex check.
 * Matches: `fab`/`fad`/`fal`/`far`/`fas` alone; `fa-name fab`; `fab fa-`.
 */
const FA_REGEX = /(fa[bdlrs]|fa-.*?\s+fa[bdlrs]|fa[bdlrs]\s+fa-)/;

function isFontAwesome(icon: string): boolean {
  return FA_REGEX.test(icon);
}

/**
 * Build the sorted, space-joined class string for the list container.
 * Mirrors the Twig `parent_classes` merge → sort → join → trim chain.
 */
function buildParentClasses(
  parentElement: string,
  listId: string | undefined,
  bulletIcons: boolean | undefined,
  bulletIconPosition: 'before' | 'after' | undefined,
  parentClasses: string[] | undefined,
  parentOtherClasses: string | undefined,
): string {
  const listType = parentElement === 'ol' ? 'ordered' : 'unordered';

  const bulletPositionClass =
    bulletIconPosition === 'before'
      ? 'bullet-icons--before'
      : bulletIconPosition === 'after'
        ? 'bullet-icons--after'
        : null;

  return [
    ...(parentClasses ?? []),
    'list',
    listId ? `list-id--${listId}` : null,
    `list-type--${listType}`,
    bulletIcons ? 'bullet-icons' : null,
    bulletPositionClass,
    parentOtherClasses ?? null,
  ]
    .filter(Boolean)
    .sort()
    .join(' ');
}

/**
 * Build the sorted, space-joined class string for each list item.
 * Mirrors the Twig `item_classes` merge → sort → join → trim chain.
 */
function buildItemClasses(
  itemCount: number,
  itemClasses: string[] | undefined,
  itemOtherClasses: string | undefined,
): string {
  return [
    ...(itemClasses ?? []),
    'list-item',
    `list-item--item-${itemCount}`,
    itemOtherClasses ?? null,
  ]
    .filter(Boolean)
    .sort()
    .join(' ');
}

interface IconSizes {
  width: string;
  height: string;
  lineHeight: string | undefined;
}

/**
 * Resolve icon dimensions following the Twig priority order:
 * 1. Parent-level bulletIconSize (when bulletIcons is true)
 * 2. Per-item iconWidth / iconHeight
 * 3. Default 1em × 1em
 */
function resolveIconSizes(
  bulletIcons: boolean | undefined,
  bulletIconSize: string | undefined,
  item: ListItem,
): IconSizes {
  if (bulletIcons && bulletIconSize) {
    return {
      width: bulletIconSize,
      height: bulletIconSize,
      lineHeight: bulletIconSize,
    };
  }
  if (item.iconWidth || item.iconHeight) {
    return {
      width: item.iconWidth ?? '1em',
      height: item.iconHeight ?? '1em',
      lineHeight: item.iconHeight,
    };
  }
  return { width: '1em', height: '1em', lineHeight: undefined };
}

/**
 * Render the icon markup for a single list item.
 *
 * Font Awesome icons render as:
 *   <span class="icon"><i class="fas fa-check color-fill--primary"></i></span>
 *
 * SVG icons (identified by name string) render a span with `svg svg--colorable`
 * classes that match the Svg atom's inline output. Actual SVG content requires
 * an SVG sprite system; the class structure is preserved for CSS targeting.
 */
function renderIcon(
  item: ListItem,
  width: string,
  height: string,
): React.ReactNode {
  if (!item.itemIcon) return null;

  if (isFontAwesome(item.itemIcon)) {
    const iconCls = [
      item.itemIcon,
      item.iconColor ? `color-fill--${item.iconColor}` : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span className="icon" style={{ fontSize: width }}>
        <i className={iconCls} style={item.iconStyles} />
      </span>
    );
  }

  // SVG icon — span structure matches @atoms/svg inline rendering
  const svgCls = [
    'svg',
    'svg--colorable',
    item.iconColor ? `text-${item.iconColor}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={svgCls}
      style={{ width, height, display: 'inline-block', ...item.iconStyles }}
      aria-hidden="true"
    />
  );
}

// ─── Public types ─────────────────────────────────────────────────────────────

/** A single item in a List, mirroring the `items.item` variables from the Twig pattern. */
export interface ListItem {
  /**
   * Icon for this item. Accepts either:
   * - A Font Awesome class string (e.g. `'fas fa-check'`) — detected automatically.
   * - An SVG icon name string (any other value) — renders the svg/svg--colorable span wrapper.
   */
  itemIcon?: string;
  /**
   * Position of this item's icon. Defaults to `'before'`.
   * Overridden by the parent's `bulletIconPosition` when it is explicitly set.
   */
  iconPosition?: 'before' | 'after';
  /** Icon color. Maps to `color-fill--{color}` on Font Awesome icons, `text-{color}` on SVG. */
  iconColor?: string;
  /** Icon width (e.g. `'1.25rem'`). Overridden by parent `bulletIconSize`. */
  iconWidth?: string;
  /** Icon height (e.g. `'1.25rem'`). Overridden by parent `bulletIconSize`. Drives `line-height` on the item. */
  iconHeight?: string;
  /** Additional inline styles for the icon element. */
  iconStyles?: React.CSSProperties;
  /** List item text or rich content. */
  itemText?: React.ReactNode;
  /** HTML element for this list item. Defaults to `'li'`. */
  itemElement?: string;
  /** Additional CSS classes for this item (array). */
  itemClasses?: string[];
  /** Additional CSS classes for this item (string). */
  itemOtherClasses?: string;
  /** Additional HTML attributes spread onto the list item element. */
  itemOtherAttributes?: React.HTMLAttributes<HTMLElement>;
  /** Nested list items — triggers recursive rendering. */
  items?: ListItem[];
  /** Container element for the nested list. Defaults to `'ul'`. */
  parentElement?: 'ul' | 'ol';
  /** ID for the nested list element. */
  listId?: string;
  /** Enable icon bullets on the nested list. */
  bulletIcons?: boolean;
  /** Global icon position for the nested list. */
  bulletIconPosition?: 'before' | 'after';
  /** Global icon size for the nested list. */
  bulletIconSize?: string;
  /** Additional CSS classes for the nested list container (array). */
  parentClasses?: string[];
  /** Additional CSS classes for the nested list container (string). */
  parentOtherClasses?: string;
}

/** Props for the List molecule, mirroring the `_list.tpl.twig` template variables. */
export interface ListProps {
  /** HTML element for the list container. Defaults to `'ul'`. */
  parentElement?: 'ul' | 'ol';
  /** Additional CSS classes for the list container (array), merged and sorted with built-in classes. */
  parentClasses?: string[];
  /** Additional CSS classes for the list container (string), merged into the sorted class string. */
  parentOtherClasses?: string;
  /** HTML `id` attribute value. Also added as `list-id--{listId}` CSS class when provided. */
  listId?: string;
  /**
   * Replace native bullets/numbers with icons.
   * When `true`, items render their icon (or a default icon) instead of the list marker.
   */
  bulletIcons?: boolean;
  /**
   * Global icon position for all items. Overrides per-item `iconPosition`.
   * `'before'` = icon before text (default). `'after'` = icon after text.
   */
  bulletIconPosition?: 'before' | 'after';
  /** Global icon size applied to all items (e.g. `'1.25rem'`). Overrides per-item `iconWidth`/`iconHeight`. */
  bulletIconSize?: string;
  /** Array of list items. Renders nothing when empty or omitted. */
  items?: ListItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * List molecule — mirrors `src/design-system/patterns/02-molecules/list/_list.tpl.twig`.
 *
 * Renders an unordered or ordered list with optional icon bullets (Font Awesome or SVG),
 * configurable icon positions, per-item overrides, and recursive nested list support.
 *
 * Icons are detected automatically: Font Awesome class strings (`fas fa-check`, `fab fa-github`)
 * render as `<span class="icon"><i class="..."></i></span>`; any other string renders as
 * an SVG placeholder span with `svg svg--colorable` classes.
 */
export function List({
  parentElement = 'ul',
  parentClasses,
  parentOtherClasses,
  listId,
  bulletIcons,
  bulletIconPosition,
  bulletIconSize,
  items,
}: ListProps) {
  if (!items || items.length === 0) return null;

  const Tag = parentElement as React.ElementType;
  const className = buildParentClasses(
    parentElement,
    listId,
    bulletIcons,
    bulletIconPosition,
    parentClasses,
    parentOtherClasses,
  );

  return (
    <Tag
      id={listId ?? undefined}
      className={className}
      data-pattern="timberland/list"
    >
      {items.map((item, index) => {
        const itemCount = index + 1;
        const ItemTag = (item.itemElement ?? 'li') as React.ElementType;
        const itemClassName = buildItemClasses(
          itemCount,
          item.itemClasses,
          item.itemOtherClasses,
        );

        const { width, height, lineHeight } = resolveIconSizes(
          bulletIcons,
          bulletIconSize,
          item,
        );

        const iconPosition = item.iconPosition ?? 'before';

        // Mirror Twig: show icon before text
        const showBefore =
          (!!item.itemIcon &&
            iconPosition === 'before' &&
            bulletIconPosition !== 'after') ||
          (bulletIcons === true && bulletIconPosition === 'before');

        // Mirror Twig: show icon after text
        const showAfter =
          (!!item.itemIcon &&
            iconPosition === 'after' &&
            bulletIconPosition !== 'before') ||
          (bulletIcons === true && bulletIconPosition === 'after');

        const iconNode = renderIcon(item, width, height);

        return (
          <ItemTag
            key={index}
            className={itemClassName}
            style={lineHeight ? { lineHeight } : undefined}
            {...(item.itemOtherAttributes ?? {})}
          >
            {showBefore && iconNode}
            {item.itemText}
            {item.items && item.items.length > 0 && (
              <List
                parentElement={item.parentElement ?? 'ul'}
                parentClasses={item.parentClasses}
                parentOtherClasses={item.parentOtherClasses}
                listId={item.listId}
                bulletIcons={item.bulletIcons}
                bulletIconPosition={item.bulletIconPosition}
                bulletIconSize={item.bulletIconSize}
                items={item.items}
              />
            )}
            {showAfter && iconNode}
          </ItemTag>
        );
      })}
    </Tag>
  );
}

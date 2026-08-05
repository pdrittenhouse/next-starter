import React from 'react';
import styles from './list-group.module.scss';
import { cx } from '@/lib/cx';

export type ListGroupElement = 'ul' | 'ol' | 'div';
export type ListGroupItemElement = 'li' | 'a' | 'button' | 'div' | 'label';
export type ContextualVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export interface ListGroupItem {
  itemContent: React.ReactNode;
  itemElement?: ListGroupItemElement;
  itemActive?: boolean;
  itemDisabled?: boolean;
  contextualClass?: ContextualVariant;
  itemClasses?: string[];
  itemOtherClasses?: string;
  itemOtherAttributes?: React.AllHTMLAttributes<HTMLElement>;
}

export interface ListGroupProps {
  listGroupElement?: ListGroupElement;
  listGroupFlush?: boolean;
  listGroupHorizontal?: boolean;
  listGroupClasses?: string[];
  listGroupOtherClasses?: string;
  /**
   * Global item element — controls whether `list-group-item-action` is applied
   * and serves as the default element for each item. Mirrors the Twig template's
   * `item_element` template-level variable.
   */
  itemElement?: ListGroupItemElement;
  items?: ListGroupItem[];
  children?: React.ReactNode;
}

function buildListGroupClasses(
  flush?: boolean,
  horizontal?: boolean,
  extra?: string[],
  otherClasses?: string,
): string {
  return cx(
    styles,
    'list-group',
    flush ? 'list-group-flush' : null,
    horizontal ? 'list-group-horizontal' : null,
    ...(extra ?? []),
    otherClasses,
  );
}

function buildItemClasses(
  item: ListGroupItem,
  isActionItem: boolean,
  extra?: string[],
  otherClasses?: string,
): string {
  return cx(
    styles,
    'list-group-item',
    item.itemActive ? 'active' : null,
    item.itemDisabled ? 'disabled' : null,
    isActionItem ? 'list-group-item-action' : null,
    item.contextualClass ? `list-group-item-${item.contextualClass}` : null,
    ...(item.itemClasses ?? []),
    ...(extra ?? []),
    item.itemOtherClasses,
    otherClasses,
  );
}

export function ListGroup({
  listGroupElement: Tag = 'ul',
  listGroupFlush,
  listGroupHorizontal,
  listGroupClasses,
  listGroupOtherClasses,
  itemElement = 'li',
  items = [],
  children,
}: ListGroupProps) {
  const isActionItem = itemElement === 'a' || itemElement === 'button';
  const groupClassName = buildListGroupClasses(
    listGroupFlush,
    listGroupHorizontal,
    listGroupClasses,
    listGroupOtherClasses,
  );

  return (
    <Tag className={groupClassName} data-pattern="timberland/list-group">
      {children ??
        items.map((item, index) => {
          const ItemTag = (item.itemElement ?? itemElement) as React.ElementType;
          const itemClassName = buildItemClasses(item, isActionItem);
          const typeAttr =
            ItemTag === 'button' ? { type: 'button' as const } : {};
          const { itemContent, itemOtherAttributes } = item;

          return (
            <ItemTag
              key={index}
              className={itemClassName}
              {...typeAttr}
              {...(itemOtherAttributes ?? {})}
            >
              {itemContent}
            </ItemTag>
          );
        })}
    </Tag>
  );
}

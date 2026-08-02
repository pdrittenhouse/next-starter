import React from 'react';
import styles from './pagination.module.scss';
import { cx } from '@/lib/cx';

/**
 * A single pagination page item.
 *
 * Maps to each element of the `page_items` array in `_pagination.tpl.twig`:
 *   - item.title  → title
 *   - item.link   → link
 *   - item.active → active
 */
export interface PageItem {
  /** Page number or label text. Maps to `item.title`. */
  title: string;
  /** URL for this page. Maps to `item.link`. */
  link: string;
  /** Whether this is the currently active page. Maps to `item.active`. */
  active?: boolean;
}

/**
 * Pagination molecule props — mirrors `_pagination.tpl.twig`.
 *
 * Available Twig variables mapped to camelCase props:
 *   - pagination_title         → title
 *   - pagination_size          → size
 *   - page_icon                → pageIcon
 *   - page_items               → pageItems
 *   - prev_link                → prevLink
 *   - next_link                → nextLink
 *   - pagination_other_classes → otherClasses
 */
export interface PaginationProps {
  /** Accessible label for the `<nav>` landmark. Maps to `pagination_title`. */
  title?: string;
  /**
   * Size modifier for the Bootstrap pagination list.
   * Maps to `pagination_size`; produces `pagination-sm` or `pagination-lg`.
   */
  size?: 'sm' | 'lg';
  /**
   * Render «/» chevron icons inside the Previous/Next anchors.
   * When true the text label receives `sr-only`; when false it gets `button-label`.
   * Maps to `page_icon`.
   */
  pageIcon?: boolean;
  /** Array of page-number link objects. Maps to `page_items`. */
  pageItems?: PageItem[];
  /** URL for the Previous control. Defaults to `'#'`. Maps to `prev_link`. */
  prevLink?: string;
  /** URL for the Next control. Defaults to `'#'`. Maps to `next_link`. */
  nextLink?: string;
  /** Additional CSS classes appended to the `<ul>` element. Maps to `pagination_other_classes`. */
  otherClasses?: string;
}

/**
 * Pagination molecule — mirrors
 * `src/design-system/patterns/02-molecules/pagination/_pagination.tpl.twig`.
 *
 * Produces a Bootstrap 5 `<nav>` + `<ul class="pagination">` structure with
 * Previous/Next controls and a configurable set of numbered page links.
 * The class array is sorted before joining to match the Twig `| sort` filter.
 *
 * @example
 * ```tsx
 * <Pagination
 *   title="Blog page navigation"
 *   pageIcon
 *   prevLink="/blog?page=1"
 *   nextLink="/blog?page=3"
 *   pageItems={[
 *     { title: '1', link: '/blog?page=1' },
 *     { title: '2', link: '/blog?page=2', active: true },
 *     { title: '3', link: '/blog?page=3' },
 *   ]}
 * />
 * ```
 */
export function Pagination({
  title = 'Page navigation',
  size,
  pageIcon = false,
  pageItems = [],
  prevLink = '#',
  nextLink = '#',
  otherClasses,
}: PaginationProps) {
  // Mirror Twig: build class array → filter falsy → sort → join → trim
  const paginationClasses = cx(
    styles,
    'pagination',
    size ? `pagination-${size}` : null,
    otherClasses,
  );

  return (
    <nav aria-label={title} data-pattern="timberland/pagination">
      <ul className={paginationClasses}>

        <li className={cx(styles, 'page-item', 'btn', 'prev')}>
          <a className={cx(styles, 'page-link')} href={prevLink} aria-label="Previous">
            {pageIcon && <span aria-hidden="true">&laquo;</span>}
            <span className={cx(styles, pageIcon ? 'sr-only' : 'button-label')}>Previous</span>
          </a>
        </li>

        {pageItems.map((item, index) => (
          <li
            key={`page-item-${index}`}
            className={cx(styles, 'page-item', item.active && 'active')}
          >
            <a
              className={cx(styles, 'page-link')}
              href={item.link}
              {...(item.active ? { 'aria-current': 'page' as const } : {})}
            >
              {item.title}
            </a>
          </li>
        ))}

        <li className={cx(styles, 'page-item', 'btn', 'next')}>
          <a className={cx(styles, 'page-link')} href={nextLink} aria-label="Next">
            {pageIcon && <span aria-hidden="true">&raquo;</span>}
            <span className={cx(styles, pageIcon ? 'sr-only' : 'button-label')}>Next</span>
          </a>
        </li>

      </ul>
    </nav>
  );
}

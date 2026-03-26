'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor?: string;
  startCursor?: string;
}

/**
 * Cursor-based pagination for archive listings.
 * Mirrors: templates/partials/menus/pagination.twig
 */
export function Pagination({
  hasNextPage,
  hasPreviousPage,
  endCursor,
  startCursor,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!hasNextPage && !hasPreviousPage) return null;

  function buildUrl(cursor: string | undefined, direction: 'after' | 'before') {
    const params = new URLSearchParams(searchParams.toString());
    if (cursor) {
      params.set(direction, cursor);
      // Remove the opposite direction param
      params.delete(direction === 'after' ? 'before' : 'after');
    }
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="pagination-wrapper">
      <div className="container">
        <div className="row">
          <div className="col">
            <nav className="pagination" aria-label="Pagination">
              {hasPreviousPage && startCursor && (
                <Link
                  href={buildUrl(startCursor, 'before')}
                  className="pagination-link prev"
                >
                  &laquo; Previous
                </Link>
              )}
              {hasNextPage && endCursor && (
                <Link
                  href={buildUrl(endCursor, 'after')}
                  className="pagination-link next"
                >
                  Next &raquo;
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

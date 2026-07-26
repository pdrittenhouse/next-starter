import styles from './breadcrumb.module.scss';

export interface BreadcrumbItem {
  text: string;
  url: string;
}

export interface BreadcrumbProps {
  /** Ordered list of breadcrumb trail items. The last item is treated as the current page. */
  items: BreadcrumbItem[];
  /** Custom divider character rendered via the Bootstrap CSS variable `--bs-breadcrumb-divider`. */
  divider?: string;
  /** Optional prefix text prepended (with a trailing space) to the current/last item's text. */
  label?: string;
  /** Additional CSS class names appended to the `<ol>` element. */
  className?: string;
  /** Additional inline styles applied to the `<ol>` element. */
  listStyle?: React.CSSProperties;
}

export function Breadcrumb({
  items,
  divider,
  label,
  className,
  listStyle,
}: BreadcrumbProps) {
  const olClasses = ['breadcrumb', className].filter(Boolean).join(' ');

  const navStyle = divider
    ? ({ '--bs-breadcrumb-divider': `'${divider}'` } as React.CSSProperties)
    : undefined;

  return (
    <nav
      style={navStyle}
      aria-label="breadcrumb"
      role="navigation"
      data-pattern="timberland/breadcrumb"
    >
      <ol className={olClasses} style={listStyle}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast) {
            return (
              <li
                key={index}
                className="breadcrumb-item active is-active"
                aria-current="page"
              >
                {label ? `${label} ` : ''}
                {item.text}
              </li>
            );
          }

          return (
            <li key={index} className="breadcrumb-item">
              <a href={item.url}>{item.text}</a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

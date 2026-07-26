import React from 'react';
import styles from './table.module.scss';

export type TableVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export type VerticalAlign = 'top' | 'middle' | 'bottom';

export type TableResponsive = boolean | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface TableCellData {
  content: React.ReactNode;
  element?: 'th' | 'td';
  cellClasses?: string[];
  cellOtherClasses?: string;
  colspan?: number;
  rowspan?: number;
  /** Only applied when element is 'th'. */
  scope?: string;
  headers?: string;
  verticalAlign?: VerticalAlign;
  /** Raw CSS declaration strings, e.g. ['color: red']. */
  styles?: string[];
}

export interface TableRowData {
  cells: TableCellData[];
  rowClasses?: string[];
  rowOtherClasses?: string;
}

export interface TableSectionConfig {
  rows: TableRowData[];
  classes?: string[];
  otherClasses?: string;
}

export interface TableProps {
  tableClasses?: string[];
  tableId?: string;
  /** Maps to table_other_classes. */
  className?: string;

  striped?: boolean;
  hover?: boolean;
  active?: boolean;
  bordered?: boolean;
  borderless?: boolean;
  small?: boolean;
  variant?: TableVariant;
  responsive?: TableResponsive;
  verticalAlign?: VerticalAlign;

  /**
   * true  → border-collapse: collapse (inline style only)
   * false → border-collapse: separate + table-border-separate class
   */
  borderCollapse?: boolean;
  /** Pixel value; only applied when borderCollapse is false. */
  borderSpacing?: number;

  caption?: string;
  captionClasses?: string[];
  captionOtherClasses?: string;
  captionTop?: boolean;

  thead?: TableSectionConfig;
  tbody?: TableSectionConfig;
  tfoot?: TableSectionConfig;
  /** Shorthand: rows rendered inside an implicit tbody when thead/tbody are not provided. */
  rows?: TableRowData[];
}

function buildCellClasses(
  cell: TableCellData,
  cellIndex: number,
  rowIndex: number,
): string {
  return [
    `table-cell--cell-${cellIndex}`,
    `table-cell--row-${rowIndex}`,
    cell.verticalAlign ? `align-${cell.verticalAlign}` : null,
    ...(cell.cellClasses ?? []),
    cell.cellOtherClasses ?? null,
  ]
    .filter(Boolean)
    .join(' ');
}

function TableCellElement({
  cell,
  cellIndex,
  rowIndex,
}: {
  cell: TableCellData;
  cellIndex: number;
  rowIndex: number;
}) {
  const Tag = cell.element ?? 'td';
  const cls = buildCellClasses(cell, cellIndex, rowIndex);

  const inlineStyle: React.CSSProperties | undefined =
    cell.styles && cell.styles.length > 0
      ? (Object.fromEntries(
          cell.styles
            .filter(Boolean)
            .flatMap((s) => {
              const [prop, ...rest] = s.split(':');
              const val = rest.join(':').trim();
              // Convert kebab-case to camelCase for React style prop
              const camel = prop.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
              return [[camel, val]];
            }),
        ) as React.CSSProperties)
      : undefined;

  return (
    <Tag
      className={cls || undefined}
      colSpan={cell.colspan}
      rowSpan={cell.rowspan}
      scope={Tag === 'th' && cell.scope ? cell.scope : undefined}
      headers={cell.headers}
      style={inlineStyle}
    >
      {cell.content}
    </Tag>
  );
}

function TableRowElement({
  row,
  rowIndex,
}: {
  row: TableRowData;
  rowIndex: number;
}) {
  const cls = [
    `table-row--row-${rowIndex}`,
    ...(row.rowClasses ?? []),
    row.rowOtherClasses ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <tr className={cls || undefined}>
      {row.cells.map((cell, i) => (
        <TableCellElement
          key={i}
          cell={cell}
          cellIndex={i + 1}
          rowIndex={rowIndex}
        />
      ))}
    </tr>
  );
}

function TableSection({
  tag,
  config,
}: {
  tag: 'thead' | 'tbody' | 'tfoot';
  config: TableSectionConfig;
}) {
  const Tag = tag;
  const cls = [...(config.classes ?? []), config.otherClasses ?? null]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={cls || undefined}>
      {config.rows.map((row, i) => (
        <TableRowElement key={i} row={row} rowIndex={i + 1} />
      ))}
    </Tag>
  );
}

export function Table({
  tableClasses,
  tableId,
  className,
  striped,
  hover,
  active,
  bordered,
  borderless,
  small,
  variant,
  responsive,
  verticalAlign,
  borderCollapse,
  borderSpacing,
  caption,
  captionClasses,
  captionOtherClasses,
  captionTop,
  thead,
  tbody,
  tfoot,
  rows,
}: TableProps) {
  const hasContent =
    (rows && rows.length > 0) ||
    (thead && thead.rows.length > 0) ||
    (tbody && tbody.rows.length > 0) ||
    (tfoot && tfoot.rows.length > 0);

  if (!hasContent) return null;

  const bootstrapClasses: (string | null)[] = [
    striped ? 'table-striped' : null,
    hover ? 'table-hover' : null,
    active ? 'table-active' : null,
    bordered ? 'table-bordered' : null,
    borderless ? 'table-borderless' : null,
    small ? 'table-sm' : null,
    variant ? `table-${variant}` : null,
    verticalAlign ? `align-${verticalAlign}` : null,
    borderCollapse === false ? 'table-border-separate' : null,
    borderCollapse === false && borderSpacing && borderSpacing > 0
      ? `table-border-spacing-${borderSpacing}`
      : null,
  ];

  const tableCls = [
    'table',
    tableId ? `table-id--${tableId}` : null,
    ...(tableClasses ?? []),
    ...bootstrapClasses,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const tableStyle: React.CSSProperties = {};
  if (borderCollapse === false) {
    tableStyle.borderCollapse = 'separate';
    if (borderSpacing && borderSpacing > 0) {
      tableStyle.borderSpacing = `${borderSpacing}px`;
    }
  } else if (borderCollapse === true) {
    tableStyle.borderCollapse = 'collapse';
  }

  const captionCls = [
    captionTop ? 'caption-top' : null,
    ...(captionClasses ?? []),
    captionOtherClasses ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const implicitTbody: TableSectionConfig | undefined =
    !tbody && rows && rows.length > 0 ? { rows } : undefined;

  const tableEl = (
    <table
      id={tableId}
      className={tableCls}
      style={Object.keys(tableStyle).length > 0 ? tableStyle : undefined}
      data-pattern="timberland/table"
    >
      {caption && (
        <caption className={captionCls || undefined}>{caption}</caption>
      )}
      {thead && thead.rows.length > 0 && (
        <TableSection tag="thead" config={thead} />
      )}
      {tbody && tbody.rows.length > 0 && (
        <TableSection tag="tbody" config={tbody} />
      )}
      {implicitTbody && <TableSection tag="tbody" config={implicitTbody} />}
      {tfoot && tfoot.rows.length > 0 && (
        <TableSection tag="tfoot" config={tfoot} />
      )}
    </table>
  );

  if (responsive) {
    const responsiveCls =
      responsive === true ? 'table-responsive' : `table-responsive-${responsive}`;
    return (
      <div className={responsiveCls} data-pattern="timberland/table">
        {tableEl}
      </div>
    );
  }

  return tableEl;
}

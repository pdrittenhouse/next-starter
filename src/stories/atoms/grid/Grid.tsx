import styles from './grid.module.scss';

export type ContainerBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface GridProps {
  /** Whether to add Bootstrap's `.container` class. */
  container?: boolean;
  /**
   * Whether to add Bootstrap's `.container-fluid` class.
   * Takes precedence over `container` when both are true.
   */
  containerFluid?: boolean;
  /**
   * Breakpoint suffix for `.container-{breakpoint}` (e.g. 'md' → `.container-md`).
   * Only applied when `container` is true and `containerFluid` is false.
   */
  containerBreakpoint?: ContainerBreakpoint;
  /** When `containerFluid` is true, also adds `.max-width-fluid-container`. */
  maxWidthFluidContainer?: boolean;
  /** Additional CSS class names — maps to `grid_other_classes` in the Twig pattern. */
  className?: string;
  /** Column content — maps to the `column_1` Twig block. */
  children?: React.ReactNode;
}

function buildClasses({
  container,
  containerFluid,
  containerBreakpoint,
  maxWidthFluidContainer,
  className,
}: GridProps): string {
  let containerClass: string | null = null;
  if (containerFluid) {
    containerClass = 'container-fluid';
  } else if (container) {
    containerClass = containerBreakpoint ? `container-${containerBreakpoint}` : 'container';
  }

  return [
    'grid',
    containerClass,
    containerFluid && maxWidthFluidContainer ? 'max-width-fluid-container' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Grid({
  container,
  containerFluid,
  containerBreakpoint,
  maxWidthFluidContainer,
  className,
  children,
}: GridProps) {
  const cls = buildClasses({
    container,
    containerFluid,
    containerBreakpoint,
    maxWidthFluidContainer,
    className,
  });

  return (
    <div className={cls} data-pattern="timberland/grid">
      <div className="row">
        <div className="col col-first">{children}</div>
      </div>
    </div>
  );
}

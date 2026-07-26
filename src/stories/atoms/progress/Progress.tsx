import styles from './progress.module.scss';

export interface ProgressBarConfig {
  /** Unique ID for the bar element. Provide one for correct accessibility linkage. */
  progressBarId?: string;
  progressBarLabel?: string;
  progressBarClasses?: string[];
  progressBarOtherClasses?: string;
  progressBarValue?: number;
  progressBarMin?: number;
  progressBarMax?: number;
  /** Fallback text rendered inside the native <progress> element (HTML5 mode only). */
  progressBarText?: string;
  /** Bootstrap contextual color token applied as `bg-{color}` (Bootstrap mode only). */
  color?: string;
  /** Adds a striped gradient (Bootstrap mode only). */
  striped?: boolean;
  /** Animates the stripes — requires `striped: true` (Bootstrap mode only). */
  animate?: boolean;
  /** Inline width style applied to the <progress> element (HTML5 mode only). */
  width?: string;
  /** Inline height style applied to the <progress> element (HTML5 mode only). */
  height?: string;
  /** Render a <label> element above the <progress> (HTML5 mode only). */
  showLabel?: boolean;
}

export interface ProgressProps {
  /**
   * When true (default) renders Bootstrap 5 progress bars.
   * When false renders native HTML5 <progress> elements.
   */
  bootstrapProgress?: boolean;
  progressBars?: ProgressBarConfig[];
  progressWrapperClasses?: string[];
  progressWrapperOtherClasses?: string;
  progressClasses?: string[];
  progressOtherClasses?: string;
  /** Inline height applied to the Bootstrap `.progress` wrapper or each HTML5 `.progress--container`. */
  height?: string;
  /** Additional CSS class names on the outermost wrapper. */
  className?: string;
}

function buildWrapperClasses(extra?: string, others?: string): string {
  return [
    'progress--wrapper',
    others ?? null,
    extra ?? null,
  ].filter(Boolean).join(' ');
}

function buildBootstrapBarClasses(bar: ProgressBarConfig): string {
  return [
    'progress-bar',
    bar.color ? `bg-${bar.color}` : null,
    bar.striped ? 'progress-bar-striped' : null,
    bar.striped && bar.animate ? 'progress-bar-animated' : null,
    ...(bar.progressBarClasses ?? []),
    bar.progressBarOtherClasses ?? null,
  ].filter(Boolean).join(' ');
}

function buildHtml5BarClasses(bar: ProgressBarConfig): string {
  return [
    'progress--bar',
    ...(bar.progressBarClasses ?? []),
    bar.progressBarOtherClasses ?? null,
  ].filter(Boolean).join(' ');
}

function buildContainerClasses(extra: string[], others?: string): string {
  return [
    ...extra,
    others ?? null,
  ].filter(Boolean).join(' ');
}

// Fallback ID mirrors the Twig's auto-generated progressBar_ prefix.
// Callers should supply progressBarId for production accessibility.
function resolveBarId(bar: ProgressBarConfig, index: number): string {
  return bar.progressBarId ?? `progressBar_${index}`;
}

export function Progress({
  bootstrapProgress = true,
  progressBars = [],
  progressWrapperClasses = [],
  progressWrapperOtherClasses,
  progressClasses = [],
  progressOtherClasses,
  height,
  className,
}: ProgressProps) {
  const wrapperCls = buildWrapperClasses(className, progressWrapperOtherClasses);

  const additionalWrapperClasses = progressWrapperClasses.length
    ? ' ' + progressWrapperClasses.join(' ')
    : '';

  if (!bootstrapProgress) {
    const containerCls = buildContainerClasses(
      ['progress--container', ...progressClasses],
      progressOtherClasses,
    );
    const containerStyle: React.CSSProperties | undefined = height
      ? { height }
      : undefined;

    return (
      <div
        className={wrapperCls + additionalWrapperClasses}
        data-pattern="timberland/progress"
      >
        {progressBars.map((bar, i) => {
          const barId = resolveBarId(bar, i);
          const barCls = buildHtml5BarClasses(bar);
          const barStyle: React.CSSProperties | undefined =
            bar.width || bar.height
              ? { width: bar.width ?? undefined, height: bar.height ?? undefined }
              : undefined;

          return (
            <div key={barId} className={containerCls} style={containerStyle}>
              {bar.showLabel && (
                <label
                  className="progress--label"
                  htmlFor={barId}
                  id={`${barId}-label`}
                >
                  {bar.progressBarLabel}
                </label>
              )}
              <progress
                className={barCls}
                id={barId}
                aria-labelledby={`${barId}-label`}
                max={bar.progressBarMax ?? 100}
                value={bar.progressBarValue ?? 0}
                style={barStyle}
              >
                {bar.progressBarText}
              </progress>
            </div>
          );
        })}
      </div>
    );
  }

  const outerCls = buildContainerClasses(
    ['progress', ...progressClasses],
    progressOtherClasses,
  );
  const outerStyle: React.CSSProperties | undefined = height
    ? { height }
    : undefined;

  return (
    <div
      className={wrapperCls + additionalWrapperClasses}
      data-pattern="timberland/progress"
    >
      <div className={outerCls} style={outerStyle}>
        {progressBars.map((bar, i) => {
          const barId = resolveBarId(bar, i);
          const barCls = buildBootstrapBarClasses(bar);
          const value = bar.progressBarValue ?? 0;

          return (
            <div
              key={barId}
              className={barCls}
              id={barId}
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={bar.progressBarMin ?? 0}
              aria-valuemax={bar.progressBarMax ?? 100}
              style={{ width: `${value}%` }}
            >
              {bar.progressBarLabel ?? bar.progressBarText ?? null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

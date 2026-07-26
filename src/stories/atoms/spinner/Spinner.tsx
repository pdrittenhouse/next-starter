import styles from './spinner.module.scss';

export type SpinnerStyle = 'border' | 'grow';

export interface SpinnerProps {
  /** Bootstrap spinner style — 'border' (animated ring) or 'grow' (pulsing dot). Defaults to 'border'. */
  spinnerStyle?: SpinnerStyle;
  /** Bootstrap contextual color token applied as `text-{color}` (e.g. 'primary', 'danger'). */
  spinnerColor?: string;
  /** Use the small size variant. */
  spinnerSmall?: boolean;
  /** Inline width override (CSS value, e.g. '3rem'). */
  width?: string;
  /** Inline height override (CSS value, e.g. '3rem'). */
  height?: string;
  /** Accessible label rendered inside a visually-hidden span. */
  spinnerLabel?: string;
  /** Slot override for the label block — replaces the default visually-hidden span. */
  children?: React.ReactNode;
  /** Additional CSS class names. Maps to `spinner_other_classes` in the Twig pattern. */
  className?: string;
}

function buildClasses(
  spinnerStyle: SpinnerStyle,
  spinnerSmall: boolean,
  spinnerColor?: string,
  className?: string,
): string {
  return [
    spinnerStyle === 'border' ? 'spinner-border' : 'spinner-grow',
    spinnerSmall && spinnerStyle === 'border' ? 'spinner-border-sm' : null,
    spinnerSmall && spinnerStyle === 'grow' ? 'spinner-grow-sm' : null,
    spinnerColor ? `text-${spinnerColor}` : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Spinner({
  spinnerStyle = 'border',
  spinnerColor,
  spinnerSmall = false,
  width,
  height,
  spinnerLabel,
  children,
  className,
}: SpinnerProps) {
  const cls = buildClasses(spinnerStyle, spinnerSmall, spinnerColor, className);

  const style: React.CSSProperties | undefined =
    width || height
      ? { width: width ?? undefined, height: height ?? undefined }
      : undefined;

  return (
    <div
      className={cls}
      data-pattern="timberland/spinner"
      role="status"
      style={style}
    >
      {children ?? (spinnerLabel ? (
        <span className="visually-hidden">{spinnerLabel}</span>
      ) : null)}
    </div>
  );
}

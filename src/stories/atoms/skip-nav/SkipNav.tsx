import styles from './skip-nav.module.scss';

export interface SkipNavProps {
  /** Text for the skip nav link — maps to `text` in the Twig pattern. */
  text?: string;
  /** Additional CSS class names as an array — maps to `skip_nav_classes` in the Twig pattern. */
  skipNavClasses?: string[];
  /** Additional CSS class names as a string — maps to `skip_nav_other_classes` in the Twig pattern. */
  className?: string;
  /** Slot content — overrides `text` when provided; maps to the `skip_nav_content` Twig block. */
  children?: React.ReactNode;
  /** Link target. Defaults to `#content` to match the Twig pattern. */
  href?: string;
}

function buildClasses(skipNavClasses?: string[], className?: string): string {
  return [
    'skip-nav',
    'screen-reader-text',
    ...(skipNavClasses ?? []),
    className ?? null,
  ].filter(Boolean).join(' ');
}

export function SkipNav({
  text = 'Skip to main content',
  skipNavClasses,
  className,
  children,
  href = '#content',
}: SkipNavProps) {
  const cls = buildClasses(skipNavClasses, className);

  return (
    <a className={cls} href={href} data-pattern="timberland/skip-nav">
      {children ?? text}
    </a>
  );
}

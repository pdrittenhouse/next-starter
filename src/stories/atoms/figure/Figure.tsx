export type CaptionPosition = 'before' | 'after';

export interface FigureProps {
  /** Figure caption text. */
  caption?: string;
  /** Where the caption renders relative to the content block. Defaults to 'after'. */
  captionPosition?: CaptionPosition;
  /** Additional CSS class names — maps to `figure_classes` in the Twig pattern. */
  figureClasses?: string[];
  /** Additional CSS class name string — maps to `figure_other_classes` in the Twig pattern. */
  figureOtherClasses?: string;
  /** Slotted content — mirrors the Twig `content` block. */
  children?: React.ReactNode;
}

function buildClasses(extra: string[] = [], otherClasses?: string): string {
  return ['figure', ...extra, otherClasses ?? null]
    .filter(Boolean)
    .sort()
    .join(' ')
    .trim();
}

export function Figure({
  caption,
  captionPosition = 'after',
  figureClasses,
  figureOtherClasses,
  children,
}: FigureProps) {
  const cls = buildClasses(figureClasses, figureOtherClasses);
  const showBefore = caption && captionPosition === 'before';
  const showAfter = caption && captionPosition === 'after';

  return (
    <figure className={cls} data-pattern="timberland/figure">
      {showBefore && <figcaption>{caption}</figcaption>}
      {children}
      {showAfter && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

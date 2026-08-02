type ClassValue = string | null | undefined | false | 0;

/**
 * Combines class names, dual-applying any class found in the given CSS Modules
 * styles object — the hashed module class is prepended to the literal so both
 * are present on the element. Classes absent from moduleStyles pass through as
 * literals only. Falsy values are silently dropped.
 *
 * Usage:
 *   import styles from './foo.module.scss';
 *   import { cx } from '@/lib/cx';
 *   <div className={cx(styles, 'foo', conditionalClass, props.className)} />
 */
export function cx(
  moduleStyles: Record<string, string>,
  ...args: ClassValue[]
): string {
  const result: string[] = [];
  for (const val of args) {
    if (!val) continue;
    const cls = String(val);
    const hashed = moduleStyles[cls];
    if (hashed) result.push(hashed);
    result.push(cls);
  }
  return result.join(' ');
}

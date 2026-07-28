import type { CSSProperties } from 'react';

/**
 * Converts a CSS declaration string into a React CSSProperties object.
 *
 * Handles the inline style strings returned by the `contentWrapperStyle`
 * GraphQL field, e.g. "padding-top: 20px; padding-bottom: 40px;" →
 * { paddingTop: '20px', paddingBottom: '40px' }
 *
 * Returns undefined when the string is empty or nullish so callers can
 * safely spread or pass directly to the style prop.
 */
export function parseCssStyle(css: string | null | undefined): CSSProperties | undefined {
  if (!css) return undefined;

  return css.split(';').reduce<CSSProperties>((acc, decl) => {
    const colon = decl.indexOf(':');
    if (colon === -1) return acc;
    const prop = decl.slice(0, colon).trim();
    const val  = decl.slice(colon + 1).trim();
    if (!prop || !val) return acc;
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()) as keyof CSSProperties;
    (acc as Record<string, string>)[camel] = val;
    return acc;
  }, {});
}

/**
 * Coerce an ACF true_false field to a boolean.
 * ACF stores these as true/1/"1" (checked) or false/0/"0" (unchecked).
 * Using ?? or || on these raw values is unsafe because "0" is truthy in JS.
 */
export function acfBool(val: unknown): boolean {
  return val === true || val === 1 || val === '1';
}

/**
 * Parse an ACF repeater field from block attributesJSON.data.
 *
 * ACF stores repeater fields in block attributes as flat keys:
 *   { fieldName: 2, fieldName_0_sub: val, fieldName_1_sub: val }
 * where the top-level key is the row count.
 *
 * Storybook mocks (and any future API version that serialises arrays directly)
 * may supply a proper array — both formats are handled transparently.
 */
export function parseAcfRepeater<T extends Record<string, unknown>>(
  data: Record<string, unknown>,
  fieldName: string,
): T[] {
  const raw = data[fieldName];

  if (Array.isArray(raw)) return raw as T[];

  const count = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
  if (!count || isNaN(count) || count <= 0) return [];

  const prefix = `${fieldName}_`;
  const result: T[] = [];

  for (let i = 0; i < count; i++) {
    const rowPrefix = `${prefix}${i}_`;
    const row: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      if (key.startsWith(rowPrefix)) {
        row[key.slice(rowPrefix.length)] = data[key];
      }
    }
    result.push(row as T);
  }

  return result;
}

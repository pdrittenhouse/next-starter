export interface TimberlandTreeNode {
  /**
   * - 'pattern'  — a registered Timberland pattern (maps to PATTERN_MAP or a generic element shell)
   * - 'slot'     — a named content insertion point (e.g. the 'content' slot → BlockRenderer)
   * - 'element'  — a structural HTML wrapper node (not a pattern; used for <main>, <div>, etc.)
   *                The 'element' field names the tag; 'className'/'id'/'style' set its attributes.
   *                Children recurse through TemplateRenderer.
   */
  type: 'pattern' | 'slot' | 'element';
  slug?: string | null;
  name?: string | null;
  source?: string | null;
  level?: string | null;
  file?: string | null;
  /** Outermost HTML element tag, e.g. "header", "main", "div". */
  element?: string | null;
  /** CSS class string for the element, e.g. "content-wrapper sidebar-active". */
  className?: string | null;
  /** ID attribute for the element, e.g. "content". */
  id?: string | null;
  /** Inline CSS declaration string for the element, e.g. "padding-top: 20px; padding-bottom: 40px;". */
  style?: string | null;
  children?: TimberlandTreeNode[] | null;
}

export interface TimberlandPatternEntry {
  slug: string;
  base?: string | null;
  variant?: string | null;
  level?: string | null;
  source?: string | null;
}

export interface TimberlandTemplateEntry {
  key: string;
  file?: string | null;
  patterns?: TimberlandPatternEntry[];
  tree?: TimberlandTreeNode[] | null;
}

export interface TimberlandPatternManifest {
  version?: string | null;
  patterns?: TimberlandPatternEntry[];
  templates?: TimberlandTemplateEntry[];
}

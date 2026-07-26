export interface TimberlandTreeNode {
  type: 'pattern' | 'slot';
  slug?: string | null;
  name?: string | null;
  source?: string | null;
  level?: string | null;
  file?: string | null;
  /** Outermost HTML element tag extracted from the pattern's Twig file, e.g. "header". */
  element?: string | null;
  /** Classes from the pattern's rendered outer element, e.g. "site-header navbar". */
  className?: string | null;
  /** ID from the pattern's rendered outer element, e.g. "siteHeader". */
  id?: string | null;
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

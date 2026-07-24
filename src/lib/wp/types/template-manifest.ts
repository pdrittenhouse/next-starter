export interface TimberlandTreeNode {
  type: 'pattern' | 'slot';
  slug?: string | null;
  name?: string | null;
  source?: string | null;
  level?: string | null;
  file?: string | null;
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

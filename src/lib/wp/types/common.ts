/**
 * Common WPGraphQL types shared across all content types.
 */

/** Standard WPGraphQL connection wrapper. */
export interface WpConnection<T> {
  edges: Array<{ node: T }>;
}

/** Alternative connection shape using `nodes` instead of `edges`. */
export interface WpNodeConnection<T> {
  nodes: T[];
}

/** WordPress image/media reference. */
export interface WpImage {
  id: string;
  sourceUrl: string;
  altText?: string;
  caption?: string;
  srcSet?: string;
  sizes?: string;
}

/** WordPress avatar. */
export interface WpAvatar {
  url: string;
  height: number;
  width: number;
}

/** Author node as returned in content queries. */
export interface WpAuthor {
  node: {
    id: string;
    name: string;
    slug: string;
    avatar?: WpAvatar;
  };
}

/** Taxonomy term as returned in `terms` connections. */
export interface WpTerm {
  id: string;
  name: string;
  slug: string;
  taxonomyName?: string;
  uri?: string;
}

/** Editor block (WPGraphQL Content Blocks plugin). */
export interface WpEditorBlock {
  name: string;
  clientId: string;
  parentClientId?: string;
  renderedHtml?: string;
}

/** Per-content SEO data (Yoast/RankMath via custom resolver). */
export interface WpSeo {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  robots?: string;
  schema?: string;
}

/** Content type registration info from contentTypes query. */
export interface WpContentType {
  id: string;
  name: string;
  label: string;
  description?: string;
  graphqlPluralName: string;
  graphqlSingleName: string;
  showInAdminBar?: boolean;
  showInGraphql?: boolean;
  showInNavMenus?: boolean;
  showInRest?: boolean;
  showUi?: boolean;
  hierarchical?: boolean;
  hasArchive?: boolean;
  menuPosition?: number;
  menuIcon?: string;
}

/** Taxonomy registration info from taxonomies query. */
export interface WpTaxonomy {
  id: string;
  label?: string;
  name: string;
  description?: string;
  graphqlPluralName: string;
  graphqlSingleName: string;
}

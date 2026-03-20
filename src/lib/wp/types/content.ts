/**
 * WordPress content types: Posts, Pages, Media, Comments, Revisions.
 */

import type {
  WpConnection,
  WpImage,
  WpAuthor,
  WpTerm,
  WpEditorBlock,
  WpSeo,
} from './common';

/** Category node. */
export interface WpCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  categoryId?: number;
  parentDatabaseId?: number;
  parentId?: string;
  taxonomyName?: string;
  uri?: string;
  isRestricted?: boolean;
  isContentNode?: boolean;
  isTermNode?: boolean;
  link?: string;
  termGroupId?: number;
  termTaxonomyId?: number;
}

/** Tag node. */
export interface WpTag {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  tagId?: number;
  taxonomyName?: string;
  uri?: string;
  isRestricted?: boolean;
  isContentNode?: boolean;
  isTermNode?: boolean;
  link?: string;
  termGroupId?: number;
  termTaxonomyId?: number;
}

/** Post node. */
export interface WpPost {
  id: string;
  databaseId: number;
  slug: string;
  title: string;
  date?: string;
  modified?: string;
  status?: string;
  uri?: string;
  isSticky?: boolean;
  postId?: number;
  content?: string;
  excerpt?: string;
  categories?: WpConnection<WpCategory>;
  tags?: WpConnection<WpTag>;
  author?: WpAuthor;
  featuredImage?: { node: WpImage };
  terms?: WpConnection<WpTerm>;
  editorBlocks?: WpEditorBlock[];
  seo?: WpSeo;
}

/** Page node. */
export interface WpPage {
  id: string;
  databaseId?: number;
  slug: string;
  title: string;
  uri: string;
  menuOrder?: number;
  content?: string;
  date?: string;
  modified?: string;
  status?: string;
  parent?: {
    node: {
      id: string;
      slug: string;
      uri: string;
      title?: string;
    };
  };
  children?: WpConnection<{
    id: string;
    slug: string;
    uri: string;
    title?: string;
  }>;
  author?: WpAuthor;
  featuredImage?: { node: WpImage };
  terms?: WpConnection<WpTerm>;
  editorBlocks?: WpEditorBlock[];
  seo?: WpSeo;
}

/** Media item node. */
export interface WpMediaItem {
  id: string;
  databaseId: number;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  sourceUrl: string;
  srcSet?: string;
  sizes?: string;
  mediaItemUrl?: string;
  mimeType?: string;
  mediaType?: string;
  fileSize?: number;
  date?: string;
  modified?: string;
  slug?: string;
  status?: string;
  mediaDetails?: {
    height: number;
    width: number;
    file?: string;
    sizes?: Array<{
      name: string;
      sourceUrl: string;
      width: string;
      height: string;
      mimeType: string;
    }>;
  };
}

/** Comment node. */
export interface WpComment {
  id: string;
  databaseId: number;
  content?: string;
  date?: string;
  status?: string;
  type?: string;
  approved?: boolean;
  karma?: number;
  parentDatabaseId?: number;
  parentId?: string;
  author?: {
    node: {
      id: string;
      name: string;
      email?: string;
      url?: string;
    };
  };
  commentedOn?: {
    node: {
      id: string;
      databaseId: number;
      title?: string;
      slug?: string;
    };
  };
}

/** Revision node. */
export interface WpRevision {
  id: string;
  databaseId: number;
  title?: string;
  date?: string;
  slug?: string;
  status?: string;
  parentDatabaseId?: number;
  parentId?: string;
  author?: {
    node: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

/** Content node (union of all content types). */
export interface WpContentNode {
  id: string;
  databaseId: number;
  slug?: string;
  uri?: string;
  status?: string;
  date?: string;
  modified?: string;
  title?: string;
  excerpt?: string;
  sourceUrl?: string;
  contentType?: {
    node: {
      name: string;
      label: string;
    };
  };
}

/** Post format. */
export interface WpPostFormat {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  uri?: string;
}

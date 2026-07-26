import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './post-meta.module.scss';

interface PostMetaBlockData {
  [key: string]: unknown;
}

interface PostMetaBlockProps {
  block: EditorBlock;
}

export async function PostMetaBlock({ block }: PostMetaBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: PostMetaBlockData; className?: string };
  void attrs;
  if (!block.renderedHtml) return null;
  return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
}

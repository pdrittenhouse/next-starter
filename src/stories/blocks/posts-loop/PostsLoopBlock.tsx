import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './posts-loop.module.scss';
import { PostsLoopClient } from './PostsLoopClient';

interface PostsLoopBlockData {
  [key: string]: unknown;
}

interface PostsLoopBlockProps {
  block: EditorBlock;
}

export async function PostsLoopBlock({ block }: PostsLoopBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: PostsLoopBlockData; className?: string };
  void attrs;
  void styles;
  if (!block.renderedHtml) return null;
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />
      <PostsLoopClient />
    </>
  );
}

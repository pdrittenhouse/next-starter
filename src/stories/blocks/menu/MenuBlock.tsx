import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './menu.module.scss';

interface MenuBlockData {
  [key: string]: unknown;
}

interface MenuBlockProps {
  block: EditorBlock;
}

export async function MenuBlock({ block }: MenuBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: MenuBlockData; className?: string };
  void attrs;
  if (!block.renderedHtml) return null;
  return <nav dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
}

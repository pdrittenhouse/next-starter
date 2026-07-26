import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './search-bar.module.scss';

interface SearchBarBlockData {
  [key: string]: unknown;
}

interface SearchBarBlockProps {
  block: EditorBlock;
}

export async function SearchBarBlock({ block }: SearchBarBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: SearchBarBlockData; className?: string };
  void attrs;
  if (!block.renderedHtml) return null;
  return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
}

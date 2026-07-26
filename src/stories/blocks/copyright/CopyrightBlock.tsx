import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './copyright.module.scss';

interface CopyrightBlockData {
  [key: string]: unknown;
}

interface CopyrightBlockProps {
  block: EditorBlock;
}

export async function CopyrightBlock({ block }: CopyrightBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: CopyrightBlockData; className?: string };
  void attrs;
  if (!block.renderedHtml) return null;
  return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
}

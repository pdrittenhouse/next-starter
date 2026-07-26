import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './pattern.module.scss';

interface PatternBlockData {
  [key: string]: unknown;
}

interface PatternBlockProps {
  block: EditorBlock;
}

export async function PatternBlock({ block }: PatternBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: PatternBlockData; className?: string };
  void attrs;
  if (!block.renderedHtml) return null;
  return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
}

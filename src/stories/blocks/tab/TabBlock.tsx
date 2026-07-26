import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './tab.module.scss';

interface TabBlockData {
  tab_label?: string | null;
  active?: boolean;
}

interface TabBlockProps {
  block: EditorBlock;
}

/**
 * Standalone tab block. Normally rendered recursively inside TabsBlock.
 * When rendered at top level, falls through to renderedHtml.
 */
export async function TabBlock({ block }: TabBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: TabBlockData; className?: string };
  void attrs;
  if (!block.renderedHtml) return null;
  return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
}

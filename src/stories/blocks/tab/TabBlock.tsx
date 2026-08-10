import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './tab.module.scss';

/**
 * ACF id group field — stores either a custom string or an auto-generated
 * integer suffix. Mirrors AcfIdField in TabsBlock.tsx.
 */
interface AcfIdField {
  id?: string | null;
  id_gen?: string | null;
}

interface TabBlockData {
  tab_label?: string | null;
  /**
   * Group: custom / generated per-tab ID.
   * Mirrors the module-id clone used by the parent tabs wrapper.
   * Resolved as: id.id ?: 'tab' ~ id.id_gen
   * Consumed by TabsBlock when building panel id attributes and nav hrefs.
   */
  id?: AcfIdField;
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

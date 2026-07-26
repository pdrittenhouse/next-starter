import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './sidebar.module.scss';

interface SidebarBlockData {
  [key: string]: unknown;
}

interface SidebarBlockProps {
  block: EditorBlock;
}

export async function SidebarBlock({ block }: SidebarBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: SidebarBlockData; className?: string };
  void attrs;
  if (!block.renderedHtml) return null;
  return <aside dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
}

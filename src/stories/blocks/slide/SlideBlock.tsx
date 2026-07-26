import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './slide.module.scss';

interface SlideBlockData {
  [key: string]: unknown;
}

interface SlideBlockProps {
  block: EditorBlock;
}

export async function SlideBlock({ block }: SlideBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: SlideBlockData; className?: string };
  void attrs;
  if (!block.renderedHtml) return null;
  return <div className="carousel-cell" dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
}

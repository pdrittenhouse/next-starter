import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './button-text.module.scss';

interface ButtonTextBlockData {
  button_text?: string | null;
}

interface ButtonTextBlockProps {
  block: EditorBlock;
}

export async function ButtonTextBlock({ block }: ButtonTextBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: ButtonTextBlockData; className?: string };
  const data: ButtonTextBlockData = attrs?.data ?? {};

  if (data.button_text) {
    return <span>{data.button_text}</span>;
  }

  if (!block.renderedHtml) return null;
  return <span dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
}

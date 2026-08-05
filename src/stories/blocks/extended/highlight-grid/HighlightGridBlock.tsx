// TODO: implement — mirrors acf/highlight-grid block in timberland-extended plugin
import type { EditorBlock } from '@/types/blocks';

export async function HighlightGridBlock({ block }: { block: EditorBlock }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />
  );
}

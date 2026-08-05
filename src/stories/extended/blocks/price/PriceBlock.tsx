// TODO: implement — mirrors acf/price block in timberland-extended plugin
import type { EditorBlock } from '@/types/blocks';

export async function PriceBlock({ block }: { block: EditorBlock }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />
  );
}

// TODO: implement — mirrors acf/promo block in timberland-extended plugin
import type { EditorBlock } from '@/types/blocks';

export async function PromoBlock({ block }: { block: EditorBlock }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />
  );
}

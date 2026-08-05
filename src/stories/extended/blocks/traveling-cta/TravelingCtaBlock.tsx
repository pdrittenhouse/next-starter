// TODO: implement — mirrors acf/traveling-cta block in timberland-extended plugin
import type { EditorBlock } from '@/types/blocks';

export async function TravelingCtaBlock({ block }: { block: EditorBlock }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />
  );
}

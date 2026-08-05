// TODO: implement — mirrors acf/feature block in timberland-extended plugin
import type { EditorBlock } from '@/types/blocks';

export async function FeatureBlock({ block }: { block: EditorBlock }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />
  );
}

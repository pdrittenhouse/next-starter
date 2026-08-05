// TODO: implement — mirrors acf/logo-slider block in timberland-extended plugin
import type { EditorBlock } from '@/types/blocks';

export async function LogoSliderBlock({ block }: { block: EditorBlock }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />
  );
}

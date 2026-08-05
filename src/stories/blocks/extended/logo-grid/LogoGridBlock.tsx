// TODO: implement — mirrors acf/logo-grid block in timberland-extended plugin
import type { EditorBlock } from '@/types/blocks';

export async function LogoGridBlock({ block }: { block: EditorBlock }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />
  );
}

import { Image } from '@/stories/atoms/image/Image';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './highlight-grid.module.scss';
import { cx } from '@/lib/cx';

interface HighlightGridItem {
  item_type?: boolean;
  title?: string | null;
  image?: {
    url?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  label?: string | null;
}

interface HighlightGridBlockData {
  items?: HighlightGridItem[] | null;
}

export async function HighlightGridBlock({ block }: { block: EditorBlock }) {
  const attrs = parseBlockAttributes(block) as { data?: HighlightGridBlockData; className?: string };
  const data: HighlightGridBlockData = attrs?.data ?? {};

  if (!data.items?.length) {
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />;
  }

  const className = cx(styles, 'block-highlight-grid', attrs.className);

  return (
    <div className={className} data-pattern="timberland/highlight-grid">
      <div className="block-highlight-grid--wrapper">
        {data.items.map((item, i) => (
          <div key={i} className="block-highlight-grid--item">
            {item.item_type && item.image?.url ? (
              <Image
                src={item.image.url}
                alt={item.image.alt ?? ''}
                width={item.image.width ?? undefined}
                height={item.image.height ?? undefined}
                loading="lazy"
                className="block-highlight-grid--image"
              />
            ) : item.title ? (
              <h4 className="block-highlight-grid--title">{item.title}</h4>
            ) : null}
            {item.label && (
              <h6 className="block-highlight-grid--label">{item.label}</h6>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

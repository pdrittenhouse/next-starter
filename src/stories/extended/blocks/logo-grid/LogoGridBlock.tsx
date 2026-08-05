import { Image } from '@/stories/patterns/atoms/image/Image';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './logo-grid.module.scss';
import { cx } from '@/lib/cx';

interface LogoItem {
  logo?: {
    image_type?: 'file' | 'url' | null;
    image?: {
      url?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
    image_url?: string | null;
  } | null;
  width?: number | null;
  height?: number | null;
}

interface LogoGridBlockData {
  title?: string | null;
  intro?: string | null;
  logos?: LogoItem[] | null;
  grayscale?: boolean;
}

export async function LogoGridBlock({ block }: { block: EditorBlock }) {
  const attrs = parseBlockAttributes(block) as { data?: LogoGridBlockData; className?: string };
  const data: LogoGridBlockData = attrs?.data ?? {};

  if (!data.logos?.length) {
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />;
  }

  const className = cx(styles, 'logo-grid-block', attrs.className);
  const wrapperClass = cx(styles, 'logo-grid--wrapper', data.grayscale ? 'grayscale-images' : null);

  return (
    <div className={className} data-pattern="timberland/logo-grid">
      <div className="logo-grid">
        <div className="col">
          {data.title && <h4 className="logo-grid--title">{data.title}</h4>}
          {data.intro && <div className="logo-grid--intro">{data.intro}</div>}
          <div className={wrapperClass}>
            {data.logos.map((item, i) => {
              const src =
                item.logo?.image_type === 'file'
                  ? (item.logo?.image?.url ?? undefined)
                  : (item.logo?.image_url ?? undefined);
              if (!src) return null;
              return (
                <div key={i} className="logo-grid--item">
                  <Image
                    src={src}
                    alt={item.logo?.image?.alt ?? ''}
                    width={item.width ? item.width : (item.logo?.image?.width ?? undefined)}
                    height={item.height ? item.height : (item.logo?.image?.height ?? undefined)}
                    loading="lazy"
                    className="logo-grid--image"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

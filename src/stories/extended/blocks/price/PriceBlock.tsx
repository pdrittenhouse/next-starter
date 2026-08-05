import type { CSSProperties } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './price.module.scss';
import { cx } from '@/lib/cx';

interface PriceBlockData {
  label?: string | null;
  symbol?: string | null;
  whole_amount?: number | null;
  separator?: string | null;
  change_amount?: number | null;
  frequency_separator?: string | null;
  frequency?: string | null;
  terms?: string | null;
  style?: string | null;
  align?: string | null;
}

export async function PriceBlock({ block }: { block: EditorBlock }) {
  const attrs = parseBlockAttributes(block) as { data?: PriceBlockData; className?: string };
  const data: PriceBlockData = attrs?.data ?? {};

  if (data.whole_amount == null && !data.label) {
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml ?? '' }} />;
  }

  const styleVariant = data.style && data.style !== 'default' ? data.style : null;
  const className = cx(styles, 'block-price', 'price', styleVariant, attrs.className);
  const rootStyle = data.align ? { textAlign: data.align as CSSProperties['textAlign'] } : undefined;

  const hasRemainder = data.change_amount != null;
  const hasMeta = hasRemainder || data.frequency_separator || data.frequency;

  return (
    <div className={className} style={rootStyle} data-pattern="timberland/price">
      <div className="price-wrapper">
        {data.label && <span className="label">{data.label}</span>}
        <div className="amount">
          <div className="price-main">
            {data.symbol && <span className="symbol">{data.symbol}</span>}
            {data.whole_amount != null && <span className="whole">{data.whole_amount}</span>}
            {data.separator && <span className="separator">{data.separator}</span>}
          </div>
          {hasMeta && (
            <div className="price-meta">
              {hasRemainder && <span className="remainder">{data.change_amount}</span>}
              {data.frequency_separator && <span className="frequency-separator">{data.frequency_separator}</span>}
              {data.frequency && <span className="frequency">{data.frequency}</span>}
            </div>
          )}
        </div>
        {data.terms && (
          <div className="details">
            <span className="terms">{data.terms}</span>
          </div>
        )}
      </div>
    </div>
  );
}


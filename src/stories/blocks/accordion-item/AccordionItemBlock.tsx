import type { ReactNode } from 'react';
import { Button } from '@/stories/atoms/button/Button';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './accordion-item.module.scss';
import { cx } from '@/lib/cx';

interface AccordionItemBlockData {
  header?: string | null;
  active?: boolean;
  header_element?: string | null;
}

interface AccordionItemBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

/**
 * Standalone accordion-item block. Normally rendered recursively inside
 * AccordionBlock (which uses the Accordion molecule). When rendered at top
 * level, builds the accordion-item structure using the Button atom for the
 * collapse toggle — mirroring accordion-item.twig's @atoms/button include.
 */
export async function AccordionItemBlock({ block, children }: AccordionItemBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: AccordionItemBlockData; className?: string };
  const data: AccordionItemBlockData = attrs?.data ?? {};

  if (!data.header) {
    if (!block.renderedHtml) return null;
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
  }

  // Derive a stable item ID from the block clientId
  const itemId = block.clientId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const collapseId = `collapse_${itemId}`;
  const headerId = `accordionHeader_${itemId}`;

  const HeadingEl = (data.header_element ?? 'h2') as keyof JSX.IntrinsicElements;

  const fallbackHtml = block.renderedHtml ?? '';
  const itemClasses = cx(styles, 'accordion-item', attrs.className);

  return (
    <div className={itemClasses}>
      <HeadingEl id={headerId} className="accordion-header">
        <Button
          label={data.header}
          toggle="collapse"
          href={`#${collapseId}`}
          aria-expanded={data.active ? 'true' : 'false'}
          aria-controls={collapseId}
          className={data.active ? 'accordion-button' : 'accordion-button collapsed'}
        />
      </HeadingEl>
      <div
        id={collapseId}
        className={`accordion-collapse collapse${data.active ? ' show' : ''}`}
        aria-labelledby={headerId}
      >
        <div className="accordion-body">
          {children ?? <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />}
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './row.module.scss';
import { getContentWrapperOptions } from '@/lib/wp/utils/getContentWrapperOptions';

interface GutterEntry {
  breakpoint?: string | null;
  value?: string | null;
}

interface AlignEntry {
  breakpoint?: string | null;
  alignment?: string | null;
}

interface RowBlockData {
  vert_gutters?: { gutters?: GutterEntry[] };
  hor_gutters?: { gutters?: GutterEntry[] };
  vert_align?: AlignEntry[];
  hor_align?: AlignEntry[];
  container?: boolean;
  full_width?: boolean;
  container_breakpoint?: { breakpoint?: string | null };
  max_width_fluid_container?: boolean;
  no_gutters?: boolean;
}

interface RowBlockProps {
  block: EditorBlock;
  children?: ReactNode;
}

function buildGutterClasses(gutters: GutterEntry[] | undefined, prefix: 'gy' | 'gx'): string[] {
  if (!gutters) return [];
  return gutters
    .filter(g => g.value)
    .map(g => {
      const bp = g.breakpoint ? `-${g.breakpoint}` : '';
      return `${prefix}${bp}-${g.value}`;
    });
}

function buildAlignClasses(aligns: AlignEntry[] | undefined, cssPrefix: string): string[] {
  if (!aligns) return [];
  return aligns
    .filter(a => a.alignment)
    .map(a => {
      const bp = a.breakpoint ? `-${a.breakpoint}` : '';
      return `${cssPrefix}${bp}-${a.alignment}`;
    });
}

// Mirrors Twig row.twig container_classes logic
function buildRowContainerClasses(data: RowBlockData, extraClass?: string | null): string {
  const bp = data.container_breakpoint?.breakpoint ? `-${data.container_breakpoint.breakpoint}` : '';
  const base = data.full_width ? 'container-fluid' : `container${bp}`;
  const maxWidth = data.max_width_fluid_container ? 'max-width-fluid-container' : null;
  return [base, maxWidth, extraClass].filter(Boolean).join(' ');
}

export async function RowBlock({ block, children }: RowBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: RowBlockData; className?: string };
  const data: RowBlockData = attrs?.data ?? {};

  // Guard: a parent SectionBlock injected _context when it already added a container.
  // Mirrors Twig row.twig: block_context['acf/fields']['container'] != true guard.
  const parentContainerSet = (block as any)._context?.parentContainerSet === true;

  // Container div renders when either the global or per-post disable-containers flag is on.
  // Mirrors framework: fields.container AND (options.remove_content_containers OR block_post.custom['remove_content_container'])
  const { removeContentContainers: globalRCC } = await getContentWrapperOptions();
  const perPostRCC = (block as any)._context?.removeContentContainerPerPost === true;
  const removeContentContainers = (globalRCC === true) || perPostRCC;
  const addContainer = data.container === true && !parentContainerSet && removeContentContainers;

  // mx-0 neutralizes Bootstrap's negative row margins when containers are globally
  // disabled, this row has no container of its own, and no parent already set one.
  const addMxZero = removeContentContainers && !parentContainerSet && !data.container;

  const vertGutters = buildGutterClasses(data.vert_gutters?.gutters, 'gy');
  const horGutters = buildGutterClasses(data.hor_gutters?.gutters, 'gx');
  const vertAlign = buildAlignClasses(data.vert_align, 'align-items');
  const horAlign = buildAlignClasses(data.hor_align, 'justify-content');

  // When this row adds a container, className goes to the container div (Twig: container_classes).
  // When it doesn't, className goes to the row div (Twig: row_classes when fields.container != true).
  const rowClasses = [
    'row',
    addMxZero ? 'mx-0' : null,
    data.no_gutters ? 'g-0' : null,
    !addContainer ? attrs.className : null,
    ...vertGutters,
    ...horGutters,
    ...vertAlign,
    ...horAlign,
  ].filter(Boolean).join(' ');

  const fallbackHtml = block.renderedHtml ?? '';

  if (!children && !fallbackHtml) return null;

  const rowEl = (
    <div className={rowClasses}>
      {children ?? <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />}
    </div>
  );

  if (addContainer) {
    return (
      <div className={buildRowContainerClasses(data, attrs.className)}>
        {rowEl}
      </div>
    );
  }

  return rowEl;
}

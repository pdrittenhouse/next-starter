import { cache } from 'react';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_WIDGET_AREA_BLOCKS } from '@/lib/wp/queries/widgets';
import { buildBlockTree } from '@/lib/wp/utils/blockTree';
import { BlockRenderer } from '@/stories/templates/partials/block-renderer';
import styles from './SidebarPattern.module.scss';
import { cx } from '@/lib/cx';

const getWidgetAreaBlocks = cache(async (slug: string) => {
  const { data } = await fetchGraphQL(print(GET_WIDGET_AREA_BLOCKS), { slug }).catch(() => ({ data: null }));
  return (data as any)?.widgetAreaBlocks ?? null;
});

interface SidebarPatternProps {
  slug: string;
  className?: string;
}

/**
 * Renders a WordPress widget area as a sidebar <aside>.
 * Mirrors partials/content/sidebar.twig — the sidebar is placed as a sibling
 * of <article> inside <main>. The CSS classes match sidebar.twig:
 *   sidebar sidebar-{variant}   e.g. sidebar sidebar-primary
 *
 * The slug is the registered widget area ID: primary_sidebar, secondary_sidebar,
 * or tertiary_sidebar. Returns null when the widget area has no active blocks.
 */
export async function SidebarPattern({ slug, className }: SidebarPatternProps) {
  const blocks = await getWidgetAreaBlocks(slug);
  if (!blocks?.length) return null;

  const variant = slug.replace('_sidebar', '');
  const sidebarClasses = cx(styles, 'sidebar', `sidebar-${variant}`, className);

  return (
    <aside className={sidebarClasses}>
      <BlockRenderer blocks={buildBlockTree(blocks)} />
    </aside>
  );
}

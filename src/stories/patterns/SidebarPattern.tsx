import { cache } from 'react';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_WIDGET_AREA } from '@/lib/wp/queries/widgets';
import styles from './SidebarPattern.module.scss';
import { cx } from '@/lib/cx';

const getWidgetAreaHtml = cache(async (slug: string) => {
  const { data } = await fetchGraphQL(print(GET_WIDGET_AREA), { slug }).catch(() => ({ data: null }));
  return (data as any)?.widgetArea ?? null;
});

interface SidebarPatternProps {
  slug: string;
  className?: string;
}

/**
 * Renders a WordPress widget area as a sidebar <aside>.
 * Mirrors partials/content/sidebar.twig — the sidebar is placed as a Bootstrap
 * column sibling inside article-content--row. The CSS classes match sidebar.twig:
 *   sidebar sidebar-{variant}   e.g. sidebar sidebar-primary
 *
 * Uses the widgetArea(slug) GraphQL field which calls dynamic_sidebar()
 * server-side and returns rendered HTML — works for both classic and block widgets.
 * Returns null when the widget area is empty or not registered.
 */
export async function SidebarPattern({ slug, className }: SidebarPatternProps) {
  const html = await getWidgetAreaHtml(slug);
  if (!html) return null;

  const variant = slug.replace('_sidebar', '');
  const sidebarClasses = cx(styles, 'sidebar', `sidebar-${variant}`, className);

  return (
    <aside className={sidebarClasses} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

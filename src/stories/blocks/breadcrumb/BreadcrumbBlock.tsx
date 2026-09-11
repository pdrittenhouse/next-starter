import { Breadcrumb } from '@/stories/patterns/atoms/breadcrumb/Breadcrumb';
import type { BreadcrumbItem } from '@/stories/patterns/atoms/breadcrumb/Breadcrumb';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './breadcrumb.module.scss';
import { cx } from '@/lib/cx';
import { getBreadcrumbs } from '@/lib/wp/breadcrumbStore';

/**
 * ACF field values for the breadcrumb block, as they appear in attributesJSON.data.
 *
 * Mirrors the fields consumed in breadcrumb.twig:
 *   fields.divider          — separator character (default &#187; / »)
 *   fields.label            — optional prefix text for the current/last item
 *   fields.show_home        — whether to prepend a Home link to the trail
 *   fields.text_home        — label for the home link (default 'Home')
 *   fields.home_link        — URL for the home link (defaults to '/')
 *   fields.show_categories  — whether to include taxonomy ancestors in the trail
 *   fields.text_404         — label used when displaying a 404 trail item (default '404')
 *   fields.items            — optional ACF repeater that pre-builds the breadcrumb trail
 *                             for headless contexts (avoids needing the PHP helper)
 */
interface BreadcrumbBlockData {
  divider?: string | null;
  label?: string | null;
  show_home?: boolean;
  text_home?: string | null;
  home_link?: string | null;
  show_categories?: boolean;
  text_404?: string | null;
  /** Pre-built trail items — populated via ACF repeater for headless delivery. */
  items?: Array<{ text?: string; url?: string }> | null;
}

interface BreadcrumbBlockProps {
  block: EditorBlock;
}

/**
 * Breadcrumb block — mirrors `src/templates/blocks/breadcrumb/breadcrumb.twig`.
 *
 * Mirrors the Twig block's relationship with the breadcrumb pattern: just as the
 * Twig block includes `@atoms/breadcrumb/_breadcrumb.tpl.twig`, this component
 * renders the Breadcrumb atom.
 *
 * In WordPress the breadcrumb trail is generated at render time by
 * `Timberland\Framework\Breadcrumb::get_breadcrumb()`. In the headless context
 * that PHP helper is unavailable, so the trail is resolved in priority order:
 *
 *   1. `fields.items` ACF repeater — if populated, used directly as the trail.
 *   2. `fields.show_home` config — if no repeater items are present, a minimal
 *      single-item trail is built from the show_home / text_home / home_link
 *      fields so the component renders something meaningful rather than null.
 *
 * Registered in BLOCK_MAP as 'acf/breadcrumb'.
 */
export async function BreadcrumbBlock({ block }: BreadcrumbBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: BreadcrumbBlockData; className?: string };
  const data: BreadcrumbBlockData = attrs?.data ?? {};

  const divider = data.divider ?? undefined;
  const label = data.label ?? undefined;

  // Resolve the breadcrumb trail.
  //
  // Priority 1: the REAL trail, from the node's `breadcrumbs` GraphQL field,
  // seeded into a per-request store by RouteContent.
  //
  // This is what the block should have been using. It previously had only
  // priorities 2 and 3, on the stated assumption that the PHP helper was
  // "unavailable in the headless context" — true of
  // `Breadcrumb::get_breadcrumb()`, which reads the main query, but the
  // framework also has a post-ID-driven resolver that was never exposed: it
  // computed the trail and threw it away behind an SEO-plugin check. The
  // practical result was that this block rendered a lone "Home" crumb on every
  // page.
  let items: BreadcrumbItem[] = (getBreadcrumbs() ?? [])
    .filter((crumb) => crumb?.label)
    .map((crumb) => ({
      text: crumb.label as string,
      // The last crumb renders as text, not a link, so its URL is unused.
      url: crumb.url ?? '',
    }));

  // Priority 2: an explicit ACF repeater, if a project populates one. Kept as
  // an override for what the automatic trail cannot know — a landing page that
  // should claim a different parent, say.
  if (Array.isArray(data.items) && data.items.length > 0) {
    items = data.items
      .filter((item): item is { text: string; url: string } =>
        typeof item.text === 'string' && item.text.trim() !== '' &&
        typeof item.url === 'string' && item.url.trim() !== '',
      )
      .map((item) => ({ text: item.text, url: item.url }));
  }

  // Priority 3: a minimal home-only trail, for a node-less route (search, a
  // date archive) where a breadcrumb block still appears in a widget area.
  if (items.length === 0 && data.show_home) {
    const homeText = data.text_home?.trim() || 'Home';
    const homeUrl = data.home_link?.trim() || '/';
    items = [{ text: homeText, url: homeUrl }];
  }

  // A single crumb is not a trail — the front page resolves to exactly one —
  // and rendering "Home" alone is noise. Matches the JSON-LD threshold.
  if (items.length < 2) {
    return null;
  }

  const blockClasses = cx(styles, 'block-breadcrumb', attrs.className);

  return (
    <div className={blockClasses}>
      <Breadcrumb
        items={items}
        divider={divider}
        label={label}
      />
    </div>
  );
}

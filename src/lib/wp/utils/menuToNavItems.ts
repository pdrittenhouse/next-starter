import type { NavItem } from '@/stories/patterns/molecules/nav/Nav';

interface WpMenuItemNode {
  id: string;
  label?: string | null;
  title?: string | null;
  parentId?: string | null;
  url?: string | null;
  path?: string | null;
  target?: string | null;
  cssClasses?: string[] | null;
  description?: string | null;
  menuItemId?: number | null;
  megaMenuPanelId?: number | null;
}

interface WpMenuItemEdge {
  node: WpMenuItemNode;
}

/**
 * Converts WPGraphQL's flat menuItems.edges array (with parentId references)
 * into a nested NavItem tree suitable for the Nav molecule.
 *
 * Pass a `panelContentMap` (databaseId → rendered HTML) to populate `megaMenu`
 * on items that reference a mega menu panel post.
 */
export function menuItemsToNavItems(
  edges: WpMenuItemEdge[],
  panelContentMap: Record<number, string> = {},
): NavItem[] {
  if (!edges?.length) return [];

  type TreeNode = NavItem & { _id: string; _parentId: string | null };
  const map = new Map<string, TreeNode>();

  for (const { node } of edges) {
    const panelContent = node.megaMenuPanelId ? panelContentMap[node.megaMenuPanelId] : undefined;
    map.set(node.id, {
      _id: node.id,
      _parentId: node.parentId || null,
      // `path` BEFORE `url`. WPGraphQL returns `path` already root-relative
      // ("/hello-world/") and `url` absolute against the WordPress origin
      // ("http://wp.example.com/hello-world/"). With url first, every nav link
      // on every page pointed at the WordPress install — a different host in
      // production, often not publicly reachable. `path` falls back to the
      // absolute URL for external custom links, which is what we want there.
      url: node.path || node.url || '#',
      title: node.label || node.title || '',
      linkClasses: node.cssClasses?.filter(Boolean) ?? undefined,
      linkTarget: node.target || undefined,
      description: node.description || undefined,
      linkId: undefined,
      megaMenu: panelContent ? { enabled: true, content: panelContent } : undefined,
      items: [],
    });
  }

  const roots: TreeNode[] = [];
  for (const item of map.values()) {
    if (item._parentId && map.has(item._parentId)) {
      map.get(item._parentId)!.items!.push(item);
    } else {
      roots.push(item);
    }
  }

  return roots.map(stripInternals);
}

function stripInternals({ _id, _parentId, items, ...rest }: any): NavItem {
  const clean: NavItem = { ...rest };
  if (items?.length) {
    clean.items = items.map(stripInternals);
  }
  return clean;
}

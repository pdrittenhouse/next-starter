import type { NavItem } from '@/stories/molecules/nav/Nav';

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
}

interface WpMenuItemEdge {
  node: WpMenuItemNode;
}

/**
 * Converts WPGraphQL's flat menuItems.edges array (with parentId references)
 * into a nested NavItem tree suitable for the Nav molecule.
 */
export function menuItemsToNavItems(edges: WpMenuItemEdge[]): NavItem[] {
  if (!edges?.length) return [];

  type TreeNode = NavItem & { _id: string; _parentId: string | null };
  const map = new Map<string, TreeNode>();

  for (const { node } of edges) {
    map.set(node.id, {
      _id: node.id,
      _parentId: node.parentId || null,
      url: node.url || node.path || '#',
      title: node.label || node.title || '',
      linkClasses: node.cssClasses?.filter(Boolean) ?? undefined,
      linkTarget: node.target || undefined,
      description: node.description || undefined,
      linkId: node.menuItemId ? String(node.menuItemId) : undefined,
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

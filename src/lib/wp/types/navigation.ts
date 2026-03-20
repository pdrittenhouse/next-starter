/**
 * WordPress navigation types: Menus, Widgets, Users, Themes, Plugins, Assets.
 */

/** Menu item node. */
export interface WpMenuItem {
  id: string;
  label?: string;
  parentId?: string;
  cssClasses?: string[];
  description?: string;
  locations?: string[];
  menuItemId?: number;
  order?: number;
  path?: string;
  target?: string;
  url?: string;
  title?: string;
}

/** Menu node. */
export interface WpMenu {
  id: string;
  databaseId: number;
  name: string;
  slug?: string;
  menuId?: number;
  locations?: string[];
  menuItems?: {
    edges: Array<{ node: WpMenuItem }>;
  };
}

/** Widget area (custom resolver). */
export interface WpWidgetArea {
  id: string;
  name: string;
  widgets?: Array<{
    id: string;
    type: string;
    title?: string;
    settings?: string;
  }>;
}

/** Block pattern. */
export interface WpBlockPattern {
  name: string;
  title: string;
  description?: string;
  content?: string;
  categories?: string[];
  keywords?: string[];
  viewportWidth?: number;
  blockTypes?: string[];
  source?: string;
}

/** Block pattern category. */
export interface WpBlockPatternCategory {
  name: string;
  label: string;
}

/** User node. */
export interface WpUser {
  id: string;
  databaseId?: number;
  name: string;
  slug: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  description?: string;
  username?: string;
  locale?: string;
  registeredDate?: string;
  url?: string;
  avatar?: { url: string; height: number; width: number };
  roles?: { nodes: Array<{ name: string }> };
  capabilities?: string[];
}

/** User role. */
export interface WpUserRole {
  id: string;
  name: string;
  displayName?: string;
  capabilities?: string[];
}

/** Theme node. */
export interface WpTheme {
  id: string;
  name: string;
  slug: string;
  version?: string;
  description?: string;
  author?: string;
  authorUri?: string;
  themeUri?: string;
  screenshot?: string;
  tags?: string[];
}

/** Plugin node. */
export interface WpPlugin {
  id: string;
  name: string;
  pluginUri?: string;
  description?: string;
  author?: string;
  authorUri?: string;
  version?: string;
  isRestricted?: boolean;
  path?: string;
}

/** Registered script/stylesheet. */
export interface WpRegisteredAsset {
  id: string;
  handle: string;
  src?: string;
  version?: string;
  dependencies?: Array<{ handle: string }>;
  extra?: string;
}

/** Theme enqueued asset (custom resolver). */
export interface WpEnqueuedAsset {
  handle: string;
  src?: string;
  version?: string;
  dependencies?: string[];
  context?: string;
}

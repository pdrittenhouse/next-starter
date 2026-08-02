import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import { SidebarPattern } from '@/stories/patterns/SidebarPattern';
import styles from './sidebar.module.scss';

interface SidebarBlockData {
  sidebar?: string | null;
}

interface SidebarBlockProps {
  block: EditorBlock;
}

/**
 * Sidebar block — mirrors `src/templates/blocks/sidebar/sidebar.twig`.
 *
 * Renders the widget area selected in the block's ACF `sidebar` field via
 * SidebarPattern so the content flows through BlockRenderer and can be
 * overridden in headless environments. Works for both built-in areas
 * (primary_sidebar, etc.) and custom areas from Menu & Widget Options.
 *
 * Registered in BLOCK_MAP as 'acf/sidebar'.
 */
export async function SidebarBlock({ block }: SidebarBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: SidebarBlockData; className?: string };
  const slug = attrs?.data?.sidebar ?? null;

  if (!slug) return null;

  return <SidebarPattern slug={slug} className={attrs?.className} />;
}

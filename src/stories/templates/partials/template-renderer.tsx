import type { ElementType } from 'react';
import type { TimberlandTreeNode } from '@/lib/wp/types/template-manifest';
import type { EditorBlock } from '@/types/blocks';
import { getPatternMap } from '@/lib/registries/PATTERN_MAP';
import { parseCssStyle } from '@/lib/wp/utils/parseCssStyle';
import { BlockRenderer } from './block-renderer';
import { SidebarPattern } from '@/stories/templates/partials/wrapper/SidebarPattern';

interface TemplateRendererProps {
  tree: TimberlandTreeNode[];
  editorBlocks?: EditorBlock[];
  /** Classic WP post_content HTML — used as fallback when editorBlocks is empty. */
  content?: string | null;
  /** Resolved widget-area slug for the sidebar slot (e.g. 'primary_sidebar'). */
  sidebarSlug?: string | null;
  /** Bootstrap column class passed to SidebarPattern, e.g. 'col-lg-3'. */
  sidebarColClass?: string;
  /** Per-post container override forwarded to BlockRenderer. */
  removeContentContainerPerPost?: boolean;
}

// Walks the manifest tree and renders registered PATTERN_MAP components.
// The `content` and `sidebar` slots are handled here; all other slots are
// Twig-only concerns (html_head, foot, etc.) and are skipped.
// Unregistered patterns use a generic HTML shell derived from the PHP-rendered
// outer element (element + className + id) so their children still recurse.
export async function TemplateRenderer({ tree, editorBlocks = [], content, sidebarSlug, sidebarColClass, removeContentContainerPerPost }: TemplateRendererProps) {
  const patternMap = await getPatternMap();
  return (
    <>
      {tree.map((node, i) => {
        if (node.type === 'slot') {
          if (node.name === 'content') {
            if (editorBlocks.length > 0) {
              return <BlockRenderer key="content" blocks={editorBlocks} context={removeContentContainerPerPost ? { removeContentContainerPerPost } : undefined} />;
            }
            if (content) {
              return <div key="content" dangerouslySetInnerHTML={{ __html: content }} />;
            }
            return null;
          }
          if (node.name === 'sidebar' && sidebarSlug) {
            return <SidebarPattern key="sidebar" slug={sidebarSlug} className={sidebarColClass} />;
          }
          return null;
        }

        if (node.type === 'element') {
          const Tag = (node.element ?? 'div') as ElementType;
          const childContent = node.children?.length ? (
            <TemplateRenderer tree={node.children} editorBlocks={editorBlocks} content={content} sidebarSlug={sidebarSlug} sidebarColClass={sidebarColClass} removeContentContainerPerPost={removeContentContainerPerPost} />
          ) : null;
          return (
            <Tag
              key={`${node.element ?? 'el'}-${i}`}
              id={node.id ?? undefined}
              className={node.className ?? undefined}
              style={parseCssStyle(node.style)}
            >
              {childContent}
            </Tag>
          );
        }

        if (node.type === 'pattern') {
          const childContent = node.children?.length ? (
            <TemplateRenderer tree={node.children} editorBlocks={editorBlocks} sidebarSlug={sidebarSlug} sidebarColClass={sidebarColClass} />
          ) : null;

          const Component = patternMap[node.slug ?? ''];
          if (Component) {
            return <Component key={node.slug ?? i}>{childContent}</Component>;
          }

          // Generic shell for unregistered patterns: use the element + classes
          // extracted from the Twig file by the PHP REST endpoint.
          if (node.element) {
            const Tag = node.element as ElementType;
            return (
              <Tag
                key={node.slug ?? i}
                className={node.className ?? undefined}
                id={node.id ?? undefined}
              >
                {childContent}
              </Tag>
            );
          }

          // No element metadata and no component — render children inline if any
          // so a content slot nested below this node is still reachable.
          if (childContent) {
            return <span key={node.slug ?? i}>{childContent}</span>;
          }

          return null;
        }

        return null;
      })}
    </>
  );
}

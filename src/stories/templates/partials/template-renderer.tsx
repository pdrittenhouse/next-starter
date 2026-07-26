import type { ElementType } from 'react';
import type { TimberlandTreeNode } from '@/lib/wp/types/template-manifest';
import type { EditorBlock } from '@/types/blocks';
import { PATTERN_MAP } from '@/lib/registries/PATTERN_MAP';
import { BlockRenderer } from './block-renderer';

interface TemplateRendererProps {
  tree: TimberlandTreeNode[];
  editorBlocks?: EditorBlock[];
  /** Classic WP post_content HTML — used as fallback when editorBlocks is empty. */
  content?: string | null;
}

// Walks the manifest tree and renders registered PATTERN_MAP components.
// The `content` slot is the only slot rendered here — it maps to BlockRenderer.
// All other slots are Twig-only concerns (html_head, foot, etc.) and are skipped.
// Unregistered patterns use a generic HTML shell derived from the PHP-rendered
// outer element (element + className + id) so their children still recurse.
export function TemplateRenderer({ tree, editorBlocks = [], content }: TemplateRendererProps) {
  return (
    <>
      {tree.map((node, i) => {
        if (node.type === 'slot') {
          if (node.name === 'content') {
            if (editorBlocks.length > 0) {
              return <BlockRenderer key="content" blocks={editorBlocks} />;
            }
            if (content) {
              return <div key="content" dangerouslySetInnerHTML={{ __html: content }} />;
            }
            return null;
          }
          return null;
        }

        if (node.type === 'pattern') {
          const childContent = node.children?.length ? (
            <TemplateRenderer tree={node.children} editorBlocks={editorBlocks} />
          ) : null;

          const Component = PATTERN_MAP[node.slug ?? ''];
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

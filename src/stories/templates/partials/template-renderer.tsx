import type { TimberlandTreeNode } from '@/lib/wp/types/template-manifest';
import type { EditorBlock } from '@/types/blocks';
import { PATTERN_MAP } from '@/lib/registries/PATTERN_MAP';
import { BlockRenderer } from './block-renderer';

interface TemplateRendererProps {
  tree: TimberlandTreeNode[];
  editorBlocks?: EditorBlock[];
}

// Walks the manifest tree and renders registered PATTERN_MAP components.
// The `content` slot is the only slot rendered here — it maps to BlockRenderer.
// All other slots are Twig-only concerns (html_head, foot, etc.) and are skipped.
// Pattern nodes with no registered component are silently skipped; their children
// are not recursed because the component shell doesn't exist to host them.
export function TemplateRenderer({ tree, editorBlocks = [] }: TemplateRendererProps) {
  return (
    <>
      {tree.map((node, i) => {
        if (node.type === 'slot') {
          if (node.name === 'content') {
            return <BlockRenderer key="content" blocks={editorBlocks} />;
          }
          return null;
        }

        if (node.type === 'pattern') {
          const Component = PATTERN_MAP[node.slug ?? ''];
          if (!Component) return null;
          return (
            <Component key={node.slug ?? i}>
              {node.children?.length ? (
                <TemplateRenderer tree={node.children} editorBlocks={editorBlocks} />
              ) : null}
            </Component>
          );
        }

        return null;
      })}
    </>
  );
}

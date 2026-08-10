import { Alert } from '@/stories/patterns/atoms/alert/Alert';
import type { AlertStatus } from '@/stories/patterns/atoms/alert/Alert';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './alert.module.scss';
import { cx } from '@/lib/cx';

/**
 * ACF field values for the alert block, as they appear in attributesJSON.data.
 *
 * `text_align` is an ACF clone of module-text-align with prefix_name: 1, so
 * its sub-field is stored with the clone name as prefix:
 *   text_align_text_align  (not text_align)
 *
 * `alert_layout` is similarly a clone with prefix, so:
 *   alert_layout_alert_layout  (not alert_layout)
 *
 * `alert_link` is an ACF link picker field — WPGraphQL surfaces it as an
 * object with url, title, and target sub-keys.
 */
interface AlertBlockData {
  alert_title?: string | null;
  alert_message?: string | null;
  alert_footer?: string | null;
  alert_link?: { url?: string; title?: string; target?: string } | null;
  alert_status?: AlertStatus | null;
  dismissable?: boolean;
  close_position?: 'top' | 'bottom';
  /** Clone field: text_align group with prefix_name: 1 → text_align_text_align */
  text_align_text_align?: 'start' | 'center' | 'end' | null;
  show_inner_blocks?: boolean;
  /** Clone field: alert_layout group with prefix_name: 1 → alert_layout_alert_layout */
  alert_layout_alert_layout?: string | null;
  inner_blocks_position?: 'top' | 'bottom';
}

interface AlertBlockProps {
  block: EditorBlock;
}

/**
 * Alert block — mirrors `src/templates/blocks/alert/alert.twig`.
 *
 * Mirrors the Twig block's relationship with the alert pattern: just as the
 * Twig block embeds `@atoms/alert/_alert.tpl.twig`, this component renders
 * the Alert atom.
 *
 * Inner blocks are rendered adjacent to the Alert element rather than via
 * the Alert atom's `additionalContent` prop (which renders in both header and
 * footer positions simultaneously). Placing inner blocks before or after the
 * Alert element preserves the Twig intent of a single positional zone:
 *   inner_blocks_position 'top' (default) → before the Alert
 *   inner_blocks_position 'bottom'        → after the Alert
 *
 * Registered in BLOCK_MAP as 'acf/alert'.
 */
export async function AlertBlock({ block }: AlertBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: AlertBlockData; className?: string };
  const data: AlertBlockData = attrs?.data ?? {};

  // Mirrors the Twig block_classes logic:
  //   alert_layout != 'default' → append alert-{layout}
  //   block['className'] → passed through from attrs
  const layoutModifier =
    data.alert_layout_alert_layout && data.alert_layout_alert_layout !== 'default'
      ? `alert-${data.alert_layout_alert_layout}`
      : null;

  const blockClasses = cx(styles, 'block-alert', layoutModifier, attrs.className);

  // Inner blocks — mirrors alert.twig additional_header_content / additional_footer_content.
  const innerBlocks: EditorBlock[] = data.show_inner_blocks === true
    ? (block.innerBlocks ?? [])
    : [];
  const innerBlocksPos = data.inner_blocks_position ?? 'top';

  const innerContent = innerBlocks.length > 0
    ? <>{innerBlocks.map((b, i) =>
        b.renderedHtml
          ? <div key={i} dangerouslySetInnerHTML={{ __html: b.renderedHtml }} />
          : null
      )}</>
    : null;

  const alertEl = (
    <Alert
      status={data.alert_status ?? 'info'}
      alertTitle={data.alert_title ?? undefined}
      alertPrimary={data.alert_message ?? undefined}
      alertSecondary={data.alert_footer ?? undefined}
      alertLink={data.alert_link?.url ?? undefined}
      dismissable={data.dismissable ?? false}
      closePosition={data.close_position ?? 'top'}
      alertTextAlign={data.text_align_text_align ?? undefined}
      className={blockClasses}
    />
  );

  if (!innerContent) return alertEl;

  return innerBlocksPos === 'bottom'
    ? <>{alertEl}{innerContent}</>
    : <>{innerContent}{alertEl}</>;
}

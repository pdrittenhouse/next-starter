import type { EditorBlock } from '@/types/blocks';
import { parseBlockAttributes } from '@/types/blocks';
import { parseAcfRepeater } from '@/lib/wp/utils/parseAcfRepeater';
import { Tabs } from '@/stories/molecules/tabs/Tabs';
import type { TabItem } from '@/stories/molecules/tabs/Tabs';

/**
 * ACF id group field — shared by both the tabs wrapper (tabs_id)
 * and each tab item (id). Stores either a custom string or an
 * auto-generated integer suffix.
 */
interface AcfIdField {
  id?: string | null;
  id_gen?: string | null;
}

/**
 * ACF field values for the `acf/tabs` block, as they appear in
 * `attributesJSON.data`.
 *
 * Field names match ACF export conventions verbatim so they can be
 * compared directly against the parsed JSON.
 *
 * The `disabled_tabs` repeater stores one row per disabled tab;
 * each row has a single `tab_index` integer (1-based).
 */
interface TabsBlockData {
  /** Group: custom / generated wrapper ID (module-id clone). */
  tabs_id?: AcfIdField;
  /** Use pill-style nav instead of underline tabs. Maps to `nav_pills`. */
  pills?: boolean;
  /**
   * Tab library / visual style.
   * ACF default: 'jquery' (responsive-tabs plugin).
   * Maps to `tabs_type`.
   */
  type?: 'bootstrap' | 'jquery';
  /** Equal-width fill or justified alignment for the nav. Maps to `fill_justify`. */
  fill?: 'fill' | 'justified';
  /** Horizontal alignment of the nav buttons. Used as `justify-content-{value}` class. */
  alignment?: string;
  /** Render tabs vertically. Maps to `vertical`. */
  vertical?: boolean;

  // ── Active / disabled ────────────────────────────────────────────
  /** 0-based index of the initially active tab. Maps to `activeTab`. */
  active_tab?: number;
  /** Repeater: rows describing tabs to disable. */
  disabled_tabs?: Array<{ tab_index: number }>;

  // ── Collapsible mode ─────────────────────────────────────────────
  /** Collapsible behaviour string. Maps to `collapsible`. */
  collapsible?: string;
  /** Whether tabs start collapsed. Maps to `startCollapsed`. */
  start_collapsed?: string;

  // ── Accordion at breakpoint ───────────────────────────────────────
  /** Heading element used for accordion headers. Maps to `accordionTabElement`. */
  accordion_tab_element?: string;
  /** Scroll to accordion panel when activated. Maps to `scrollToAccordion`. */
  scroll_to_accordion?: string;
  /** Scroll on initial load. Maps to `scrollToAccordionOnLoad`. */
  scroll_to_accordion_on_load?: string;
  /** Pixel offset for the accordion scroll. Maps to `scrollToAccordionOffset`. */
  scroll_to_accordion_offset?: string;

  // ── Hash & rotation ───────────────────────────────────────────────
  /** Update URL hash on tab activation. Maps to `setHash`. */
  set_hash?: string;
  /** Auto-rotate through tabs. Maps to `rotate`. */
  rotate?: string;

  // ── Animation ─────────────────────────────────────────────────────
  /** Activation event (e.g. 'click', 'mouseover'). Maps to `event`. */
  event?: string;
  /** Panel animation type. Maps to `animation`. */
  animation?: string;
  /** Enable animation queuing. Maps to `animationQueue`. */
  animation_queue?: string;
  /** Animation duration in ms. Maps to `duration`. */
  duration?: number;
  /** Adaptive height animation. Maps to `fluidHeight`. */
  fluid_height?: string;
}

/**
 * ACF field values for each `acf/tab` inner block.
 *
 * The `id` group mirrors the module-id clone used by the parent tabs block;
 * `tab_label` is the nav button text; `active` marks the initially active panel.
 */
interface AcfTabData {
  /** Tab navigation button label. Maps to `TabItem.title`. */
  tab_label?: string | null;
  /** Group: custom / generated per-tab ID. */
  id?: AcfIdField;
  /** Whether this tab is initially active (bootstrap mode). */
  active?: boolean;
}

interface TabsBlockProps {
  block: EditorBlock;
}

/**
 * Resolve an ACF id group to a string ID.
 * Mirrors the Twig pattern used in both tabs.twig and tab.twig:
 *   `field['id'] ?: prefix ~ field['id_gen']`
 */
function resolveAcfId(field: AcfIdField | undefined, prefix: string): string | undefined {
  if (!field) return undefined;
  if (field.id) return field.id;
  if (field.id_gen) return `${prefix}${field.id_gen}`;
  return undefined;
}

/**
 * Tabs block — mirrors `src/templates/blocks/tabs/tabs.twig`.
 *
 * Maps ACF `attributesJSON.data` field values to the Tabs pattern component.
 * Tab items are sourced from `acf/tab` inner blocks; each item's label comes
 * from the inner block's `attributesJSON.data.tab_label`, and its panel content
 * is the inner block's WordPress-rendered `renderedHtml`.
 *
 * Architecture note — inner blocks:
 *   `WpEditorBlock` types inner blocks as a flat array with `parentClientId`.
 *   The WPGraphQL Content Blocks plugin may also return them as a nested
 *   `innerBlocks` array at runtime (not yet in the TypeScript type). Both paths
 *   are handled: nested via `(block as any).innerBlocks` and flat via
 *   `allBlocks` when the block renderer is extended to pass it. If no inner
 *   blocks are accessible the component returns null (the BlockRenderer will
 *   fall through to `renderedHtml`).
 *
 * Registered in BLOCK_MAP as 'acf/tabs'.
 */
export async function TabsBlock({ block }: TabsBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: Record<string, unknown>; className?: string };
  const rawData = attrs?.data ?? {};
  const data: TabsBlockData = {
    ...(rawData as Partial<TabsBlockData>),
    disabled_tabs: parseAcfRepeater<{ tab_index: number }>(rawData, 'disabled_tabs'),
  };

  // ── Tabs wrapper ID ──────────────────────────────────────────────────────
  // Mirrors: fields.tabs_id['id'] ?: 'tabs' ~ fields.tabs_id['id_gen']
  const tabsId = resolveAcfId(data.tabs_id, 'tabs');

  // ── Disabled tabs — repeater → comma-joined sorted index string ──────────
  // Mirrors the Twig loop that builds the `disabled` array then joins it.
  const disabledTabs =
    data.disabled_tabs && data.disabled_tabs.length > 0
      ? data.disabled_tabs
          .map(row => row.tab_index)
          .sort((a, b) => a - b)
          .join(',')
      : undefined;

  // ── Inner blocks (acf/tab children) ─────────────────────────────────────
  // WPGraphQL Content Blocks may return inner blocks as a nested array at
  // runtime even though WpEditorBlock does not type that property yet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawInnerBlocks: EditorBlock[] = (block as any).innerBlocks ?? [];
  const tabInnerBlocks = rawInnerBlocks.filter(b => b.name === 'acf/tab');

  // No inner blocks available — return null so the BlockRenderer falls back
  // to dangerouslySetInnerHTML with block.renderedHtml.
  if (tabInnerBlocks.length === 0) {
    return null;
  }

  // ── Build TabItem array ───────────────────────────────────────────────────
  const tabs: TabItem[] = tabInnerBlocks.map((inner, i) => {
    const innerAttrs = parseBlockAttributes(inner) as { data?: AcfTabData };
    const tabData: AcfTabData = innerAttrs?.data ?? {};

    // Mirrors tab.twig: fields.id['id'] ?: fields.id['id_gen']
    const tabItemId = resolveAcfId(tabData.id, 'tab');

    // Tab panel content: use the WordPress-rendered HTML for the inner block.
    // Note: acf/tab's renderedHtml includes the outer .tab-pane / .tabs__content-wrapper
    // div that the React Tabs component also generates. The double-wrapper is
    // intentional here — Bootstrap JS targets the React-generated outer panel
    // via data-bs-* attributes; the WordPress-rendered wrapper inside acts as
    // a content passthrough. A future enhancement could strip the outer wrapper
    // from renderedHtml using a DOM parser.
    const content = inner.renderedHtml ? (
      <div dangerouslySetInnerHTML={{ __html: inner.renderedHtml }} />
    ) : null;

    return {
      id: tabItemId ?? String(i),
      title: tabData.tab_label ?? `Tab ${i + 1}`,
      content,
    };
  });

  // ── Wrapper classes ───────────────────────────────────────────────────────
  // Mirrors tabs.twig block_classes: block['className'], 'block-tabs'
  // The alignment class (justify-content-*) targets the nav list in Twig but
  // the Tabs pattern component does not expose a navClasses prop; it is
  // appended to the wrapper classes as a best-effort mapping.
  const blockClasses = [
    'block-tabs',
    attrs.className ?? null,
    data.alignment ? `justify-content-${data.alignment}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tabs
      id={tabsId}
      tabsType={data.type ?? 'jquery'}
      navPills={data.pills}
      fillJustify={data.fill}
      vertical={data.vertical}
      collapsible={data.collapsible}
      startCollapsed={data.start_collapsed}
      activeTab={data.active_tab}
      disabledTabs={disabledTabs}
      accordionTabElement={data.accordion_tab_element}
      setHash={data.set_hash}
      rotate={data.rotate}
      event={data.event}
      animation={data.animation}
      animationQueue={data.animation_queue}
      duration={data.duration}
      fluidHeight={data.fluid_height}
      scrollToAccordion={data.scroll_to_accordion}
      scrollToAccordionOnLoad={data.scroll_to_accordion_on_load}
      scrollToAccordionOffset={data.scroll_to_accordion_offset}
      classes={[blockClasses]}
      tabs={tabs}
    />
  );
}

import React, { useId } from 'react';
import { ButtonGroup } from '@/stories/molecules/button-group/ButtonGroup';
import type { ButtonGroupItem, WrapperDisplay } from '@/stories/molecules/button-group/ButtonGroup';
import type { ButtonProps } from '@/stories/atoms/button/Button';

/**
 * A single collapse panel item.
 * Maps to one entry in the `content` array in the Twig template.
 */
export interface CollapseItem {
  /**
   * Explicit HTML id for this panel.
   * When omitted the panel shares the component-generated collapse ID,
   * meaning all panels and all buttons toggle together.
   * Maps to `item.collapse_id` in the Twig template.
   */
  collapseId?: string;
  /** ReactNode rendered inside the `.collapse--inner` wrapper. */
  content: React.ReactNode;
  /**
   * Bootstrap bg-* color utility (e.g. 'light', 'primary', 'dark').
   * Maps to `item.background_color`.
   */
  backgroundColor?: string;
  /**
   * Bootstrap text-* color utility (e.g. 'white', 'dark').
   * Maps to `item.text_color`.
   */
  textColor?: string;
  /**
   * Additional CSS classes for the `.collapse` element.
   * Maps to `item.collapse_other_classes`.
   */
  className?: string;
}

/**
 * Collapse organism props — mirrors all variables from the Twig template at
 * `03-organisms/collapse/_collapse.tpl.twig`.
 */
export interface CollapseProps {
  /**
   * Bootstrap display utility applied to the ButtonGroup wrapper.
   * Maps to `button_group_display`. Defaults to `'inline-block'`.
   */
  buttonGroupDisplay?: WrapperDisplay;
  /**
   * Size variant for the button group (`btn-group-sm` / `btn-group-lg`).
   * Maps to `button_group_size`.
   */
  buttonGroupSize?: 'sm' | 'lg';
  /**
   * Render buttons as a d-grid block group (true) or inline btn-group (false).
   * Maps to `button_group_display_grid`. Defaults to the ButtonGroup default (true).
   */
  buttonGroupDisplayGrid?: boolean | null;
  /**
   * `aria-label` for the button group element.
   * Maps to `button_group_label`.
   */
  buttonGroupLabel?: string;
  /**
   * Bootstrap gap-* spacer applied to the button group (e.g. `2` → `gap-2`).
   * Maps to `button_group_gap`.
   */
  buttonGroupGap?: string | number;
  /**
   * Responsive display breakpoints for the button group.
   * e.g. `{ sm: 'flex', lg: 'block' }` → `d-sm-flex d-lg-block`.
   * Maps to `button_group_breakpoints`.
   */
  buttonGroupBreakpoints?: Record<string, string>;
  /**
   * Render buttons vertically using `btn-group-vertical`.
   * Maps to `button_group_vertical`.
   */
  buttonGroupVertical?: boolean;
  /**
   * Additional CSS classes for the button group div.
   * Maps to `button_group_other_classes`.
   */
  buttonGroupClassName?: string;
  /**
   * Buttons to render in the controls area.
   * Each button's `toggle` defaults to `'collapse'` and `target` defaults to
   * `#<generated-id>` when not explicitly provided — mirroring the Twig loop
   * that injects `button_target` and `button_link` on each button.
   */
  buttons: ButtonProps[];
  /**
   * Collapse panel items.
   * Each item renders a `.collapse--wrapper > .collapse > .collapse--inner`
   * structure. When `collapseId` is omitted the panel inherits the shared ID.
   */
  content: CollapseItem[];
  /**
   * Additional CSS classes for the outer `.collapse--container` element.
   * Maps to `collapse_container_other_classes`.
   */
  className?: string;
}

/**
 * Collapse organism — mirrors
 * `src/design-system/patterns/03-organisms/collapse/_collapse.tpl.twig`.
 *
 * Renders a ButtonGroup that toggles one or more Bootstrap collapse panels.
 * A stable shared collapse ID is generated via React's `useId` hook so that
 * buttons and panels are wired together automatically without any props.
 * Pass explicit `target` on individual buttons and `collapseId` on individual
 * panels to create multiple independent collapse targets.
 */
export function Collapse({
  buttonGroupDisplay = 'inline-block',
  buttonGroupSize,
  buttonGroupDisplayGrid,
  buttonGroupLabel,
  buttonGroupGap,
  buttonGroupBreakpoints,
  buttonGroupVertical = false,
  buttonGroupClassName,
  buttons,
  content,
  className,
}: CollapseProps) {
  // Generate a stable, SSR-safe collapse ID.
  // React's useId produces strings like ":r0:" — sanitize colons for valid HTML IDs.
  const uid = useId();
  const collapseId = 'collapse_' + uid.replace(/:/g, '');

  // Mirror Twig's collapseButtons loop: inject target + toggle defaults for
  // each button that does not already specify them.
  const collapseButtons: ButtonProps[] = buttons.map((btn) => ({
    ...btn,
    toggle: btn.toggle ?? 'collapse',
    // target maps to data-bs-target when toggle is set (see Button atom).
    target: btn.target ?? '#' + collapseId,
    // aria-controls should reference the panel ID (without leading #).
    controls: btn.controls ?? collapseId,
    expanded: btn.expanded ?? false,
  }));

  const group: ButtonGroupItem = {
    displayGrid: buttonGroupDisplayGrid,
    label: buttonGroupLabel,
    gap: buttonGroupGap,
    breakpoints: buttonGroupBreakpoints,
    className: buttonGroupClassName,
    buttons: collapseButtons,
  };

  const containerClasses = ['collapse--container', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} data-pattern="timberland/collapse">
      {/* controls block — mirrors {% block controls %} */}
      <ButtonGroup
        wrapperDisplay={buttonGroupDisplay}
        size={buttonGroupSize}
        vertical={buttonGroupVertical}
        // collapse--controls is applied to the ButtonGroup wrapper,
        // matching button_group_wrapper_other_classes: 'collapse--controls' in Twig.
        wrapperClassName="collapse--controls"
        groups={[group]}
      />

      {/* content block — mirrors {% block items %} */}
      <div className="collapse--content">
        {content.map((item, index) => {
          const panelId = item.collapseId ?? collapseId;

          const panelClasses = [
            'collapse',
            'p-3',
            item.backgroundColor ? `bg-${item.backgroundColor}` : null,
            item.textColor ? `text-${item.textColor}` : null,
            item.className,
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={index} className="collapse--wrapper">
              <div className={panelClasses} id={panelId}>
                <div className="collapse--inner">{item.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

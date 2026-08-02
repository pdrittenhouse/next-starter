'use client';

import React, { useId, useState } from 'react';
import { Collapse as BsCollapse } from 'react-bootstrap';
import { ButtonGroup } from '@/stories/molecules/button-group/ButtonGroup';
import type { ButtonGroupItem, WrapperDisplay } from '@/stories/molecules/button-group/ButtonGroup';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import styles from './collapse.module.scss';
import { cx } from '@/lib/cx';

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
   * Each button's `target` defaults to `#<generated-id>` when not explicitly
   * provided — clicking toggles the matching panel.
   */
  buttons: ButtonProps[];
  /**
   * Collapse panel items.
   * Each item renders a `.collapse--wrapper > BsCollapse > .collapse--inner`
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
 * Renders a ButtonGroup that toggles one or more collapse panels.
 * Open/close state is managed via React state and React Bootstrap's `Collapse`
 * component — no Bootstrap JS bundle required.
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
  const uid = useId();
  const collapseId = 'collapse_' + uid.replace(/:/g, '');

  // Track open state per panel ID.
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});

  const togglePanel = (panelId: string) => {
    setOpenPanels(prev => ({ ...prev, [panelId]: !prev[panelId] }));
  };

  // Build collapse buttons: strip toggle/target (Bootstrap JS attrs), inject
  // onClick and reactive expanded/controls instead.
  const collapseButtons: ButtonProps[] = buttons.map((btn) => {
    const { toggle: _t, target: _tgt, ...restBtn } = btn as ButtonProps & {
      toggle?: unknown;
      target?: unknown;
    };
    const targetId = ((btn as any).target as string | undefined ?? '#' + collapseId).replace(/^#/, '');
    const isOpen = !!openPanels[targetId];
    return {
      ...restBtn,
      controls: btn.controls ?? targetId,
      expanded: isOpen,
      onClick: () => togglePanel(targetId),
    } as ButtonProps;
  });

  const group: ButtonGroupItem = {
    displayGrid: buttonGroupDisplayGrid,
    label: buttonGroupLabel,
    gap: buttonGroupGap,
    breakpoints: buttonGroupBreakpoints,
    className: buttonGroupClassName,
    buttons: collapseButtons,
  };

  const containerClasses = cx(styles, 'collapse--container', className);

  return (
    <div className={containerClasses} data-pattern="timberland/collapse">
      {/* controls block — mirrors {% block controls %} */}
      <ButtonGroup
        wrapperDisplay={buttonGroupDisplay}
        size={buttonGroupSize}
        vertical={buttonGroupVertical}
        wrapperClassName="collapse--controls"
        groups={[group]}
      />

      {/* content block — mirrors {% block items %} */}
      <div className={cx(styles, 'collapse--content')}>
        {content.map((item, index) => {
          const panelId = item.collapseId ?? collapseId;
          const isOpen = !!openPanels[panelId];

          // 'collapse' class omitted here — BsCollapse adds it automatically.
          const panelClasses = cx(
            styles,
            'p-3',
            item.backgroundColor ? `bg-${item.backgroundColor}` : null,
            item.textColor ? `text-${item.textColor}` : null,
            item.className,
          );

          return (
            <div key={index} className={cx(styles, 'collapse--wrapper')}>
              <BsCollapse in={isOpen}>
                <div className={panelClasses} id={panelId}>
                  <div className={cx(styles, 'collapse--inner')}>{item.content}</div>
                </div>
              </BsCollapse>
            </div>
          );
        })}
      </div>
    </div>
  );
}

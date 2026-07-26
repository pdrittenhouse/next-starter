import React from 'react';
import { Button } from '@/stories/atoms/button/Button';
import type { ButtonProps } from '@/stories/atoms/button/Button';
import styles from './button-group.module.scss';

/**
 * Wrapper display utility variants — maps to Bootstrap d-* classes.
 * Mirrors button_group_wrapper_display in the Twig template.
 */
export type WrapperDisplay =
  | 'inline'
  | 'inline-block'
  | 'grid'
  | 'block'
  | 'flex'
  | 'inline-flex';

const WRAPPER_DISPLAY_CLASS: Record<WrapperDisplay, string> = {
  'inline': 'd-inline',
  'inline-block': 'd-inline-block',
  'grid': 'd-grid',
  'block': 'd-block',
  'flex': 'd-flex',
  'inline-flex': 'd-inline-flex',
};

/**
 * A single button group within the wrapper.
 * Maps to one iteration of the `button_groups` array in the Twig template.
 */
export interface ButtonGroupItem {
  /**
   * Render this group as a block/grid layout (d-grid + display-grid) rather
   * than an inline btn-group (display-group + btn-group).
   * Defaults to true unless the parent toolbar prop overrides it to false.
   * Maps to button_group_display_grid per group.
   */
  displayGrid?: boolean | null;
  /**
   * Responsive display breakpoints applied to the group when displayGrid is
   * true. Keys are Bootstrap breakpoint names (sm, md, lg, xl, xxl), values
   * are Bootstrap display utilities (flex, block, none, etc.).
   * Example: { sm: 'flex', lg: 'block' } → 'd-sm-flex d-lg-block'
   * Maps to button_group_breakpoints.
   */
  breakpoints?: Record<string, string>;
  /**
   * Bootstrap gap spacer applied to the group (gap-{n}).
   * Maps to button_group_gap.
   */
  gap?: string | number;
  /**
   * aria-label for this group's role="group" div.
   * Maps to button_group_label.
   */
  label?: string;
  /**
   * Additional CSS class names for this group div.
   * Maps to button_group_other_classes / button_group_classes.
   */
  className?: string;
  /**
   * Buttons to render inside this group. Each object maps to all Button atom
   * props, passed directly to the Button component.
   */
  buttons: ButtonProps[];
}

/**
 * ButtonGroup molecule props — mirrors all Twig template variables.
 */
export interface ButtonGroupProps {
  /**
   * Bootstrap display utility class applied to the outer wrapper.
   * Defaults to 'inline-block' → 'd-inline-block'.
   * Maps to button_group_wrapper_display.
   */
  wrapperDisplay?: WrapperDisplay;
  /**
   * Optional heading title rendered above the button group(s).
   * Maps to button_group_title.
   */
  title?: string;
  /**
   * Optional description rendered below the title.
   * Maps to button_group_description.
   */
  description?: string;
  /**
   * Combine groups inside a Bootstrap btn-toolbar wrapper.
   * When true, all groups are forced to displayGrid=false.
   * Maps to button_group_toolbar.
   */
  toolbar?: boolean;
  /**
   * aria-label for the toolbar wrapper element.
   * Maps to button_group_toolbar_label.
   */
  toolbarLabel?: string;
  /**
   * Size variant applied to all groups (btn-group-sm / btn-group-lg).
   * Maps to button_group_size.
   */
  size?: 'sm' | 'lg';
  /**
   * Render all groups vertically (btn-group-vertical instead of button-group).
   * Maps to button_group_vertical.
   */
  vertical?: boolean;
  /**
   * Additional CSS classes for the outer wrapper div.
   * Maps to button_group_wrapper_other_classes / button_group_wrapper_classes.
   */
  wrapperClassName?: string;
  /**
   * Additional CSS classes for the toolbar div (only applies when toolbar=true).
   * Maps to button_group_toolbar_other_classes / button_group_toolbar_classes.
   */
  toolbarClassName?: string;
  /**
   * Array of button group objects to render.
   * Maps to button_groups in the Twig template.
   */
  groups: ButtonGroupItem[];
}

/**
 * ButtonGroup molecule — mirrors
 * `src/design-system/patterns/02-molecules/button-group/_button-group.tpl.twig`.
 *
 * Renders one or more Bootstrap button groups inside an outer wrapper, with
 * optional heading, toolbar mode, size, and vertical orientation. Composes
 * the Button atom for each individual button. Produces identical HTML class
 * structure to the Twig template.
 */
export function ButtonGroup({
  wrapperDisplay = 'inline-block',
  title,
  description,
  toolbar = false,
  toolbarLabel,
  size,
  vertical = false,
  wrapperClassName,
  toolbarClassName,
  groups,
}: ButtonGroupProps) {
  const wrapperClasses = [
    'button-group--wrapper',
    WRAPPER_DISPLAY_CLASS[wrapperDisplay] ?? 'd-inline-block',
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const toolbarClasses = ['btn-toolbar', toolbarClassName]
    .filter(Boolean)
    .join(' ');

  const groupElements = groups.map((group, groupIndex) => {
    // Mirror Twig displayGrid resolution logic:
    //   toolbar=true → false; group.displayGrid null/undefined → true; else use group value
    let displayGrid: boolean;
    if (toolbar) {
      displayGrid = false;
    } else if (group.displayGrid == null) {
      displayGrid = true;
    } else {
      displayGrid = group.displayGrid;
    }

    // Build responsive breakpoint classes (only applied when displayGrid is true,
    // matching the Twig: button_group_display_grid == true and breakpoints)
    const breakpointClasses =
      displayGrid && group.breakpoints
        ? Object.entries(group.breakpoints).map(
            ([bp, display]) => `d-${bp}-${display}`,
          )
        : [];

    // Mirror Twig button_group_classes merge + sort + join logic
    const groupClasses = [
      vertical ? 'btn-group-vertical' : 'button-group',
      displayGrid ? 'display-grid' : 'display-group',
      displayGrid ? 'd-grid' : 'btn-group',
      group.gap != null ? `gap-${group.gap}` : null,
      ...breakpointClasses,
      size ? `btn-group-${size}` : null,
      group.className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={groupIndex}
        className={groupClasses}
        role="group"
        aria-label={group.label}
      >
        {group.buttons.map((buttonProps, btnIndex) => (
          <Button key={btnIndex} {...buttonProps} />
        ))}
      </div>
    );
  });

  return (
    <div className={wrapperClasses} data-pattern="timberland/button-group">
      {/* heading block — mirrors {% block heading %} */}
      {(title || description) && (
        <div className="button-group--heading">
          {title && <h2 className="button-group--title">{title}</h2>}
          {description && (
            <div className="button-group--description">{description}</div>
          )}
        </div>
      )}

      {/* toolbar wrapper or bare group(s) */}
      {toolbar ? (
        <div
          className={toolbarClasses}
          role="toolbar"
          aria-label={toolbarLabel}
        >
          {groupElements}
        </div>
      ) : (
        groupElements
      )}
    </div>
  );
}

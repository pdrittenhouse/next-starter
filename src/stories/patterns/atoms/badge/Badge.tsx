import React from 'react';
import styles from './badge.module.scss';
import { cx } from '@/lib/cx';

export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export interface BadgeProps {
  /** Element type. Use 'a' together with href for linked badges. Defaults to 'span'. */
  element?: 'span' | 'a';
  /** Applies rounded-pill shape (Bootstrap 5 rounded-pill — replaces BS4 badge-pill). */
  pill?: boolean;
  /** Background color variant. Defaults to 'primary'. */
  color?: BadgeColor;
  /** URL for linked badges. Only meaningful when element is 'a'. */
  href?: string;
  /** Badge display text. Children take precedence when both are supplied. */
  text?: string;
  /** Slotted content — maps to the badge_text block in the Twig pattern. */
  children?: React.ReactNode;
  /** Additional CSS class names — maps to badge_other_classes in the Twig pattern. */
  className?: string;
}

function buildClasses(pill: boolean, color: BadgeColor, extra?: string): string {
  return cx(
    styles,
    'badge',
    pill ? 'rounded-pill' : null,
    `bg-${color}`,
    extra,
  );
}

export function Badge({
  element = 'span',
  pill = false,
  color = 'primary',
  href,
  text,
  children,
  className,
}: BadgeProps) {
  const classes = buildClasses(pill, color, className);
  const content = children ?? text;

  if (element === 'a') {
    return (
      <a href={href} className={classes} data-pattern="timberland/badge">
        {content}
      </a>
    );
  }

  return (
    <span className={classes} data-pattern="timberland/badge">
      {content}
    </span>
  );
}

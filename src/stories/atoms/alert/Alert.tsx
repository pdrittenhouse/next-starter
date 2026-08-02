'use client';

import React, { useState } from 'react';
import styles from './alert.module.scss';
import { cx } from '@/lib/cx';

export type AlertStatus =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'primary'
  | 'secondary'
  | 'light'
  | 'dark';

export interface AlertProps {
  /** Bootstrap color variant — maps to `alert-{status}`. Defaults to 'info'. */
  status?: AlertStatus;
  /**
   * Semantic type — controls the ARIA live region attribute.
   * 'error' → role="alert" (interrupts immediately); all other values → aria-live="polite".
   * Maps to the Twig `type` variable.
   */
  alertType?: 'status' | 'warning' | 'error';
  /** Heading text. Renders as <h2> when body content is present, <p> when the title is the sole element. */
  alertTitle?: string;
  /** Primary body paragraph. */
  alertPrimary?: string;
  /** Secondary footer paragraph, preceded by a horizontal rule. */
  alertSecondary?: string;
  /** URL applied to the title (or primary paragraph when no title is set). */
  alertLink?: string;
  /** Renders a dismiss button. Clicking sets visibility to false — no Bootstrap JS required. */
  dismissable?: boolean;
  /** Position of the dismiss button. Defaults to 'top'. */
  closePosition?: 'top' | 'bottom';
  /**
   * Text alignment helper class. Maps to Bootstrap `text-{start|center|end}`.
   * Note: Bootstrap 5 removed text-left/right; use 'start' and 'end' instead.
   */
  alertTextAlign?: 'start' | 'center' | 'end';
  /** Additional CSS class names — maps to `alert_other_classes` in the Twig pattern. */
  className?: string;
  /**
   * Slotted content rendered in both the header block (after the top close button, before the
   * title) and the footer block (after the secondary paragraph, before the bottom close button).
   * Mirrors the Twig pattern's `additional_content` variable, which fills both
   * `additional_header_content` and `additional_footer_content` blocks.
   */
  additionalContent?: React.ReactNode;
  /** Callback invoked when the alert is dismissed. */
  onClose?: () => void;
}

export function Alert({
  status = 'info',
  alertType = 'status',
  alertTitle,
  alertPrimary,
  alertSecondary,
  alertLink,
  dismissable = false,
  closePosition = 'top',
  alertTextAlign,
  className,
  additionalContent,
  onClose,
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    setVisible(false);
    onClose?.();
  };

  // d-flex is applied only when the alert has a single content element with no
  // additional slotted content. The `!additionalContent` mirrors Twig's `additional_content != true`.
  const dFlex =
    !additionalContent &&
    ((!!alertTitle && !alertPrimary && !alertSecondary) ||
      (!!alertPrimary && !alertTitle && !alertSecondary));

  // The top close button gets d-inline-block when the alert has exactly one content element.
  const closeIsSingle =
    (!!alertTitle && !alertPrimary && !alertSecondary) ||
    (!!alertPrimary && !alertTitle && !alertSecondary);

  const alertClasses = cx(
    styles,
    'mb-0',
    'alert',
    `alert-${status}`,
    dismissable ? 'alert-dismissible' : null,
    dismissable ? `close-${closePosition}` : null,
    'fade',
    'show',
    alertTextAlign ? `text-${alertTextAlign}` : null,
    dFlex ? 'd-flex' : null,
    className,
  );

  const ariaProps =
    alertType === 'error'
      ? { role: 'alert' as const }
      : { 'aria-live': 'polite' as const };

  const hasBodyContent = !!alertPrimary || !!alertSecondary;

  return (
    <div className={alertClasses} {...ariaProps} data-pattern="timberland/alert">
      {dismissable && closePosition === 'top' && (
        <a
          href="#"
          role="button"
          className={cx(styles, 'close', closeIsSingle ? 'd-inline-block' : null)}
          onClick={handleDismiss}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </a>
      )}

      {additionalContent}

      {alertTitle &&
        (hasBodyContent ? (
          <h2 className={cx(styles, 'alert-heading')}>
            {alertLink ? (
              <a href={alertLink} className={cx(styles, 'alert-link')}>
                {alertTitle}
              </a>
            ) : (
              alertTitle
            )}
          </h2>
        ) : (
          <p className={cx(styles, 'alert-text', 'mb-0', 'd-inline-block', 'w-100')}>
            {alertLink ? (
              <a href={alertLink} className={cx(styles, 'alert-link')}>
                {alertTitle}
              </a>
            ) : (
              alertTitle
            )}
          </p>
        ))}

      {alertPrimary && (
        <p
          className={cx(
            styles,
            'alert-text',
            !alertSecondary ? 'mb-0' : null,
            !alertTitle && !alertSecondary ? 'd-inline-block' : null,
            !alertTitle && !alertSecondary ? 'w-100' : null,
          )}
        >
          {alertLink && !alertTitle ? (
            <a href={alertLink} className={cx(styles, 'alert-link')}>
              {alertPrimary}
            </a>
          ) : (
            alertPrimary
          )}
        </p>
      )}

      {alertSecondary && (
        <>
          <hr />
          <p className="mb-0">{alertSecondary}</p>
        </>
      )}

      {additionalContent}

      {dismissable && closePosition === 'bottom' && (
        <a
          href="#"
          role="button"
          className={cx(styles, 'close')}
          onClick={handleDismiss}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </a>
      )}
    </div>
  );
}

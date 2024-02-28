import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import styles from './button.scss';

interface ButtonProps {
  /**
   * The button variant?
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary' | 'senary' | 'septenary' | 'octonary' | 'nonary' | 'denary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark';
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  backgroundColor,
  label,
  onClick,
  ...props
}: ButtonProps) => {
  return (
      <BootstrapButton
          variant={variant}
          size={size}
          className={[].join(' ')}
          onClick={onClick}
          role="button"
          name={label}
          {...props}
      >
          {label}
      </BootstrapButton>
  );
};

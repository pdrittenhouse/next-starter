import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import './button.scss';

interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
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
  primary = false,
  size = 'md',
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  return (
      <BootstrapButton
          variant="primary"
          size={size}
          className={[].join(' ')}
          {...props}
      >
          {label}
      </BootstrapButton>
  );
};

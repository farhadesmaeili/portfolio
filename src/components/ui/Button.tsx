import type { ButtonHTMLAttributes, ReactElement } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ children, variant = 'primary', ...props }: ButtonProps): ReactElement {
  return (
    <button data-variant={variant} {...props}>
      {children}
    </button>
  );
}

import type { ReactElement, ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'secondary';
}

export function Badge({ children, variant = 'default' }: BadgeProps): ReactElement {
  return <span data-variant={variant}>{children}</span>;
}

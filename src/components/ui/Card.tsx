import type { ReactElement, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps): ReactElement {
  return <div className={className}>{children}</div>;
}

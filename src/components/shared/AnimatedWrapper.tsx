'use client';

import type { ReactElement, ReactNode } from 'react';

interface AnimatedWrapperProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedWrapper({ children, className }: AnimatedWrapperProps): ReactElement {
  return <div className={className}>{children}</div>;
}

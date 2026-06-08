'use client';

import type { ReactElement } from 'react';

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps): ReactElement {
  return <div className={className} role="progressbar" aria-label="Scroll progress" />;
}

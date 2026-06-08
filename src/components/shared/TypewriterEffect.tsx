'use client';

import type { ReactElement } from 'react';

interface TypewriterEffectProps {
  text: string;
  className?: string;
}

export function TypewriterEffect({ text, className }: TypewriterEffectProps): ReactElement {
  return <span className={className}>{text}</span>;
}

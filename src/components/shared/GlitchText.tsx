'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  /** Milliseconds before the scramble starts after mount (or after trigger changes). */
  delay?: number;
  className?: string;
  /**
   * Increment this number to re-trigger the scramble effect.
   * Useful for hover-driven glitches: pass a counter that increments on mouseenter.
   */
  trigger?: number;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*_+=';

export function GlitchText({
  text,
  delay = 0,
  className,
  trigger = 0,
}: GlitchTextProps): ReactElement {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    let interval: ReturnType<typeof setInterval>;

    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration) return text[index] ?? char;
              return CHARS[Math.floor(Math.random() * CHARS.length)] ?? char;
            })
            .join('')
        );
        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 30);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, [text, delay, trigger]);

  return (
    <span
      className={cn('font-mono tracking-wider drop-shadow-[0_0_6px_rgba(0,255,65,0.5)]', className)}
      aria-label={text}
    >
      {displayText}
    </span>
  );
}

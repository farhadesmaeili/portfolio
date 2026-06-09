'use client';

import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNameProps {
  text: string;
  className?: string;
}

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=';
const SCRAMBLE_DURATION = 480; // ms each letter spends scrambling before resolving
const STAGGER_MS = 58; // delay between letters starting

// ─── Single character ────────────────────────────────────────────────────────

interface ScrambleLetterProps {
  char: string;
  startDelay: number;
}

function ScrambleLetter({ char, startDelay }: ScrambleLetterProps): ReactElement {
  // Start with a static placeholder — element is opacity:0 (Framer Motion
  // initial) so the initial value is never visible to the user.
  const [display, setDisplay] = useState<string>('@');

  useEffect(() => {
    if (char === ' ') return;

    let elapsed = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    // Wait for this letter's stagger slot, then scramble → resolve
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        elapsed += 40;
        if (elapsed >= SCRAMBLE_DURATION) {
          setDisplay(char);
          clearInterval(intervalId);
        } else {
          setDisplay(SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] ?? char);
        }
      }, 40);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [char, startDelay]);

  if (char === ' ') {
    return <span className="inline-block w-[0.28em]" aria-hidden="true" />;
  }

  return (
    <motion.span
      className="inline-block"
      aria-hidden="true"
      // Rise from below while scrambling, then settle when resolved
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: startDelay / 1000,
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {display}
    </motion.span>
  );
}

// ─── Full name ────────────────────────────────────────────────────────────────

export function AnimatedName({ text, className }: AnimatedNameProps): ReactElement {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // hero-in-2 CSS animation: 0.25 s delay + 0.55 s duration = 0.80 s.
    // Wait until it completes, then swap plain text for per-letter animation.
    // The brief opacity flash at the swap point reads as an intentional "glitch".
    const id = setTimeout(() => setMounted(true), 900);
    return () => clearTimeout(id);
  }, []);

  // Phase 1: plain text — fully visible via CSS hero-in-2 animation on parent
  if (!mounted) {
    return (
      <span className={cn(className)} aria-label={text}>
        {text}
      </span>
    );
  }

  // Phase 2: per-letter scramble reveal
  return (
    <span className={cn('inline-flex flex-wrap justify-center', className)} aria-label={text}>
      {text.split('').map((char, i) => (
        <ScrambleLetter key={i} char={char} startDelay={i * STAGGER_MS} />
      ))}
    </span>
  );
}

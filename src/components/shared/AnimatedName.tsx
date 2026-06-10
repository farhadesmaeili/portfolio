'use client';

import type { ReactElement, CSSProperties } from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNameProps {
  text: string;
  className?: string;
}

// ─── Original constants (unchanged) ──────────────────────────────────────────

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=';
const SCRAMBLE_DURATION = 480; // ms each letter spends scrambling before resolving
const STAGGER_MS = 58; // delay between letters starting

// ─── Glitch burst constants ───────────────────────────────────────────────────

const NOISE_CHARS = '/#\\%$@*!';

// ─── Burst state ──────────────────────────────────────────────────────────────

interface BurstState {
  active: boolean;
  jumpX: number;
  jumpY: number;
  rgbFilter: string;
  scanlineY: number;
  scanlineOp: number;
  sliceOn: boolean;
  sliceY: number;
  sliceH: number;
  sliceX: number;
  noiseMap: Record<number, string>;
}

const IDLE_BURST: BurstState = {
  active: false,
  jumpX: 0,
  jumpY: 0,
  rgbFilter: '',
  scanlineY: 0,
  scanlineOp: 0,
  sliceOn: false,
  sliceY: 0,
  sliceH: 0,
  sliceX: 0,
  noiseMap: {},
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildNoiseMap(text: string, count: number): Record<number, string> {
  const eligible: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== ' ') eligible.push(i);
  }
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = eligible[i] as number;
    eligible[i] = eligible[j] as number;
    eligible[j] = tmp;
  }
  const result: Record<number, string> = {};
  eligible.slice(0, count).forEach((idx) => {
    result[idx] = NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)] ?? '#';
  });
  return result;
}

// ─── useGlitchBurst ───────────────────────────────────────────────────────────
// All scheduling lives inside a single useEffect so local recursive functions
// and ref mutations are permitted by the React Compiler lint rules.

function useGlitchBurst(text: string): BurstState {
  const [burst, setBurst] = useState<BurstState>(IDLE_BURST);
  const textRef = useRef(text);
  const idsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    const after = (ms: number, fn: () => void): void => {
      const id = setTimeout(fn, ms);
      idsRef.current.push(id);
    };

    const fire = (): void => {
      const t = textRef.current;
      const sliceY = 22 + Math.random() * 36;
      const sliceH = 16 + Math.random() * 20;

      // ① Impact
      setBurst({
        active: true,
        jumpX: 2 + Math.random() * 2,
        jumpY: -(1 + Math.random()),
        rgbFilter:
          'drop-shadow(-4px 0 0 rgba(255,0,64,0.88)) ' +
          'drop-shadow(4px 0 0 rgba(0,255,136,0.82))',
        scanlineY: 8,
        scanlineOp: 0,
        sliceOn: false,
        sliceY,
        sliceH,
        sliceX: 0,
        noiseMap: buildNoiseMap(t, 2),
      });

      // ② Peak
      after(70, () =>
        setBurst((p) => ({
          ...p,
          jumpX: -1.5,
          jumpY: 1.5,
          rgbFilter:
            'drop-shadow(-5px 1px 0 rgba(255,0,64,0.9)) ' +
            'drop-shadow(5px -1px 0 rgba(0,255,136,0.88)) ' +
            'drop-shadow(0 2px 0 rgba(0,212,255,0.38))',
          scanlineY: 18,
          scanlineOp: 1,
          sliceOn: true,
          sliceX: 4 + Math.random() * 3,
          noiseMap: buildNoiseMap(t, 1),
        }))
      );

      // ③ Scanline sweep
      after(145, () =>
        setBurst((p) => ({
          ...p,
          jumpX: 1,
          jumpY: -0.5,
          rgbFilter:
            'drop-shadow(-3px 0 0 rgba(255,0,64,0.62)) ' +
            'drop-shadow(3px 0 0 rgba(0,255,136,0.58))',
          scanlineY: 62,
          scanlineOp: 0.72,
          sliceX: -(2 + Math.random() * 2),
          noiseMap: {},
        }))
      );

      // ④ Restore
      after(215, () =>
        setBurst((p) => ({
          ...p,
          jumpX: -0.5,
          jumpY: 0,
          rgbFilter:
            'drop-shadow(-1px 0 0 rgba(255,0,64,0.28)) ' +
            'drop-shadow(1px 0 0 rgba(0,255,136,0.28))',
          scanlineY: 88,
          scanlineOp: 0.28,
          sliceOn: false,
          sliceX: 0,
        }))
      );

      // ⑤ Done → schedule next burst in 4–8 s
      after(295, () => {
        setBurst(IDLE_BURST);
        after(4000 + Math.random() * 4000, fire);
      });
    };

    after(3200, fire);

    return () => {
      idsRef.current.forEach(clearTimeout);
      idsRef.current = [];
    };
  }, []); // Intentionally empty — text is read through textRef inside callbacks

  return burst;
}

// ─── Single character (original logic preserved exactly) ─────────────────────

interface ScrambleLetterProps {
  char: string;
  startDelay: number;
  /** When set, temporarily overrides the displayed character (glitch noise). */
  noiseChar?: string;
}

function ScrambleLetter({ char, startDelay, noiseChar }: ScrambleLetterProps): ReactElement {
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
      {noiseChar ?? display}
    </motion.span>
  );
}

// ─── Full name ────────────────────────────────────────────────────────────────

export function AnimatedName({ text, className }: AnimatedNameProps): ReactElement {
  const [mounted, setMounted] = useState(false);
  const burst = useGlitchBurst(text);

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

  // ── Burst-driven wrapper styles ───────────────────────────────────────────
  const wrapperStyle: CSSProperties = burst.active
    ? {
        transform: `translate(${burst.jumpX}px, ${burst.jumpY}px)`,
        filter: burst.rgbFilter,
        transition: 'none',
      }
    : {
        transform: 'none',
        filter: 'none',
        transition: 'filter 0.18s ease, transform 0.18s ease',
      };

  const chars = text.split('');

  // Phase 2: per-letter scramble reveal + burst overlays
  return (
    <span
      className={cn('relative inline-flex flex-wrap justify-center', className)}
      aria-label={text}
      style={wrapperStyle}
    >
      {/* ── Original scramble letters (logic unchanged) ───────────── */}
      {chars.map((char, i) => (
        <ScrambleLetter
          key={i}
          char={char}
          startDelay={i * STAGGER_MS}
          noiseChar={burst.noiseMap[i]}
        />
      ))}

      {/* ── Slice distortion overlay ──────────────────────────────── */}
      {burst.sliceOn && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 inline-flex flex-wrap justify-center overflow-hidden"
          style={{
            clipPath: `inset(${burst.sliceY}% 0 ${Math.max(0, 100 - burst.sliceY - burst.sliceH)}% 0)`,
            transform: `translateX(${burst.sliceX}px)`,
          }}
        >
          {text}
        </span>
      )}

      {/* ── Scanline ──────────────────────────────────────────────── */}
      {burst.scanlineOp > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[-8%] h-0.5 w-[116%]"
          style={{
            top: `${burst.scanlineY}%`,
            opacity: burst.scanlineOp,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(0,255,136,0.45) 18%, rgba(255,255,255,0.92) 50%, rgba(0,255,136,0.45) 82%, transparent 100%)',
            boxShadow: '0 0 6px rgba(0,255,136,0.9), 0 0 14px rgba(255,255,255,0.45)',
            transition: `top ${70}ms linear, opacity 55ms ease`,
          }}
        />
      )}
    </span>
  );
}

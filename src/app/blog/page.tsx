'use client';

import type { ReactElement } from 'react';
import { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { siteConfig } from '@/config/site';

// metadata can't be exported from a 'use client' file, so it lives in layout.
// We keep SEO via the parent layout's metadata (title template).

const TOPICS = [
  'Next.js Deep Dives',
  'Bug Bounty Write-ups',
  'NestJS Architecture',
  'Flutter Patterns',
  'Security Research',
  'DevOps & CI/CD',
  'Poker & Probability',
  'Open Source',
] as const;

const MATRIX_CHARS = '01アイウエオ@#$%&*{}[]<>=+-/\\ABCDEFabcdef';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface Particle {
  id: number;
  x: number;
  duration: number;
  delay: number;
  char: string;
  opacity: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    duration: 10 + Math.random() * 12,
    delay: Math.random() * 8,
    char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? '0',
    opacity: 0.08 + Math.random() * 0.07,
  }));
}

// ─── Animated terminal cursor ─────────────────────────────────────────────────

function TerminalLine({ text, delay }: { text: string; delay: number }): ReactElement {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(iv);
          setDone(true);
        }
      }, 42);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(start);
  }, [text, delay]);

  return (
    <span className="font-mono text-sm sm:text-base">
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse' }}
          className="bg-accent ml-0.5 inline-block h-[1.1em] w-[0.55em] align-middle"
          aria-hidden="true"
        />
      )}
    </span>
  );
}

// ─── Spinning scan ring ───────────────────────────────────────────────────────

function ScanRing({
  size,
  duration,
  reverse = false,
  opacity = 0.12,
}: {
  size: number;
  duration: number;
  reverse?: boolean;
  opacity?: number;
}): ReactElement {
  return (
    <div
      className="border-accent pointer-events-none absolute rounded-full border border-dashed"
      style={{
        width: size,
        height: size,
        opacity,
        animation: `spin-slow ${duration}s linear infinite${reverse ? ' reverse' : ''}`,
      }}
    />
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BlogPage(): ReactElement {
  const noMotion = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setMounted(true);
      setParticles(generateParticles());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <main
      ref={sectionRef}
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden"
    >
      {/* ── Background ──────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #00ff41 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Floating matrix chars */}
        {mounted &&
          !noMotion &&
          particles.map((p) => (
            <motion.span
              key={p.id}
              className="text-accent absolute font-mono text-xs select-none"
              style={{ left: `${p.x}%`, bottom: '-14px', opacity: p.opacity }}
              animate={{ y: [0, -1200] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {p.char}
            </motion.span>
          ))}

        {/* Edge vignettes */}
        <div className="from-background absolute inset-x-0 top-0 h-32 bg-linear-to-b to-transparent" />
        <div className="from-background absolute inset-x-0 bottom-0 h-32 bg-linear-to-t to-transparent" />
        <div className="from-background absolute inset-y-0 left-0 w-20 bg-linear-to-r to-transparent" />
        <div className="from-background absolute inset-y-0 right-0 w-20 bg-linear-to-l to-transparent" />
      </div>

      {/* ── Center content ──────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Scan rings */}
        {!noMotion && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <ScanRing size={320} duration={22} opacity={0.07} />
            <ScanRing size={420} duration={34} reverse opacity={0.04} />
            <ScanRing size={520} duration={48} opacity={0.025} />
          </div>
        )}

        {/* Glowing orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: EASE_OUT }}
          className="relative mb-10"
        >
          {/* Core orb */}
          <div
            className="border-accent/20 relative flex h-24 w-24 items-center justify-center rounded-full border"
            style={{
              background:
                'radial-gradient(circle, rgba(0,255,65,0.12) 0%, rgba(0,255,65,0.02) 60%, transparent 100%)',
              boxShadow: '0 0 60px rgba(0,255,65,0.12), 0 0 120px rgba(0,255,65,0.05)',
            }}
          >
            {/* Inner pulse rings */}
            {!noMotion &&
              [1, 1.4, 1.8].map((scale, i) => (
                <motion.div
                  key={i}
                  className="border-accent/15 absolute rounded-full border"
                  style={{ inset: 0 }}
                  animate={{ scale: [1, scale], opacity: [0.4, 0] }}
                  transition={{
                    duration: 2.2,
                    delay: i * 0.7,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              ))}

            {/* Pen icon — writing/blog */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00ff41"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
        </motion.div>

        {/* Terminal typing lines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-accent/60 mb-2 flex items-center gap-1.5 font-mono text-[11px] tracking-[0.22em] uppercase"
        >
          <span className="opacity-50">$</span>
          <TerminalLine text="./blog --status" delay={400} />
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.7, ease: EASE_OUT }}
          className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Coming Soon
        </motion.h1>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.1, duration: 0.55, ease: EASE_OUT }}
          className="border-accent/20 bg-accent/6 text-accent mb-5 flex items-center gap-2 border px-3.5 py-1.5 font-mono text-xs tracking-widest uppercase"
        >
          <motion.span
            className="bg-accent block h-1.5 w-1.5 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          Writing in progress...
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.6, ease: EASE_OUT }}
          className="text-muted mx-auto mb-10 max-w-sm text-sm leading-relaxed sm:max-w-md sm:text-base"
        >
          Articles on full-stack development, bug bounty findings, security research, and the
          occasional deep dive into probability — launching soon.
        </motion.p>

        {/* Topics grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.6 }}
          className="mb-10 w-full max-w-lg"
        >
          <p className="text-muted/50 mb-3 font-mono text-[10px] tracking-[0.2em] uppercase">
            {'// topics in the pipeline'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TOPICS.map((topic, i) => (
              <motion.span
                key={topic}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.0 + i * 0.06, duration: 0.35, ease: EASE_OUT }}
                className="border-border bg-surface text-muted/70 border px-2.5 py-1 font-mono text-[11px]"
              >
                {topic}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Notify CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.55, ease: EASE_OUT }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            className="border-accent/25 bg-accent/6 text-accent hover:bg-accent/12 flex items-center gap-2 border px-4 py-2 font-mono text-xs transition-all duration-200 hover:shadow-[0_0_18px_rgba(0,255,65,0.18)]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Follow on GitHub
          </a>
          <a
            href={`https://t.me/${siteConfig.author.telegram.replace('https://t.me/', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border text-muted hover:border-accent/25 hover:text-foreground flex items-center gap-2 border px-4 py-2 font-mono text-xs transition-all duration-200"
          >
            Get notified
          </a>
        </motion.div>

        {/* Bottom scan line */}
        {!noMotion && (
          <motion.div
            className="pointer-events-none absolute right-0 bottom-0 left-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.6) 50%, transparent 100%)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: 4 }}
          />
        )}
      </div>
    </main>
  );
}

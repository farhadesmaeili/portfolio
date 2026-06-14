'use client';

import type { ReactElement } from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { X, Gamepad2, Terminal, Cpu } from 'lucide-react';
import { GAMES, type Game } from '@/config/games';

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const DIFFICULTY_CFG: Record<string, { label: string; color: string }> = {
  easy: { label: 'EASY', color: '#00ff41' },
  medium: { label: 'MEDIUM', color: '#00d4ff' },
  hard: { label: 'HARD', color: '#ff6b35' },
};

// ─── Animation Variants ───────────────────────────────────────────────────────

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: EASE_OUT } },
};

// ─── Game Player (Modal) ──────────────────────────────────────────────────────

interface GamePlayerProps {
  game: Game;
  onClose: () => void;
}

function GamePlayer({ game, onClose }: GamePlayerProps): ReactElement {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock background scroll while the game is open (prevents the page behind
  // the modal from moving when interacting with the game on mobile).
  useEffect(() => {
    const { body } = document;
    const scrollY = window.scrollY;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-2 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header bar */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-2 flex w-full max-w-2xl items-center justify-between"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Terminal size={13} className="text-accent shrink-0" />
          <span className="text-accent font-mono text-xs tracking-widest uppercase">
            {game.name}
          </span>
          <span className="text-muted hidden font-mono text-[10px] opacity-60 sm:inline">
            {'// '}
            {game.controls}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close game"
          className="border-border text-muted hover:border-accent/40 hover:text-accent flex shrink-0 items-center gap-1.5 border px-3 py-1.5 font-mono text-xs transition-all duration-200"
        >
          <X size={12} />
          ESC
        </button>
      </motion.div>

      {/* iframe container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.12, ease: EASE_OUT }}
        className="border-accent/20 bg-surface relative w-full max-w-2xl border"
        style={{ aspectRatio: '1 / 1', maxHeight: 'min(70vh, calc(100vw - 16px))' }}
      >
        {/* Corner decorations */}
        <span className="border-accent/40 absolute top-0 left-0 block h-3 w-3 border-t border-l" />
        <span className="border-accent/40 absolute top-0 right-0 block h-3 w-3 border-t border-r" />
        <span className="border-accent/40 absolute bottom-0 left-0 block h-3 w-3 border-b border-l" />
        <span className="border-accent/40 absolute right-0 bottom-0 block h-3 w-3 border-r border-b" />

        <iframe
          src={game.src}
          title={game.name}
          className="h-full w-full"
          style={{ border: 'none', display: 'block' }}
          sandbox="allow-scripts"
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Game Card ────────────────────────────────────────────────────────────────

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

function GameCard({ game, onPlay }: GameCardProps): ReactElement {
  const diff = DIFFICULTY_CFG[game.difficulty] ?? DIFFICULTY_CFG['easy']!;

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') onPlay(game);
  };

  return (
    <motion.div
      variants={fadeUpVariants}
      className="border-border bg-surface group relative overflow-hidden border p-6"
      onClick={() => onPlay(game)}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Play ${game.name}`}
      style={{ cursor: 'pointer' }}
    >
      {/* Top accent line on hover */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${diff.color}, transparent)` }}
      />

      {/* Icon + difficulty */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center border"
          style={{ borderColor: `${diff.color}33`, backgroundColor: `${diff.color}0d` }}
        >
          <Gamepad2 size={18} style={{ color: diff.color }} />
        </div>
        <span
          className="border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase"
          style={{ borderColor: `${diff.color}33`, color: diff.color }}
        >
          {diff.label}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-foreground mb-2 font-mono text-lg font-bold tracking-tight">
        {game.name}
      </h3>

      {/* Description */}
      <p className="text-muted mb-4 text-sm leading-relaxed">{game.description}</p>

      {/* Controls */}
      <div className="mb-4 flex items-center gap-2">
        <Cpu size={10} className="text-muted/60 shrink-0" />
        <span className="text-muted/60 font-mono text-[10px] tracking-wider">{game.controls}</span>
      </div>

      {/* Tags */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {game.tags.map((tag) => (
          <span
            key={tag}
            className="border-border bg-background text-muted border px-2 py-0.5 font-mono text-[11px]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Launch button */}
      <div
        className="flex items-center justify-center gap-2 border py-2.5 font-mono text-xs tracking-wider uppercase transition-all duration-200 group-hover:shadow-[0_0_18px_rgba(0,255,65,0.18)]"
        style={{
          borderColor: `${diff.color}4d`,
          backgroundColor: `${diff.color}0d`,
          color: diff.color,
        }}
      >
        <span>▶</span>
        <span>LAUNCH</span>
      </div>

      {/* Hover scan sweep */}
      <div className="via-accent/2.5 pointer-events-none absolute inset-x-0 top-0 h-full -translate-y-full bg-linear-to-b from-transparent to-transparent opacity-0 transition-all duration-700 group-hover:translate-y-full group-hover:opacity-100" />
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function GamesSection(): ReactElement {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const isHeaderInView = useInView(headerRef, { once: true, margin: '-60px' });
  const isGridInView = useInView(gridRef, { once: true, margin: '-40px' });

  return (
    <>
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        {/* ── Background ──────────────────────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.032]"
            style={{
              backgroundImage: 'radial-gradient(circle, #00ff41 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 50% 38% at 50% 30%, rgba(0,255,65,0.03) 0%, transparent 70%)',
            }}
          />
          <div className="from-background absolute inset-x-0 top-0 h-28 bg-linear-to-b to-transparent" />
          <div className="from-background absolute inset-x-0 bottom-0 h-28 bg-linear-to-t to-transparent" />
          <div className="from-background absolute inset-y-0 left-0 w-16 bg-linear-to-r to-transparent" />
          <div className="from-background absolute inset-y-0 right-0 w-16 bg-linear-to-l to-transparent" />
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          {/* ── Header ───────────────────────────────────────────────────── */}
          <motion.div
            ref={headerRef}
            variants={staggerVariants}
            initial="hidden"
            animate={isHeaderInView ? 'visible' : 'hidden'}
            className="mb-16 text-center"
          >
            <motion.p
              variants={fadeUpVariants}
              className="text-accent mb-3 font-mono text-[10px] tracking-[0.22em] uppercase sm:text-xs sm:tracking-[0.3em]"
            >
              <span className="mr-2 opacity-40 select-none">$</span>
              ls ~/games --sort=fun
            </motion.p>

            <motion.h1
              variants={fadeUpVariants}
              className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Games
            </motion.h1>

            <motion.p
              variants={fadeUpVariants}
              className="text-muted mx-auto max-w-lg text-sm leading-relaxed sm:text-base"
            >
              Mini games built with HTML5 Canvas and React. Because every hacker needs a break from
              breaking things.
            </motion.p>

            <motion.div
              variants={fadeUpVariants}
              className="mt-8 flex items-center justify-center gap-8 sm:gap-12"
            >
              {[
                { value: String(GAMES.length), label: 'Games' },
                { value: '∞', label: 'High Scores' },
                { value: '0', label: 'Productivity' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-accent font-mono text-xl font-bold sm:text-2xl">{value}</div>
                  <div className="text-muted font-mono text-[10px] tracking-widest uppercase">
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Games Grid ────────────────────────────────────────────────── */}
          <motion.div
            ref={gridRef}
            variants={staggerVariants}
            initial="hidden"
            animate={isGridInView ? 'visible' : 'hidden'}
          >
            <motion.div variants={fadeUpVariants} className="mb-6 flex items-center gap-3">
              <span className="text-accent font-mono text-xs tracking-[0.2em] uppercase">
                <span className="opacity-40">{'// '}</span>Playable
              </span>
              <div className="bg-border h-px flex-1" />
              <span className="text-muted font-mono text-xs">{GAMES.length} available</span>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GAMES.map((game) => (
                <GameCard key={game.id} game={game} onPlay={setActiveGame} />
              ))}

              {/* Coming Soon placeholder */}
              <motion.div
                variants={fadeUpVariants}
                className="border-border/40 bg-surface/30 relative flex min-h-65 flex-col items-center justify-center border border-dashed p-6 text-center"
              >
                <span className="text-accent/30 mb-3 font-mono text-3xl">+</span>
                <p className="text-muted/50 font-mono text-xs tracking-widest uppercase">
                  More games coming
                </p>
                <p className="text-muted/30 mt-1 font-mono text-[10px]">{'// stay tuned'}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Game Player Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeGame !== null && (
          <GamePlayer game={activeGame} onClose={() => setActiveGame(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

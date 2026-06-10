'use client';

import type { ReactElement, MouseEvent as ReactMouseEvent } from 'react';
import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import {
  motion,
  useInView,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { SKILLS, SKILL_CATEGORIES, type SkillCategory } from '@/config/skills';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveCategory = SkillCategory | 'All';

interface FloatingChar {
  id: number;
  char: string;
  x: number;
  duration: number;
  delay: number;
  opacity: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MATRIX_CHARS = '01アイウエオカキ@#$%&*ABCDEFabcdef0123456789{}[]<>=+-/\\';

// ─── Hydration-safe random chars (useSyncExternalStore pattern) ───────────────
// Server snapshot → [] so the initial HTML matches; client snapshot → stable
// random chars generated once after mount. Avoids useEffect setState entirely.

let _charsCache: FloatingChar[] | null = null;

function getCharsSnapshot(): FloatingChar[] {
  if (_charsCache === null) {
    _charsCache = Array.from({ length: 26 }, (_, i) => ({
      id: i,
      char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? '0',
      x: Math.random() * 100,
      duration: 10 + Math.random() * 16,
      delay: Math.random() * 9,
      opacity: 0.038 + Math.random() * 0.072,
    }));
  }
  return _charsCache;
}

const EMPTY_CHARS: FloatingChar[] = [];

function getEmptyChars(): FloatingChar[] {
  return EMPTY_CHARS;
}

const EASE_OUT_CUBIC = [0.22, 1, 0.36, 1] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryColor(cat: ActiveCategory): string {
  if (cat === 'All') return '#00ff41';
  return SKILL_CATEGORIES.find((c) => c.id === cat)?.color ?? '#00ff41';
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const headerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const headerItemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_CUBIC } },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.042 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.86, y: 22 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.42, ease: EASE_OUT_CUBIC },
  },
};

// ─── Count-Up Hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, isActive: boolean, delayMs: number): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const timeoutId = setTimeout(() => {
      const steps = 44;
      const stepMs = 1600 / steps;
      let step = 0;

      intervalId = setInterval(() => {
        step++;
        const easedProgress = 1 - Math.pow(1 - step / steps, 3);
        setCount(Math.round(easedProgress * target));
        if (step >= steps) {
          setCount(target);
          clearInterval(intervalId);
        }
      }, stepMs);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [isActive, target, delayMs]);

  return count;
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

interface StatsRowProps {
  isInView: boolean;
}

function StatsRow({ isInView }: StatsRowProps): ReactElement {
  const skills = useCountUp(SKILLS.length, isInView, 350);
  const domains = useCountUp(SKILL_CATEGORIES.length, isInView, 550);
  const years = useCountUp(5, isInView, 750);

  const entries = [
    { value: skills, label: 'SKILLS', suffix: '+' },
    { value: domains, label: 'DOMAINS', suffix: '' },
    { value: years, label: 'YRS_EXP', suffix: '+' },
  ];

  return (
    <motion.div
      variants={headerItemVariants}
      className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:mt-10 sm:gap-12"
    >
      {entries.map(({ value, label, suffix }) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <span
            className="text-accent font-mono text-3xl font-bold tabular-nums sm:text-4xl"
            style={{
              textShadow: '0 0 24px rgba(0,255,65,0.65), 0 0 60px rgba(0,255,65,0.22)',
            }}
          >
            {value}
            {suffix}
          </span>
          <span className="text-muted font-mono text-[9px] tracking-[0.24em] sm:text-[10px] sm:tracking-[0.28em]">
            {label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Category Tab ─────────────────────────────────────────────────────────────

interface CategoryTabProps {
  id: ActiveCategory;
  label: string;
  count: number;
  isActive: boolean;
  color: string;
  onClick: () => void;
}

function CategoryTab({ label, count, isActive, color, onClick }: CategoryTabProps): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        'group relative flex shrink-0 items-center gap-1 px-3 py-2 sm:gap-1.5 sm:px-4',
        'font-mono text-[11px] tracking-wider uppercase sm:text-xs',
        'focus-visible:ring-accent/50 transition-colors duration-200 focus-visible:ring-1 focus-visible:outline-none',
        isActive ? 'text-foreground' : 'text-muted hover:text-foreground/70'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="skillCategoryTab"
          className="absolute inset-0"
          style={{
            border: `1px solid ${color}48`,
            background: `${color}09`,
            boxShadow: `0 0 18px ${color}14, inset 0 0 18px ${color}07`,
          }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
        />
      )}
      <span className="relative z-10">{label}</span>
      <span
        className="relative z-10 font-mono text-[10px] opacity-55"
        style={isActive ? { color } : undefined}
      >
        [{count}]
      </span>
    </button>
  );
}

// ─── Skill Card ───────────────────────────────────────────────────────────────

interface SkillCardProps {
  name: string;
  abbr: string;
  level: number;
  color: string;
  index: number;
  noMotion: boolean;
}

function SkillCard({ name, abbr, level, color, index, noMotion }: SkillCardProps): ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-28px' });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rawRotX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rawRotY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
  const rotateX = useSpring(rawRotX, { stiffness: 260, damping: 24 });
  const rotateY = useSpring(rawRotY, { stiffness: 260, damping: 24 });

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (noMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY, noMotion]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      style={{ perspective: '800px' }}
      className="cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={noMotion ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn(
          'group relative flex flex-col gap-2.5 overflow-hidden p-3 sm:gap-3 sm:p-3.5',
          'border-border bg-surface border',
          'transition-[border-color,box-shadow] duration-300',
          'hover:border-white/10'
        )}
        whileHover={noMotion ? {} : { scale: 1.038, transition: { duration: 0.2 } }}
      >
        {/* Ambient glow – brightens on hover */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(ellipse at 50% -15%, ${color}12 0%, transparent 68%)`,
            boxShadow: `inset 0 0 0 1px ${color}32, 0 0 18px ${color}1a`,
          }}
        />

        {/* Corner brackets – appear on hover */}
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <div
            key={c}
            className="pointer-events-none absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              top: c.startsWith('t') ? 0 : 'auto',
              bottom: c.startsWith('b') ? 0 : 'auto',
              left: c.endsWith('l') ? 0 : 'auto',
              right: c.endsWith('r') ? 0 : 'auto',
              width: 9,
              height: 9,
              borderTop: c.startsWith('t') ? `1.5px solid ${color}` : undefined,
              borderBottom: c.startsWith('b') ? `1.5px solid ${color}` : undefined,
              borderLeft: c.endsWith('l') ? `1.5px solid ${color}` : undefined,
              borderRight: c.endsWith('r') ? `1.5px solid ${color}` : undefined,
            }}
          />
        ))}

        {/* One-shot scan line on card enter */}
        {!noMotion && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 z-10 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}95, transparent)`,
            }}
            initial={{ top: 0, opacity: 0 }}
            animate={isInView ? { top: ['0%', '100%'], opacity: [0, 0.85, 0.85, 0] } : {}}
            transition={{ duration: 1.0, delay: index * 0.028, ease: 'linear' }}
          />
        )}

        {/* Icon badge + proficiency % */}
        <div className="flex items-center justify-between gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center font-mono text-[10px] font-bold tracking-wide transition-all duration-300 sm:h-8 sm:w-8 sm:text-[11px]"
            style={{
              border: `1px solid ${color}32`,
              color,
              background: `${color}0e`,
            }}
          >
            {abbr}
          </div>
          <span
            className="font-mono text-[10px] tabular-nums sm:text-[10px]"
            style={{ color: `${color}62` }}
          >
            {level}%
          </span>
        </div>

        {/* Skill name */}
        <p className="text-foreground/70 group-hover:text-foreground/95 font-mono text-[11px] leading-tight font-medium transition-colors duration-200 sm:text-xs">
          {name}
        </p>

        {/* Proficiency bar */}
        <div className="relative h-px w-full bg-white/5">
          <motion.div
            className="absolute top-0 left-0 h-full"
            style={{
              background: `linear-gradient(90deg, ${color}55, ${color})`,
            }}
            initial={{ width: '0%' }}
            animate={isInView ? { width: `${level}%` } : { width: '0%' }}
            transition={{
              duration: 1.35,
              delay: index * 0.024 + 0.48,
              ease: EASE_OUT_CUBIC,
            }}
          />
          {/* Glowing tip dot */}
          <motion.div
            className="absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 7px 2px ${color}`,
              left: `${level}%`,
            }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: index * 0.024 + 0.9, duration: 0.3 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Floating Matrix Chars Background ────────────────────────────────────────

interface FloatingCharsProps {
  chars: FloatingChar[];
}

function FloatingChars({ chars }: FloatingCharsProps): ReactElement {
  return (
    <>
      {chars.map((fc) => (
        <motion.span
          key={fc.id}
          className="text-accent absolute font-mono text-xs select-none"
          style={{ left: `${fc.x}%`, bottom: '-14px', opacity: fc.opacity }}
          animate={{ y: [0, -1700] }}
          transition={{
            duration: fc.duration,
            delay: fc.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          aria-hidden="true"
        >
          {fc.char}
        </motion.span>
      ))}
    </>
  );
}

// ─── Main Skills Section ──────────────────────────────────────────────────────

export function SkillsSection(): ReactElement {
  const [active, setActive] = useState<ActiveCategory>('All');

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const noMotion = useReducedMotion() ?? false;
  const isSectionInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-70px' });

  const floatingChars = useSyncExternalStore(() => () => {}, getCharsSnapshot, getEmptyChars);

  const filteredSkills = active === 'All' ? SKILLS : SKILLS.filter((s) => s.category === active);

  const activeColor = getCategoryColor(active);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative overflow-hidden py-16 sm:py-24 lg:py-32"
    >
      {/* ── Background ──────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.042]"
          style={{
            backgroundImage: 'radial-gradient(circle, #00ff41 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Horizontal rule grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.016]"
          style={{
            backgroundImage: 'linear-gradient(0deg, transparent calc(100% - 1px), #00ff41 100%)',
            backgroundSize: '100% 60px',
          }}
        />

        {/* Floating matrix chars – client-only */}
        {!noMotion && <FloatingChars chars={floatingChars} />}

        {/* Full-section scan sweep – fires once on entry */}
        {!noMotion && (
          <motion.div
            className="absolute inset-x-0 z-10 h-[2px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.9) 50%, transparent 100%)',
              boxShadow: '0 0 22px rgba(0,255,65,0.9), 0 0 50px rgba(0,255,65,0.4)',
            }}
            initial={{ top: 0, opacity: 0 }}
            animate={isSectionInView ? { top: '100%', opacity: [0, 1, 1, 0] } : {}}
            transition={{ duration: 1.9, ease: 'easeInOut', delay: 0.08 }}
          />
        )}

        {/* Edge vignette fades */}
        <div className="from-background absolute inset-x-0 top-0 h-28 bg-linear-to-b to-transparent" />
        <div className="from-background absolute inset-x-0 bottom-0 h-28 bg-linear-to-t to-transparent" />
        <div className="from-background absolute inset-y-0 left-0 w-16 bg-linear-to-r to-transparent" />
        <div className="from-background absolute inset-y-0 right-0 w-16 bg-linear-to-l to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── Section Header ───────────────────────────────────────────── */}
        <motion.div
          ref={headerRef}
          variants={headerVariants}
          initial="hidden"
          animate={isHeaderInView ? 'visible' : 'hidden'}
          className="mb-16 text-center"
        >
          {/* Terminal prompt */}
          <motion.p
            variants={headerItemVariants}
            className="text-accent mb-3 font-mono text-[10px] tracking-[0.2em] uppercase sm:text-xs sm:tracking-[0.3em]"
          >
            <span className="mr-2 opacity-40 select-none">$</span>
            <span className="hidden sm:inline">./skill_matrix --init --verbose</span>
            <span className="sm:hidden">skill_matrix --init</span>
          </motion.p>

          {/* Section title */}
          <motion.h2
            variants={headerItemVariants}
            className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Tech{' '}
            <span
              className="text-accent"
              style={{
                textShadow: '0 0 28px rgba(0,255,65,0.65), 0 0 72px rgba(0,255,65,0.22)',
              }}
            >
              Arsenal
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={headerItemVariants}
            className="text-muted mx-auto max-w-md font-mono text-sm leading-relaxed"
          >
            <span className="opacity-40">{'//'}</span> Battle-tested tools for building{' '}
            <span className="text-accent/75">fast, secure &amp; scalable</span> systems.
          </motion.p>

          {/* Animated stats */}
          <StatsRow isInView={isHeaderInView} />
        </motion.div>

        {/* ── Category Filter Tabs ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.52, duration: 0.5, ease: EASE_OUT_CUBIC }}
          className="mb-8"
          role="group"
          aria-label="Filter skills by category"
        >
          {/* Scrollable row on mobile, wrapping flex on sm+ */}
          <div
            className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0"
            style={{ scrollbarWidth: 'none' }}
          >
            <CategoryTab
              id="All"
              label="All"
              count={SKILLS.length}
              isActive={active === 'All'}
              color="#00ff41"
              onClick={() => setActive('All')}
            />
            {SKILL_CATEGORIES.map((cat) => (
              <CategoryTab
                key={cat.id}
                id={cat.id}
                label={cat.label}
                count={SKILLS.filter((s) => s.category === cat.id).length}
                isActive={active === cat.id}
                color={cat.color}
                onClick={() => setActive(cat.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Active Category Label ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {active !== 'All' && (
            <motion.div
              key={`label-${active}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="text-muted mb-6 flex items-center gap-2 font-mono text-xs"
            >
              <span className="opacity-40">›</span>
              <span>filter:</span>
              <span style={{ color: activeColor }}>{active}</span>
              <span className="opacity-30">—</span>
              <span>{filteredSkills.length} modules loaded</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Skills Grid ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`grid-${active}`}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.14 } }}
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {filteredSkills.map((skill, i) => (
              <SkillCard
                key={skill.name}
                name={skill.name}
                abbr={skill.abbr}
                level={skill.level}
                color={getCategoryColor(skill.category)}
                index={i}
                noMotion={noMotion}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Category Legend ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isHeaderInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActive(cat.id)}
              className="text-muted hover:text-foreground/70 flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase transition-colors duration-150"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}` }}
              />
              {cat.label}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

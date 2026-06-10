'use client';

import type { ReactElement, PointerEvent as ReactPointerEvent } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Trophy, MapPin, Wifi, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FloatingChar {
  id: number;
  char: string;
  x: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface NNNode {
  x: number;
  y: number;
  z: number;
  phase: number;
  r: number;
  color: string;
}

interface NNEdge {
  from: number;
  to: number;
}

interface NNPulse {
  edgeIdx: number;
  progress: number;
  speed: number;
  dir: 1 | -1;
  color: string;
}

interface IdentityCardData {
  id: string;
  command: string;
  title: string;
  body: string;
  color: string;
  tags: string[];
  icon: ReactElement;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MATRIX_CHARS = '01アイウエオ@#$%&*ABCDEFabcdef{}[]<>=+-/\\';
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const NET_SIZE = 300;

// ─── Data ─────────────────────────────────────────────────────────────────────

const IDENTITY_CARDS: IdentityCardData[] = [
  {
    id: 'developer',
    command: '$ git log --author="farhad" --oneline | wc -l',
    title: 'Full Stack Developer',
    body: "Building scalable web and mobile products from the ground up. I care deeply about architecture, performance, and developer experience — writing code that's both clean and built to last.",
    color: '#00ff41',
    tags: ['Next.js', 'NestJS', 'Flutter', 'TypeScript', 'Docker'],
    icon: <Terminal size={16} />,
  },
  {
    id: 'security',
    command: '$ nmap -sV --script vuln target.com',
    title: 'Bug Bounty Hunter',
    body: 'Finding critical vulnerabilities that others miss. I approach every system as an attacker first — probing edge cases, chaining low-severity findings, and thinking outside the spec.',
    color: '#ff6b35',
    tags: ['OWASP Top 10', 'Web Security', 'XSS / SQLi', 'Recon', 'CVE Research'],
    icon: <Shield size={16} />,
  },
  {
    id: 'poker',
    command: '$ poker --mode=tournament --ev-calc --reads=enabled',
    title: 'Professional Poker Player',
    body: 'Poker is where probability meets psychology. Managing risk, reading patterns, staying disciplined under pressure — lessons the felt table teaches that no textbook can. The same analytical mindset that makes a great engineer makes a great poker player.',
    color: '#a78bfa',
    tags: ['Expected Value', 'Risk Management', 'Pattern Reading', 'Discipline', 'Reads'],
    icon: <Trophy size={16} />,
  },
];

const STATS = [
  { value: '7+', label: 'Years Coding' },
  { value: '25+', label: 'Technologies' },
  { value: '3', label: 'Disciplines' },
  { value: '∞', label: 'Curiosity' },
] as const;

const BIO_HIGHLIGHTS = [
  '7+ years building full-stack web & mobile applications',
  'Active bug bounty hunter — finding what systems hide',
  'Professional poker player — probability, reads, discipline',
  'Open to new ideas, remote collaboration & bold projects',
] as const;

// ─── Animation Variants ───────────────────────────────────────────────────────

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: EASE_OUT } },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

// ─── Floating Chars ───────────────────────────────────────────────────────────

function generateFloatingChars(): FloatingChar[] {
  return Array.from({ length: 28 }, (_, i) => ({
    id: i,
    char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? '0',
    x: Math.random() * 100,
    duration: 11 + Math.random() * 14,
    delay: Math.random() * 10,
    opacity: 0.09 + Math.random() * 0.06,
  }));
}

function FloatingChars({ chars }: { chars: FloatingChar[] }): ReactElement {
  return (
    <>
      {chars.map((fc) => (
        <motion.span
          key={fc.id}
          className="text-accent absolute font-mono text-xs select-none"
          style={{ left: `${fc.x}%`, bottom: '-14px', opacity: fc.opacity }}
          animate={{ y: [0, -1600] }}
          transition={{ duration: fc.duration, delay: fc.delay, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        >
          {fc.char}
        </motion.span>
      ))}
    </>
  );
}

// ─── Neural Network 3D ────────────────────────────────────────────────────────

function NeuralNet(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef({ x: 0.25, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const [mounted, setMounted] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const noMotion = mounted && prefersReducedMotion;

  const onDown = useCallback((e: ReactPointerEvent<HTMLCanvasElement>): void => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    velRef.current = { x: 0, y: 0 };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setHintVisible(false);
  }, []);

  const onMove = useCallback((e: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    velRef.current = { x: dy * 0.014, y: dx * 0.014 };
    rotRef.current.x += dy * 0.014;
    rotRef.current.y += dx * 0.014;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  }, []);

  const onUp = useCallback((): void => {
    dragRef.current.active = false;
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const S = NET_SIZE;
    canvas.width = S * dpr;
    canvas.height = S * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const half = S / 2;
    const R = 112;
    const FOV = 480;
    const CONNECT_DIST = 0.92;

    // Node palette: mostly green, 3 orange (security), 2 purple (poker)
    const palette = [
      ...Array(15).fill('#00ff41'),
      '#ff6b35',
      '#ff6b35',
      '#ff6b35',
      '#a78bfa',
      '#a78bfa',
    ];

    // Generate nodes inside unit sphere
    const nodes: NNNode[] = [];
    while (nodes.length < 20) {
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = (Math.random() - 0.5) * 2;
      if (x * x + y * y + z * z <= 1) {
        nodes.push({
          x,
          y,
          z,
          phase: Math.random() * Math.PI * 2,
          r: 2.2 + Math.random() * 1.8,
          color: palette[nodes.length] ?? '#00ff41',
        });
      }
    }

    // Build edge list
    const edges: NNEdge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i]!,
          nj = nodes[j]!;
        const d = Math.sqrt((ni.x - nj.x) ** 2 + (ni.y - nj.y) ** 2 + (ni.z - nj.z) ** 2);
        if (d < CONNECT_DIST) edges.push({ from: i, to: j });
      }
    }

    // Seed pulses
    const pulses: NNPulse[] = [];
    const seedCount = Math.min(8, edges.length);
    const used = new Set<number>();
    for (let k = 0; k < seedCount; k++) {
      let idx: number;
      do {
        idx = Math.floor(Math.random() * edges.length);
      } while (used.has(idx));
      used.add(idx);
      const fromNode = nodes[edges[idx]!.from]!;
      pulses.push({
        edgeIdx: idx,
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.006,
        dir: Math.random() > 0.5 ? 1 : -1,
        color: fromNode.color,
      });
    }

    let frame = 0;
    let rafId: number;

    const rotate = (x: number, y: number, z: number): [number, number, number] => {
      const ry = rotRef.current.y;
      const rx = rotRef.current.x;
      const x1 = x * Math.cos(ry) - z * Math.sin(ry);
      const z1 = x * Math.sin(ry) + z * Math.cos(ry);
      const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      return [x1, y2, z2];
    };

    const project = (x: number, y: number, z: number): [number, number, number] => {
      const scale = FOV / (FOV + z * R * 0.55);
      return [half + x * R * scale, half + y * R * scale, z];
    };

    const hexToRgb = (hex: string): string => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };

    const draw = (): void => {
      frame++;
      ctx.clearRect(0, 0, S, S);

      // Physics
      if (!dragRef.current.active) {
        rotRef.current.y += velRef.current.y + 0.0025;
        rotRef.current.x += velRef.current.x;
        velRef.current.y *= 0.91;
        velRef.current.x *= 0.91;
      }

      // Update pulses
      for (const pulse of pulses) {
        pulse.progress += pulse.speed * pulse.dir;
        if (pulse.progress >= 1 || pulse.progress <= 0) {
          pulse.dir = pulse.dir === 1 ? -1 : 1;
          pulse.progress = Math.max(0, Math.min(1, pulse.progress));
        }
      }

      // Occasionally spawn a new pulse to keep network alive
      if (frame % 90 === 0 && edges.length > 0 && pulses.length < 12) {
        const idx = Math.floor(Math.random() * edges.length);
        const fromNode = nodes[edges[idx]!.from]!;
        pulses.push({
          edgeIdx: idx,
          progress: 0,
          speed: 0.007 + Math.random() * 0.005,
          dir: 1,
          color: fromNode.color,
        });
      }
      if (pulses.length > 14) pulses.splice(0, pulses.length - 14);

      // Ambient glow
      const bg = ctx.createRadialGradient(half, half, 10, half, half, R * 1.6);
      bg.addColorStop(0, 'rgba(0,255,65,0.05)');
      bg.addColorStop(0.5, 'rgba(0,255,65,0.01)');
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, S, S);

      // Project nodes
      type Projected = { px: number; py: number; pz: number };
      const proj: Projected[] = nodes.map((n) => {
        const [rx, ry, rz] = rotate(n.x, n.y, n.z);
        const [px, py, pz] = project(rx, ry, rz);
        return { px, py, pz };
      });

      // Draw edges
      for (const edge of edges) {
        const a = proj[edge.from]!;
        const b = proj[edge.to]!;
        const avgZ = (a.pz + b.pz) / 2;
        const depth = (avgZ + 1) / 2;

        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.strokeStyle = `rgba(0,255,65,${(0.05 + depth * 0.12).toFixed(2)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Draw pulses
      for (const pulse of pulses) {
        const edge = edges[pulse.edgeIdx];
        if (!edge) continue;
        const a = proj[edge.from]!;
        const b = proj[edge.to]!;
        const avgZ = (a.pz + b.pz) / 2;
        const depth = (avgZ + 1) / 2;
        if (depth < 0.1) continue;

        const px = a.px + (b.px - a.px) * pulse.progress;
        const py = a.py + (b.py - a.py) * pulse.progress;
        const rgb = hexToRgb(pulse.color);

        // Trail glow
        const trail = ctx.createRadialGradient(px, py, 0, px, py, 9);
        trail.addColorStop(0, `rgba(${rgb},${(depth * 0.75).toFixed(2)})`);
        trail.addColorStop(0.5, `rgba(${rgb},${(depth * 0.2).toFixed(2)})`);
        trail.addColorStop(1, 'transparent');
        ctx.fillStyle = trail;
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(${rgb},${(0.6 + depth * 0.4).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw nodes
      nodes.forEach((node, i) => {
        const { px, py, pz } = proj[i]!;
        const depth = (pz + 1) / 2;
        const brightness = 0.5 + 0.5 * Math.sin(frame * 0.038 + node.phase);
        const r = node.r + brightness * 1.8;
        const alpha = 0.25 + depth * 0.75;
        const rgb = hexToRgb(node.color);

        // Outer glow
        const ng = ctx.createRadialGradient(px, py, 0, px, py, r * 4.5);
        ng.addColorStop(0, `rgba(${rgb},${(alpha * 0.55).toFixed(2)})`);
        ng.addColorStop(0.5, `rgba(${rgb},${(alpha * 0.12).toFixed(2)})`);
        ng.addColorStop(1, 'transparent');
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(px, py, r * 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (noMotion) {
    return (
      <div
        className="border-accent/20 flex items-center justify-center border border-dashed"
        style={{ width: NET_SIZE, height: NET_SIZE }}
      >
        <span className="text-muted font-mono text-xs">[ reduced motion ]</span>
      </div>
    );
  }

  return (
    <div className="relative inline-flex flex-col items-center gap-3">
      {/* Outer decorative ring */}
      <div
        className="border-accent/[0.08] absolute rounded-full border border-dashed"
        style={{
          width: NET_SIZE + 60,
          height: NET_SIZE + 60,
          animation: 'spin-slow 36s linear infinite',
        }}
      />
      <div
        className="border-accent/[0.04] absolute rounded-full border"
        style={{
          width: NET_SIZE + 32,
          height: NET_SIZE + 32,
          animation: 'spin-slow 22s linear infinite reverse',
        }}
      />

      {/* Color legend dots */}
      <div className="absolute top-1/2 -right-2 z-20 flex -translate-y-1/2 flex-col gap-2.5">
        {[
          { color: '#00ff41', label: 'Dev' },
          { color: '#ff6b35', label: 'Sec' },
          { color: '#a78bfa', label: 'Poker' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1" title={label}>
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 6px ${color}` }}
            />
          </div>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className="relative z-10 cursor-grab touch-none active:cursor-grabbing"
        style={{ width: NET_SIZE, height: NET_SIZE }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onPointerCancel={onUp}
        aria-label="Interactive 3D neural network — drag or touch to rotate"
      />

      <motion.p
        initial={{ opacity: 0.4 }}
        animate={{ opacity: hintVisible ? 0.4 : 0 }}
        transition={{ duration: 0.6 }}
        className="text-accent/60 relative z-10 font-mono text-[10px] tracking-[0.25em] uppercase"
        aria-hidden="true"
      >
        ↺ drag to explore
      </motion.p>
    </div>
  );
}

// ─── Identity Card ────────────────────────────────────────────────────────────

function IdentityCard({ card }: { card: IdentityCardData }): ReactElement {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={fadeUpVariants}
      className="group border-border bg-surface relative overflow-hidden border p-5 sm:p-6"
      style={{ '--card-color': card.color } as React.CSSProperties}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${card.color}60, transparent)` }}
      />

      {/* Icon + title row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center border"
            style={{
              borderColor: `${card.color}30`,
              background: `${card.color}0c`,
              color: card.color,
            }}
          >
            {card.icon}
          </div>
          <h3 className="text-foreground font-bold tracking-tight">{card.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-muted hover:text-foreground shrink-0 transition-colors duration-150"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <ChevronRight
            size={14}
            className="transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(90deg)' : undefined }}
          />
        </button>
      </div>

      {/* Terminal command */}
      <p className="mb-3 font-mono text-[11px] tracking-wide" style={{ color: `${card.color}70` }}>
        {card.command}
      </p>

      {/* Body (always visible, truncated on small) */}
      <p className={cn('text-muted/80 mb-4 text-sm leading-relaxed', !expanded && 'line-clamp-2')}>
        {card.body}
      </p>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="tags"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 pt-1">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase"
                  style={{ borderColor: `${card.color}28`, color: `${card.color}90` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${card.color}08 0%, transparent 65%)`,
        }}
      />
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function AboutSection(): ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  const [floatingChars, setFloatingChars] = useState<FloatingChar[]>([]);

  const isSectionInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-60px' });
  const isBioInView = useInView(bioRef, { once: true, margin: '-40px' });
  const isStatsInView = useInView(statsRef, { once: true, margin: '-40px' });
  const isCardsInView = useInView(cardsRef, { once: true, margin: '-40px' });
  const isNetInView = useInView(netRef, { once: true, margin: '-60px' });

  const noMotion = prefersReducedMotion && mounted;

  useEffect(() => {
    const id = setTimeout(() => {
      setMounted(true);
      setFloatingChars(generateFloatingChars());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden py-16 sm:py-24 lg:py-32"
    >
      {/* ── Background ──────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #00ff41 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent calc(100% - 1px), #00ff41 100%),
              linear-gradient(90deg, transparent calc(100% - 1px), #00ff41 100%)
            `,
            backgroundSize: '88px 88px',
          }}
        />

        {mounted && !noMotion && <FloatingChars chars={floatingChars} />}

        {!noMotion && (
          <motion.div
            className="absolute inset-x-0 z-10 h-0.5"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.9) 50%, transparent 100%)',
              boxShadow: '0 0 22px rgba(0,255,65,0.9)',
            }}
            initial={{ top: 0, opacity: 0 }}
            animate={isSectionInView ? { top: '100%', opacity: [0, 1, 1, 0] } : {}}
            transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.05 }}
          />
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 75% 50%, rgba(0,255,65,0.025) 0%, transparent 70%)',
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
          className="mb-14 text-center sm:mb-16"
        >
          <motion.p
            variants={fadeUpVariants}
            className="text-accent mb-3 font-mono text-[10px] tracking-[0.22em] uppercase sm:text-xs sm:tracking-[0.3em]"
          >
            <span className="mr-2 opacity-40 select-none">$</span>
            <span className="hidden sm:inline">
              cat ~/about.md | grep --identity --skills --passions
            </span>
            <span className="sm:hidden">cat ~/about.md</span>
          </motion.p>

          <motion.h1
            variants={fadeUpVariants}
            className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            About Me
          </motion.h1>

          <motion.p
            variants={fadeUpVariants}
            className="text-muted mx-auto max-w-md text-sm leading-relaxed sm:text-base"
          >
            Developer. Security researcher. Poker professional. Driven by curiosity, detail, and the
            relentless pursuit of what&apos;s next.
          </motion.p>
        </motion.div>

        {/* ── Two-column: Bio + Neural Net ─────────────────────────────── */}
        <div className="mb-16 grid items-center gap-12 lg:grid-cols-5 lg:gap-16">
          {/* ── Bio column ─────────────────────────────────────────────── */}
          <motion.div
            ref={bioRef}
            variants={staggerVariants}
            initial="hidden"
            animate={isBioInView ? 'visible' : 'hidden'}
            className="lg:col-span-3"
          >
            {/* Name + status */}
            <motion.div variants={fadeUpVariants} className="mb-5">
              <div className="text-accent mb-1 flex items-center gap-2 font-mono text-xs tracking-widest uppercase">
                <Wifi size={11} />
                <span>online · available for new projects</span>
              </div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Farhad Esmaeili
              </h2>
              <p className="text-muted mt-1 font-mono text-sm">
                Full Stack Developer · Bug Bounty Hunter · Poker Player
              </p>
            </motion.div>

            {/* Bio text */}
            <motion.p
              variants={fadeUpVariants}
              className="text-muted/85 mb-6 text-sm leading-[1.8] sm:text-base"
            >
              I&apos;m a full stack developer with{' '}
              <span className="text-foreground font-semibold">7+ years of hands-on experience</span>{' '}
              building web and mobile applications. I&apos;m deeply passionate about technology and
              always chasing what&apos;s next — whether that&apos;s a new framework, an obscure
              vulnerability, or a novel approach to an old problem.
            </motion.p>

            <motion.p
              variants={fadeUpVariants}
              className="text-muted/85 mb-7 text-sm leading-[1.8] sm:text-base"
            >
              Beyond code, I&apos;m a{' '}
              <span className="text-foreground font-semibold">professional poker player</span> — a
              game that demands the same skills I bring to engineering: reading patterns,
              calculating probability, managing risk, and staying disciplined when stakes are high.
            </motion.p>

            {/* Highlights */}
            <motion.ul variants={staggerVariants} className="space-y-2.5">
              {BIO_HIGHLIGHTS.map((h) => (
                <motion.li
                  key={h}
                  variants={fadeUpVariants}
                  className="text-muted/75 flex items-start gap-2.5 font-mono text-xs sm:text-sm"
                >
                  <span className="text-accent mt-0.5 text-base leading-none select-none">›</span>
                  {h}
                </motion.li>
              ))}
            </motion.ul>

            {/* Location + links */}
            <motion.div
              variants={fadeUpVariants}
              className="mt-7 flex flex-wrap items-center gap-4"
            >
              <div className="text-muted flex items-center gap-1.5 font-mono text-xs">
                <MapPin size={11} />
                Iran · Remote Worldwide
              </div>
              <a
                href={siteConfig.author.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent/70 hover:text-accent border-accent/20 hover:border-accent/40 border px-3 py-1.5 font-mono text-xs transition-all duration-200"
              >
                github.com/farhadesmaeili
              </a>
            </motion.div>
          </motion.div>

          {/* ── Neural Network column ───────────────────────────────────── */}
          <motion.div
            ref={netRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isNetInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.85, ease: EASE_OUT }}
            className="flex justify-center lg:col-span-2"
          >
            <NeuralNet />
          </motion.div>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <motion.div
          ref={statsRef}
          variants={staggerVariants}
          initial="hidden"
          animate={isStatsInView ? 'visible' : 'hidden'}
          className="border-border bg-border mb-16 grid grid-cols-2 gap-px border sm:grid-cols-4"
        >
          {STATS.map(({ value, label }) => (
            <motion.div
              key={label}
              variants={fadeInVariants}
              className="bg-surface flex flex-col items-center gap-1 px-6 py-6 text-center"
            >
              <span
                className="text-accent font-mono text-2xl font-bold sm:text-3xl"
                style={{ textShadow: '0 0 22px rgba(0,255,65,0.55)' }}
              >
                {value}
              </span>
              <span className="text-muted font-mono text-[10px] tracking-[0.22em] uppercase">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Identity Cards ────────────────────────────────────────────── */}
        <motion.div
          ref={cardsRef}
          variants={staggerVariants}
          initial="hidden"
          animate={isCardsInView ? 'visible' : 'hidden'}
        >
          {/* Section label */}
          <motion.div variants={fadeUpVariants} className="mb-6 flex items-center gap-3">
            <span className="text-accent font-mono text-xs tracking-[0.2em] uppercase">
              <span className="opacity-40">{'// '}</span>Who I Am
            </span>
            <div className="bg-border h-px flex-1" />
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {IDENTITY_CARDS.map((card) => (
              <IdentityCard key={card.id} card={card} />
            ))}
          </div>

          {/* Philosophy note */}
          <motion.div
            variants={fadeUpVariants}
            className="border-border/60 bg-surface/50 relative mt-4 overflow-hidden border p-6 sm:p-7"
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(0,255,65,0.3) 30%, rgba(167,139,250,0.3) 70%, transparent)',
              }}
            />
            <p className="text-muted mb-2 font-mono text-xs tracking-wider uppercase opacity-50">
              {'// philosophy.txt'}
            </p>
            <p className="text-foreground/70 text-sm leading-relaxed sm:text-base">
              &quot;Technology is not just my profession — it&apos;s how I think. Every system has a
              pattern, every problem has a solution hiding in plain sight. My job is to find it,
              whether that system is a web app, a security boundary, or a poker table.&quot;
            </p>
            <p className="text-accent/50 mt-3 font-mono text-xs">— Farhad Esmaeili</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

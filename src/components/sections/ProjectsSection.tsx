'use client';

import type { ReactElement, PointerEvent as ReactPointerEvent } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ExternalLink, Terminal, Lock, Globe, Shield, Smartphone, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import {
  PROJECTS,
  COMING_SOON,
  type Project,
  type ComingSoonProject,
  type ProjectCategory,
} from '@/config/projects';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FloatingChar {
  id: number;
  char: string;
  x: number;
  duration: number;
  delay: number;
  opacity: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MATRIX_CHARS = '01アイウエオ@#$%&*ABCDEFabcdef0123456789{}[]<>=+-/\\';
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const GLOBE_CSS_SIZE = 280;

// ─── Category Config ──────────────────────────────────────────────────────────

const CATEGORY_CFG: Record<ProjectCategory, { label: string; color: string; icon: ReactElement }> =
  {
    web: { label: 'Web', color: '#00ff41', icon: <Globe size={11} /> },
    mobile: { label: 'Mobile', color: '#00d4ff', icon: <Smartphone size={11} /> },
    security: { label: 'Security', color: '#ff6b35', icon: <Shield size={11} /> },
    devops: { label: 'DevOps', color: '#a78bfa', icon: <Code2 size={11} /> },
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

// ─── Floating Chars ───────────────────────────────────────────────────────────

function generateFloatingChars(): FloatingChar[] {
  return Array.from({ length: 32 }, (_, i) => ({
    id: i,
    char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? '0',
    x: Math.random() * 100,
    duration: 10 + Math.random() * 14,
    delay: Math.random() * 9,
    opacity: 0.1 + Math.random() * 0.07,
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

// ─── Interactive Globe ────────────────────────────────────────────────────────

function InteractiveGlobe(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef({ x: 0.3, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const [hintVisible, setHintVisible] = useState(true);
  const [globeMounted, setGlobeMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const noMotion = globeMounted && prefersReducedMotion;

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
    velRef.current = { x: dy * 0.013, y: dx * 0.013 };
    rotRef.current.x += dy * 0.013;
    rotRef.current.y += dx * 0.013;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  }, []);

  const onUp = useCallback((): void => {
    dragRef.current.active = false;
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setGlobeMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const S = GLOBE_CSS_SIZE;
    canvas.width = S * dpr;
    canvas.height = S * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const R = 100;
    const FOV = 460;
    const half = S / 2;
    const PHI_G = (1 + Math.sqrt(5)) / 2;

    // Wireframe rings (lat + lon)
    const rings: [number, number, number][][] = [];
    const SEGS = 52;

    for (let i = 1; i < 9; i++) {
      const phi = (i / 9) * Math.PI;
      const ring: [number, number, number][] = [];
      for (let j = 0; j <= SEGS; j++) {
        const theta = (j / SEGS) * 2 * Math.PI;
        ring.push([
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta),
        ]);
      }
      rings.push(ring);
    }
    for (let i = 0; i < 16; i++) {
      const theta = (i / 16) * 2 * Math.PI;
      const line: [number, number, number][] = [];
      for (let j = 0; j <= SEGS; j++) {
        const phi = (j / SEGS) * Math.PI;
        line.push([
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta),
        ]);
      }
      rings.push(line);
    }

    // Icosahedron-based data nodes projected onto unit sphere
    const rawNodes: [number, number, number][] = [
      [0, 1, PHI_G],
      [0, -1, PHI_G],
      [0, 1, -PHI_G],
      [0, -1, -PHI_G],
      [1, PHI_G, 0],
      [-1, PHI_G, 0],
      [1, -PHI_G, 0],
      [-1, -PHI_G, 0],
      [PHI_G, 0, 1],
      [-PHI_G, 0, 1],
      [PHI_G, 0, -1],
      [-PHI_G, 0, -1],
    ];
    const nodes = rawNodes.map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return [x / len, y / len, z / len] as [number, number, number];
    });

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

    const project = (x: number, y: number, z: number): [number, number] => {
      const scale = FOV / (FOV + z * R * 0.42);
      return [half + x * R * scale, half + y * R * scale];
    };

    const draw = (): void => {
      frame++;
      ctx.clearRect(0, 0, S, S);

      if (!dragRef.current.active) {
        rotRef.current.y += velRef.current.y + 0.003;
        rotRef.current.x += velRef.current.x;
        velRef.current.y *= 0.9;
        velRef.current.x *= 0.9;
      }

      // Ambient glow
      const bg = ctx.createRadialGradient(half, half, R * 0.3, half, half, R * 1.6);
      bg.addColorStop(0, 'rgba(0,255,65,0.07)');
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(half, half, R * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Wireframe
      rings.forEach((ring) => {
        const mid = ring[Math.floor(ring.length / 2)];
        let zDepth = 0;
        if (mid) {
          const [, , rz] = rotate(...mid);
          zDepth = rz;
        }
        const alpha = 0.06 + 0.5 * ((1 - zDepth) / 2);
        ctx.beginPath();
        ring.forEach(([x, y, z], i) => {
          const [rx, ry, rz] = rotate(x, y, z);
          const [px, py] = project(rx, ry, rz);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = `rgba(0,255,65,${alpha.toFixed(2)})`;
        ctx.lineWidth = 0.65;
        ctx.stroke();
      });

      // Data nodes
      nodes.forEach(([nx, ny, nz], idx) => {
        const [rx, ry, rz] = rotate(nx, ny, nz);
        const [px, py] = project(rx, ry, rz);
        const depth = (rz + 1) / 2;
        if (depth < 0.12) return;

        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + idx * 0.52);
        const r = 2.2 + pulse * 2;
        const alpha = 0.3 + depth * 0.7;

        const ng = ctx.createRadialGradient(px, py, 0, px, py, r * 5);
        ng.addColorStop(0, `rgba(0,255,65,${(alpha * 0.5).toFixed(2)})`);
        ng.addColorStop(1, 'transparent');
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(px, py, r * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(0,255,65,${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Core pulse
      const cp = 0.5 + 0.5 * Math.sin(frame * 0.028);
      const cg = ctx.createRadialGradient(half, half, 0, half, half, 18 + cp * 8);
      cg.addColorStop(0, `rgba(0,255,65,${(0.5 + cp * 0.3).toFixed(2)})`);
      cg.addColorStop(0.5, `rgba(0,255,65,${(0.1 + cp * 0.08).toFixed(2)})`);
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(half, half, 18 + cp * 8, 0, Math.PI * 2);
      ctx.fill();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (noMotion) {
    return (
      <div
        className="border-accent/20 flex items-center justify-center border border-dashed"
        style={{ width: GLOBE_CSS_SIZE, height: GLOBE_CSS_SIZE }}
      >
        <Globe size={48} className="text-accent/40" />
      </div>
    );
  }

  return (
    <div className="relative inline-flex flex-col items-center gap-3">
      {/* Decorative outer rings */}
      <div
        className="border-accent/[0.07] absolute rounded-full border border-dashed"
        style={{
          width: GLOBE_CSS_SIZE + 64,
          height: GLOBE_CSS_SIZE + 64,
          animation: 'spin-slow 32s linear infinite reverse',
        }}
      />
      <div
        className="border-accent/4 absolute rounded-full border"
        style={{
          width: GLOBE_CSS_SIZE + 32,
          height: GLOBE_CSS_SIZE + 32,
          animation: 'spin-slow 20s linear infinite',
        }}
      />

      <canvas
        ref={canvasRef}
        className="relative z-10 cursor-grab touch-none active:cursor-grabbing"
        style={{ width: GLOBE_CSS_SIZE, height: GLOBE_CSS_SIZE }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onPointerCancel={onUp}
        aria-label="Interactive 3D globe — drag or touch to rotate"
      />

      <motion.p
        initial={{ opacity: 0.45 }}
        animate={{ opacity: hintVisible ? 0.45 : 0 }}
        transition={{ duration: 0.6 }}
        className="text-accent/60 relative z-10 font-mono text-[10px] tracking-[0.25em] uppercase"
        aria-hidden="true"
      >
        ↺ drag to rotate
      </motion.p>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  index: number;
}

function ProjectCard({ project, index }: ProjectCardProps): ReactElement {
  const cat = CATEGORY_CFG[project.category];

  return (
    <motion.div
      variants={fadeUpVariants}
      className="border-border bg-surface group relative overflow-hidden border p-6 sm:p-8"
    >
      {/* Top accent line on hover */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }}
      />

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="text-muted font-mono text-xs">
              #{String(index + 1).padStart(2, '0')}
            </span>
            <span
              className="flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase"
              style={{ color: cat.color }}
            >
              {cat.icon}
              {cat.label}
            </span>
            <span className="text-muted font-mono text-xs">{project.year}</span>
          </div>
          <h3 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            {project.title}
          </h3>
        </div>

        {project.status === 'live' && (
          <div className="border-accent/20 bg-accent/[0.07] text-accent flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase">
            <span
              className="bg-accent block h-1.5 w-1.5 rounded-full"
              style={{ animation: 'pulse 1.8s ease-in-out infinite' }}
            />
            LIVE
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-muted mb-5 text-sm leading-relaxed sm:text-base">{project.description}</p>

      {/* Highlights */}
      <ul className="mb-5 space-y-1.5">
        {project.highlights.map((h) => (
          <li key={h} className="text-foreground/60 flex items-start gap-2 font-mono text-xs">
            <span className="text-accent mt-0.5 select-none">›</span>
            {h}
          </li>
        ))}
      </ul>

      {/* Tech stack */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <span
            key={t}
            className="border-border bg-background text-muted border px-2 py-0.5 font-mono text-[11px]"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex flex-wrap items-center gap-3">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border text-muted hover:border-accent/30 hover:text-accent flex items-center gap-1.5 border px-3.5 py-2 font-mono text-xs transition-all duration-200"
          >
            <Terminal size={12} />
            Source
          </a>
        )}
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="border-accent/30 bg-accent/[0.07] text-accent hover:bg-accent/12 flex items-center gap-1.5 border px-3.5 py-2 font-mono text-xs transition-all duration-200 hover:shadow-[0_0_18px_rgba(0,255,65,0.18)]"
          >
            <ExternalLink size={12} />
            Live Site
          </a>
        )}
      </div>

      {/* Hover scan sweep */}
      <div className="via-accent/2.5 pointer-events-none absolute inset-x-0 top-0 h-full -translate-y-full bg-linear-to-b from-transparent to-transparent opacity-0 transition-all duration-700 group-hover:translate-y-full group-hover:opacity-100" />
    </motion.div>
  );
}

// ─── Coming Soon Card ─────────────────────────────────────────────────────────

interface ComingSoonCardProps {
  project: ComingSoonProject;
  index: number;
}

function ComingSoonCard({ project, index }: ComingSoonCardProps): ReactElement {
  const cat = CATEGORY_CFG[project.category];

  return (
    <motion.div
      variants={fadeUpVariants}
      className={cn('border-border/60 relative overflow-hidden border p-5', 'bg-surface/50')}
    >
      <div className="bg-background/15 pointer-events-none absolute inset-0" />

      <div className="relative">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <span
              className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase opacity-70"
              style={{ color: cat.color }}
            >
              {cat.icon}
              {cat.label}
            </span>
            <h4 className="text-foreground/70 font-bold tracking-tight">{project.title}</h4>
          </div>
          <div className="text-muted/60 border-border/50 shrink-0 border px-2 py-0.5 font-mono text-[10px] uppercase">
            <Lock size={8} className="mr-1 inline" />
            Soon
          </div>
        </div>

        <p className="text-muted/70 mb-4 text-xs leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap gap-1">
          {project.tech.map((t) => (
            <span
              key={t}
              className="border-border/40 text-muted/50 border px-1.5 py-0.5 font-mono text-[10px]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Watermark index */}
      <span className="text-foreground/3 pointer-events-none absolute right-4 bottom-3 font-mono text-5xl leading-none font-bold select-none">
        {String(index + 1).padStart(2, '0')}
      </span>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function ProjectsSection(): ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const comingSoonRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  const [floatingChars, setFloatingChars] = useState<FloatingChar[]>([]);

  const isSectionInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-60px' });
  const isGlobeInView = useInView(globeRef, { once: true, margin: '-60px' });
  const isProjectsInView = useInView(projectsRef, { once: true, margin: '-40px' });
  const isComingSoonInView = useInView(comingSoonRef, { once: true, margin: '-40px' });

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
      id="projects"
      className="relative overflow-hidden py-16 sm:py-24 lg:py-32"
    >
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
          className="absolute inset-0 opacity-[0.013]"
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
            <span className="hidden sm:inline">ls -la ~/projects --sort=date --format=long</span>
            <span className="sm:hidden">ls ~/projects --sort=date</span>
          </motion.p>

          <motion.h1
            variants={fadeUpVariants}
            className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Projects
          </motion.h1>

          <motion.p
            variants={fadeUpVariants}
            className="text-muted mx-auto max-w-lg text-sm leading-relaxed sm:text-base"
          >
            What I&apos;ve built and what&apos;s in the pipeline. Each project reflects an obsessive
            attention to detail and a love for clean, performant code.
          </motion.p>

          <motion.div
            variants={fadeUpVariants}
            className="mt-8 flex items-center justify-center gap-8 sm:gap-12"
          >
            {[
              { value: String(PROJECTS.length), label: 'Live' },
              { value: `${COMING_SOON.length}+`, label: 'In Pipeline' },
              { value: '5+', label: 'Technologies' },
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

        {/* ── 3D Globe ─────────────────────────────────────────────────── */}
        <motion.div
          ref={globeRef}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={isGlobeInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.85, ease: EASE_OUT }}
          className="mb-20 flex justify-center"
        >
          <InteractiveGlobe />
        </motion.div>

        {/* ── Live Projects ─────────────────────────────────────────────── */}
        <motion.div
          ref={projectsRef}
          variants={staggerVariants}
          initial="hidden"
          animate={isProjectsInView ? 'visible' : 'hidden'}
        >
          <motion.div variants={fadeUpVariants} className="mb-6 flex items-center gap-3">
            <span className="text-accent font-mono text-xs tracking-[0.2em] uppercase">
              <span className="opacity-40">{'// '}</span>Live Projects
            </span>
            <div className="bg-border h-px flex-1" />
            <span className="text-muted font-mono text-xs">{PROJECTS.length} total</span>
          </motion.div>

          <div className="space-y-4">
            {PROJECTS.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </motion.div>

        {/* ── Coming Soon ───────────────────────────────────────────────── */}
        <motion.div
          ref={comingSoonRef}
          variants={staggerVariants}
          initial="hidden"
          animate={isComingSoonInView ? 'visible' : 'hidden'}
          className="mt-16"
        >
          <motion.div variants={fadeUpVariants} className="mb-6 flex items-center gap-3">
            <span className="text-muted font-mono text-xs tracking-[0.2em] uppercase">
              <span className="opacity-40">{'// '}</span>Coming Soon
            </span>
            <div className="bg-border h-px flex-1" />
            <span className="text-muted font-mono text-xs">{COMING_SOON.length} in pipeline</span>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMING_SOON.map((project, i) => (
              <ComingSoonCard key={project.title} project={project} index={i} />
            ))}
          </div>

          <motion.p
            variants={fadeUpVariants}
            className="text-muted/50 mt-10 text-center font-mono text-xs"
          >
            More projects shipping soon — follow{' '}
            <a
              href={siteConfig.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent/60 hover:text-accent transition-colors duration-200"
            >
              github.com/farhadesmaeili
            </a>{' '}
            for updates.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

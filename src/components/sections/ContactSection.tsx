'use client';

import type {
  ReactElement,
  PointerEvent as ReactPointerEvent,
  ChangeEvent,
  FormEvent,
} from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Mail, Send, MapPin, Terminal, Lock, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = 'idle' | 'transmitting' | 'encrypting' | 'success';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface FloatingChar {
  id: number;
  char: string;
  x: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface ContactItemConfig {
  icon: ReactElement;
  label: string;
  value: string;
  href: string | null;
  tag: string;
}

interface TerminalInputProps {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface TerminalTextareaProps {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MATRIX_CHARS = '01アイウエオカキ@#$%&*ABCDEFabcdef0123456789{}[]<>=+-/\\';
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const ACCENT = '#00ff41';
const GLOBE_SIZE = 220;

const TRANSMISSION_STEPS = [
  'Initializing secure channel...',
  'Encrypting payload...',
  'Transmitting packet...',
  'Connection established.',
] as const;

// ─── Custom Icon SVGs (mirroring Footer pattern) ──────────────────────────────

function GithubSvg(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function LinkedinSvg(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// ─── Contact Items (module-level, icons pre-rendered) ─────────────────────────

const CONTACT_ITEMS: ContactItemConfig[] = [
  {
    icon: <Mail size={14} />,
    label: 'EMAIL',
    value: siteConfig.author.email,
    href: `mailto:${siteConfig.author.email}`,
    tag: 'primary_channel',
  },
  {
    icon: <GithubSvg />,
    label: 'GITHUB',
    value: 'farhadesmaeili',
    href: siteConfig.author.github,
    tag: 'code_repository',
  },
  {
    icon: <LinkedinSvg />,
    label: 'LINKEDIN',
    value: 'farhad-esmaeili',
    href: siteConfig.author.linkedin,
    tag: 'professional_network',
  },
  {
    icon: <Send size={14} />,
    label: 'TELEGRAM',
    value: '@farhadesmaeili',
    href: siteConfig.author.telegram,
    tag: 'instant_message',
  },
  {
    icon: <MapPin size={14} />,
    label: 'LOCATION',
    value: 'Iran · Remote Worldwide',
    href: null,
    tag: 'geo_coordinates',
  },
];

// ─── Floating chars generator (client-only, never runs on server) ─────────────

function generateFloatingChars(): FloatingChar[] {
  return Array.from({ length: 38 }, (_, i) => ({
    id: i,
    char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? '0',
    x: Math.random() * 100,
    duration: 11 + Math.random() * 14,
    delay: Math.random() * 10,
    opacity: 0.12 + Math.random() * 0.07,
  }));
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: EASE_OUT } },
};

// ─── CyberGlobe ───────────────────────────────────────────────────────────────

function CyberGlobe(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const noMotion = useReducedMotion() ?? false;

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseRef.current = {
      x: ((e.clientX - cx) / (rect.width / 2)) * 0.32,
      y: -((e.clientY - cy) / (rect.height / 2)) * 0.32,
    };
  }, []);

  const handlePointerEnd = useCallback((): void => {
    mouseRef.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;
    const context = ctx;

    canvas.width = GLOBE_SIZE;
    canvas.height = GLOBE_SIZE;

    const R = 84;
    const FOV = 390;
    const half = GLOBE_SIZE / 2;
    const SEGS = 54;

    // Pre-generate unit-sphere wireframe rings
    const rings: [number, number, number][][] = [];

    for (let i = 1; i < 9; i++) {
      const phi = (i / 9) * Math.PI;
      const ring: [number, number, number][] = [];
      for (let j = 0; j <= SEGS; j++) {
        const theta = (j / SEGS) * Math.PI * 2;
        ring.push([
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta),
        ]);
      }
      rings.push(ring);
    }

    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI * 2;
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

    let rotY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let rafId = 0;
    let lastTime = 0;
    const TARGET_MS = 1000 / 40;

    const draw = (time: number): void => {
      rafId = requestAnimationFrame(draw);
      if (time - lastTime < TARGET_MS) return;
      lastTime = time;

      if (!noMotion) rotY += 0.0048;
      tiltX += (mouseRef.current.y - tiltX) * 0.055;
      tiltY += (mouseRef.current.x - tiltY) * 0.055;

      const cosRY = Math.cos(rotY + tiltY);
      const sinRY = Math.sin(rotY + tiltY);
      const cosTX = Math.cos(tiltX);
      const sinTX = Math.sin(tiltX);

      context.clearRect(0, 0, GLOBE_SIZE, GLOBE_SIZE);

      // Outer ambient glow
      const glow = context.createRadialGradient(half, half, R * 0.5, half, half, R * 1.55);
      glow.addColorStop(0, 'rgba(0,255,65,0.055)');
      glow.addColorStop(1, 'rgba(0,255,65,0)');
      context.beginPath();
      context.arc(half, half, R * 1.5, 0, Math.PI * 2);
      context.fillStyle = glow;
      context.fill();

      rings.forEach((ring) => {
        // Depth-based opacity from midpoint Z
        const mid = ring[Math.floor(ring.length / 2)];
        let zDepth = 0;
        if (mid) {
          const z1m = mid[0] * sinRY + mid[2] * cosRY;
          const z2m = mid[1] * sinTX + z1m * cosTX;
          zDepth = z2m;
        }
        const alpha = 0.09 + 0.52 * ((1 - zDepth) / 2);

        context.beginPath();
        ring.forEach((p, idx) => {
          const x1 = p[0] * cosRY - p[2] * sinRY;
          const z1 = p[0] * sinRY + p[2] * cosRY;
          const y2 = p[1] * cosTX - z1 * sinTX;
          const z2 = p[1] * sinTX + z1 * cosTX;
          const scale = FOV / (FOV + z2 * R * 0.42);
          const sx = half + x1 * R * scale;
          const sy = half + y2 * R * scale;
          if (idx === 0) context.moveTo(sx, sy);
          else context.lineTo(sx, sy);
        });
        context.strokeStyle = `rgba(0,255,65,${alpha.toFixed(2)})`;
        context.lineWidth = 0.6;
        context.stroke();
      });

      // Pulsing core dot
      const core = context.createRadialGradient(half, half, 0, half, half, 10);
      core.addColorStop(0, 'rgba(0,255,65,0.95)');
      core.addColorStop(0.45, 'rgba(0,255,65,0.38)');
      core.addColorStop(1, 'rgba(0,255,65,0)');
      context.beginPath();
      context.arc(half, half, 10, 0, Math.PI * 2);
      context.fillStyle = core;
      context.fill();
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [noMotion]);

  return (
    <div
      className="relative inline-flex cursor-crosshair touch-none items-center justify-center select-none"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerEnd}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {/* Outer decorative rings */}
      <div
        className="absolute rounded-full border border-dashed"
        style={{
          width: GLOBE_SIZE + 32,
          height: GLOBE_SIZE + 32,
          borderColor: 'rgba(0,255,65,0.13)',
          animation: 'spin-slow 22s linear infinite',
        }}
      />
      <div
        className="absolute rounded-full border"
        style={{
          width: GLOBE_SIZE + 58,
          height: GLOBE_SIZE + 58,
          borderColor: 'rgba(0,255,65,0.05)',
          animation: 'spin-slow 38s linear infinite reverse',
        }}
      />

      {/* Tick marks on the dashed ring */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <div
          key={deg}
          className="absolute"
          style={{
            width: 5,
            height: 1,
            background: 'rgba(0,255,65,0.45)',
            top: '50%',
            left: '50%',
            transformOrigin: '0 50%',
            transform: `rotate(${deg}deg) translateX(${(GLOBE_SIZE + 32) / 2 - 1}px)`,
          }}
        />
      ))}

      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* Subtle scanline overlay on canvas area */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: GLOBE_SIZE,
          height: GLOBE_SIZE,
          borderRadius: '50%',
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,65,0.011) 3px, rgba(0,255,65,0.011) 4px)',
        }}
      />

      {/* Label */}
      <span
        className="text-accent/28 absolute font-mono text-[8px] tracking-[0.28em] uppercase"
        style={{ bottom: -(GLOBE_SIZE / 2 + 28) / 2 + 2 }}
        aria-hidden="true"
      >
        CYBER·CORE·v2.0
      </span>
    </div>
  );
}

// ─── Corner Brackets ──────────────────────────────────────────────────────────

function CornerBrackets(): ReactElement {
  return (
    <>
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <div
          key={c}
          className="pointer-events-none absolute"
          style={{
            width: 8,
            height: 8,
            top: c.startsWith('t') ? -1 : 'auto',
            bottom: c.startsWith('b') ? -1 : 'auto',
            left: c.endsWith('l') ? -1 : 'auto',
            right: c.endsWith('r') ? -1 : 'auto',
            borderTop: c.startsWith('t') ? `1.5px solid ${ACCENT}` : undefined,
            borderBottom: c.startsWith('b') ? `1.5px solid ${ACCENT}` : undefined,
            borderLeft: c.endsWith('l') ? `1.5px solid ${ACCENT}` : undefined,
            borderRight: c.endsWith('r') ? `1.5px solid ${ACCENT}` : undefined,
          }}
        />
      ))}
    </>
  );
}

// ─── Contact Info Card ────────────────────────────────────────────────────────

function ContactCard({ item }: { item: ContactItemConfig }): ReactElement {
  const sharedClass = cn(
    'group relative flex items-center gap-3 overflow-hidden p-3.5',
    'border border-border bg-surface',
    'transition-all duration-200',
    item.href &&
      'hover:translate-x-1.5 hover:border-accent/22 hover:shadow-[0_0_18px_rgba(0,255,65,0.05)]',
    item.href && 'cursor-pointer'
  );

  const content = (
    <>
      {/* Left accent stripe */}
      <div
        className="absolute top-0 left-0 h-full w-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, #00ff41 35%, #00ff41 65%, transparent 100%)',
        }}
      />

      {/* Icon box */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center transition-all duration-200 group-hover:shadow-[0_0_11px_rgba(0,255,65,0.32)]"
        style={{
          border: '1px solid rgba(0,255,65,0.16)',
          background: 'rgba(0,255,65,0.055)',
          color: ACCENT,
        }}
      >
        {item.icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="text-muted font-mono text-[9px] tracking-[0.2em] uppercase">
            {item.label}
          </span>
          <span className="text-accent/20 hidden font-mono text-[7px] tracking-wide uppercase md:block">
            {item.tag}
          </span>
        </div>
        <p className="text-foreground/60 group-hover:text-foreground/85 truncate font-mono text-[11px] transition-colors duration-200">
          {item.value}
        </p>
      </div>

      {/* Arrow */}
      {item.href && (
        <div className="text-accent shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-55">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path
              d="M1.5 5.5h8M6.5 2.5l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </>
  );

  if (item.href) {
    const isEmail = item.href.startsWith('mailto:');
    return (
      <a
        href={item.href}
        target={isEmail ? undefined : '_blank'}
        rel={isEmail ? undefined : 'noopener noreferrer'}
        className={sharedClass}
      >
        {content}
      </a>
    );
  }
  return <div className={sharedClass}>{content}</div>;
}

// ─── Terminal Input ────────────────────────────────────────────────────────────

function TerminalInput({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  error,
  onChange,
}: TerminalInputProps): ReactElement {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="text-accent/55 mb-1.5 block font-mono text-[9px] tracking-[0.2em] uppercase"
      >
        <span className="mr-1.5 opacity-35 select-none">$</span>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          className={cn(
            'bg-background text-foreground/85 w-full border font-mono text-[13px] outline-none',
            'placeholder:text-muted/28 px-3.5 py-2.5 placeholder:text-[11px]',
            'transition-[border-color,box-shadow] duration-200',
            focused
              ? 'border-accent/48 shadow-[0_0_0_1px_rgba(0,255,65,0.11),0_0_16px_rgba(0,255,65,0.07)]'
              : error
                ? 'border-red-500/40'
                : 'border-border hover:border-white/8'
          )}
        />
        <AnimatePresence>
          {focused && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
            >
              <CornerBrackets />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-1 font-mono text-[10px] text-red-400/72"
          >
            <span className="mr-1 opacity-50">!</span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Terminal Textarea ────────────────────────────────────────────────────────

function TerminalTextarea({
  label,
  id,
  placeholder,
  value,
  error,
  onChange,
}: TerminalTextareaProps): ReactElement {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="text-accent/55 mb-1.5 block font-mono text-[9px] tracking-[0.2em] uppercase"
      >
        <span className="mr-1.5 opacity-35 select-none">$</span>
        {label}
      </label>
      <div className="relative">
        <textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={5}
          className={cn(
            'bg-background text-foreground/85 w-full resize-none border font-mono text-[13px] outline-none',
            'placeholder:text-muted/28 px-3.5 py-2.5 placeholder:text-[11px]',
            'transition-[border-color,box-shadow] duration-200',
            focused
              ? 'border-accent/48 shadow-[0_0_0_1px_rgba(0,255,65,0.11),0_0_16px_rgba(0,255,65,0.07)]'
              : error
                ? 'border-red-500/40'
                : 'border-border hover:border-white/8'
          )}
        />
        <AnimatePresence>
          {focused && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
            >
              <CornerBrackets />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-1 font-mono text-[10px] text-red-400/72"
          >
            <span className="mr-1 opacity-50">!</span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm(): ReactElement {
  const [data, setData] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState<FormState>('idle');
  const [txStep, setTxStep] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const validate = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!data.name.trim()) e.name = 'Identifier required';
    if (!data.email.trim()) e.email = 'Email address required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Invalid format';
    if (!data.subject.trim()) e.subject = 'Subject required';
    if (!data.message.trim()) e.message = 'Message payload required';
    else if (data.message.trim().length < 10) e.message = 'Too short (min 10 chars)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [data]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!validate()) return;

    timeoutsRef.current.forEach(clearTimeout);
    setFormState('transmitting');
    setTxStep(0);

    timeoutsRef.current = [
      setTimeout(() => setTxStep(1), 720),
      setTimeout(() => {
        setFormState('encrypting');
        setTxStep(2);
      }, 1480),
      setTimeout(() => setTxStep(3), 2260),
      setTimeout(() => setFormState('success'), 2980),
    ];
  };

  const handleReset = (): void => {
    setData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setFormState('idle');
    setTxStep(0);
  };

  const isTransmitting = formState === 'transmitting' || formState === 'encrypting';

  return (
    <div
      className="border-border bg-surface relative border"
      style={{
        boxShadow: '0 0 40px rgba(0,255,65,0.03), inset 0 1px 0 rgba(255,255,255,0.025)',
      }}
    >
      {/* Terminal window header */}
      <div className="border-border flex items-center gap-2 border-b px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/55" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/55" />
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(0,255,65,0.55)' }} />
        </div>
        <div className="flex flex-1 items-center justify-center gap-1.5">
          <Lock size={8} className="text-accent/40" />
          <span className="text-muted/50 font-mono text-[9px] tracking-[0.16em] uppercase">
            ssh://farhad.dev · encrypted · secure
          </span>
          <Shield size={8} className="text-accent/40" />
        </div>
      </div>

      {/* Transmission overlay */}
      <AnimatePresence>
        {isTransmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(17,17,17,0.96)', border: '1px solid rgba(0,255,65,0.12)' }}
          >
            {/* Scanning line */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.75) 50%, transparent 100%)',
              }}
              animate={{ top: ['8%', '92%', '8%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,65,0.6))' }}
            >
              <Shield size={28} className="text-accent" />
            </motion.div>

            <div className="z-10 space-y-1.5 text-center">
              {TRANSMISSION_STEPS.slice(0, txStep + 1).map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'flex items-center gap-2 font-mono text-xs',
                    i === txStep ? 'text-accent' : 'text-muted/45'
                  )}
                >
                  <span className="opacity-55">{i < txStep ? '✓' : '›'}</span>
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success overlay */}
      <AnimatePresence>
        {formState === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 text-center"
            style={{ background: 'rgba(17,17,17,0.97)' }}
          >
            {/* Ambient ring */}
            <motion.div
              className="absolute rounded-full"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
              style={{
                width: 80,
                height: 80,
                border: '1px solid rgba(0,255,65,0.4)',
              }}
            />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                border: '1px solid rgba(0,255,65,0.35)',
                background: 'rgba(0,255,65,0.06)',
                boxShadow: '0 0 30px rgba(0,255,65,0.18), inset 0 0 20px rgba(0,255,65,0.04)',
              }}
            >
              <CheckCircle2 size={28} className="text-accent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <p className="text-foreground mb-1.5 font-mono text-sm">Connection established.</p>
              <p className="text-muted/65 mx-auto max-w-[240px] font-mono text-[11px] leading-relaxed">
                Message received. I&apos;ll respond within 24–48 hours.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-accent/38 font-mono text-[8px] tracking-[0.22em] uppercase"
            >
              ● transmission complete
            </motion.div>

            <motion.button
              type="button"
              onClick={handleReset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="border-accent/18 text-accent/55 hover:border-accent/35 hover:text-accent/75 mt-1 border px-4 py-1.5 font-mono text-xs transition-colors duration-200"
            >
              [ new transmission ]
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form body */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TerminalInput
            id="contact-name"
            label="Name"
            placeholder="Your name"
            value={data.name}
            error={errors.name}
            onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
          />
          <TerminalInput
            id="contact-email"
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={data.email}
            error={errors.email}
            onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <TerminalInput
          id="contact-subject"
          label="Subject"
          placeholder="Re: Collaboration request"
          value={data.subject}
          error={errors.subject}
          onChange={(e) => setData((prev) => ({ ...prev, subject: e.target.value }))}
        />

        <TerminalTextarea
          id="contact-message"
          label="Message"
          placeholder="Hello Farhad, I'd like to discuss..."
          value={data.message}
          error={errors.message}
          onChange={(e) => setData((prev) => ({ ...prev, message: e.target.value }))}
        />

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isTransmitting}
          whileHover={isTransmitting ? {} : { scale: 1.012 }}
          whileTap={isTransmitting ? {} : { scale: 0.985 }}
          className={cn(
            'flex w-full items-center justify-center gap-2.5 px-6 py-3 font-mono text-sm font-semibold tracking-wider',
            'transition-[opacity,box-shadow] duration-200',
            isTransmitting
              ? 'border-accent/15 bg-accent/10 text-accent/40 cursor-not-allowed border'
              : 'bg-accent text-background hover:opacity-88 hover:shadow-[0_0_22px_rgba(0,255,65,0.28)] active:scale-[0.985]'
          )}
        >
          {isTransmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 size={14} />
              </motion.div>
              <span>TRANSMITTING...</span>
            </>
          ) : (
            <>
              <Send size={13} />
              <span>TRANSMIT MESSAGE</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}

// ─── Floating Chars ───────────────────────────────────────────────────────────

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

// ─── Main Contact Section ─────────────────────────────────────────────────────

export function ContactSection(): ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  const [floatingChars, setFloatingChars] = useState<FloatingChar[]>([]);
  const isSectionInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-60px' });
  const isLeftInView = useInView(leftRef, { once: true, margin: '-40px' });
  const isRightInView = useInView(rightRef, { once: true, margin: '-40px' });

  useEffect(() => {
    const id = setTimeout(() => {
      setMounted(true);
      setFloatingChars(generateFloatingChars());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const noMotion = prefersReducedMotion && mounted;

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative overflow-hidden py-16 sm:py-24 lg:py-32"
    >
      {/* ── Background ──────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.036]"
          style={{
            backgroundImage: 'radial-gradient(circle, #00ff41 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Cyber grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.016]"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent calc(100% - 1px), #00ff41 100%),
              linear-gradient(90deg, transparent calc(100% - 1px), #00ff41 100%)
            `,
            backgroundSize: '88px 88px',
          }}
        />

        {/* Floating matrix chars */}
        {!noMotion && <FloatingChars chars={floatingChars} />}

        {/* Section entry scan sweep */}
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
            transition={{ duration: 2.1, ease: 'easeInOut', delay: 0.08 }}
          />
        )}

        {/* Ambient right-side radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 45% at 80% 52%, rgba(0,255,65,0.03) 0%, transparent 70%)',
          }}
        />

        {/* Edge vignette fades */}
        <div className="from-background absolute inset-x-0 top-0 h-28 bg-linear-to-b to-transparent" />
        <div className="from-background absolute inset-x-0 bottom-0 h-28 bg-linear-to-t to-transparent" />
        <div className="from-background absolute inset-y-0 left-0 w-16 bg-linear-to-r to-transparent" />
        <div className="from-background absolute inset-y-0 right-0 w-16 bg-linear-to-l to-transparent" />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── Section Header ───────────────────────────────────────────── */}
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
            <span className="hidden sm:inline">./contact --init --encrypt --verbose</span>
            <span className="sm:hidden">contact --init --encrypt</span>
          </motion.p>

          <motion.h2
            variants={fadeUpVariants}
            className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Establish{' '}
            <span
              className="text-accent"
              style={{
                textShadow: '0 0 28px rgba(0,255,65,0.65), 0 0 72px rgba(0,255,65,0.22)',
              }}
            >
              Connection
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUpVariants}
            className="text-muted mx-auto max-w-md font-mono text-sm leading-relaxed"
          >
            <span className="opacity-40">{'//'}</span> Secure communication channel.{' '}
            <span className="text-accent/72">Available for freelance &amp; full-time roles.</span>
          </motion.p>

          {/* Online status badge */}
          <motion.div
            variants={fadeUpVariants}
            className="border-accent/18 bg-accent/[0.028] mt-6 inline-flex items-center gap-2 border px-3.5 py-1.5"
          >
            <span
              className="bg-accent inline-block h-1.5 w-1.5 rounded-full"
              style={{
                boxShadow: '0 0 6px rgba(0,255,65,0.85)',
                animation: 'pulse 1.6s ease-in-out infinite',
              }}
            />
            <span className="text-accent/62 font-mono text-[9px] tracking-[0.22em] uppercase">
              ONLINE · AVAILABLE FOR HIRE
            </span>
          </motion.div>
        </motion.div>

        {/* ── Two-Column Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* ── Left: Contact Info + Globe ────────────────────────────── */}
          <motion.div
            ref={leftRef}
            variants={staggerVariants}
            initial="hidden"
            animate={isLeftInView ? 'visible' : 'hidden'}
            className="flex flex-col gap-3"
          >
            {/* Connection info file header */}
            <motion.div
              variants={fadeUpVariants}
              className="border-border flex items-center gap-2 border-b pb-3"
            >
              <Terminal size={10} className="text-accent/45" />
              <span className="text-muted/45 font-mono text-[9px] tracking-[0.2em] uppercase">
                connection_info.cfg
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <span
                  className="bg-accent/60 inline-block h-1 w-1 rounded-full"
                  style={{ boxShadow: '0 0 4px rgba(0,255,65,0.5)' }}
                />
                <span className="text-accent/40 font-mono text-[7px] tracking-wider uppercase">
                  LIVE
                </span>
              </div>
            </motion.div>

            {/* Contact cards */}
            {CONTACT_ITEMS.map((item) => (
              <motion.div key={item.label} variants={fadeUpVariants}>
                <ContactCard item={item} />
              </motion.div>
            ))}

            {/* CyberGlobe */}
            <motion.div
              variants={fadeUpVariants}
              className="mt-6 flex flex-col items-center gap-8 py-4"
            >
              <CyberGlobe />
              <p
                className="text-muted/30 font-mono text-[8px] tracking-[0.3em] uppercase"
                aria-hidden="true"
              >
                SECURE · ENCRYPTED · GLOBAL
              </p>
            </motion.div>
          </motion.div>

          {/* ── Right: Contact Form ───────────────────────────────────── */}
          <motion.div
            ref={rightRef}
            initial={{ opacity: 0, y: 22 }}
            animate={isRightInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.62, ease: EASE_OUT, delay: 0.15 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

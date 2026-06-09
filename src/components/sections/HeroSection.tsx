'use client';

import type { ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, Mail } from 'lucide-react';
import { ParticleBackground } from '@/components/shared/ParticleBackground';
import { AnimatedName } from '@/components/shared/AnimatedName';
import { useTypingEffect } from '@/hooks/useTypingEffect';
import { cn } from '@/lib/utils';

const ROLES = [
  'Full Stack Developer',
  'Bug Bounty Hunter',
  'Flutter Developer',
  'Backend Engineer',
];

export function HeroSection(): ReactElement {
  const { text: typedRole } = useTypingEffect({ words: ROLES });

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden"
    >
      <ParticleBackground />

      {/* Edge-fade overlays */}
      <div className="from-background pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b to-transparent" />
      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l to-transparent" />

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-center md:gap-16 md:text-left">
          {/* ── Left: text (order-2 on mobile → below avatar) ─────────── */}
          <div className="order-2 flex flex-col items-center md:order-1 md:flex-1 md:items-start">
            {/* Greeting */}
            <p className="hero-in-1 text-accent mb-4 font-mono text-sm tracking-[0.25em] uppercase">
              <span className="mr-2 opacity-40 select-none">$</span>
              Hello, I&apos;m
            </p>

            {/* Name */}
            <h1 className="hero-in-2 name-glow text-foreground mb-5 text-5xl leading-none font-bold tracking-tight sm:text-6xl md:text-4xl lg:text-5xl xl:text-6xl">
              <AnimatedName text="Farhad Esmaeili" />
            </h1>

            {/* Typing roles */}
            <div className="hero-in-3 text-accent mb-6 flex h-9 items-center justify-center gap-2 font-mono text-lg sm:text-xl md:justify-start md:text-2xl">
              <span className="text-muted text-base select-none">&gt;</span>
              <span>{typedRole}</span>
              <span className="bg-accent h-6 w-0.5 shrink-0 animate-pulse" />
            </div>

            {/* Bio */}
            <p className="hero-in-4 text-muted mb-10 max-w-xl text-sm leading-relaxed sm:text-base">
              Building fast, secure, and scalable web &amp; mobile apps. Passionate about clean
              code, system internals, and security research.
            </p>

            {/* CTA buttons */}
            <div className="hero-in-5 flex flex-col items-center gap-4 sm:flex-row md:items-start">
              <Link
                href="/projects"
                className={cn(
                  'group flex items-center gap-2 px-8 py-3.5',
                  'bg-accent text-background font-mono text-sm font-semibold',
                  'transition-all duration-150 hover:opacity-90 active:scale-95'
                )}
              >
                <span>View Projects</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/contact"
                className={cn(
                  'group flex items-center gap-2 px-8 py-3.5',
                  'border-accent/40 text-accent border font-mono text-sm font-medium',
                  'hover:border-accent hover:bg-accent/5 transition-all duration-150 active:scale-95'
                )}
              >
                <Mail size={15} />
                <span>Contact Me</span>
              </Link>
            </div>
          </div>

          {/* ── Right: avatar (order-1 on mobile → above text) ─────────── */}
          <div className="hero-in-0 order-1 shrink-0 md:order-2">
            {/* Container: small on mobile, large on desktop */}
            <div className="relative h-36 w-36 sm:h-44 sm:w-44 md:h-72 md:w-72 lg:h-80 lg:w-80">
              {/* Slowly rotating dashed outer ring */}
              <div className="animate-spin-slow border-accent/35 absolute -inset-3 rounded-full border border-dashed md:-inset-4" />
              {/* Counter-rotating inner accent ring */}
              <div
                className="border-accent/20 absolute -inset-1 rounded-full border md:-inset-2"
                style={{ animation: 'spin-slow 18s linear infinite reverse' }}
              />
              {/* Neon glow border */}
              <div className="absolute inset-0 rounded-full shadow-[0_0_0_2px_#00ff41,0_0_20px_rgba(0,255,65,0.5),0_0_50px_rgba(0,255,65,0.18)]" />
              {/* Avatar */}
              <Image
                src="/images/avatar.webp"
                alt="Farhad Esmaeili — Full Stack Developer"
                fill
                sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, (max-width: 1024px) 288px, 320px"
                priority
                className="rounded-full object-cover p-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <div className="scroll-indicator flex flex-col items-center gap-2">
          <span className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase select-none">
            scroll
          </span>
          <ArrowDown size={15} className="text-accent" />
        </div>
      </div>
    </section>
  );
}

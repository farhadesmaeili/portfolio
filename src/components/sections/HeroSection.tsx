'use client';

import type { ReactElement } from 'react';
import type { Variants } from 'framer-motion';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Mail } from 'lucide-react';
import { ParticleBackground } from '@/components/shared/ParticleBackground';
import { useTypingEffect } from '@/hooks/useTypingEffect';
import { cn } from '@/lib/utils';

const ROLES = [
  'Full Stack Developer',
  'Bug Bounty Hunter',
  'Flutter Developer',
  'Backend Engineer',
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.4 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function HeroSection(): ReactElement {
  const { text: typedRole } = useTypingEffect({ words: ROLES });

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden"
    >
      {/* Matrix rain background */}
      <ParticleBackground className="absolute inset-0" />

      {/* Edge-fade overlays */}
      <div className="from-background pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent" />
      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l to-transparent" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        {/* Greeting */}
        <motion.p
          variants={itemVariants}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-accent mb-5 font-mono text-sm tracking-[0.25em] uppercase"
        >
          <span className="mr-2 opacity-40 select-none">$</span>
          Hello, I&apos;m
        </motion.p>

        {/* Name with glitch + neon glow */}
        <motion.h1
          variants={itemVariants}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="name-glow text-foreground mb-5 text-5xl leading-none font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Farhad Esmaeili
        </motion.h1>

        {/* Typing roles */}
        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-accent mb-8 flex h-9 items-center justify-center gap-2 font-mono text-lg sm:text-xl md:text-2xl"
        >
          <span className="text-muted text-base select-none">&gt;</span>
          <span>{typedRole}</span>
          <span className="bg-accent h-6 w-[2px] shrink-0 animate-pulse" />
        </motion.div>

        {/* Bio */}
        <motion.p
          variants={itemVariants}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-muted mx-auto mb-12 max-w-xl text-sm leading-relaxed sm:text-base"
        >
          Building fast, secure, and scalable web &amp; mobile apps. Passionate about clean code,
          system internals, and security research.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
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
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase select-none">
          scroll
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ArrowDown size={15} className="text-accent" />
        </motion.div>
      </motion.div>
    </section>
  );
}

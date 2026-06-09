'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { navItems } from '@/config/navigation';
import { GlitchText } from '@/components/shared/GlitchText';
import { cn } from '@/lib/utils';

export function Navbar(): ReactElement {
  const pathname = usePathname();
  // Per-item counter: incrementing triggers GlitchText to re-scramble on hover
  const [hoverCounters, setHoverCounters] = useState<Record<string, number>>({});

  const triggerGlitch = (href: string): void => {
    setHoverCounters((prev) => ({ ...prev, [href]: (prev[href] ?? 0) + 1 }));
  };

  return (
    <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onMouseEnter={() => triggerGlitch(item.href)}
            className={cn(
              'group relative py-1 font-mono text-sm transition-colors duration-200',
              isActive ? 'text-accent' : 'text-muted hover:text-foreground'
            )}
          >
            <span
              className={cn(
                'transition-colors duration-200',
                isActive ? 'text-accent' : 'text-accent/40 group-hover:text-accent/70'
              )}
            >
              ~/
            </span>
            {/* Initial mount glitch (staggered by index), then re-glitches on hover */}
            <GlitchText
              text={item.label.toLowerCase()}
              delay={index * 80 + 200}
              trigger={hoverCounters[item.href] ?? 0}
            />

            {isActive && (
              <motion.span
                layoutId="nav-underline"
                className="bg-accent absolute right-0 -bottom-px left-0 h-px rounded-full"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

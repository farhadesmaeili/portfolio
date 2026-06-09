'use client';

import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlitchText } from '@/components/shared/GlitchText';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';

export function Header(): ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    return () => setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/*
        CSS-animated header (.header-in) with NO transform in the keyframe.
        Even translateY(0) leaves an active transform property on the element
        in iOS Safari, which breaks touch-event dispatch for child buttons.
        Fade-only animation avoids this entirely.
      */}
      <header
        className={cn(
          'header-in fixed top-0 right-0 left-0 z-60 flex h-16 items-center justify-between px-6 transition-all duration-300',
          scrolled
            ? 'bg-background/90 border-border border-b shadow-lg shadow-black/40 backdrop-blur-md'
            : 'bg-transparent'
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Farhad Esmaeili — Home"
          className="group flex items-center gap-0.5 font-mono text-base font-bold"
        >
          <motion.span
            className="text-accent"
            whileHover={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 12 }}
          >
            &lt;
          </motion.span>
          <span className="text-foreground group-hover:text-accent/80 transition-colors duration-200">
            <GlitchText text="farhad" delay={150} />
          </span>
          <span className="text-accent">/&gt;</span>
        </Link>

        <Navbar />

        {/*
          Mobile hamburger:
          - No AnimatePresence (was swallowing touch events)
          - onTouchEnd + preventDefault: fires immediately on iOS, prevents
            the redundant 300ms-delayed click event from double-toggling
          - onClick kept for mouse/pointer devices
          - h-11 w-11 = 44px minimum touch-target spec
        */}
        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onTouchEnd={(e) => {
            e.preventDefault();
            setMenuOpen((prev) => !prev);
          }}
          onClick={() => setMenuOpen((prev) => !prev)}
          // -webkit-tap-highlight-color: iOS Safari shows a grey flash on tap
          // which can absorb the touch event. Setting transparent removes it.
          style={{ WebkitTapHighlightColor: 'transparent' }}
          className="text-foreground hover:bg-accent/10 hover:text-accent flex h-11 w-11 touch-manipulation items-center justify-center rounded-md transition-colors duration-200 md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <MobileMenu id="mobile-menu" isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

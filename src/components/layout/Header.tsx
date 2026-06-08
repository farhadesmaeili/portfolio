'use client';

import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between px-6 transition-all duration-300',
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
            farhad
          </span>
          <span className="text-accent">/&gt;</span>
        </Link>

        <Navbar />

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="text-foreground hover:text-accent hover:bg-accent-glow flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-200 md:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={menuOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.header>

      <MobileMenu id="mobile-menu" isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

'use client';

import type { ReactElement } from 'react';
import type { Variants } from 'framer-motion';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { navItems } from '@/config/navigation';
import { GlitchText } from '@/components/shared/GlitchText';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export function MobileMenu({ id, isOpen, onClose }: MobileMenuProps): ReactElement {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        /*
          z-[55]: sits above page content but BELOW the header (z-[60]).
          This keeps the header's hamburger/X button always tappable.
          No backdrop-blur: blur on fixed full-screen overlays can break
          touch-event dispatch on older iOS Safari.
        */
        <motion.div
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="bg-background/97 fixed inset-0 z-55 flex flex-col items-center justify-center md:hidden"
        >
          {/* Neon scanline decorative background */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,65,0.02)_50%)] bg-size-[100%_4px]" />

          {/* Close button inside overlay — onTouchEnd fires immediately on iOS */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onTouchEnd={(e) => {
              e.preventDefault();
              onClose();
            }}
            onClick={onClose}
            className="text-muted hover:text-accent absolute top-4 right-4 flex h-11 w-11 touch-manipulation items-center justify-center rounded-md transition-colors duration-200"
          >
            <X size={22} />
          </button>

          <motion.nav
            aria-label="Mobile navigation"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-10"
          >
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  variants={itemVariants}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'group flex touch-manipulation items-center gap-1 font-mono text-3xl font-medium tracking-wide transition-colors duration-200',
                      isActive ? 'text-accent' : 'text-foreground/60 hover:text-accent'
                    )}
                  >
                    <span className="text-accent/50">~/</span>
                    {/* GlitchText re-runs each time menu opens (items unmount on close) */}
                    <GlitchText text={item.label.toLowerCase()} delay={index * 100 + 100} />
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>

          {/* Terminal prompt at bottom */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-muted absolute bottom-10 font-mono text-xs"
          >
            farhad@esmaeili:~$
            <span className="bg-accent ml-1 inline-block h-4 w-2 animate-pulse" />
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

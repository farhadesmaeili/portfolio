'use client';

import type { ReactElement } from 'react';
import type { Variants } from 'framer-motion';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '@/config/navigation';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
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
        <motion.div
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="bg-background/95 fixed inset-0 z-40 flex flex-col items-center justify-center backdrop-blur-xl md:hidden"
        >
          <motion.nav
            aria-label="Mobile navigation"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-10"
          >
            {navItems.map((item) => {
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
                      'font-mono text-3xl font-medium tracking-wide transition-colors duration-200',
                      isActive ? 'text-accent' : 'text-foreground/60 hover:text-accent'
                    )}
                  >
                    <span className="text-accent/50">~/</span>
                    {item.label.toLowerCase()}
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
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

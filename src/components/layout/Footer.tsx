'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Send, Mail } from 'lucide-react';
import { socialLinks } from '@/config/socials';
import { siteConfig } from '@/config/site';

function GithubIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function LinkedinIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const iconMap: Record<string, ReactElement> = {
  Github: <GithubIcon />,
  Linkedin: <LinkedinIcon />,
  Send: <Send size={18} />,
  Mail: <Mail size={18} />,
};

export function Footer(): ReactElement {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-border border-t"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-muted order-2 font-mono text-xs sm:order-1">
          <span className="text-accent">&copy;{year}</span> {siteConfig.name}
          <span className="text-muted/50 ml-2 hidden sm:inline">{'// all rights reserved'}</span>
        </p>

        <Link
          href="/games"
          className="text-muted/35 hover:text-accent/70 order-3 font-mono text-[10px] tracking-widest transition-colors duration-300 sm:order-2"
          aria-label="Games"
        >
          {'// games'}
        </Link>

        <div className="order-1 flex items-center gap-5 sm:order-3">
          {socialLinks.map((link) => {
            const icon = iconMap[link.icon];
            if (!icon) return null;
            const isEmail = link.href.startsWith('mailto:');
            return (
              <motion.div
                key={link.label}
                whileHover={{ y: -3, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Link
                  href={link.href}
                  target={isEmail ? undefined : '_blank'}
                  rel={isEmail ? undefined : 'noopener noreferrer'}
                  aria-label={link.label}
                  className="text-muted hover:text-accent inline-flex transition-colors duration-200"
                >
                  {icon}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.footer>
  );
}

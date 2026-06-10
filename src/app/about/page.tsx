import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { AboutSection } from '@/components/sections/AboutSection';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Farhad Esmaeili — Full Stack Developer with 7+ years experience, Bug Bounty Hunter, and Professional Poker Player. Passionate about technology, clean code, and bold ideas.',
};

export default function AboutPage(): ReactElement {
  return <AboutSection />;
}

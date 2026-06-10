import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { ContactSection } from '@/components/sections/ContactSection';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Farhad Esmaeili — Full Stack Developer & Bug Bounty Hunter. Available for freelance projects, collaborations, and full-time opportunities.',
};

export default function ContactPage(): ReactElement {
  return <ContactSection />;
}

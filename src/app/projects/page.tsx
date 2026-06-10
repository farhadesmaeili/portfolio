import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { ProjectsSection } from '@/components/sections/ProjectsSection';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Explore projects built by Farhad Esmaeili — Full Stack Developer & Bug Bounty Hunter. From Next.js web apps to Flutter mobile apps and security tools.',
};

export default function ProjectsPage(): ReactElement {
  return <ProjectsSection />;
}

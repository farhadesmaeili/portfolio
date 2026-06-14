import { siteConfig } from '@/config/site';

export type ProjectCategory = 'web' | 'mobile' | 'security' | 'devops';
export type ProjectStatus = 'live' | 'wip' | 'coming-soon';

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  github?: string;
  live?: string;
  year: string;
  highlights: string[];
}

export interface ComingSoonProject {
  title: string;
  category: ProjectCategory;
  description: string;
  tech: string[];
}

export const PROJECTS: Project[] = [
  {
    id: 'portfolio',
    title: 'Portfolio Website',
    description:
      "The site you're currently viewing — a cyberpunk-themed developer portfolio built from scratch with canvas 3D animations, Framer Motion scroll effects, and a full hacker aesthetic.",
    tech: ['Next.js 15', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion', 'Vercel'],
    category: 'web',
    status: 'live',
    github: `${siteConfig.author.github}/portfolio`,
    live: 'https://farhades.vercel.app/',
    year: '2026',
    highlights: [
      'App Router + React Server Components architecture',
      'Canvas 2D API — interactive drag-to-rotate 3D wireframe globe',
      'Husky · commitlint · GitHub Actions CI/CD pipeline',
    ],
  },
  {
    id: 'farhmyst-bio',
    title: 'FarhMyst Bio',
    description:
      'A terminal-styled link-in-bio landing page with a layered, scroll-driven narrative that unfolds the "hacker/builder" brand across Code, AI & Data, and Security — capped with a contact call-to-action.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Three.js', 'WebGL', 'GitHub Pages'],
    category: 'web',
    status: 'live',
    github: `${siteConfig.author.github}/farhmyst-bio`,
    live: 'https://farhadesmaeili.github.io/farhmyst-bio/',
    year: '2026',
    highlights: [
      'Single-file build — no framework or bundler, just HTML, raw CSS & vanilla JS',
      'Three stacked graphic layers: video base + WebGL/Three.js 3D object + CSS effects',
      'Deployed on GitHub Pages with Telegram · GitHub · LinkedIn links',
    ],
  },
];

export const COMING_SOON: ComingSoonProject[] = [
  {
    title: 'Bug Bounty Toolkit',
    category: 'security',
    description:
      'Automated recon pipeline and vulnerability scanner. Chains multiple security tools into a unified CLI with smart reporting and CVE correlation.',
    tech: ['Python', 'Docker', 'Linux', 'Bash'],
  },
  {
    title: 'E-Commerce Platform',
    category: 'web',
    description:
      'Full-stack marketplace with NestJS backend, Next.js storefront, real-time inventory management, and Stripe payment processing.',
    tech: ['NestJS', 'Next.js', 'PostgreSQL', 'Docker'],
  },
  {
    title: 'Flutter Finance App',
    category: 'mobile',
    description:
      'Cross-platform personal finance tracker with interactive charts, budget planning, and multi-currency support for iOS and Android.',
    tech: ['Flutter', 'Dart', 'Firebase'],
  },
];

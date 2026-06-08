export const siteConfig = {
  name: 'Farhad Esmaeili',
  title: 'Farhad Esmaeili — Full Stack Developer',
  description:
    'Full Stack Developer & Bug Bounty Hunter specializing in Next.js, NestJS, Flutter, and more.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://farhadesmaeili.dev',
  ogImage: '/images/og.png',
  author: {
    name: 'Farhad Esmaeili',
    email: 'farhad.esmaeili.it@gmail.com',
    github: 'https://github.com/farhadesmaeili',
    linkedin: 'https://www.linkedin.com/in/farhad-esmaeili',
    telegram: 'https://t.me/farhadesmaeili',
  },
  keywords: [
    'Full Stack Developer',
    'Bug Bounty Hunter',
    'Next.js',
    'NestJS',
    'Flutter',
    'TypeScript',
    'React',
    'Docker',
    'Kubernetes',
    'Linux',
  ],
} as const;

export type SiteConfig = typeof siteConfig;

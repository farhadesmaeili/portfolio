import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { GamesSection } from '@/components/sections/GamesSection';

export const metadata: Metadata = {
  title: 'Games',
  description:
    'Mini games built with HTML5 Canvas. An easter egg corner by Farhad Esmaeili — because every hacker needs a break.',
};

export default function GamesPage(): ReactElement {
  return <GamesSection />;
}

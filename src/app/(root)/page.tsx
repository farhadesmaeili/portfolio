import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.title,
  },
  description: siteConfig.description,
};

export default function HomePage(): ReactElement {
  return (
    <>
      <HeroSection />
      <SkillsSection />
    </>
  );
}

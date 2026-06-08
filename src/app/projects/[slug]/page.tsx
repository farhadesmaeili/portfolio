import type { Metadata } from 'next';
import type { ReactElement } from 'react';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} — Projects — Farhad Esmaeili`,
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps): Promise<ReactElement> {
  const { slug } = await params;
  return <main data-slug={slug} />;
}

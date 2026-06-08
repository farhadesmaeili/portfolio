import type { Metadata } from 'next';
import type { ReactElement } from 'react';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} — Blog — Farhad Esmaeili`,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps): Promise<ReactElement> {
  const { slug } = await params;
  return <main data-slug={slug} />;
}

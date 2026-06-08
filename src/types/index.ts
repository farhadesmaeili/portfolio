export type { Project, ProjectLinks } from './project';
export type { BlogPost } from './blog';

export interface PageParams {
  params: Promise<{ slug: string }>;
}

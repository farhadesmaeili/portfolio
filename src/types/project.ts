export interface ProjectLinks {
  live?: string;
  github?: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  links: ProjectLinks;
  coverImage?: string;
  featured: boolean;
  publishedAt: string;
  tags: string[];
}

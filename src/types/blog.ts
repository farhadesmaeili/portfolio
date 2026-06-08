export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  readingTime: number;
  coverImage?: string;
  featured?: boolean;
}

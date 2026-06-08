export type SkillCategory = 'Frontend' | 'Backend' | 'DevOps' | 'Tools';

export interface Skill {
  name: string;
  category: SkillCategory;
  icon: string;
  level: 1 | 2 | 3 | 4 | 5;
}

export const skills: Skill[] = [
  // Frontend
  { name: 'Next.js', category: 'Frontend', icon: 'nextjs', level: 5 },
  { name: 'React', category: 'Frontend', icon: 'react', level: 5 },
  { name: 'TypeScript', category: 'Frontend', icon: 'typescript', level: 5 },
  { name: 'Tailwind CSS', category: 'Frontend', icon: 'tailwind', level: 5 },
  { name: 'Flutter', category: 'Frontend', icon: 'flutter', level: 4 },
  { name: 'Dart', category: 'Frontend', icon: 'dart', level: 4 },
  { name: 'HTML', category: 'Frontend', icon: 'html', level: 5 },
  { name: 'CSS', category: 'Frontend', icon: 'css', level: 5 },
  { name: 'Sass', category: 'Frontend', icon: 'sass', level: 4 },

  // Backend
  { name: 'NestJS', category: 'Backend', icon: 'nestjs', level: 5 },
  { name: 'Python', category: 'Backend', icon: 'python', level: 4 },
  { name: 'WordPress', category: 'Backend', icon: 'wordpress', level: 4 },

  // DevOps
  { name: 'Docker', category: 'DevOps', icon: 'docker', level: 4 },
  { name: 'Kubernetes', category: 'DevOps', icon: 'kubernetes', level: 3 },
  { name: 'Linux', category: 'DevOps', icon: 'linux', level: 5 },

  // Tools
  { name: 'Git', category: 'Tools', icon: 'git', level: 5 },
  { name: 'GitHub', category: 'Tools', icon: 'github', level: 5 },
  { name: 'Bug Bounty', category: 'Tools', icon: 'shield', level: 4 },
];

export const skillCategories: SkillCategory[] = ['Frontend', 'Backend', 'DevOps', 'Tools'];

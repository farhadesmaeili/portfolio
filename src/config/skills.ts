export type SkillCategory = 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Security';

export interface Skill {
  name: string;
  category: SkillCategory;
  abbr: string;
  level: number;
}

export interface SkillCategoryMeta {
  id: SkillCategory;
  label: string;
  color: string;
}

export const SKILL_CATEGORIES: SkillCategoryMeta[] = [
  { id: 'Frontend', label: 'Frontend', color: '#00ff41' },
  { id: 'Backend', label: 'Backend', color: '#00d4ff' },
  { id: 'Database', label: 'Database', color: '#ff3d71' },
  { id: 'DevOps', label: 'DevOps', color: '#ffd60a' },
  { id: 'Security', label: 'Security', color: '#bf5af2' },
];

export const SKILLS: Skill[] = [
  // Frontend
  { name: 'Flutter', category: 'Frontend', abbr: 'FL', level: 88 },
  { name: 'Dart', category: 'Frontend', abbr: 'DA', level: 85 },
  { name: 'Next.js', category: 'Frontend', abbr: 'NX', level: 95 },
  { name: 'React', category: 'Frontend', abbr: 'RE', level: 92 },
  { name: 'TypeScript', category: 'Frontend', abbr: 'TS', level: 90 },
  { name: 'JavaScript', category: 'Frontend', abbr: 'JS', level: 92 },
  { name: 'HTML', category: 'Frontend', abbr: 'HT', level: 98 },
  { name: 'CSS', category: 'Frontend', abbr: 'CS', level: 95 },

  // Backend
  { name: 'Node.js', category: 'Backend', abbr: 'ND', level: 88 },
  { name: 'NestJS', category: 'Backend', abbr: 'NS', level: 90 },
  { name: 'Express.js', category: 'Backend', abbr: 'EX', level: 85 },
  { name: 'Dart Frog', category: 'Backend', abbr: 'DF', level: 75 },
  { name: 'REST API', category: 'Backend', abbr: 'RA', level: 92 },
  { name: 'WebSocket', category: 'Backend', abbr: 'WS', level: 82 },
  { name: 'Socket.IO', category: 'Backend', abbr: 'SK', level: 80 },

  // Database
  { name: 'MongoDB', category: 'Database', abbr: 'MG', level: 85 },
  { name: 'PostgreSQL', category: 'Database', abbr: 'PG', level: 80 },
  { name: 'MySQL', category: 'Database', abbr: 'MY', level: 78 },

  // DevOps
  { name: 'Docker', category: 'DevOps', abbr: 'DK', level: 85 },
  { name: 'Linux', category: 'DevOps', abbr: 'LX', level: 88 },
  { name: 'Git', category: 'DevOps', abbr: 'GT', level: 95 },
  { name: 'GitHub', category: 'DevOps', abbr: 'GH', level: 92 },
  { name: 'CI/CD', category: 'DevOps', abbr: 'CI', level: 80 },
  { name: 'Vercel', category: 'DevOps', abbr: 'VC', level: 88 },
  { name: 'Claude AI', category: 'DevOps', abbr: 'CL', level: 90 },
  { name: 'Claude Code', category: 'DevOps', abbr: 'CC', level: 88 },

  // Security
  { name: 'Web Security', category: 'Security', abbr: 'SC', level: 85 },
  { name: 'Authentication', category: 'Security', abbr: 'AU', level: 88 },
  { name: 'JWT', category: 'Security', abbr: 'JW', level: 90 },
  { name: 'OWASP', category: 'Security', abbr: 'OW', level: 82 },
];

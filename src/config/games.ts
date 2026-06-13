export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface Game {
  id: string;
  name: string;
  description: string;
  src: string;
  tags: string[];
  difficulty: GameDifficulty;
  controls: string;
}

export const GAMES: Game[] = [
  {
    id: 'snake',
    name: 'snake.exe',
    description:
      'Classic snake with a neon hacker aesthetic. Eat data packets, avoid the stack overflow.',
    src: '/games/snake.html',
    tags: ['HTML5', 'Canvas', 'Classic'],
    difficulty: 'easy',
    controls: 'WASD / Arrow Keys',
  },
  {
    id: 'invaders',
    name: 'invaders.exe',
    description:
      'Pixel alien swarms descend on the perimeter. Eliminate all threats before the breach.',
    src: '/games/invaders.html',
    tags: ['HTML5', 'Canvas', 'Arcade'],
    difficulty: 'medium',
    controls: 'WASD / Arrows + Space',
  },
];

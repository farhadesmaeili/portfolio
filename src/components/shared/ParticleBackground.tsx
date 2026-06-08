'use client';

import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ParticleBackgroundProps {
  className?: string;
}

const FONT_SIZE = 13;
const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
const FRAME_INTERVAL = 50;

export function ParticleBackground({ className }: ParticleBackgroundProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cols = 0;
    let drops: number[] = [];

    const setSize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / FONT_SIZE);
      drops = new Array<number>(cols).fill(1);
    };
    setSize();

    const draw = (): void => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)] ?? '0';
        const x = i * FONT_SIZE;
        const y = (drops[i] ?? 1) * FONT_SIZE;
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] = (drops[i] ?? 0) + 1;
      }
    };

    const intervalId = setInterval(draw, FRAME_INTERVAL);
    window.addEventListener('resize', setSize, { passive: true });

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return <canvas ref={canvasRef} className={cn('opacity-[0.45]', className)} aria-hidden="true" />;
}

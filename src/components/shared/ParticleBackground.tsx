'use client';

import type { ReactElement, CSSProperties } from 'react';
import { useEffect, useRef } from 'react';

const FONT_SIZE = 14;
const CHARS =
  '01アイウエオカキクケコサシスセソタチツテトナニヌネノ' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
  '0123456789' +
  '@#$%&*+-=/\\|<>[]{}()^~' +
  '█▓▒░■□▪▫▲▼◆◇●○★☆' +
  '╔╗╚╝╠╣═║╬' +
  '∑∏∆√∞≈≠≤≥' +
  '日月火水木金土' +
  '☠☢☣⚠☯' +
  'シンセコードデジタルカオス' +
  '⛧⟠⟡⟢⟣';
const TARGET_FPS = 20;
const FRAME_MS = 1000 / TARGET_FPS;

// Use explicit top/right/bottom/left instead of `inset` shorthand.
// `inset` is NOT supported on iOS Safari < 14.5 (released Apr 2021).
// Explicit longhand properties work on all mobile browsers.
const CANVAS_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  pointerEvents: 'none',
  opacity: 0.45,
  display: 'block',
};

export function ParticleBackground(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;

    const context = ctx;
    let cols = 0;
    let drops: number[] = [];
    let rafId = 0;
    let lastTime = 0;
    // Phase 1: all columns start at row 0 and fall together (orderly sweep).
    // Phase 2: after every column has hit the bottom once, reset randomly.
    let firstPassDone = false;
    const dropsReachedBottom = new Set<number>();

    const setSize = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      cols = Math.max(1, Math.floor(w / FONT_SIZE));
      // Start all drops at row 0 for the ordered first-pass sweep
      drops = Array.from({ length: cols }, () => 0);
    };

    setSize();

    const draw = (): void => {
      // Semi-transparent fill creates the fade-trail effect
      context.fillStyle = 'rgba(10,10,10,0.05)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = '#00ff41';
      context.font = `bold ${FONT_SIZE}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] ?? 0;
        const char = CHARS[Math.floor(Math.random() * CHARS.length)] ?? '0';
        context.fillText(char, i * FONT_SIZE, y * FONT_SIZE);

        if (y * FONT_SIZE > canvas.height) {
          if (!firstPassDone) {
            // Phase 1: reset immediately so the next sweep starts right away
            dropsReachedBottom.add(i);
            if (dropsReachedBottom.size >= cols) {
              firstPassDone = true;
            }
            drops[i] = 0;
          } else {
            // Phase 2: random sparse resets for chaotic matrix rain
            if (Math.random() > 0.975) {
              drops[i] = 0;
            }
          }
        } else {
          drops[i] = y + 1;
        }
      }
    };

    // Draw one frame immediately so something shows before the RAF loop
    draw();

    const tick = (timestamp: number): void => {
      rafId = requestAnimationFrame(tick);
      if (timestamp - lastTime < FRAME_MS) return;
      lastTime = timestamp;
      if (!document.hidden) draw();
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener('resize', setSize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return <canvas ref={canvasRef} style={CANVAS_STYLE} aria-hidden="true" />;
}

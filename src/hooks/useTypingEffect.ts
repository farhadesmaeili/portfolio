'use client';

import { useState, useEffect, useRef } from 'react';

interface UseTypingEffectOptions {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
}

interface UseTypingEffectResult {
  text: string;
  isTyping: boolean;
}

/**
 * Rewritten to use a single stable useEffect with mutable refs.
 *
 * The previous version had `text` in the deps array, which caused the
 * effect to cleanup and recreate a new setTimeout on EVERY character
 * change. On iOS Safari with slower JS execution, concurrent renders
 * (from GlitchText's setInterval) could cancel the pending timeout
 * before it fired, starving the typing loop entirely.
 *
 * Using refs for mutable state means the effect only mounts/unmounts
 * once per `words` reference change — no cancellation race.
 */
export function useTypingEffect({
  words,
  typeSpeed = 80,
  deleteSpeed = 50,
  pauseDuration = 2000,
}: UseTypingEffectOptions): UseTypingEffectResult {
  const [output, setOutput] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // All mutable typing state lives in a ref — changes don't trigger re-renders
  const state = useRef<{
    wordIndex: number;
    charIndex: number;
    isDeleting: boolean;
    timerId: ReturnType<typeof setTimeout> | undefined;
  }>({
    wordIndex: 0,
    charIndex: 0,
    isDeleting: false,
    timerId: undefined,
  });

  useEffect(() => {
    const s = state.current;

    function tick(): void {
      const word = words[s.wordIndex % words.length] ?? '';

      if (!s.isDeleting) {
        s.charIndex += 1;
        setOutput(word.slice(0, s.charIndex));
        setIsTyping(true);

        if (s.charIndex >= word.length) {
          // Fully typed — pause, then start deleting
          s.timerId = setTimeout(() => {
            s.isDeleting = true;
            tick();
          }, pauseDuration);
          return;
        }
      } else {
        s.charIndex -= 1;
        setOutput(word.slice(0, s.charIndex));
        setIsTyping(false);

        if (s.charIndex <= 0) {
          s.isDeleting = false;
          s.wordIndex = (s.wordIndex + 1) % words.length;
        }
      }

      s.timerId = setTimeout(tick, s.isDeleting ? deleteSpeed : typeSpeed);
    }

    // Kick off first character after one typeSpeed delay
    s.timerId = setTimeout(tick, typeSpeed);

    return () => clearTimeout(s.timerId);
  }, [words, typeSpeed, deleteSpeed, pauseDuration]);

  return { text: output, isTyping };
}

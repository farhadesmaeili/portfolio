'use client';

import { useState, useEffect } from 'react';

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

export function useTypingEffect({
  words,
  typeSpeed = 80,
  deleteSpeed = 50,
  pauseDuration = 2000,
}: UseTypingEffectOptions): UseTypingEffectResult {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex % words.length] ?? '';
    const isFullyTyped = !isDeleting && text === currentWord;
    const isFullyDeleted = isDeleting && text === '';

    let delay = isDeleting ? deleteSpeed : typeSpeed;
    if (isFullyTyped) delay = pauseDuration;

    const timeout = setTimeout(() => {
      if (isFullyTyped) {
        setIsDeleting(true);
      } else if (isFullyDeleted) {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      } else if (isDeleting) {
        setText((prev) => prev.slice(0, -1));
      } else {
        setText(currentWord.slice(0, text.length + 1));
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, pauseDuration]);

  return { text, isTyping: !isDeleting };
}

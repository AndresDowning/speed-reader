import { useState, useCallback, useRef, useEffect } from 'react';

export function useReader(words) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const intervalRef = useRef(null);

  const totalWords = words.length;
  const currentWord = words[currentIndex] || '';
  const progress = totalWords > 0 ? (currentIndex / totalWords) * 100 : 0;
  const wordsRemaining = totalWords - currentIndex;
  const timeRemaining = wordsRemaining / wpm; // in minutes

  const play = useCallback(() => {
    if (currentIndex >= totalWords - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [currentIndex, totalWords]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const skipForward = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 10, totalWords - 1));
  }, [totalWords]);

  const skipBackward = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 10, 0));
  }, []);

  const goToPosition = useCallback((percent) => {
    const newIndex = Math.floor((percent / 100) * totalWords);
    setCurrentIndex(Math.min(Math.max(newIndex, 0), totalWords - 1));
  }, [totalWords]);

  // Main reading loop
  useEffect(() => {
    if (isPlaying && totalWords > 0) {
      const intervalMs = (60 / wpm) * 1000;

      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= totalWords - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);

      return () => clearInterval(intervalRef.current);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isPlaying, wpm, totalWords]);

  // Reset when words change
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [words]);

  return {
    currentWord,
    currentIndex,
    totalWords,
    progress,
    timeRemaining,
    isPlaying,
    wpm,
    setWpm,
    play,
    pause,
    reset,
    skipForward,
    skipBackward,
    goToPosition
  };
}

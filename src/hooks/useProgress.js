import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'speed-reader-progress';

/**
 * Hook to save and load reading progress from localStorage
 */
export function useProgress(fileName, currentIndex, totalWords) {
  // Save progress periodically
  useEffect(() => {
    if (!fileName || totalWords === 0) return;

    const saveProgress = () => {
      const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

      allProgress[fileName] = {
        currentIndex,
        totalWords,
        percent: Math.round((currentIndex / totalWords) * 100),
        lastRead: new Date().toISOString(),
        fileName
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    };

    // Save every 5 seconds while reading
    const interval = setInterval(saveProgress, 5000);

    // Also save on unmount
    return () => {
      clearInterval(interval);
      saveProgress();
    };
  }, [fileName, currentIndex, totalWords]);

  // Load saved progress for a file
  const loadProgress = useCallback((file) => {
    const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return allProgress[file] || null;
  }, []);

  // Get all saved books
  const getSavedBooks = useCallback(() => {
    const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.values(allProgress).sort((a, b) =>
      new Date(b.lastRead) - new Date(a.lastRead)
    );
  }, []);

  // Delete a saved book
  const deleteSavedBook = useCallback((file) => {
    const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete allProgress[file];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  }, []);

  return {
    loadProgress,
    getSavedBooks,
    deleteSavedBook
  };
}

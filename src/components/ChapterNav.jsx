import { useState } from 'react';
import { getPreviewSnippet } from '../utils/chapterDetector';

export function ChapterNav({
  chapters,
  words,
  currentIndex,
  onNavigate,
  onClose
}) {
  const [jumpToWord, setJumpToWord] = useState('');
  const [jumpToPercent, setJumpToPercent] = useState('');

  const handleJumpToWord = () => {
    const index = parseInt(jumpToWord, 10);
    if (!isNaN(index) && index >= 0 && index < words.length) {
      onNavigate(index);
      onClose();
    }
  };

  const handleJumpToPercent = () => {
    const percent = parseInt(jumpToPercent, 10);
    if (!isNaN(percent) && percent >= 0 && percent <= 100) {
      const index = Math.floor((percent / 100) * words.length);
      onNavigate(index);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Jump to controls */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Word #"
              value={jumpToWord}
              onChange={(e) => setJumpToWord(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              min="0"
              max={words.length - 1}
            />
            <button
              onClick={handleJumpToWord}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
            >
              Go
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Jump to %"
              value={jumpToPercent}
              onChange={(e) => setJumpToPercent(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              min="0"
              max="100"
            />
            <button
              onClick={handleJumpToPercent}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
            >
              Go
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Currently at word {currentIndex + 1} of {words.length}
          </div>
        </div>

        {/* Chapters list */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs text-gray-500 px-2 py-1 uppercase tracking-wider">
            Chapters / Sections
          </div>
          {chapters.map((chapter, idx) => {
            const isCurrentChapter = idx === chapters.length - 1
              ? currentIndex >= chapter.wordIndex
              : currentIndex >= chapter.wordIndex && currentIndex < (chapters[idx + 1]?.wordIndex || words.length);

            return (
              <button
                key={idx}
                onClick={() => {
                  onNavigate(chapter.wordIndex);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  isCurrentChapter
                    ? 'bg-red-500/20 border border-red-500/50'
                    : 'hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isCurrentChapter ? 'text-red-400' : 'text-white'}`}>
                    {chapter.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {chapter.percent}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {getPreviewSnippet(words, chapter.wordIndex, 8)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

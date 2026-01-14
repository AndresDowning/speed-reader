import { useState, useCallback, useEffect, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { WordDisplay } from './components/WordDisplay';
import { Controls } from './components/Controls';
import { ProgressBar } from './components/ProgressBar';
import { MusicPlayer } from './components/MusicPlayer';
import { ChapterNav } from './components/ChapterNav';
import { useReader } from './hooks/useReader';
import { useAudio } from './hooks/useAudio';
import { useProgress } from './hooks/useProgress';
import { extractTextFromFile, parseTextToWords } from './utils/textParser';
import { detectChapters } from './utils/chapterDetector';

function App() {
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fontSize, setFontSize] = useState(72);
  const [focusMode, setFocusMode] = useState(false);
  const [showChapterNav, setShowChapterNav] = useState(false);
  const [pendingPosition, setPendingPosition] = useState(null);

  const reader = useReader(words);
  const audio = useAudio();
  const { loadProgress, getSavedBooks, deleteSavedBook } = useProgress(
    fileName,
    reader.currentIndex,
    reader.totalWords
  );

  // Detect chapters in the text
  const chapters = useMemo(() => detectChapters(words), [words]);

  // Get saved books for the home screen
  const savedBooks = useMemo(() => getSavedBooks(), [getSavedBooks, words]);

  // Apply pending position after words are loaded
  useEffect(() => {
    if (pendingPosition !== null && words.length > 0) {
      reader.goToPosition((pendingPosition / words.length) * 100);
      setPendingPosition(null);
    }
  }, [pendingPosition, words.length, reader]);

  const handleTextLoaded = useCallback(async (input) => {
    setIsLoading(true);

    try {
      let text;
      let name;

      if (typeof input === 'string') {
        text = input;
        name = 'Pasted text - ' + new Date().toLocaleDateString();
      } else {
        text = await extractTextFromFile(input);
        name = input.name;
      }

      setFileName(name);
      const parsedWords = parseTextToWords(text);
      setWords(parsedWords);

      // Check for saved progress
      const saved = loadProgress(name);
      if (saved && saved.currentIndex > 0) {
        setPendingPosition(saved.currentIndex);
      }
    } catch (error) {
      console.error('Error loading text:', error);
      alert('Error loading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [loadProgress]);

  const handleResumeBook = useCallback((book) => {
    // For resuming, we need to reload the file
    // Since we can't store the actual content, show a message
    alert(`To resume "${book.fileName}", please upload the same file again. Your position (${book.percent}%) will be restored.`);
  }, []);

  const handleNewText = () => {
    setWords([]);
    setFileName('');
    reader.reset();
  };

  const handleNavigateToWord = useCallback((wordIndex) => {
    reader.goToPosition((wordIndex / words.length) * 100);
  }, [reader, words.length]);

  const hasContent = words.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-red-500">Speed Reader</h1>
          {hasContent && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowChapterNav(true)}
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Chapters
              </button>
              <button
                onClick={handleNewText}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Load new text
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400">Loading text...</p>
            </div>
          </div>
        ) : !hasContent ? (
          <div className="py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Read Faster</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Upload a document or paste text to start speed reading with RSVP technology.
                The red letter marks the optimal focus point for each word.
              </p>
            </div>

            <FileUpload onTextLoaded={handleTextLoaded} isDisabled={isLoading} />

            {/* Saved books / Continue reading */}
            {savedBooks.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-semibold mb-4 text-center text-gray-300">
                  Continue Reading
                </h3>
                <div className="space-y-2 max-w-md mx-auto">
                  {savedBooks.slice(0, 5).map((book, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 group"
                    >
                      <button
                        onClick={() => handleResumeBook(book)}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm text-white truncate">{book.fileName}</div>
                        <div className="text-xs text-gray-500">
                          {book.percent}% complete • {new Date(book.lastRead).toLocaleDateString()}
                        </div>
                        {/* Mini progress bar */}
                        <div className="h-1 bg-gray-700 rounded mt-2">
                          <div
                            className="h-full bg-red-500 rounded"
                            style={{ width: `${book.percent}%` }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => deleteSavedBook(book.fileName)}
                        className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : focusMode ? (
          /* Focus Mode - Only word display */
          <div
            className="fixed inset-0 bg-gray-900 flex items-center justify-center cursor-pointer z-50"
            onClick={() => setFocusMode(false)}
          >
            <div className="w-full max-w-[90vw] overflow-hidden">
              <WordDisplay word={reader.currentWord} fontSize={fontSize} />
            </div>
            <div className="absolute bottom-8 text-gray-600 text-sm">
              Click anywhere or press Escape to exit focus mode
            </div>
            <div className="absolute top-8 right-8 text-gray-500 text-sm">
              {Math.round(reader.progress)}%
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* File info & Focus mode button */}
            <div className="flex items-center justify-between">
              {fileName && (
                <div className="text-gray-400 text-sm truncate max-w-[200px]">
                  {fileName}
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChapterNav(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Navigate
                </button>
                <button
                  onClick={() => setFocusMode(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Focus
                </button>
              </div>
            </div>

            {/* Word display */}
            <div className="bg-gray-800/30 rounded-2xl p-8 overflow-hidden">
              <WordDisplay word={reader.currentWord} fontSize={fontSize} />
            </div>

            {/* Font size control */}
            <div className="flex items-center gap-4 justify-center">
              <span className="text-gray-400 text-sm">Size</span>
              <button
                onClick={() => setFontSize(s => Math.max(32, s - 8))}
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded text-gray-300"
              >
                -
              </button>
              <span className="text-white font-mono w-16 text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize(s => Math.min(120, s + 8))}
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded text-gray-300"
              >
                +
              </button>
            </div>

            {/* Progress */}
            <ProgressBar
              progress={reader.progress}
              currentIndex={reader.currentIndex}
              totalWords={reader.totalWords}
              timeRemaining={reader.timeRemaining}
              onSeek={reader.goToPosition}
            />

            {/* Controls */}
            <Controls
              isPlaying={reader.isPlaying}
              wpm={reader.wpm}
              onPlay={reader.play}
              onPause={reader.pause}
              onReset={reader.reset}
              onSkipForward={reader.skipForward}
              onSkipBackward={reader.skipBackward}
              onWpmChange={reader.setWpm}
            />

            {/* Music player */}
            <MusicPlayer
              currentTrack={audio.currentTrack}
              volume={audio.volume}
              isPlaying={audio.isPlaying}
              tracks={audio.tracks}
              onSelectTrack={audio.selectTrack}
              onVolumeChange={audio.setVolume}
              onTogglePlay={audio.togglePlay}
            />

            {/* Keyboard shortcuts hint */}
            <div className="text-center text-gray-500 text-xs">
              Spacebar: play/pause • Arrows: skip/speed • F: focus • C: chapters
            </div>
          </div>
        )}
      </main>

      {/* Chapter Navigation Modal */}
      {showChapterNav && (
        <ChapterNav
          chapters={chapters}
          words={words}
          currentIndex={reader.currentIndex}
          onNavigate={handleNavigateToWord}
          onClose={() => setShowChapterNav(false)}
        />
      )}

      {/* Keyboard event handler */}
      <KeyboardHandler
        reader={reader}
        hasContent={hasContent}
        focusMode={focusMode}
        setFocusMode={setFocusMode}
        showChapterNav={showChapterNav}
        setShowChapterNav={setShowChapterNav}
      />
    </div>
  );
}

// Keyboard shortcuts component
function KeyboardHandler({ reader, hasContent, focusMode, setFocusMode, showChapterNav, setShowChapterNav }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!hasContent) return;

      // Close modals on Escape
      if (e.code === 'Escape') {
        if (showChapterNav) {
          setShowChapterNav(false);
          return;
        }
        if (focusMode) {
          setFocusMode(false);
          return;
        }
      }

      // Don't handle shortcuts when chapter nav is open
      if (showChapterNav) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (reader.isPlaying) {
          reader.pause();
        } else {
          reader.play();
        }
      } else if (e.code === 'ArrowRight') {
        reader.skipForward();
      } else if (e.code === 'ArrowLeft') {
        reader.skipBackward();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        reader.setWpm(Math.min(reader.wpm + 50, 1000));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        reader.setWpm(Math.max(reader.wpm - 50, 100));
      } else if (e.code === 'KeyF') {
        setFocusMode(true);
      } else if (e.code === 'KeyC') {
        setShowChapterNav(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasContent, focusMode, setFocusMode, showChapterNav, setShowChapterNav, reader]);

  return null;
}

export default App;

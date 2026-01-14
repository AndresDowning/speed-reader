export function Controls({
  isPlaying,
  wpm,
  onPlay,
  onPause,
  onReset,
  onSkipForward,
  onSkipBackward,
  onWpmChange
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Playback controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSkipBackward}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Skip back 10 words"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
        >
          {isPlaying ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={onSkipForward}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Skip forward 10 words"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>

        <button
          onClick={onReset}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Reset"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <span className="text-gray-400 text-sm w-16">Speed</span>
        <input
          type="range"
          min="100"
          max="1000"
          step="25"
          value={wpm}
          onChange={(e) => onWpmChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
        <span className="text-white font-mono w-24 text-right">{wpm} WPM</span>
      </div>
    </div>
  );
}

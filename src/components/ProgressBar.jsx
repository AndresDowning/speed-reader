import { formatTime } from '../utils/textParser';

export function ProgressBar({
  progress,
  currentIndex,
  totalWords,
  timeRemaining,
  onSeek
}) {
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    onSeek(percent);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div
        className="h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        <div
          className="h-full bg-red-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between mt-2 text-sm text-gray-400">
        <span>{currentIndex + 1} / {totalWords} words</span>
        <span>{Math.round(progress)}% complete</span>
        <span>{formatTime(timeRemaining * 60)} remaining</span>
      </div>
    </div>
  );
}

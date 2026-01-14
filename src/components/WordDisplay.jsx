import { splitWordByORP } from '../utils/orpCalculator';

export function WordDisplay({ word, fontSize = 72 }) {
  const { before, anchor, after } = splitWordByORP(word);

  // Auto-scale font size for long words
  const wordLength = word?.length || 0;
  let adjustedFontSize = fontSize;
  if (wordLength > 12) {
    adjustedFontSize = Math.max(32, fontSize * (12 / wordLength));
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] select-none">
      <div className="relative max-w-full">
        {/* Focal point indicator lines */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-0.5 h-6 bg-gray-700" />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 w-0.5 h-6 bg-gray-700" />

        {/* Word display with ORP highlighting */}
        <div
          className="font-mono tracking-wider text-center break-all"
          style={{ fontSize: `${adjustedFontSize}px` }}
        >
          <span className="text-gray-300">{before}</span>
          <span className="text-red-500 font-bold">{anchor}</span>
          <span className="text-gray-300">{after}</span>
        </div>
      </div>
    </div>
  );
}

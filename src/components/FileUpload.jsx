import { useState, useRef } from 'react';

export function FileUpload({ onTextLoaded, isDisabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onTextLoaded(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onTextLoaded(file);
    }
  };

  const handlePasteSubmit = () => {
    if (pasteText.trim()) {
      onTextLoaded(pasteText);
      setPasteText('');
      setShowPaste(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!showPaste ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
            ${isDragging
              ? 'border-red-500 bg-red-500/10'
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
            }
            ${isDisabled ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.epub"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-5xl mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <p className="text-gray-300 text-lg mb-2">
            Drop your file here or click to browse
          </p>
          <p className="text-gray-500 text-sm">
            Supports PDF, EPUB, TXT files
          </p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-6">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full h-48 bg-gray-900 text-gray-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePasteSubmit}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Load Text
            </button>
            <button
              onClick={() => setShowPaste(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="text-center mt-4">
        <button
          onClick={() => setShowPaste(!showPaste)}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          {showPaste ? 'Upload a file instead' : 'Or paste text directly'}
        </button>
      </div>
    </div>
  );
}
